import { Send, Loader2 } from 'lucide-react';

interface TransactionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  placeholder: string;
}

export function TransactionInput({ 
  value, 
  onChange, 
  onSubmit, 
  isLoading, 
  placeholder 
}: TransactionInputProps) {
  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full px-4 py-3 pr-12 text-sm border border-slate-300 dark:border-slate-600 rounded-lg 
                   bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                   placeholder-slate-500 dark:placeholder-slate-400
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed
                   font-mono"
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className="absolute right-2 p-2 text-blue-600 dark:text-blue-400 
                   hover:text-blue-700 dark:hover:text-blue-300
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
      
      <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
        Supported: Ethereum, Base, Arbitrum, Polygon, BSC, Optimism, Solana
      </div>
    </form>
  );
} 