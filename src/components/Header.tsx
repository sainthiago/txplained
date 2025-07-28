import { Search, Activity } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  TXplained
                </h1>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  TX or didn&apos;t happen
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Search className="h-4 w-4" />
              <span>Support for Ethereum, Base, Arbitrum, Polygon, Solana & more</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 