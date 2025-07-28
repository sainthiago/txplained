'use client';

import { useState } from 'react';
import { Search, Activity } from 'lucide-react';

interface SimpleHeaderProps {
  onSearch: (txHash: string) => void;
  isLoading: boolean;
}

export function SimpleHeader({ onSearch, isLoading }: SimpleHeaderProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSearch(input.trim());
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Activity className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              TXplained
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                TX or didn&apos;t happen
              </div>
            </span>
          </div>

          {/* Centered Search Bar */}
          <form onSubmit={handleSubmit} className="flex justify-center">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search transaction hash (0x... or Solana signature)"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </form>

          {/* Chain Support Indicator */}
          <div className="hidden lg:flex items-center justify-end space-x-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>ETH</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>SOL</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>+</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 