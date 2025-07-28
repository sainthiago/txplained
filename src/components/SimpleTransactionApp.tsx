'use client';

import { useState } from 'react';
import { SimpleHeader } from './SimpleHeader';
import { Search } from 'lucide-react';

export function SimpleTransactionApp() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Simple Header with Search */}
      <SimpleHeader isLoading={isLoading} />

      {/* Main Content - Welcome State Only */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-full flex items-center justify-center">
            <Search className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Search Any Transaction
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Enter a transaction hash from Ethereum, Base, Arbitrum, Polygon, Solana, or other supported chains to get AI-powered analysis.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              Ethereum
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
              Solana
            </span>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
              Base
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
              Arbitrum
            </span>
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
              Polygon
            </span>
          </div>
        </div>
      </main>
    </div>
  );
} 