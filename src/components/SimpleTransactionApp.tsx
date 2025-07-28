'use client';

import { useState } from 'react';
import { TransactionAnalysis, TransactionData } from '@/types';
import { SimpleHeader } from './SimpleHeader';
import { SimpleTransactionView } from './SimpleTransactionView';
import { Search } from 'lucide-react';

interface AnalyzedTransaction {
  txHash: string;
  analysis: TransactionAnalysis;
  txData?: TransactionData;
  timestamp: number;
}

export function SimpleTransactionApp() {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalyzedTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidTxHash = (hash: string): boolean => {
    const evmHash = /^0x[a-fA-F0-9]{64}$/.test(hash.trim());
    const solanaSignature = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(hash.trim());
    return evmHash || solanaSignature;
  };

  const extractTxHashFromUrl = (input: string): string | null => {
    const urlPatterns = [
      // EVM explorers
      /etherscan\.io\/tx\/(0x[a-fA-F0-9]{64})/,
      /basescan\.org\/tx\/(0x[a-fA-F0-9]{64})/,
      /arbiscan\.io\/tx\/(0x[a-fA-F0-9]{64})/,
      /polygonscan\.com\/tx\/(0x[a-fA-F0-9]{64})/,
      /bscscan\.com\/tx\/(0x[a-fA-F0-9]{64})/,
      /optimistic\.etherscan\.io\/tx\/(0x[a-fA-F0-9]{64})/,
      // Solana explorers
      /solscan\.io\/tx\/([1-9A-HJ-NP-Za-km-z]{87,88})/,
      /explorer\.solana\.com\/tx\/([1-9A-HJ-NP-Za-km-z]{87,88})/,
      /solana\.fm\/tx\/([1-9A-HJ-NP-Za-km-z]{87,88})/,
    ];

    for (const pattern of urlPatterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSearch = async (inputValue: string) => {
    let txHash = inputValue;

    // Try to extract hash from URL
    const extractedHash = extractTxHashFromUrl(inputValue);
    if (extractedHash) {
      txHash = extractedHash;
    }

    if (!isValidTxHash(txHash)) {
      setError("Invalid transaction hash. Please provide a valid EVM transaction hash (66-character hex starting with '0x'), Solana signature (87-88 character base58), or a valid explorer URL.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txHash }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      const analyzedTx: AnalyzedTransaction = {
        txHash,
        analysis: data.analysis,
        txData: data.txData,
        timestamp: Date.now(),
      };

      setCurrentAnalysis(analyzedTx);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(`Sorry, I couldn't analyze this transaction. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Simple Header with Search */}
      <SimpleHeader onSearch={handleSearch} isLoading={isLoading} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-red-600 mt-0.5">⚠️</div>
                <span className="text-red-800 dark:text-red-200 text-sm">
                  {error}
                </span>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="max-w-4xl mx-auto">
            <SimpleTransactionView 
              txHash="" 
              analysis={{} as TransactionAnalysis} 
              isLoading={true} 
            />
          </div>
        ) : currentAnalysis ? (
          <div className="max-w-4xl mx-auto">
            <SimpleTransactionView 
              txHash={currentAnalysis.txHash} 
              analysis={currentAnalysis.analysis}
              txData={currentAnalysis.txData}
            />
          </div>
        ) : (
          /* Welcome State */
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
        )}
      </main>
    </div>
  );
} 