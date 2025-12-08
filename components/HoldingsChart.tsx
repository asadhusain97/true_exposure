'use client';

import { AggregatedExposure } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HoldingsChartProps {
    exposures: AggregatedExposure[];
}

export function HoldingsChart({ exposures }: HoldingsChartProps) {
    if (exposures.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                Chart will appear here
            </div>
        );
    }

    // Process data: Top 15 + "Other"
    const top15 = exposures.slice(0, 15);
    const otherWeight = exposures.slice(15).reduce((acc, curr) => acc + curr.totalWeight, 0);

    const data = [
        ...top15.map(e => ({
            name: e.ticker,
            fullName: e.name,
            weight: e.totalWeight * 100,
            dollarValue: e.dollarExposure
        })),
        ...(otherWeight > 0.005 ? [{
            name: 'Other',
            fullName: 'Other Holdings',
            weight: otherWeight * 100,
            dollarValue: exposures.slice(15).reduce((acc, curr) => acc + (curr.dollarExposure || 0), 0)
        }] : [])
    ];

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        height={40}
                        angle={-45}
                        textAnchor="end"
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-lg border border-zinc-100 dark:border-zinc-800">
                                        <p className="font-semibold text-sm mb-1">{data.name}</p>
                                        <p className="text-xs text-zinc-500 mb-2">{data.fullName}</p>
                                        <div className="space-y-1 text-sm">
                                            <p className="flex justify-between gap-4">
                                                <span className="text-zinc-500">Weight:</span>
                                                <span className="font-medium">{data.weight.toFixed(2)}%</span>
                                            </p>
                                            {data.dollarValue > 0 && (
                                                <p className="flex justify-between gap-4">
                                                    <span className="text-zinc-500">Value:</span>
                                                    <span className="font-medium">
                                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.dollarValue)}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="weight" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
