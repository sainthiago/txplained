'use client';

import { SimpleHeader } from '@/components/SimpleHeader';
import { SimpleTransactionView } from '@/components/SimpleTransactionView';
import { APIResponse } from '@/types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TransactionPage() {
  const params = useParams();
  const txHash = decodeURIComponent(params.tx as string);

  const [apiResponse, setApiResponse] = useState<APIResponse | null>(null);
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

      const data: APIResponse = await response.json();

      if (!data.success) {
        throw new Error('Transaction analysis failed');
      }

      setApiResponse(data);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Header with the current transaction hash */}
      <SimpleHeader initialValue={txHash} isLoading={isLoading} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-red-600 mt-0.5">⚠️</div>
                <span className="text-red-800 text-sm">
                  {error}
                </span>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="max-w-6xl mx-auto">
            <SimpleTransactionView
              txHash={txHash}
              apiResponse={null}
              isLoading={true}
            />
          </div>
        ) : apiResponse ? (
          <div className="max-w-6xl mx-auto">
            <SimpleTransactionView
              txHash={apiResponse.txData.hash}
              apiResponse={apiResponse}
            />
          </div>
        ) : error ? (
          /* No valid transaction hash */
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Invalid Transaction Hash
            </h2>
            <p className="text-slate-600 mb-6 break-all">
              The provided transaction hash &quot;{txHash}&quot; is not valid. Please enter a valid transaction hash from Ethereum, Base, Arbitrum, Polygon, Solana, or other supported chains.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
} 