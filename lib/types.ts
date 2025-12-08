export interface PortfolioEntry {
    ticker: string;
    amount?: number; // USD invested, optional
    type: 'stock' | 'etf' | 'mutualFund';
}

export interface Holding {
    ticker: string;
    name: string;
    weight: number; // 0-1 decimal
    sector?: string;
}

export interface FundData {
    ticker: string;
    name: string;
    holdings: Holding[];
    lastUpdated: string;
}

export interface AggregatedExposure {
    ticker: string;
    name: string;
    totalWeight: number;
    dollarExposure?: number;
    sources: { fund: string; contribution: number }[];
}

export interface ConcentrationWarning {
    ticker: string;
    percentage: number;
    severity: 'low' | 'medium' | 'high';
    message: string;
}

export interface AnalysisResult {
    exposures: AggregatedExposure[];
    warnings: ConcentrationWarning[];
    totalAnalyzed: number;
}
