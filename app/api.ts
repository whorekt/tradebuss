import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch top boosted tokens
    const res = await fetch('https://api.dexscreener.com/token-boosts/top/v1', {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    const data = await res.json();

    // We will just return the raw data, and filter it in the component 
    // to make sure we don't accidentally delete valid tokens.
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
}