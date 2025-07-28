import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/lib/transaction-service';
import { AIAnalyzer } from '@/lib/ai-analyzer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { txHash } = body;

    if (!txHash || typeof txHash !== 'string') {
      return NextResponse.json(
        { error: 'Transaction hash is required' }, 
        { status: 400 }
      );
    }

    // Validate transaction hash format
    // Validate transaction hash format (EVM or Solana)
    const isEvmHash = /^0x[a-fA-F0-9]{64}$/.test(txHash);
    const isSolanaSignature = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(txHash);
    
    if (!isEvmHash && !isSolanaSignature) {
      return NextResponse.json(
        { error: 'Invalid transaction hash format. Please provide a valid EVM hash (0x...) or Solana signature.' }, 
        { status: 400 }
      );
    }

    const transactionService = new TransactionService();
    const aiAnalyzer = new AIAnalyzer(transactionService);

    // Detect chain and fetch transaction data
    const txData = await transactionService.detectChainAndFetchTransaction(txHash);
    
    if (!txData) {
      return NextResponse.json(
        { error: 'Transaction not found on any supported chain' }, 
        { status: 404 }
      );
    }

    // Analyze the transaction
    const analysis = await aiAnalyzer.analyzeTransaction(txData);
    
    // Generate human-friendly explanation
    const explanation = generateExplanation(analysis, txData);

    return NextResponse.json({
      success: true,
      txData,
      analysis,
      explanation,
    });

  } catch (error) {
    console.error('Transaction analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

function generateExplanation(analysis: { action: string; result: string; summary: string; details: string[]; riskFlags: string[]; gasInfo: { used: string; price: string; total: string } }, txData: { hash: string; chainName: string }): string {
  let explanation = `**${analysis.action}**\n\n`;
  
  explanation += `${analysis.result}\n\n`;
  
  explanation += `**What happened:**\n`;
  explanation += `${analysis.summary}\n\n`;
  
  if (analysis.details.length > 0) {
    explanation += `**Details:**\n`;
    analysis.details.forEach((detail: string) => {
      explanation += `• ${detail}\n`;
    });
    explanation += '\n';
  }
  
  if (analysis.riskFlags.length > 0) {
    explanation += `**⚠️ Notes:**\n`;
    analysis.riskFlags.forEach((flag: string) => {
      explanation += `• ${flag}\n`;
    });
    explanation += '\n';
  }
  
  explanation += `**Gas Information:**\n`;
  explanation += `• Gas Used: ${analysis.gasInfo.used}\n`;
  explanation += `• Gas Price: ${analysis.gasInfo.price}\n`;
  explanation += `• Total Cost: ${analysis.gasInfo.total}\n\n`;
  
  explanation += `*Analyzed transaction ${txData.hash.slice(0, 10)}...${txData.hash.slice(-8)} on ${txData.chainName}*`;
  
  return explanation;
} 