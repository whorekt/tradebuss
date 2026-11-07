import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.dexscreener.com/token-boosts/top/v1', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`DexScreener responded with status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}