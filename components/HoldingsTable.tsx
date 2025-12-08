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

    return (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium">
                    <tr>
                        <th className="px-4 py-3">Ticker</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 text-right">Weight</th>
                        <th className="px-4 py-3 text-right">Exposure</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {exposures.map((exp) => (
                        <tr key={exp.ticker}>
                            <td className="px-4 py-3 font-medium">{exp.ticker}</td>
                            <td className="px-4 py-3 text-zinc-500">{exp.name}</td>
                            <td className="px-4 py-3 text-right">{(exp.totalWeight * 100).toFixed(2)}%</td>
                            <td className="px-4 py-3 text-right">
                                {exp.dollarExposure
                                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(exp.dollarExposure)
                                    : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
