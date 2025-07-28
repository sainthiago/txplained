// Keep only the interfaces that are still used by the frontend
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

export interface TransactionData {
  hash: string;
  chainName: string;
  blockNumber?: number;
  from?: string;
  to?: string;
  timestamp?: number;
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