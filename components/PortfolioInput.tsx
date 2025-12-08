'use client';

import { PortfolioEntry } from '@/lib/types';

interface PortfolioInputProps {
    entries: PortfolioEntry[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, field: keyof PortfolioEntry, value: string | number | undefined) => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

export function PortfolioInput({
    entries,
    onAdd,
    onRemove,
    onUpdate,
    onAnalyze,
    isAnalyzing
}: PortfolioInputProps) {
    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 px-2">
                    <div className="col-span-3">Ticker</div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-4">Amount ($)</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>

                {entries.map((entry, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-3">
                            <input
                                type="text"
                                value={entry.ticker}
                                onChange={(e) => onUpdate(index, 'ticker', e.target.value)}
                                placeholder="VOO"
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all uppercase placeholder:normal-case"
                            />
                        </div>
                        <div className="col-span-3">
                            <select
                                value={entry.type}
                                onChange={(e) => onUpdate(index, 'type', e.target.value as any)}
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all appearance-none"
                            >
                                <option value="stock">Stock</option>
                                <option value="etf">ETF</option>
                                <option value="mutualFund">Mutual Fund</option>
                            </select>
                        </div>
                        <div className="col-span-4">
                            <input
                                type="number"
                                value={entry.amount || ''}
                                onChange={(e) => onUpdate(index, 'amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="10000"
                                min="0"
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                            />
                        </div>
                        <div className="col-span-2 text-right">
                            <button
                                onClick={() => onRemove(index)}
                                disabled={entries.length === 1}
                                className="p-2 text-zinc-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                                aria-label="Remove row"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}

                <div className="pt-4 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 mt-6">
                    <button
                        onClick={onAdd}
                        className="flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Holding
                    </button>

                    <button
                        onClick={onAnalyze}
                        disabled={isAnalyzing}
                        className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg shadow-sm hover:opacity-90 disabled:opacity-70 transition-all flex items-center"
                    >
                        {isAnalyzing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : (
                            'Analyze Composition'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
