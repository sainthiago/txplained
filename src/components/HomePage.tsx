'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Zap, Shield, BarChart3, Github, Twitter } from 'lucide-react';

export function HomePage() {
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    if (searchValue.trim() && !isSearching) {
      setIsSearching(true);
      router.push(`/${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-emerald-100">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">txplained</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">About</a>
            <a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">Docs</a>
            <a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative px-6 pt-20 pb-32">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-emerald-200/30 blur-3xl"></div>
          <div className="absolute top-40 -left-32 w-80 h-80 rounded-full bg-teal-200/30 blur-3xl"></div>
          <div className="absolute bottom-40 right-1/3 w-60 h-60 rounded-full bg-green-200/20 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full bg-emerald-100/80 px-4 py-2 text-sm text-emerald-700 backdrop-blur-sm border border-emerald-200">
            <Zap className="mr-2 h-4 w-4 text-emerald-600" />
            Multi-chain transaction analyzer
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 md:text-7xl">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              txplained
            </span>
            <br />
            <span className="text-3xl md:text-5xl font-medium text-slate-700">
              transactions made easy for you
            </span>
          </h1>

          {/* Subheading */}
          <p className="mb-12 text-xl text-slate-600 max-w-2xl mx-auto">
            tx or didn&apos;t happen. Get AI-powered analysis of any blockchain transaction across Ethereum, Solana, and more.
          </p>

          {/* Search Box */}
          <div className="mb-16 mx-auto max-w-2xl">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-emerald-200 p-2 shadow-lg">
                  <div className="flex items-center">
                    <div className="flex-1 flex items-center">
                      <Search className="ml-4 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Paste transaction hash or explorer URL..."
                        className="flex-1 bg-transparent border-0 px-4 py-4 text-slate-900 placeholder-slate-500 focus:outline-none text-lg"
                        disabled={isSearching}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!searchValue.trim() || isSearching}
                      className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-400 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <span>Analyze</span>
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Supported chains */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Ethereum</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Solana</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Base</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>Arbitrum</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Polygon</span>
              </span>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-emerald-100 hover:bg-white/80 hover:border-emerald-200 transition-all duration-300 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-slate-600">
                Get human-friendly explanations of complex blockchain transactions using advanced AI.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-emerald-100 hover:bg-white/80 hover:border-emerald-200 transition-all duration-300 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Security Insights</h3>
              <p className="text-slate-600">
                Identify potential risks, verify contracts, and understand security implications.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-emerald-100 hover:bg-white/80 hover:border-emerald-200 transition-all duration-300 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Multi-Chain Support</h3>
              <p className="text-slate-600">
                Analyze transactions across Ethereum, Solana, Polygon, and many other blockchains.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-emerald-100 bg-white/80 backdrop-blur-md px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">txplained</span>
              </div>
              <p className="text-slate-600 max-w-md">
                Making blockchain transactions understandable for everyone. tx or didn&apos;t happen.
              </p>
            </div>

            <div>
              <h4 className="text-slate-900 font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-600">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Supported Chains</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-slate-600">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-emerald-100 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">
              © 2024 txplained. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors text-sm">Privacy</a>
              <a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors text-sm">Terms</a>
              <a href="#" className="text-slate-500 hover:text-emerald-600 transition-colors text-sm">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 