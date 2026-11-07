import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.dexscreener.com/token-boosts/top/v1', {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
}