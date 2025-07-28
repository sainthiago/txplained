'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';
import { MessageBubble } from './MessageBubble';
import { TransactionInput } from './TransactionInput';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Welcome to TXplained! 🔍\n\nI'm your AI transaction analyst. Paste any transaction hash from Ethereum, Base, Arbitrum, Polygon, Solana, or other supported chains, and I'll explain what happened in plain English.\n\n*TX or didn't happen* - let's decode the blockchain together!",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isValidTxHash = (hash: string): boolean => {
    const evmHash = /^0x[a-fA-F0-9]{64}$/.test(hash.trim());
    const solanaSignature = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(hash.trim());
    return evmHash || solanaSignature;
  };

  const extractTxHashFromUrl = (input: string): string | null => {
    // Extract hash from explorer URLs
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
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "❌ Invalid transaction hash. Please provide a valid EVM transaction hash (66-character hex starting with '0x'), Solana signature (87-88 character base58), or a valid explorer URL.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: Date.now(),
      transactionHash: txHash,
    };

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: 'Analyzing transaction... 🔍',
      timestamp: Date.now(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call our transaction analysis API
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

      const analysis = await response.json();

      // Replace loading message with analysis
      setMessages(prev => 
        prev.map(msg => 
          msg.isLoading 
            ? {
                ...msg,
                content: analysis.explanation,
                isLoading: false,
                analysis: analysis.analysis,
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Analysis error:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.isLoading 
            ? {
                ...msg,
                content: `❌ Sorry, I couldn't analyze this transaction. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="mt-4">
        <TransactionInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder="Paste transaction hash or explorer URL (EVM: 0x1234... | Solana: 5j6s8... | URLs supported)"
        />
      </div>
    </div>
  );
} 