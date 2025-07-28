'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TransactionAnalysis, TransactionData } from '@/types';
import { SimpleHeader } from '@/components/SimpleHeader';
import { SimpleTransactionView } from '@/components/SimpleTransactionView';

interface AnalyzedTransaction {
  txHash: string;
  analysis: TransactionAnalysis;
  txData?: TransactionData;
  timestamp: number;
}

export default function TransactionPage() {
  const params = useParams();
  const txHash = decodeURIComponent(params.tx as string);
  
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

  const analyzeTransaction = async (hash: string) => {
    let processedHash = hash;

    // Try to extract hash from URL
    const extractedHash = extractTxHashFromUrl(hash);
    if (extractedHash) {
      processedHash = extractedHash;
    }

    if (!isValidTxHash(processedHash)) {
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
        body: JSON.stringify({ txHash: processedHash }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      const analyzedTx: AnalyzedTransaction = {
        txHash: processedHash,
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

  // Analyze transaction when component mounts or txHash changes
  useEffect(() => {
    if (txHash) {
      analyzeTransaction(txHash);
    }
  }, [txHash]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header with the current transaction hash */}
      <SimpleHeader initialValue={txHash} isLoading={isLoading} />

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
              txHash={txHash} 
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
          /* No valid transaction hash */
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 rounded-full flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Invalid Transaction Hash
            </h2>
                         <p className="text-slate-600 dark:text-slate-400 mb-6">
               The provided transaction hash &quot;{txHash}&quot; is not valid. Please enter a valid transaction hash from Ethereum, Base, Arbitrum, Polygon, Solana, or other supported chains.
             </p>
          </div>
        )}
      </main>
    </div>
  );
} 