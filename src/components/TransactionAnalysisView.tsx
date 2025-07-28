'use client';

import { TransactionAnalysis, TransactionData } from '@/types';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Hash, 
  Fuel, 
  Info,
  ExternalLink,
  Copy,
  Users,
  Calendar,
  Blocks
} from 'lucide-react';
import { useState } from 'react';
import { ChainIcon } from './ChainIcon';
import { TransactionQA } from './TransactionQA';

interface TransactionAnalysisViewProps {
  txHash: string;
  analysis: TransactionAnalysis;
  txData?: TransactionData;
  isLoading?: boolean;
}

export function TransactionAnalysisView({ txHash, analysis, txData, isLoading }: TransactionAnalysisViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>;
    }
    
    if (analysis.result.includes('✅')) {
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    } else if (analysis.result.includes('❌')) {
      return <XCircle className="h-6 w-6 text-red-600" />;
    } else {
      return <Clock className="h-6 w-6 text-yellow-600" />;
    }
  };

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const extractChainName = () => {
    if (txData?.chainName) return txData.chainName;
    // Try to extract from analysis details
    const chainDetail = analysis.details.find(detail => detail.toLowerCase().includes('chain:'));
    if (chainDetail) {
      return chainDetail.split(':')[1]?.trim() || 'Unknown';
    }
    return 'Unknown';
  };

  const extractAddresses = () => {
    const fromDetail = analysis.details.find(detail => detail.toLowerCase().includes('from:'));
    const toDetail = analysis.details.find(detail => detail.toLowerCase().includes('to:'));
    
    return {
      from: fromDetail ? fromDetail.split(':')[1]?.trim() : txData?.from,
      to: toDetail ? toDetail.split(':')[1]?.trim() : txData?.to
    };
  };

  const extractBlockInfo = () => {
    const blockDetail = analysis.details.find(detail => 
      detail.toLowerCase().includes('block:') || detail.toLowerCase().includes('slot:')
    );
    if (blockDetail) {
      const parts = blockDetail.split(':');
      return {
        label: parts[0].trim(),
        value: parts[1]?.trim() || 'N/A'
      };
    }
    return txData?.blockNumber ? { label: 'Block', value: txData.blockNumber.toString() } : null;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Analyzing transaction...
          </span>
        </div>
        <div className="mt-4 text-center text-slate-500 dark:text-slate-400">
          Fetching data from blockchain and processing with AI
        </div>
      </div>
    );
  }

  const chainName = extractChainName();
  const addresses = extractAddresses();
  const blockInfo = extractBlockInfo();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Chain Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChainIcon chainName={chainName} className="h-8 w-8" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {chainName}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Blockchain Network
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(txHash, 'hash')}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-white dark:hover:bg-slate-800"
                title="Copy transaction hash"
              >
                {copiedField === 'hash' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-white dark:hover:bg-slate-800">
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Transaction Action & Status */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              {getStatusIcon()}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analysis.action}
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">
                  {analysis.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
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
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {copiedField === 'fullhash' ? 'Copied!' : 'Copy Full'}
              </button>
            </div>
          </div>

          {/* Status Banner */}
          <div className={`p-4 rounded-lg border ${
            analysis.result.includes('✅') 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-3">
              {analysis.result.includes('✅') ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-semibold ${
                analysis.result.includes('✅') 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {analysis.result}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Addresses */}
        {(addresses.from || addresses.to) && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Addresses</h4>
            </div>
            {addresses.from && (
              <div className="mb-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">From</p>
                <button
                  onClick={() => copyToClipboard(addresses.from!, 'from')}
                  className="font-mono text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                >
                  {formatAddress(addresses.from)}
                  {copiedField === 'from' && <span className="text-green-600 ml-1">✓</span>}
                </button>
              </div>
            )}
            {addresses.to && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">To</p>
                <button
                  onClick={() => copyToClipboard(addresses.to!, 'to')}
                  className="font-mono text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                >
                  {formatAddress(addresses.to)}
                  {copiedField === 'to' && <span className="text-green-600 ml-1">✓</span>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Block Info */}
        {blockInfo && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Blocks className="h-4 w-4 text-purple-600" />
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">{blockInfo.label}</h4>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {parseInt(blockInfo.value).toLocaleString()}
            </p>
          </div>
        )}

        {/* Timestamp */}
        {txData?.timestamp && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Timestamp</h4>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {new Date(txData.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Details Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Transaction Details
              </h3>
            </div>
            <div className="space-y-4">
              {analysis.details.map((detail, index) => {
                // Skip details that are already shown in the quick info grid
                if (detail.toLowerCase().includes('chain:') || 
                    detail.toLowerCase().includes('block:') || 
                    detail.toLowerCase().includes('slot:') ||
                    detail.toLowerCase().includes('from:') || 
                    detail.toLowerCase().includes('to:')) {
                  return null;
                }
                
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {detail}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gas Information Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Fuel className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Gas & Fees
              </h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Gas Used
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {analysis.gasInfo.used}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Gas Price
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {analysis.gasInfo.price}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-5 rounded-lg border-2 border-orange-200 dark:border-orange-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                      Total Transaction Cost
                    </div>
                    <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                      {analysis.gasInfo.total}
                    </div>
                  </div>
                  <Fuel className="h-8 w-8 text-orange-600/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Flags Card */}
      {analysis.riskFlags.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                ⚠️ Important Notes & Warnings
              </h3>
            </div>
            <div className="space-y-3">
              {analysis.riskFlags.map((flag, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-400 dark:border-amber-600">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-amber-800 dark:text-amber-200 text-sm font-medium leading-relaxed">
                      {flag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional Notes Card */}
      {analysis.notes.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Additional Information
              </h3>
            </div>
            <div className="space-y-3">
              {analysis.notes.map((note, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                    {note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Q&A Section */}
      <TransactionQA 
        txHash={txHash} 
        chainName={chainName}
      />
    </div>
  );
} 