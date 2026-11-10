import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch recently created tokens from Jupiter (includes logos & symbols)
    const res = await fetch('https://api.jup.ag/tokens/v2/recent', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    
    if (!res.ok) throw new Error('Jupiter API failed');
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}