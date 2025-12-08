'use client';

import { AggregatedExposure } from '@/lib/types';

interface HoldingsTableProps {
    exposures: AggregatedExposure[];
}

export function HoldingsTable({ exposures }: HoldingsTableProps) {
    if (exposures.length === 0) {
        return (
            <div className="text-center py-12 text-zinc-500 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <p>No holdings analyzed yet</p>
            </div>
        );
    }

    // Limit to top 50 to avoid massive tables
    const displayExposures = exposures.slice(0, 50);

    return (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="px-4 py-3">Ticker</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3 text-right">Weight</th>
                            <th className="px-4 py-3 text-right">Exposure</th>
                            <th className="px-4 py-3">Sources</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                        {displayExposures.map((exp) => (
                            <tr key={exp.ticker} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-4 py-3 font-medium">{exp.ticker}</td>
                                <td className="px-4 py-3 text-zinc-500 truncate max-w-[200px]" title={exp.name}>{exp.name}</td>
                                <td className="px-4 py-3 text-right font-medium">{(exp.totalWeight * 100).toFixed(2)}%</td>
                                <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                                    {exp.dollarExposure
                                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(exp.dollarExposure)
                                        : '-'}
                                </td>
                                <td className="px-4 py-3 text-zinc-500 text-xs">
                                    {exp.sources.map(s => s.fund).join(', ')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {exposures.length > 50 && (
                <div className="px-4 py-2 text-xs text-center text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800">
                    Showing top 50 of {exposures.length} holdings
                </div>
            )}
        </div>
    );
}
