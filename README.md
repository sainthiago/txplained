# txplained - Multi-Chain Transaction Analyzer

🔍 **tx or didn't happen.**

A clean, modern frontend for the txplained transaction analysis service. Simply paste any transaction hash from supported chains and get a human-friendly explanation of what happened.

## 🌐 Supported Chains

This app leverages the [txplained API](https://txplained-agent.vercel.app/) which supports:

### EVM Compatible Chains
- **Ethereum** - The original smart contract platform
- **Base** - Coinbase's L2 solution
- **Arbitrum One** - Optimistic rollup for Ethereum
- **Polygon** - Ethereum scaling solution
- **BNB Smart Chain** - Binance's EVM-compatible chain
- **Optimism** - Another popular Ethereum L2

### Non-EVM Chains
- **Solana** - High-performance blockchain with unique transaction structure

## ✨ Features

- **Multi-Chain Detection**: Automatically detects which chain a transaction belongs to
- **Smart Transaction Analysis**: Understands common transaction types:
  - Token transfers and swaps
  - NFT mints and transfers
  - DeFi operations (lending, staking, etc.)
  - Smart contract deployments
  - Complex multi-step transactions
- **Risk Assessment**: Identifies potential red flags and unusual behavior
- **Gas Analysis**: Breaks down transaction costs and efficiency
- **Explorer URL Support**: Paste explorer URLs directly (etherscan.io, solscan.io, etc.)

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   cd /Documents/bitte-protocol/explain-this-tx
   npm install
   npm run dev
   ```

2. **Open http://localhost:3000**

3. **Paste a transaction hash or explorer URL**
   - EVM: `0x1234567890abcdef...` (66 characters)
   - Solana: `5j6s8k9L3m4n...` (87-88 characters)
   - URLs: `https://etherscan.io/tx/0x...` or `https://solscan.io/tx/...`

## 📖 Example Transactions

### Ethereum Token Swap
```
0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Solana Token Transfer
```
3Kx4E8K9sD7F2vN8wQ6rT5yU9mL3pS1xC4vG7hJ2kF9eR6tY8uI1oP5qW3aS9dF7
```

### Base NFT Mint
```
0x9876543210fedcba0987654321fedcba0987654321fedcba0987654321fedcba
```

## 🔧 Architecture

This is a lightweight Next.js frontend that provides a clean interface for the txplained analysis service.

### How It Works
1. **User Input**: Accept transaction hashes or explorer URLs
2. **Format Validation**: Basic client-side validation for hash formats
3. **API Proxy**: Forward requests to the [txplained API](https://txplained-agent.vercel.app/)
4. **UI Display**: Present the analysis results in a chat-like interface

### Supported Transaction Types
The external txplained API handles analysis for:

#### EVM Chains
- ✅ Simple ETH/token transfers
- ✅ Uniswap/DEX swaps
- ✅ NFT mints and transfers
- ✅ Contract deployments
- ✅ Multi-signature operations
- ✅ DeFi protocol interactions

#### Solana
- ✅ SOL transfers
- ✅ SPL token operations
- ✅ Jupiter aggregator swaps
- ✅ Serum DEX trades
- ✅ Program deployments
- ✅ Complex instruction sequences

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React + Heroicons
- **API**: [txplained Service](https://txplained-agent.vercel.app/)

## 🎯 Use Cases

- **Learning**: Understand what your transactions actually did
- **Security**: Verify suspicious transactions for scams
- **Development**: Debug and analyze smart contract interactions
- **Research**: Study DeFi protocol usage patterns
- **Portfolio**: Track complex transaction histories

## 📝 API Usage

This frontend exposes a simple proxy API:

```typescript
POST /api/analyze-transaction
{
  "txHash": "0x1234..." // or Solana signature
}
```

The request is forwarded to the txplained service at `https://txplained-agent.vercel.app/api/analyze-transaction`.

For direct API access, you can use the txplained service directly.

## 🏷️ About txplained

**txplained** makes blockchain transactions understandable for everyone. Whether you're a DeFi power user, developer, or crypto curious, we decode the complexity so you can focus on what matters.

*tx or didn't happen* - because every transaction tells a story.

---

*Built with ❤️ for the multi-chain future*
