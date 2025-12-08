'use client';

import { PortfolioInput } from '@/components/PortfolioInput';
import { SectorChart } from '@/components/SectorChart';
import { HoldingsChart } from '@/components/HoldingsChart';
import { HoldingsTable } from '@/components/HoldingsTable';
import { ConcentrationWarnings } from '@/components/ConcentrationWarnings';
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
        <div className="space-y-8 animate-fade-in">

          {/* Concentration Analysis */}
          <div className="max-w-4xl mx-auto mb-8">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Concentration Analysis</h3>
            {result.warnings.length > 0 ? (
              <ConcentrationWarnings warnings={result.warnings} />
            ) : (
              <p className="text-green-600">No concentration concerns detected</p>
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Sector Breakdown */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <span className="w-2 h-6 bg-blue-500 rounded-sm mr-2"></span>
                Sector Allocation
              </h2>
              <SectorChart exposures={result.sectorExposures} />
            </div>

            {/* Right: Top Holdings */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <span className="w-2 h-6 bg-indigo-500 rounded-sm mr-2"></span>
                Top Holdings
              </h2>
              <HoldingsChart exposures={result.exposures} warnings={result.warnings} />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">All Underlying Holdings</h2>
            <HoldingsTable exposures={result.exposures} />
          </div>

        </div>
      ) : (
        /* Empty State */
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
