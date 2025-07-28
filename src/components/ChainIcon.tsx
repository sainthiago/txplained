'use client';

interface ChainIconProps {
  chainName: string;
  className?: string;
}

export function ChainIcon({ chainName, className = "h-6 w-6" }: ChainIconProps) {
  const getChainIcon = (chain: string) => {
    const lowerChain = chain.toLowerCase();
    
    if (lowerChain.includes('ethereum')) {
      return (
        <div className={`${className} bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
          ETH
        </div>
      );
    }
    
    if (lowerChain.includes('base')) {
      return (
        <div className={`${className} bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
          ⚡
        </div>
      );
    }
    
    if (lowerChain.includes('arbitrum')) {
      return (
        <div className={`${className} bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
          ARB
        </div>
      );
    }
    
    if (lowerChain.includes('polygon')) {
      return (
        <div className={`${className} bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
          ⬟
        </div>
      );
    }
    
    if (lowerChain.includes('solana')) {
      return (
        <div className={`${className} bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
          ◎
        </div>
      );
    }
    
    if (lowerChain.includes('bnb') || lowerChain.includes('bsc')) {
      return (
        <div className={`${className} bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
          BNB
        </div>
      );
    }
    
    if (lowerChain.includes('optimism')) {
      return (
        <div className={`${className} bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
          OP
        </div>
      );
    }
    
    // Default blockchain icon
    return (
      <div className={`${className} bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
        ⛓️
      </div>
    );
  };

  return getChainIcon(chainName);
} 