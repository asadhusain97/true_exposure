'use client';

import { useState } from 'react';
import { PortfolioEntry, AnalysisResult } from '@/lib/types';
import { analyzePortfolio } from '@/lib/aggregator';

export function usePortfolioAnalysis() {
    const [entries, setEntries] = useState<PortfolioEntry[]>([
        { ticker: '', amount: undefined, type: 'etf' }
    ]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const addEntry = () => {
        setEntries([...entries, { ticker: '', amount: undefined, type: 'etf' }]);
    };

    const removeEntry = (index: number) => {
        if (entries.length > 1) {
            setEntries(entries.filter((_, i) => i !== index));
        }
    };

    const updateEntry = (index: number, field: keyof PortfolioEntry, value: string | number | undefined) => {
        const newEntries = [...entries];
        // Use type assertion for the specific field update or simpler logic
        if (field === 'ticker' && typeof value === 'string') {
            newEntries[index].ticker = value.toUpperCase();
        } else if (field === 'amount') {
            newEntries[index].amount = typeof value === 'number' ? value : undefined;
        } else if (field === 'type' && (value === 'stock' || value === 'etf' || value === 'mutualFund')) {
            newEntries[index].type = value;
        }
        setEntries(newEntries);
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        // Filter out invalid entries
        const validEntries = entries.filter(e => e.ticker.trim() !== '');
        try {
            const data = await analyzePortfolio(validEntries);
            setResult(data);
        } catch (error) {
            console.error('Analysis failed', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return {
        entries,
        addEntry,
        removeEntry,
        updateEntry,
        handleAnalyze,
        isAnalyzing,
        result
    };
}
