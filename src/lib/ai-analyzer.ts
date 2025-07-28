import { TransactionData, TransactionAnalysis } from '@/types';
import { getChainById } from './chains';

export class AIAnalyzer {
  private transactionService: {
    formatValue: (value: string, decimals?: number) => string;
    formatGasPrice: (gasPrice: string) => string;
    calculateTotalGasCost: (gasUsed: string, gasPrice: string) => string;
    formatSolanaFee: (fee: string) => string;
  };

  constructor(transactionService: {
    formatValue: (value: string, decimals?: number) => string;
    formatGasPrice: (gasPrice: string) => string;
    calculateTotalGasCost: (gasUsed: string, gasPrice: string) => string;
    formatSolanaFee: (fee: string) => string;
  }) {
    this.transactionService = transactionService;
  }

  async analyzeTransaction(txData: TransactionData): Promise<TransactionAnalysis> {
    const chain = getChainById(txData.chainId);
    const nativeSymbol = chain?.nativeCurrency.symbol || 'ETH';
    const isSolana = chain?.type === 'solana';
    
    // Format values based on chain type
    let ethValue, gasUsed, gasPrice, totalGasCost;
    
    if (isSolana) {
      ethValue = this.transactionService.formatValue(txData.value || '0', 9); // SOL has 9 decimals
      gasUsed = 'N/A';
      gasPrice = 'N/A';
      totalGasCost = this.transactionService.formatSolanaFee(txData.fee || '0');
    } else {
      ethValue = this.transactionService.formatValue(txData.value);
      gasUsed = parseInt(txData.gasUsed, 16).toLocaleString();
      gasPrice = this.transactionService.formatGasPrice(txData.gasPrice);
      totalGasCost = this.transactionService.calculateTotalGasCost(txData.gasUsed, txData.gasPrice);
    }

    // Determine transaction type and action
    const { action, details, riskFlags } = isSolana 
      ? this.analyzeSolanaTransaction(txData, ethValue, nativeSymbol)
      : this.analyzeEvmTransaction(txData, ethValue, nativeSymbol);
    
    // Generate result message
    const result = txData.status === 'success' 
      ? '✅ Transaction completed successfully'
      : '❌ Transaction failed';

    // Generate comprehensive details
    const transactionDetails = [
      `Chain: ${txData.chainName}`,
      isSolana ? `Slot: ${txData.slot || txData.blockNumber}` : `Block: ${txData.blockNumber.toLocaleString()}`,
      `From: ${this.formatAddress(txData.from)}`,
      txData.to ? `To: ${this.formatAddress(txData.to)}` : (isSolana ? 'Program Interaction' : 'Contract Creation'),
      ...details
    ];

    const notes = [
      `Transaction executed on ${txData.chainName}`,
      isSolana 
        ? `Contains ${txData.instructions?.length || 0} instructions`
        : txData.logs.length > 0 ? `Generated ${txData.logs.length} event logs` : 'No events emitted',
      new Date(txData.timestamp).toLocaleString()
    ];

    return {
      summary: this.generateSummary(action, txData.status, txData.chainName),
      action,
      result,
      details: transactionDetails,
      notes,
      riskFlags,
      gasInfo: {
        used: gasUsed,
        price: gasPrice,
        total: `${totalGasCost} ${nativeSymbol}`,
      },
    };
  }

  private analyzeEvmTransaction(txData: TransactionData, ethValue: string, nativeSymbol: string): {
    action: string;
    details: string[];
    riskFlags: string[];
  } {
    const details: string[] = [];
    const riskFlags: string[] = [];
    let action = '';

    // Analyze value transfer
    const hasValue = BigInt(txData.value) > BigInt(0);
    if (hasValue) {
      details.push(`Value: ${ethValue} ${nativeSymbol}`);
    }

    // Analyze transaction type
    if (!txData.to) {
      action = 'Contract Deployment';
      details.push('Deployed a new smart contract');
    } else if (hasValue && txData.logs.length === 0) {
      action = `Simple ${nativeSymbol} Transfer`;
      details.push(`Sent ${ethValue} ${nativeSymbol} to ${this.formatAddress(txData.to)}`);
    } else if (txData.logs.length > 0) {
      // Analyze logs to understand the transaction
      const logAnalysis = this.analyzeLogs(txData.logs);
      action = logAnalysis.action || 'Smart Contract Interaction';
      details.push(...logAnalysis.details);
      riskFlags.push(...logAnalysis.riskFlags);
    } else {
      action = 'Smart Contract Interaction';
      details.push('Interacted with a smart contract');
    }

    // Add risk analysis
    if (txData.status === 'failed') {
      riskFlags.push('Transaction failed - check for insufficient funds or contract errors');
    }

    // High gas usage check
    const gasUsed = parseInt(txData.gasUsed, 16);
    if (gasUsed > 500000) {
      riskFlags.push('High gas usage - complex transaction or inefficient contract');
    }

    // High gas price check
    const gasPriceGwei = parseInt(txData.gasPrice, 16) / 1e9;
    if (gasPriceGwei > 100) {
      riskFlags.push('Very high gas price - paid premium for fast execution');
    }

    return { action, details, riskFlags };
  }

