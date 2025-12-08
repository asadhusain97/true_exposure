import { FundData, Holding } from '../types';

// VOO - Vanguard S&P 500 ETF
const VOO_HOLDINGS: Holding[] = [
    { ticker: 'AAPL', name: 'Apple Inc.', weight: 0.07, sector: 'Technology' },
    { ticker: 'MSFT', name: 'Microsoft Corp.', weight: 0.07, sector: 'Technology' },
    { ticker: 'NVDA', name: 'Nvidia Corp.', weight: 0.06, sector: 'Technology' },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', weight: 0.04, sector: 'Consumer Cyclical' },
    { ticker: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 0.04, sector: 'Communication Services' },
    { ticker: 'META', name: 'Meta Platforms Inc.', weight: 0.025, sector: 'Communication Services' },
    { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc.', weight: 0.02, sector: 'Financials' },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.', weight: 0.015, sector: 'Financials' },
    { ticker: 'LLY', name: 'Eli Lilly and Co.', weight: 0.015, sector: 'Healthcare' },
    { ticker: 'UNH', name: 'UnitedHealth Group Inc.', weight: 0.013, sector: 'Healthcare' },
    { ticker: 'V', name: 'Visa Inc.', weight: 0.01, sector: 'Financials' },
    { ticker: 'XOM', name: 'Exxon Mobil Corp.', weight: 0.01, sector: 'Energy' },
    { ticker: 'AVGO', name: 'Broadcom Inc.', weight: 0.01, sector: 'Technology' },
    { ticker: 'MA', name: 'Mastercard Inc.', weight: 0.01, sector: 'Financials' },
    { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 0.01, sector: 'Healthcare' }
];

// QQQ - Invesco QQQ Trust (Nasdaq 100)
const QQQ_HOLDINGS: Holding[] = [
    { ticker: 'AAPL', name: 'Apple Inc.', weight: 0.09, sector: 'Technology' },
    { ticker: 'MSFT', name: 'Microsoft Corp.', weight: 0.08, sector: 'Technology' },
    { ticker: 'NVDA', name: 'Nvidia Corp.', weight: 0.07, sector: 'Technology' },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', weight: 0.05, sector: 'Consumer Cyclical' },
    { ticker: 'AVGO', name: 'Broadcom Inc.', weight: 0.04, sector: 'Technology' },
    { ticker: 'META', name: 'Meta Platforms Inc.', weight: 0.04, sector: 'Communication Services' },
    { ticker: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 0.03, sector: 'Communication Services' },
    { ticker: 'COST', name: 'Costco Wholesale Corp.', weight: 0.025, sector: 'Consumer Defensive' },
    { ticker: 'TSLA', name: 'Tesla Inc.', weight: 0.025, sector: 'Consumer Cyclical' },
    { ticker: 'NFLX', name: 'Netflix Inc.', weight: 0.02, sector: 'Communication Services' }
];

const FUNDS: Record<string, FundData> = {
    'VOO': {
        ticker: 'VOO',
        name: 'Vanguard S&P 500 ETF',
        holdings: VOO_HOLDINGS,
        lastUpdated: '2023-12-01'
    },
    'QQQ': {
        ticker: 'QQQ',
        name: 'Invesco QQQ Trust',
        holdings: QQQ_HOLDINGS,
        lastUpdated: '2023-12-01'
    }
};

const INDIVIDUAL_STOCKS: Record<string, { name: string; sector: string }> = {
    'AAPL': { name: 'Apple Inc.', sector: 'Technology' },
    'MSFT': { name: 'Microsoft Corp.', sector: 'Technology' },
    'NVDA': { name: 'Nvidia Corp.', sector: 'Technology' },
    'TSLA': { name: 'Tesla Inc.', sector: 'Consumer Cyclical' },
    'AMZN': { name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
    'GOOGL': { name: 'Alphabet Inc. Class A', sector: 'Communication Services' },
    'META': { name: 'Meta Platforms Inc.', sector: 'Communication Services' }
};

export function getHoldingsData(ticker: string): FundData | null {
    const upperTicker = ticker.toUpperCase();

    // 1. Check if it's a known fund
    if (FUNDS[upperTicker]) {
        return FUNDS[upperTicker];
    }

    // 2. Check if it's a known individual stock (treat as "fund" of 1 holding)
    if (INDIVIDUAL_STOCKS[upperTicker]) {
        return {
            ticker: upperTicker,
            name: INDIVIDUAL_STOCKS[upperTicker].name,
            holdings: [{
                ticker: upperTicker,
                name: INDIVIDUAL_STOCKS[upperTicker].name,
                weight: 1.0,
                sector: INDIVIDUAL_STOCKS[upperTicker].sector
            }],
            lastUpdated: new Date().toISOString().split('T')[0]
        };
    }

    return null;
}
