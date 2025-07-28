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
  Loader2,
  User,
  Bot
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ChainIcon } from './ChainIcon';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  type: 'question' | 'answer';
  content: string;
  timestamp: number;
}

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    const questionMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'question',
      content: question.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, questionMessage]);
    setQuestion('');
    setIsAsking(true);

    try {
      const response = await fetch('/api/analyze-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          txHash, 
          question: questionMessage.content
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get answer: ${response.statusText}`);
      }

      const data = await response.json();
      const answerMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'answer',
        content: data.answer || data.explanation || 'I couldn\'t provide a specific answer to that question.',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, answerMessage]);
    } catch (error) {
      console.error('Question error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'answer',
        content: 'Sorry, I encountered an error while trying to answer your question. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full max-w-7xl mx-auto">
      {/* Transaction Analysis - Left Side (3/5 width = 60%) */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Header with Chain and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ChainIcon chainName={chainName} />
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Transaction Analysis</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Powered by AI • {chainName}</p>
                </div>
              </div>
              
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center space-x-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View on Explorer</span>
              </a>
            </div>

            {/* Status Result */}
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                analysis.result.includes('✅') 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {analysis.result.includes('✅') ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${
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

            {/* Gas & Fees */}
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

            {/* Key Details */}
            {analysis.details.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Key Details</h4>
                <div className="space-y-2">
                  {analysis.details.slice(0, 8).map((detail, index) => (
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

      {/* Chat Interface - Right Side (2/5 width = 40%) */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col" style={{ height: '70vh' }}>
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Ask Questions
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Get AI-powered answers about this transaction
            </p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Ask me anything about this transaction. I can explain risks, optimizations, or any technical details.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-lg ${
                    message.type === 'question'
                      ? 'bg-indigo-600 text-white ml-4'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 mr-4'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {message.type === 'answer' && (
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-indigo-600" />
                      )}
                      <div className="flex-1">
                        {message.type === 'answer' ? (
                          <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-1">
                            <ReactMarkdown>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                      </div>
                      {message.type === 'question' && (
                        <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isAsking && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg mr-4 max-w-[90%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-indigo-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <form onSubmit={handleAskQuestion} className="space-y-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about risks, optimizations..."
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isAsking}
              />
              <button
                type="submit"
                disabled={!question.trim() || isAsking}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                {isAsking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isAsking ? 'Asking...' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 