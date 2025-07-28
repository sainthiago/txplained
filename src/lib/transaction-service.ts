import { TransactionData, ChainConfig } from '@/types';
import { SUPPORTED_CHAINS } from './chains';

export class TransactionService {
  private async fetchTransactionFromChain(
    txHash: string, 
    chain: ChainConfig
  ): Promise<TransactionData | null> {
    if (chain.type === 'solana') {
      return this.fetchSolanaTransaction(txHash, chain);
    } else {
      return this.fetchEvmTransaction(txHash, chain);
    }
  }

  private async fetchEvmTransaction(
    txHash: string,
    chain: ChainConfig
  ): Promise<TransactionData | null> {
    try {
      const response = await fetch(chain.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [txHash],
          id: 1,
        }),
      });

      const data = await response.json();
      
      if (!data.result) {
        return null;
      }

      const tx = data.result;

      // Get transaction receipt for status and logs
      const receiptResponse = await fetch(chain.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [txHash],
          id: 2,
        }),
      });

      const receiptData = await receiptResponse.json();
      const receipt = receiptData.result;

      if (!receipt) {
        return null;
      }

      // Get block for timestamp
      const blockResponse = await fetch(chain.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBlockByNumber',
          params: [tx.blockNumber, false],
          id: 3,
        }),
      });

      const blockData = await blockResponse.json();
      const block = blockData.result;

      return {
        hash: txHash,
        chainId: chain.chainId,
        chainName: chain.name,
        blockNumber: parseInt(tx.blockNumber, 16),
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gasUsed: receipt.gasUsed,
        gasPrice: tx.gasPrice,
        status: receipt.status === '0x1' ? 'success' : 'failed',
        logs: receipt.logs || [],
        timestamp: parseInt(block?.timestamp || '0', 16) * 1000,
      };
    } catch (error) {
      console.error(`Error fetching from ${chain.name}:`, error);
      return null;
    }
  }

  private async fetchSolanaTransaction(
    txSignature: string,
    chain: ChainConfig
  ): Promise<TransactionData | null> {
    try {
      const response = await fetch(chain.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [
            txSignature,
            {
              encoding: 'json',
              maxSupportedTransactionVersion: 0,
            }
          ],
        }),
      });

      const data = await response.json();
      
      if (!data.result) {
        return null;
      }

      const tx = data.result;
      const meta = tx.meta;
      const transaction = tx.transaction;

      // Get block time
      const blockTimeResponse = await fetch(chain.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'getBlockTime',
          params: [tx.slot],
        }),
      });

      const blockTimeData = await blockTimeResponse.json();
      const blockTime = blockTimeData.result;

      return {
        hash: txSignature,
        chainId: chain.chainId,
        chainName: chain.name,
        blockNumber: tx.slot,
        from: transaction.message.accountKeys[0] || '', // First account is typically the fee payer
        to: transaction.message.accountKeys[1] || null, // Second account is often the recipient
        value: '0', // Solana doesn't have a single "value" field like EVM
        gasUsed: meta?.fee?.toString() || '0',
        gasPrice: '1', // Solana uses flat fees, not gas price
        status: meta?.err ? 'failed' : 'success',
        logs: [], // We'll populate this differently for Solana
        timestamp: blockTime ? blockTime * 1000 : Date.now(),
        // Solana-specific fields
        slot: tx.slot,
        fee: meta?.fee?.toString() || '0',
        signatures: transaction.signatures,
        accountKeys: transaction.message.accountKeys,
        instructions: transaction.message.instructions,
      };
    } catch (error) {
      console.error(`Error fetching Solana transaction from ${chain.name}:`, error);
      return null;
    }
  }

  isValidSolanaSignature(signature: string): boolean {
    // Solana signatures are base58 encoded and typically 87-88 characters long
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
    return base58Regex.test(signature.trim());
  }

  isValidEvmTxHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash.trim());
  }

  async detectChainAndFetchTransaction(txHash: string): Promise<TransactionData | null> {
    // First determine if it's an EVM hash or Solana signature
    const isEvmHash = this.isValidEvmTxHash(txHash);
    const isSolanaSignature = this.isValidSolanaSignature(txHash);

    if (!isEvmHash && !isSolanaSignature) {
      return null;
    }

    // Filter chains based on transaction type
    const relevantChains = SUPPORTED_CHAINS.filter(chain => {
      if (isEvmHash) {
        return chain.type !== 'solana';
      } else if (isSolanaSignature) {
        return chain.type === 'solana';
      }
      return false;
    });

    // Try relevant chains in parallel
    const promises = relevantChains.map(chain => 
      this.fetchTransactionFromChain(txHash, chain)
    );

    const results = await Promise.allSettled(promises);
    
    // Find the first successful result
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
    }

    return null;
  }

  formatValue(value: string, decimals: number = 18): string {
    const bigIntValue = BigInt(value);
    const divisor = BigInt(10 ** decimals);
    const quotient = bigIntValue / divisor;
    const remainder = bigIntValue % divisor;
    
    if (remainder === BigInt(0)) {
      return quotient.toString();
    }
    
    const decimalPart = remainder.toString().padStart(decimals, '0');
    const trimmedDecimal = decimalPart.replace(/0+$/, '');
    
    if (trimmedDecimal === '') {
      return quotient.toString();
    }
    
    return `${quotient}.${trimmedDecimal}`;
  }

  formatGasPrice(gasPrice: string): string {
    const gasPriceInGwei = BigInt(gasPrice) / BigInt(10 ** 9);
    return `${gasPriceInGwei.toString()} Gwei`;
  }

  calculateTotalGasCost(gasUsed: string, gasPrice: string): string {
    const totalWei = BigInt(gasUsed) * BigInt(gasPrice);
    return this.formatValue(totalWei.toString());
  }

  formatSolanaFee(fee: string): string {
    // Solana fees are in lamports (1 SOL = 1e9 lamports)
    return this.formatValue(fee, 9);
  }
} 