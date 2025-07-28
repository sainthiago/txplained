'use client';

import { TransactionAnalysis, TransactionData } from '@/types';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Hash, 
  Fuel, 
  Copy,
  ExternalLink,
  MessageCircle,
  Send,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { ChainIcon } from './ChainIcon';

interface SimpleTransactionViewProps {
  txHash: string;
  analysis: TransactionAnalysis;
  txData?: TransactionData;
  isLoading?: boolean;
}

export function SimpleTransactionView({ txHash, analysis, txData, isLoading }: SimpleTransactionViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const extractChainName = () => {
    if (txData?.chainName) return txData.chainName;
    const chainDetail = analysis.details.find(detail => detail.toLowerCase().includes('chain:'));
    if (chainDetail) {
      return chainDetail.split(':')[1]?.trim() || 'Unknown';
    }
    return 'Unknown';
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    setIsAsking(true);
    try {
      const response = await fetch('/api/analyze-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          txHash, 
          question: question.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get answer: ${response.statusText}`);
      }

      const data = await response.json();
      setAnswer(data.answer || data.explanation || 'I couldn\'t provide a specific answer to that question.');
      setQuestion('');
    } catch (error) {
      console.error('Question error:', error);
      setAnswer('Sorry, I encountered an error while trying to answer your question. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              Analyzing Transaction
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Fetching data and processing with AI...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const chainName = extractChainName();

  return (
    <div className="space-y-6">
      {/* Ask a Question Section - Moved to Top */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Ask About This Transaction
          </h3>
        </div>

        <form onSubmit={handleAskQuestion} className="space-y-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What are the risks? Could this be optimized?"
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isAsking}
          />
          <button
            type="submit"
            disabled={!question.trim() || isAsking}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isAsking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{isAsking ? 'Asking...' : 'Ask Question'}</span>
          </button>
        </form>

        {answer && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Answer:</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </div>

      {/* Main Analysis Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChainIcon chainName={chainName} className="h-10 w-10" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {analysis.action}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {chainName} • {analysis.result.includes('✅') ? 'Successful' : 'Failed'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(txHash, 'hash')}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-white dark:hover:bg-slate-600"
                title="Copy transaction hash"
              >
                {copiedField === 'hash' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-white dark:hover:bg-slate-600">
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Summary */}
          <div className={`p-4 rounded-lg border-l-4 ${
            analysis.result.includes('✅') 
              ? 'bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-600' 
              : 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-600'
          }`}>
            <div className="flex items-start space-x-3">
              {analysis.result.includes('✅') ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  analysis.result.includes('✅') 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {analysis.result}
                </h3>
                <p className={`mt-1 text-sm ${
                  analysis.result.includes('✅') 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {analysis.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Hash className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Transaction Hash</p>
                  <p className="font-mono text-sm text-slate-600 dark:text-slate-400">{formatTxHash(txHash)}</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(txHash, 'fullhash')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                {copiedField === 'fullhash' ? 'Copied!' : 'Copy Full'}
              </button>
            </div>
          </div>

          {/* Gas & Fees - Simplified */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className="flex items-center space-x-2 mb-2">
                <Fuel className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Gas Used</span>
              </div>
              <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{analysis.gasInfo.used}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Gas Price</span>
              </div>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{analysis.gasInfo.price}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Total Cost</span>
              </div>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">{analysis.gasInfo.total}</p>
            </div>
          </div>

          {/* Key Details - Simplified */}
          {analysis.details.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Key Details</h4>
              <div className="space-y-2">
                {analysis.details.slice(0, 5).map((detail, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Flags */}
          {analysis.riskFlags.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h4 className="font-semibold text-amber-800 dark:text-amber-200">Important Notes</h4>
              </div>
              <div className="space-y-2">
                {analysis.riskFlags.map((flag, index) => (
                  <p key={index} className="text-sm text-amber-700 dark:text-amber-300">• {flag}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 