  private analyzeSolanaTransaction(txData: TransactionData, solValue: string, nativeSymbol: string): {
    action: string;
    details: string[];
    riskFlags: string[];
  } {
    const details: string[] = [];
    const riskFlags: string[] = [];
    let action = '';

    const instructions = txData.instructions || [];
    const accountKeys = txData.accountKeys || [];

    // Analyze Solana instructions
    if (instructions.length === 0) {
      action = 'Simple SOL Transfer';
      details.push('Transferred SOL between accounts');
    } else if (instructions.length === 1) {
      const instruction = instructions[0];
      action = this.analyzeSolanaInstruction(instruction, accountKeys);
      details.push(`Program: ${this.formatAddress(instruction.programId)}`);
      details.push(`Affected ${instruction.accounts.length} accounts`);
    } else {
      action = 'Complex Transaction';
      details.push(`Executed ${instructions.length} instructions`);
      const uniquePrograms = new Set(instructions.map(ix => ix.programId));
      details.push(`Interacted with ${uniquePrograms.size} programs`);
    }

    // Add fee information
    if (txData.fee) {
      const feeInSol = this.transactionService.formatSolanaFee(txData.fee);
      details.push(`Transaction fee: ${feeInSol} SOL`);
    }

    // Risk analysis for Solana
    if (txData.status === 'failed') {
      riskFlags.push('Transaction failed - check for insufficient funds or program errors');
    }

    // High fee check (normal Solana fees are very low)
    const feeInLamports = parseInt(txData.fee || '0');
    if (feeInLamports > 10000) { // 0.00001 SOL
      riskFlags.push('Higher than normal transaction fee');
    }

    // Multiple program interactions
    if (instructions.length > 5) {
      riskFlags.push('Complex transaction with many instructions - verify all actions');
    }

    return { action, details, riskFlags };
  }

  private analyzeSolanaInstruction(instruction: { programId: string; accounts: string[]; data: string }, accountKeys: string[]): string {
    const programId = instruction.programId;
    
    // Common Solana program IDs
    const commonPrograms = {
      '11111111111111111111111111111111': 'System Program',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'SPL Token Program',
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': 'Associated Token Account Program',
      '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM': 'Serum DEX Program',
      'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': 'Jupiter Aggregator',
      'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo': 'Solend Protocol',
    };

    const programName = commonPrograms[programId as keyof typeof commonPrograms];
    
    if (programName) {
      switch (programName) {
        case 'System Program':
          return 'System Operation (SOL Transfer or Account Creation)';
        case 'SPL Token Program':
          return 'Token Transfer';
        case 'Associated Token Account Program':
          return 'Token Account Creation';
        case 'Serum DEX Program':
          return 'DEX Trade on Serum';
        case 'Jupiter Aggregator':
          return 'Token Swap via Jupiter';
        case 'Solend Protocol':
          return 'DeFi Operation on Solend';
        default:
          return `${programName} Interaction`;
      }
    }

    return 'Program Interaction';
  }

  private analyzeLogs(logs: { topics: string[]; address: string; data: string }[]): {
    action: string | null;
    details: string[];
    riskFlags: string[];
  } {
    const details: string[] = [];
    const riskFlags: string[] = [];
    let action: string | null = null;

    // Common event signatures
    const transferSig = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'; // Transfer
    const approvalSig = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'; // Approval
    const swapSig = '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822'; // Swap (Uniswap V2)

    const hasTransfer = logs.some(log => log.topics[0] === transferSig);
    const hasApproval = logs.some(log => log.topics[0] === approvalSig);
    const hasSwap = logs.some(log => log.topics[0] === swapSig);

    if (hasSwap) {
      action = 'Token Swap';
      details.push('Swapped tokens using a DEX');
      details.push(`Generated ${logs.length} events during the swap`);
    } else if (hasTransfer && hasApproval) {
      action = 'Token Approval & Transfer';
      details.push('Approved and transferred tokens');
    } else if (hasTransfer) {
      action = 'Token Transfer';
      details.push('Transferred tokens');
    } else if (hasApproval) {
      action = 'Token Approval';
      details.push('Approved tokens for spending');
      riskFlags.push('Token approval granted - monitor for unauthorized usage');
    } else {
      action = 'Complex Contract Interaction';
      details.push(`Executed ${logs.length} contract events`);
    }

    return { action, details, riskFlags };
  }

  private formatAddress(address: string): string {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private generateSummary(action: string, status: string, chainName: string): string {
    const statusText = status === 'success' ? 'successfully executed' : 'failed to execute';
    return `${action} ${statusText} on ${chainName}`;
  }
} 