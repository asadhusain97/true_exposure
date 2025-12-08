'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { SectorExposure } from '@/lib/types';

interface SectorChartProps {
    exposures: SectorExposure[];
}

const SECTOR_COLORS: Record<string, string> = {
    'Technology': '#3b82f6', // blue-500
    'Healthcare': '#10b981', // emerald-500
    'Financials': '#8b5cf6', // violet-500
    'Consumer Cyclical': '#f59e0b', // amber-500
    'Communication Services': '#ec4899', // pink-500
    'Consumer Defensive': '#6366f1', // indigo-500
    'Energy': '#ef4444', // red-500
    'Utilities': '#64748b', // slate-500
    'Real Estate': '#a855f7', // purple-500
    'Basic Materials': '#14b8a6', // teal-500
    'Industrials': '#f97316', // orange-500
};

export function SectorChart({ exposures }: SectorChartProps) {
    if (exposures.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                No sector data available
            </div>
        );
    }

    const data = exposures.map(e => ({
        name: e.sector,
        weight: typeof e.weight === 'number' ? (e.weight * 100) : 0,
        fill: SECTOR_COLORS[e.sector] || '#71717a' // zinc-500 default
    }));

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={140}
                        tick={{ fontSize: 13, textAnchor: 'end' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value.toFixed(2)}%`, 'Weight']}
                    />
                    <Bar dataKey="weight" radius={[0, 4, 4, 0]} barSize={24}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList
                            dataKey="weight"
                            position="right"
                            formatter={(val: any) => `${val.toFixed(1)}%`}
                            style={{ fontSize: 12, fill: '#71717a' }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
