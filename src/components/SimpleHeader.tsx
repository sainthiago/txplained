'use client';

import { ArrowRight, Search, Zap } from 'lucide-react';
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
        <header className="bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-3 items-center gap-4">
                    {/* Logo */}
                    <Link href="/">
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                                <Zap className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-slate-900">
                                    TXplained
                                </span>
                                <div className="text-xs text-slate-600 font-medium">
                                    TX or didn&apos;t happen
                                </div>
                            </div>
                        </div></Link>

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
                                    className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-l-lg bg-white text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors border-r-0"
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                type="submit"
                                onClick={handleSearch}
                                disabled={!input.trim() || isLoading}
                                className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:bg-slate-400 text-white rounded-r-lg border border-emerald-500 transition-colors flex items-center justify-center min-w-[50px] shadow-lg"
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
                    <div className="hidden lg:flex items-center justify-end space-x-3 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            <span>Multi-chain</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                            <span>AI-powered</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
} 