import { PortfolioEntry, AnalysisResult, AggregatedExposure, FundData, SectorExposure } from './types';
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
    // If no amounts provided, treat all equally (1/N)
    // If some amounts provided, use amounts (treating undefined as 0)
    const entryWeights = entries.map(entry => {
        if (!hasAmounts) {
            return { ...entry, effectiveWeight: 1 / entries.length, effectiveValue: 0 };
        } else {
            const val = entry.amount || 0;
            totalPortfolioValue += val;
            return { ...entry, effectiveWeight: 0, effectiveValue: val }; // Weight calc after total sum
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
            // Calculate this holding's contribution to total portfolio
            const contributionWeight = holding.weight * entry.effectiveWeight;

            // Calculate dollar value if applicable
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

    // Convert map to array and sort
    const exposures = Array.from(exposureMap.values())
        .sort((a, b) => b.totalWeight - a.totalWeight);

    // Calculate sector exposures
    const sectorExposures = aggregateBySector(exposures, holdingsLookup);

    return {
        exposures,
        sectorExposures,
        warnings: [], // Placeholder
        totalAnalyzed: totalPortfolioValue || exposures.length // Return total value or count for now
    };
}

export function aggregateBySector(
    exposures: AggregatedExposure[],
    holdingsLookup: (ticker: string) => FundData | null
): SectorExposure[] {
    const sectorMap = new Map<string, SectorExposure>();

    exposures.forEach(exp => {
        // Look up sector primarily from the mock data again ensuring we get it
        // Since we might not have stored it on AggregatedExposure yet
        const data = holdingsLookup(exp.ticker);

        // Find the specific holding in that fund data that matches our ticker
        // (In our mock, looking up indvidual stock returns it as single holding)
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
