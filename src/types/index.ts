// Updated interfaces to match the new TXplained API response
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
  detailedBreakdown: {
    tokenTransfers: TokenTransfer[];
    contractInteractions: ContractInteraction[];
    defiOperations: unknown[];
    nftActivity: unknown[];
  };
  links: {
    blockExplorer: string;
    transaction: string;
    fromAddress: string;
    toAddress: string;
  };
  metadata: {
    complexity: string;
    categories: string[];
    timeProcessed: number;
  };
}

export interface TokenTransfer {
  token: string;
  from: string;
  to: string;
  amount: string;
  symbol?: string;
  decimals?: number;
}

export interface ContractInteraction {
  name: string;
  type: string;
  methods: string[];
  description: string;
  verified: boolean;
}

// More detailed instruction interface for Solana
export interface SolanaInstruction {
  accounts: number[];
  data: string;
  programIdIndex: number;
  stackHeight: number | null;
}

export interface TransactionData {
  hash: string;
  chainId: string;
  chainName: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: string;
  logs: unknown[];
  timestamp: number;
  slot?: number; // Solana specific
  fee?: string; // Solana specific
  signatures?: string[]; // Solana specific
  accountKeys?: string[]; // Solana specific
  instructions?: SolanaInstruction[]; // Solana specific with better typing
}

export interface APIResponse {
  success: boolean;
  isFollowUp: boolean;
  txData: TransactionData;
  analysis: TransactionAnalysis;
  explanation: string;
  links: {
    blockExplorer: string;
    transaction: string;
    fromAddress: string;
    toAddress: string;
  };
  metadata: {
    complexity: string;
    categories: string[];
    timeProcessed: number;
  };
  detailedBreakdown: {
    tokenTransfers: TokenTransfer[];
    contractInteractions: ContractInteraction[];
    defiOperations: unknown[];
    nftActivity: unknown[];
  };
  conversationPrompt: string;
  naturalSummary: string
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