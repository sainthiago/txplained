export interface TransactionData {
  hash: string;
  chainId: number;
  chainName: string;
  blockNumber: number;
  from: string;
  to: string | null;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'success' | 'failed';
  methodName?: string;
  functionName?: string;
  logs: TransactionLog[];
  timestamp: number;
  // Solana-specific fields
  slot?: number;
  fee?: string;
  signatures?: string[];
  accountKeys?: string[];
  instructions?: SolanaInstruction[];
}

export interface TransactionLog {
  address: string;
  topics: string[];
  data: string;
  decoded?: {
    name: string;
    args: Record<string, unknown>[];
  };
}

export interface SolanaInstruction {
  programId: string;
  accounts: string[];
  data: string;
  innerInstructions?: SolanaInstruction[];
}

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  // Add chain type to distinguish between EVM and Solana
  type?: 'evm' | 'solana';
}

export interface TransactionAnalysis {
  summary: string;
  action: string;
  result: string;
  details: string[];
  notes: string[];
  riskFlags: string[];
  gasInfo: {
    used: string;
    price: string;
    total: string;
  };
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  transactionHash?: string;
  analysis?: TransactionAnalysis;
  isLoading?: boolean;
} 