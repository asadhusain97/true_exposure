'use client';

import { PortfolioInput } from '@/components/PortfolioInput';
import { ExposureChart } from '@/components/ExposureChart';
import { HoldingsTable } from '@/components/HoldingsTable';
import { ConcentrationWarning } from '@/components/ConcentrationWarning';
import { usePortfolioAnalysis } from '@/hooks/usePortfolioAnalysis';

export default function Home() {
  const { entries, addEntry, removeEntry, updateEntry, handleAnalyze, isAnalyzing, result } = usePortfolioAnalysis();

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          True<span className="text-zinc-500">Exposure</span>
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          Unwrap your ETFs to reveal your true underlying stock exposure.
          Discover hidden concentration risks in your portfolio.
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-12">
        <PortfolioInput
          entries={entries}
          onAdd={addEntry}
          onRemove={removeEntry}
          onUpdate={updateEntry}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />
      </div>

      {/* Results Section */}
      {result ? (
        <div className="space-y-12 animate-fade-in">

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Concentration Warnings</h2>
              <ConcentrationWarning warnings={result.warnings} />
            </div>
          )}

          {/* Charts & Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">Exposure Distribution</h2>
              <ExposureChart exposures={result.exposures} />
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">Top Underlying Holdings</h2>
              <HoldingsTable exposures={result.exposures} />
            </div>
          </div>
        </div>
      ) : (
        /* Empty State / Placeholder for results */
        <div className="text-center py-20 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-400 dark:text-zinc-600">
            Enter your holdings above to see the breakdown.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-400">
        <p>© {new Date().getFullYear()} TrueExposure. For educational purposes only. Not financial advice.</p>
      </footer>
    </main>
  );
}
