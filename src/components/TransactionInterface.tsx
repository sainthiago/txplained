'use client';

import { useState } from 'react';
import { TransactionAnalysis, TransactionData } from '@/types';
import { SimpleTransactionView } from './SimpleTransactionView';
import { TransactionInput } from './TransactionInput';
import { Search, History, AlertCircle, Activity } from 'lucide-react';

interface AnalyzedTransaction {
  txHash: string;
  analysis: TransactionAnalysis;
  txData?: TransactionData; // Transaction data from the API
  timestamp: number;
}

export function TransactionInterface() {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalyzedTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<AnalyzedTransaction[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const inputValue = input.trim();
    let txHash = inputValue;

    // Try to extract hash from URL
    const extractedHash = extractTxHashFromUrl(inputValue);
    if (extractedHash) {
      txHash = extractedHash;
    }

    if (!isValidTxHash(txHash)) {
             setError("Invalid transaction hash. Please provide a valid EVM transaction hash (66-character hex starting with &apos;0x&apos;), Solana signature (87-88 character base58), or a valid explorer URL.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setInput('');

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
      setHistory(prev => [analyzedTx, ...prev.slice(0, 4)]); // Keep last 5 transactions

    } catch (error) {
      console.error('Analysis error:', error);
      setError(`Sorry, I couldn't analyze this transaction. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (tx: AnalyzedTransaction) => {
    setCurrentAnalysis(tx);
    setError(null);
  };

  const resetToWelcome = () => {
    setCurrentAnalysis(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Compact Header with Input */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  TXplained
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  TX or didn&apos;t happen - AI transaction analyzer
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Multi-chain</span>
              </div>
            </div>
          </div>
          
          <TransactionInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            placeholder="Paste transaction hash or explorer URL (EVM: 0x1234... | Solana: 5j6s8... | URLs supported)"
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-red-800 dark:text-red-200 text-sm">
                  {error}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Recent Analyses
                </h3>
              </div>
              <button
                onClick={resetToWelcome}
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Clear View
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {history.map((tx, index) => (
                <button
                  key={index}
                  onClick={() => loadFromHistory(tx)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    currentAnalysis?.txHash === tx.txHash
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-1">
                    {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {tx.analysis.action}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <SimpleTransactionView 
          txHash={input} 
          analysis={{} as TransactionAnalysis} 
          isLoading={true} 
        />
      ) : currentAnalysis ? (
        <SimpleTransactionView 
          txHash={currentAnalysis.txHash} 
          analysis={currentAnalysis.analysis}
          txData={currentAnalysis.txData}
        />
      ) : (
        /* Welcome Message */
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-lg">
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Ready to Analyze! 🔍
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Paste any transaction hash from Ethereum, Base, Arbitrum, Polygon, Solana, or other supported chains above.
            </p>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Get instant AI-powered analysis and ask follow-up questions
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 