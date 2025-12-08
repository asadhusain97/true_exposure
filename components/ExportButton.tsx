import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { AnalysisResult, PortfolioEntry } from '@/lib/types';
import { exportToExcel } from '@/lib/export';

interface ExportButtonProps {
    result: AnalysisResult | null;
    entries: PortfolioEntry[];
}

export function ExportButton({ result, entries }: ExportButtonProps) {
    if (!result) return null;

    const handleExport = () => {
        if (!result) return;

        exportToExcel({
            portfolioEntries: entries,
            exposures: result.exposures,
            sectorExposures: result.sectorExposures,
            warnings: result.warnings,
            analyzedAt: new Date(),
            totalValue: result.totalAnalyzed
        });
    };

    return (
        <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 border border-zinc-300 dark:border-zinc-700 shadow-sm text-sm leading-4 font-medium rounded-md text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            title="Download Excel Report"
        >
            <ArrowDownTrayIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            Export to Excel
        </button>
    );
}
