import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { txHash, question } = body;

    if (!txHash || typeof txHash !== 'string') {
      return NextResponse.json(
        { error: 'Transaction hash is required' }, 
        { status: 400 }
      );
    }

    // Validate transaction hash format (EVM or Solana)
    const isEvmHash = /^0x[a-fA-F0-9]{64}$/.test(txHash);
    const isSolanaSignature = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(txHash);
    
    if (!isEvmHash && !isSolanaSignature) {
      return NextResponse.json(
        { error: 'Invalid transaction hash format. Please provide a valid EVM hash (0x...) or Solana signature.' }, 
        { status: 400 }
      );
    }

    // Use the same endpoint for both initial analysis and follow-up questions
    const endpoint = 'https://txplained-agent.vercel.app/api/tools/analyze-transaction';

    // Call the external txplained API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        txHash,
        ...(question && { question }) // Include question if provided
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { error: `Transaction analysis failed: ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return the data from the external API
    return NextResponse.json(data);

  } catch (error) {
    console.error('Transaction analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

 