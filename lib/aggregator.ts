import { PortfolioEntry, AnalysisResult, AggregatedExposure, FundData, SectorExposure, ConcentrationWarning } from './types';
import { getHoldingsData } from './data/mock-holdings';

export async function analyzePortfolio(entries: PortfolioEntry[]): Promise<AnalysisResult> {
    // 1. Filter valid entries
    const validEntries = entries.filter(e => e.ticker && e.ticker.trim() !== '');

    if (validEntries.length === 0) {
        return { exposures: [], sectorExposures: [], warnings: [], totalAnalyzed: 0 };
    }

    // 2. Perform aggregation using the mock data lookup
    const result = aggregatePortfolio(validEntries, getHoldingsData);

    return result;
}

function aggregatePortfolio(
    entries: PortfolioEntry[],
    holdingsLookup: (ticker: string) => FundData | null
): AnalysisResult {
    const exposureMap = new Map<string, AggregatedExposure>();
    let totalPortfolioValue = 0;

    // Check if any amounts are provided to determine weighting mode
    const hasAmounts = entries.some(e => e.amount !== undefined && e.amount > 0);

    // Calculate effective weights for each entry
    const entryWeights = entries.map(entry => {
        if (!hasAmounts) {
            return { ...entry, effectiveWeight: 1 / entries.length, effectiveValue: 0 };
        } else {
            const val = entry.amount || 0;
            totalPortfolioValue += val;
            return { ...entry, effectiveWeight: 0, effectiveValue: val };
        }
    });

    if (hasAmounts && totalPortfolioValue > 0) {
        entryWeights.forEach(e => {
            e.effectiveWeight = e.effectiveValue / totalPortfolioValue;
        });
    }

    // Process each entry
    entryWeights.forEach(entry => {
        const fundData = holdingsLookup(entry.ticker);

        if (!fundData) {
            console.warn(`No data found for ticker: ${entry.ticker}`);
            return;
        }

        fundData.holdings.forEach(holding => {
            const contributionWeight = holding.weight * entry.effectiveWeight;
            const contributionValue = hasAmounts ? (holding.weight * entry.effectiveValue) : undefined;

            const existing = exposureMap.get(holding.ticker);
            if (existing) {
                existing.totalWeight += contributionWeight;
                if (contributionValue !== undefined && existing.dollarExposure !== undefined) {
                    existing.dollarExposure += contributionValue;
                }
                existing.sources.push({
                    fund: entry.ticker,
                    contribution: contributionWeight
                });
            } else {
                exposureMap.set(holding.ticker, {
                    ticker: holding.ticker,
                    name: holding.name,
                    totalWeight: contributionWeight,
                    dollarExposure: contributionValue,
                    sources: [{
                        fund: entry.ticker,
                        contribution: contributionWeight
                    }]
                });
            }
        });
    });

    // Convert to array and sort
    const exposures = Array.from(exposureMap.values())
        .sort((a, b) => b.totalWeight - a.totalWeight);

    // Calculate sector exposures
    const sectorExposures = aggregateBySector(exposures, holdingsLookup);

    // Generate concentration warnings
    const warnings = generateWarnings(exposures, sectorExposures);

    return {
        exposures,
        sectorExposures,
        warnings,
        totalAnalyzed: totalPortfolioValue || exposures.length
    };
}

function generateWarnings(
    exposures: AggregatedExposure[],
    sectorExposures: SectorExposure[]
): ConcentrationWarning[] {
    const warnings: ConcentrationWarning[] = [];
    const warningTickers = new Set<string>(); // Track tickers to avoid duplicates

    // 1. Single holding concentration warnings (only keep highest severity per ticker)
    exposures.forEach(exp => {
        const pct = exp.totalWeight * 100;

        if (pct > 20) {
            warnings.push({
                ticker: exp.ticker,
                percentage: pct,
                severity: 'high',
                message: `${exp.ticker} represents ${pct.toFixed(1)}% of your portfolio`
            });
            warningTickers.add(exp.ticker);
        } else if (pct > 15 && !warningTickers.has(exp.ticker)) {
            warnings.push({
                ticker: exp.ticker,
                percentage: pct,
                severity: 'medium',
                message: `${exp.ticker} represents ${pct.toFixed(1)}% of your portfolio`
            });
            warningTickers.add(exp.ticker);
        } else if (pct > 10 && !warningTickers.has(exp.ticker)) {
            warnings.push({
                ticker: exp.ticker,
                percentage: pct,
                severity: 'low',
                message: `${exp.ticker} represents ${pct.toFixed(1)}% of your portfolio`
            });
            warningTickers.add(exp.ticker);
        }
    });

    // 2. Top 3 concentration warning
    if (exposures.length >= 3) {
        const top3Weight = exposures.slice(0, 3).reduce((sum, exp) => sum + exp.totalWeight, 0);
        const top3Pct = top3Weight * 100;

        if (top3Pct > 40) {
            const top3Tickers = exposures.slice(0, 3).map(e => e.ticker).join(', ');
            warnings.push({
                ticker: 'TOP3',
                percentage: top3Pct,
                severity: 'medium',
                message: `Your top 3 holdings (${top3Tickers}) make up ${top3Pct.toFixed(1)}% of your portfolio`
            });
        }
    }

    // 3. Sector concentration warnings
    sectorExposures.forEach(sector => {
        if (sector.sector === 'Unknown') return; // Skip unknown sectors

        const pct = sector.weight * 100;

        if (pct > 65) {
            warnings.push({
                ticker: sector.sector,
                percentage: pct,
                severity: 'high',
                message: `${pct.toFixed(1)}% of your portfolio is in ${sector.sector}`
            });
        } else if (pct > 50) {
            warnings.push({
                ticker: sector.sector,
                percentage: pct,
                severity: 'medium',
                message: `${pct.toFixed(1)}% of your portfolio is in ${sector.sector}`
            });
        }
    });

    // Sort by severity (high → medium → low)
    const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    warnings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return warnings;
}

export function aggregateBySector(
    exposures: AggregatedExposure[],
    holdingsLookup: (ticker: string) => FundData | null
): SectorExposure[] {
    const sectorMap = new Map<string, SectorExposure>();

    exposures.forEach(exp => {
        const data = holdingsLookup(exp.ticker);
        const holdingData = data?.holdings.find(h => h.ticker === exp.ticker);
        const sector = holdingData?.sector || 'Unknown';

        const existing = sectorMap.get(sector);
        if (existing) {
            existing.weight += exp.totalWeight;
            if (exp.dollarExposure !== undefined && existing.dollarExposure !== undefined) {
                existing.dollarExposure += exp.dollarExposure;
            }
        } else {
            sectorMap.set(sector, {
                sector,
                weight: exp.totalWeight,
                dollarExposure: exp.dollarExposure
            });
        }
    });

    return Array.from(sectorMap.values())
        .sort((a, b) => b.weight - a.weight);
}
