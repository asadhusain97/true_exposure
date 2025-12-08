'use client';

import { ConcentrationWarning as WarningType } from '@/lib/types';

interface ConcentrationWarningProps {
    warnings: WarningType[];
}

export function ConcentrationWarning({ warnings }: ConcentrationWarningProps) {
    if (warnings.length === 0) return null;

    return (
        <div className="space-y-3">
            {warnings.map((warning, index) => (
                <div
                    key={index}
                    className={`p-4 rounded-lg flex items-start gap-3 ${warning.severity === 'high'
                            ? 'bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-200 border border-red-200 dark:border-red-900'
                            : 'bg-yellow-50 text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-900'
                        }`}
                >
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <span className="font-bold block text-sm">{warning.ticker}: {(warning.percentage * 100).toFixed(1)}% Concentration</span>
                        <span className="text-sm opacity-90">{warning.message}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
