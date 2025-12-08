'use client';

import { ConcentrationWarning } from '@/lib/types';

interface ConcentrationWarningsProps {
    warnings: ConcentrationWarning[];
}

export function ConcentrationWarnings({ warnings }: ConcentrationWarningsProps) {
    if (warnings.length === 0) {
        return null;
    }

    const getSeverityClass = (severity: ConcentrationWarning['severity']) => {
        switch (severity) {
            case 'high':
                return 'text-red-600 font-medium';
            case 'medium':
                return 'text-orange-500';
            case 'low':
                return 'text-yellow-600';
            default:
                return 'text-zinc-500';
        }
    };

    return (
        <ul className="space-y-1">
            {warnings.map((warning, index) => (
                <li key={`${warning.ticker}-${index}`} className={getSeverityClass(warning.severity)}>
                    • {warning.message}
                </li>
            ))}
        </ul>
    );
}
