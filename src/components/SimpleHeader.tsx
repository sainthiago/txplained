'use client';

import { Activity, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SimpleHeaderProps {
    initialValue?: string;
    isLoading: boolean;
}

export function SimpleHeader({ initialValue = '', isLoading }: SimpleHeaderProps) {
    const [input, setInput] = useState(initialValue);
    const router = useRouter();

    // Update input when initialValue changes (e.g., URL navigation)
    useEffect(() => {
        setInput(initialValue);
    }, [initialValue]);

    const handleSearch = () => {
        if (input.trim() && !isLoading) {
            // Navigate to the dynamic route
            router.push(`/${encodeURIComponent(input.trim())}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    };

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-3 items-center gap-4">
                    {/* Logo */}
                    <Link href="/">
                        <div className="flex items-center space-x-2">
                            <Activity className="h-7 w-7 text-blue-600" />
                            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                TXplained
                                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                    TX or didn&apos;t happen
                                </div>
                            </span>
                        </div>
                    </Link>

                    {/* Centered Search Bar */}
                    <form onSubmit={handleSubmit} className="flex justify-center">
                        <div className="relative w-full max-w-xl flex">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Search transaction hash (0x... or Solana signature)"
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-l-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors border-r-0"
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                onClick={handleSearch}
                                disabled={!input.trim() || isLoading}
                                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-r-lg border border-blue-600 dark:border-blue-600 transition-colors flex items-center justify-center min-w-[50px]"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <ArrowRight className="h-4 w-4" />
                                )}
                            </button>
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