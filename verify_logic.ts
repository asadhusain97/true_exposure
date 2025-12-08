import { analyzePortfolio } from './lib/aggregator';
import { PortfolioEntry } from './lib/types';

async function verify() {
    const entries: PortfolioEntry[] = [
        { ticker: 'VOO', amount: 10000, type: 'etf' },
        { ticker: 'QQQ', amount: 5000, type: 'etf' },
        { ticker: 'NVDA', amount: 2000, type: 'stock' }
    ];

    console.log('Running analysis for:', entries);

    const result = await analyzePortfolio(entries);

    console.log('\n--- Top 5 Holdings ---');
    result.exposures.slice(0, 5).forEach(e => {
        console.log(`${e.ticker}: $${e.dollarExposure?.toFixed(2)} (${(e.totalWeight * 100).toFixed(2)}%)`);
        console.log(`   Sources: ${e.sources.map(s => `${s.fund} ($${(s.contribution * (17000)).toFixed(2)})`).join(', ')}`);
    });

    console.log('\n--- Sector Allocation ---');
    result.sectorExposures.forEach(e => {
        console.log(`${e.sector}: ${(e.weight * 100).toFixed(2)}%`);
    });
}

verify().catch(console.error);
