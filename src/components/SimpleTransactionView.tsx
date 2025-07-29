'use client';

import { APIResponse } from '@/types';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Bot,
    CheckCircle2,
    Clock,
    Code,
    DollarSign,
    ExternalLink,
    FileText,
    Fuel,
    Hash,
    Image,
    Key,
    Layers,
    Loader2,
    MessageCircle,
    Send,
    Shield,
    Tag,
    TrendingUp,
    User,
    Users,
    XCircle,
    Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChainIcon } from './ChainIcon';

interface ChatMessage {
    id: string;
    type: 'question' | 'answer';
    content: string;
    timestamp: number;
}

interface InstructionData {
    stackHeight?: number;
    programIdIndex?: number;
    accounts?: unknown[];
    data?: string;
}

interface SimpleTransactionViewProps {
    txHash: string;
    apiResponse: APIResponse | null;
    isLoading?: boolean;
}

interface SolanaInstruction {
    programIdIndex: number;
    stackHeight: number | null;
    accounts: number[];
    data: string;
}

export function SimpleTransactionView({ txHash, apiResponse, isLoading }: SimpleTransactionViewProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [question, setQuestion] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'breakdown'>('overview');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize chat with the explanation if available
    useEffect(() => {
        if (apiResponse?.explanation && messages.length === 0) {
            const initialMessage: ChatMessage = {
                id: 'initial-explanation',
                type: 'answer',
                content: apiResponse.explanation,
                timestamp: Date.now()
            };
            setMessages([initialMessage]);
        }
    }, [apiResponse?.explanation]);

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

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatValue = (value: string, symbol = 'ETH') => {
        const num = parseFloat(value);
        if (num === 0) return '0';
        return `${num.toLocaleString()} ${symbol}`;
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
                content: data.explanation || data.answer || 'I couldn\'t provide a specific answer to that question.',
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
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-emerald-100 shadow-lg p-8">
                <div className="flex items-center justify-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-700">
                            Analyzing Transaction
                        </h3>
                        <p className="text-slate-500">
                            Fetching data and processing with AI...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!apiResponse) {
        return (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-emerald-100 shadow-lg p-8">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-700">
                        No Transaction Data
                    </h3>
                    <p className="text-slate-500">
                        Unable to load transaction information.
                    </p>
                </div>
            </div>
        );
    }

    const { txData, analysis, links } = apiResponse;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full max-w-7xl mx-auto">
            {/* Transaction Analysis - Left Side (3/5 width = 60%) */}
            <div className="lg:col-span-3 space-y-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-emerald-100 shadow-lg overflow-hidden">
                    <div className="p-6">
                        {/* Header with Chain and Status */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <ChainIcon chainName={txData.chainName} />
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{analysis.action}</h2>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-sm text-slate-600">{txData.chainName}</span>
                                        <span className="text-slate-400">•</span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${analysis.metadata.complexity === 'simple'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : analysis.metadata.complexity === 'medium'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                            {analysis.metadata.complexity}
                                        </span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-sm text-slate-600">
                                            {new Date(txData.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <a
                                href={links.transaction}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-emerald-50 transition-colors flex items-center space-x-1"
                            >
                                <ExternalLink className="h-4 w-4" />
                                <span>Explorer</span>
                            </a>
                        </div>

                        {/* Status Result */}
                        <div className="flex items-start space-x-4 mb-6">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${analysis.result.includes('✅')
                                    ? 'bg-emerald-100'
                                    : 'bg-red-100'
                                }`}>
                                {analysis.result.includes('✅') ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                ) : (
                                    <XCircle className="h-6 w-6 text-red-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-lg font-semibold ${analysis.result.includes('✅')
                                        ? 'text-emerald-800'
                                        : 'text-red-800'
                                    }`}>
                                    {analysis.result}
                                </h3>
                                <p className={`mt-1 text-sm ${analysis.result.includes('✅')
                                        ? 'text-emerald-700'
                                        : 'text-red-700'
                                    }`}>
                                    {analysis.summary}
                                </p>
                            </div>
                        </div>

                        {/* Natural Summary - Display if available */}
                        {apiResponse.naturalSummary && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Zap className="h-5 w-5 text-emerald-600" />
                                    <h4 className="font-semibold text-emerald-800">AI Summary</h4>
                                </div>
                                <div className="text-sm text-emerald-700 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-1 prose-emerald">
                                    <ReactMarkdown>
                                        {apiResponse.naturalSummary}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {/* Categories */}
                        {analysis.metadata.categories.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Tag className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">Categories</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.metadata.categories.map((category, index) => (
                                        <span key={index} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tab Navigation */}
                        <div className="border-b border-slate-200 mb-6">
                            <nav className="flex space-x-8">
                                {['overview', 'technical', 'breakdown'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as 'overview' | 'technical' | 'breakdown')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${activeTab === tab
                                                ? 'border-emerald-500 text-emerald-600'
                                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Transaction Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Transaction Hash */}
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Hash className="h-5 w-5 text-slate-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">Transaction Hash</p>
                                                    <p className="font-mono text-sm text-slate-600">{formatTxHash(txHash)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(txHash, 'hash')}
                                                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors"
                                            >
                                                {copiedField === 'hash' ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                        <div className="flex items-center space-x-3">
                                            <Activity className="h-5 w-5 text-slate-500" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Status</p>
                                                <p className={`text-sm font-medium ${txData.status === 'success'
                                                        ? 'text-emerald-600'
                                                        : 'text-red-600'
                                                    }`}>
                                                    {txData.status.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Value */}
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                        <div className="flex items-center space-x-3">
                                            <DollarSign className="h-5 w-5 text-slate-500" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Value</p>
                                                <p className="text-sm text-slate-600">
                                                    {formatValue(txData.value, txData.chainName === 'Solana' ? 'SOL' : 'ETH')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Block/Slot Number */}
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="h-5 w-5 text-slate-500" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">
                                                    {txData.slot ? 'Slot' : 'Block'}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    {txData.slot || txData.blockNumber}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* From Address */}
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">From</p>
                                                    <p className="font-mono text-sm text-slate-600">{formatAddress(txData.from)}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={links.fromAddress}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-emerald-600 hover:text-emerald-700 text-sm"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>

                                    {/* To Address */}
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-5 h-5 bg-emerald-500 rounded-full"></div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">To</p>
                                                    <p className="font-mono text-sm text-slate-600">{formatAddress(txData.to)}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={links.toAddress}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-emerald-600 hover:text-emerald-700 text-sm"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Gas & Fees */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Fuel className="h-4 w-4 text-orange-600" />
                                            <span className="text-sm font-medium text-orange-800">Gas Used</span>
                                        </div>
                                        <p className="text-lg font-bold text-orange-900">{analysis.gasInfo.used}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                                            <span className="text-sm font-medium text-emerald-800">Gas Price</span>
                                        </div>
                                        <p className="text-lg font-bold text-emerald-900">{analysis.gasInfo.price}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-sm font-medium text-teal-800">Total Cost</span>
                                        </div>
                                        <p className="text-lg font-bold text-teal-900">{analysis.gasInfo.total}</p>
                                        {txData.fee && (
                                            <p className="text-xs text-teal-700 mt-1">Fee: {txData.fee}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Key Details */}
                                {analysis.details.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-3">Key Details</h4>
                                        <div className="space-y-2">
                                            {analysis.details.map((detail, index) => (
                                                <div key={index} className="flex items-start space-x-2">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                                                    <span className="text-sm text-slate-700">{detail}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {analysis.notes.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-3">Additional Notes</h4>
                                        <div className="space-y-2">
                                            {analysis.notes.map((note, index) => (
                                                <div key={index} className="flex items-start space-x-2">
                                                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                                                    <span className="text-sm text-slate-700">{note}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Risk Flags */}
                                {analysis.riskFlags.length > 0 && (
                                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                                            <h4 className="font-semibold text-amber-800">Important Notes</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {analysis.riskFlags.map((flag, index) => (
                                                <p key={index} className="text-sm text-amber-700">• {flag}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Transaction Timestamp */}
                                <div className="flex items-center space-x-2 text-sm text-slate-600">
                                    <Clock className="h-4 w-4" />
                                    <span>Executed on {new Date(txData.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'technical' && (
                            <div className="space-y-6">
                                {/* Risk Flags - Move to top of technical for visibility */}
                                {analysis.riskFlags.length > 0 && (
                                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                                            <h4 className="font-semibold text-amber-800">Security & Risk Analysis</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {analysis.riskFlags.map((flag, index) => (
                                                <div key={index} className="flex items-start space-x-2">
                                                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                    <p className="text-sm text-amber-700">{flag}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Signatures */}
                                {txData.signatures && txData.signatures.length > 0 && (
                                    <div>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Key className="h-5 w-5 text-slate-500" />
                                            <h4 className="font-semibold text-slate-900">Transaction Signatures</h4>
                                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                                {txData.signatures.length} signature{txData.signatures.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {txData.signatures.map((signature, index) => (
                                                <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">#{index + 1}</span>
                                                            <span className="font-mono text-sm text-slate-600">
                                                                {formatTxHash(signature)}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => copyToClipboard(signature, `signature-${index}`)}
                                                            className="text-emerald-600 hover:text-emerald-700 text-xs px-2 py-1 rounded hover:bg-emerald-50"
                                                        >
                                                            {copiedField === `signature-${index}` ? 'Copied!' : 'Copy'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Account Keys - Enhanced display */}
                                {txData.accountKeys && txData.accountKeys.length > 0 && (
                                    <div>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Users className="h-5 w-5 text-slate-500" />
                                            <h4 className="font-semibold text-slate-900">Account Keys</h4>
                                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                                {txData.accountKeys.length} accounts involved
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                                            {txData.accountKeys.map((key, index) => (
                                                <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-mono">
                                                                #{index}
                                                            </span>
                                                            <span className="font-mono text-sm text-slate-600">
                                                                {formatAddress(key)}
                                                            </span>
                                                            {index === 0 && (
                                                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">Signer</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <a
                                                                href={`https://solscan.io/account/${key}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-emerald-600 hover:text-emerald-700 text-xs"
                                                            >
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                            <button
                                                                onClick={() => copyToClipboard(key, `account-${index}`)}
                                                                className="text-emerald-600 hover:text-emerald-700 text-xs px-2 py-1 rounded hover:bg-emerald-50"
                                                            >
                                                                {copiedField === `account-${index}` ? 'Copied!' : 'Copy'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Instructions - Enhanced display */}
                                {txData.instructions && txData.instructions.length > 0 && (
                                    <div>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Code className="h-5 w-5 text-slate-500" />
                                            <h4 className="font-semibold text-slate-900">Transaction Instructions</h4>
                                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                                {txData.instructions.length} instruction{txData.instructions.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="space-y-4 max-h-80 overflow-y-auto">
                                            {(txData.instructions as SolanaInstruction[]).map((instruction, index) => (
                                                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-slate-700">
                                                                Instruction #{index + 1}
                                                            </span>
                                                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                                                Program #{instruction.programIdIndex}
                                                            </span>
                                                        </div>
                                                        {instruction.stackHeight !== null && (
                                                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                                                                Stack: {instruction.stackHeight}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        {/* Program Info */}
                                                        <div>
                                                            <p className="text-xs font-medium text-slate-600 mb-1">Program Account:</p>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-mono text-sm text-slate-700 bg-purple-50 px-2 py-1 rounded">
                                                                    {txData.accountKeys && txData.accountKeys[instruction.programIdIndex] 
                                                                        ? formatAddress(txData.accountKeys[instruction.programIdIndex])
                                                                        : `Index ${instruction.programIdIndex}`
                                                                    }
                                                                </span>
                                                                {txData.accountKeys && txData.accountKeys[instruction.programIdIndex] && (
                                                                    <button
                                                                        onClick={() => copyToClipboard(txData.accountKeys![instruction.programIdIndex], `program-${index}`)}
                                                                        className="text-emerald-600 hover:text-emerald-700 text-xs"
                                                                    >
                                                                        {copiedField === `program-${index}` ? 'Copied!' : 'Copy'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Accounts Involved */}
                                                        <div>
                                                            <p className="text-xs font-medium text-slate-600 mb-2">
                                                                Accounts Involved ({instruction.accounts.length}):
                                                            </p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {instruction.accounts.slice(0, 10).map((accountIndex, accIndex) => (
                                                                    <span key={accIndex} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono">
                                                                        #{accountIndex}
                                                                    </span>
                                                                ))}
                                                                {instruction.accounts.length > 10 && (
                                                                    <span className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded">
                                                                        +{instruction.accounts.length - 10} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Instruction Data */}
                                                        <div>
                                                            <p className="text-xs font-medium text-slate-600 mb-1">Instruction Data:</p>
                                                            <div className="bg-slate-100 p-2 rounded border">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-mono text-xs text-slate-700 break-all">
                                                                        {instruction.data.length > 40 
                                                                            ? `${instruction.data.slice(0, 40)}...` 
                                                                            : instruction.data
                                                                        }
                                                                    </span>
                                                                    <div className="flex items-center space-x-2 ml-2">
                                                                        <span className="text-xs text-slate-500">
                                                                            {instruction.data.length} chars
                                                                        </span>
                                                                        <button
                                                                            onClick={() => copyToClipboard(instruction.data, `data-${index}`)}
                                                                            className="text-emerald-600 hover:text-emerald-700 text-xs"
                                                                        >
                                                                            {copiedField === `data-${index}` ? 'Copied!' : 'Copy'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Chain Details */}
                                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Layers className="h-5 w-5 text-emerald-600" />
                                        <h4 className="font-semibold text-emerald-800">Chain Information</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-emerald-700 font-medium">Chain ID:</span>
                                            <span className="ml-2 text-emerald-600">{txData.chainId}</span>
                                        </div>
                                        <div>
                                            <span className="text-emerald-700 font-medium">Network:</span>
                                            <span className="ml-2 text-emerald-600">{txData.chainName}</span>
                                        </div>
                                        {txData.chainName === 'Solana' ? (
                                            <>
                                                <div>
                                                    <span className="text-emerald-700 font-medium">Slot:</span>
                                                    <span className="ml-2 text-emerald-600">{txData.slot}</span>
                                                </div>
                                                <div>
                                                    <span className="text-emerald-700 font-medium">Fee:</span>
                                                    <span className="ml-2 text-emerald-600">{txData.fee} lamports</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <span className="text-emerald-700 font-medium">Gas Used:</span>
                                                    <span className="ml-2 text-emerald-600">{txData.gasUsed}</span>
                                                </div>
                                                <div>
                                                    <span className="text-emerald-700 font-medium">Gas Price:</span>
                                                    <span className="ml-2 text-emerald-600">{txData.gasPrice}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Processing Time */}
                                <div className="text-center text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                                    <Clock className="h-4 w-4 inline mr-2" />
                                    Analysis processed in {analysis.metadata.timeProcessed ? 
                                        `${(Date.now() - analysis.metadata.timeProcessed) / 1000}s` : 
                                        'unknown time'
                                    }
                                </div>
                            </div>
                        )}

                        {activeTab === 'breakdown' && (
                            <div className="space-y-6">
                                {/* Contract Interactions */}
                                {analysis.detailedBreakdown.contractInteractions.length > 0 && (
                                    <div>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Shield className="h-5 w-5 text-slate-500" />
                                            <h4 className="font-semibold text-slate-900">Contract Interactions</h4>
                                        </div>
                                        <div className="space-y-3">
                                            {analysis.detailedBreakdown.contractInteractions.map((contract, index) => (
                                                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-3 h-3 rounded-full ${contract.verified ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900">{contract.name}</p>
                                                                <p className="text-xs text-slate-600">{contract.type}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${contract.verified
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {contract.verified ? 'Verified' : 'Unverified'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700 mb-2">{contract.description}</p>
                                                    {contract.methods.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-slate-600 mb-1">Methods:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {contract.methods.map((method, methodIndex) => (
                                                                    <span key={methodIndex} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                                                                        {method}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Token Transfers */}
                                {analysis.detailedBreakdown.tokenTransfers.length > 0 && (
                                    <div>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Zap className="h-5 w-5 text-slate-500" />
                                            <h4 className="font-semibold text-slate-900">Token Transfers</h4>
                                        </div>
                                        <div className="space-y-3">
                                            {analysis.detailedBreakdown.tokenTransfers.map((transfer, index) => (
                                                <div key={index} className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                                        <div>
                                                            <p className="font-medium text-emerald-800">Token</p>
                                                            <p className="text-emerald-700">{transfer.symbol || transfer.token}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-emerald-800">Amount</p>
                                                            <p className="text-emerald-700">{transfer.amount}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-emerald-800">From → To</p>
                                                            <p className="text-emerald-700 font-mono text-xs">
                                                                {formatAddress(transfer.from)} → {formatAddress(transfer.to)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {analysis.detailedBreakdown.contractInteractions.length === 0 &&
                                    analysis.detailedBreakdown.tokenTransfers.length === 0 &&
                                    analysis.detailedBreakdown.defiOperations.length === 0 &&
                                    analysis.detailedBreakdown.nftActivity.length === 0 && (
                                        <div className="text-center py-8">
                                            <Layers className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                            <p className="text-slate-500">
                                                No detailed breakdown data available for this transaction.
                                            </p>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Interface - Right Side (2/5 width = 40%) */}
            <div className="lg:col-span-2">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-emerald-100 shadow-lg flex flex-col h-[80vh] max-h-[800px] relative overflow-hidden">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-emerald-100 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            <MessageCircle className="h-5 w-5 text-emerald-600" />
                            <h3 className="text-lg font-semibold text-slate-900">
                                Ask Questions
                            </h3>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                            {apiResponse.conversationPrompt || 'Get AI-powered answers about this transaction'}
                        </p>
                    </div>

                    {/* Messages Area */}
                    <div 
                        ref={(el) => {
                            if (el) {
                                // Completely prevent scroll propagation
                                const preventScrollPropagation = (e: Event) => {
                                    e.stopPropagation();
                                };
                                
                                const preventWheelPropagation = (e: WheelEvent) => {
                                    const element = e.currentTarget as HTMLElement;
                                    const isScrolledToTop = element.scrollTop === 0;
                                    const isScrolledToBottom = element.scrollTop + element.clientHeight >= element.scrollHeight;
                                    
                                    // Always stop propagation
                                    e.stopPropagation();
                                    
                                    // Only prevent default if we're at boundaries to allow internal scrolling
                                    if ((isScrolledToTop && e.deltaY < 0) || (isScrolledToBottom && e.deltaY > 0)) {
                                        e.preventDefault();
                                    }
                                };

                                // Remove existing listeners first
                                el.removeEventListener('scroll', preventScrollPropagation);
                                el.removeEventListener('wheel', preventWheelPropagation);
                                el.removeEventListener('touchmove', preventScrollPropagation);
                                
                                // Add listeners
                                el.addEventListener('scroll', preventScrollPropagation, { passive: false });
                                el.addEventListener('wheel', preventWheelPropagation, { passive: false });
                                el.addEventListener('touchmove', preventScrollPropagation, { passive: false });
                            }
                        }}
                        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
                        style={{ 
                            overscrollBehavior: 'contain',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#10b981 transparent',
                            touchAction: 'pan-y'
                        }}
                    >
                        {messages.length === 0 ? (
                            <div className="text-center py-8">
                                <Bot className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">
                                    Ask me anything about this transaction. I can explain risks, optimizations, or any technical details.
                                </p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div key={message.id} className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] p-3 rounded-lg ${message.type === 'question'
                                            ? 'bg-emerald-600 text-white ml-4'
                                            : 'bg-slate-100 text-slate-900 mr-4'
                                        }`}>
                                        <div className="flex items-start space-x-2">
                                            {message.type === 'answer' && (
                                                <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-600" />
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
                                <div className="bg-slate-100 p-3 rounded-lg mr-4 max-w-[90%]">
                                    <div className="flex items-center space-x-2">
                                        <Bot className="h-4 w-4 text-emerald-600" />
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
                    <div className="p-4 border-t border-emerald-100 flex-shrink-0">
                        <form onSubmit={handleAskQuestion} className="space-y-3">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Ask about risks, optimizations..."
                                className="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                disabled={isAsking}
                            />
                            <button
                                type="submit"
                                disabled={!question.trim() || isAsking}
                                className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm shadow-lg"
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