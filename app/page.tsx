'use client';
import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import TimeframeSelector from '@/frontend/components/TimeframeSelector';
import BusCard from '@/frontend/components/BusCard';
import TradeModal from '@/frontend/components/TradeModal';
import ActivePositions from '@/frontend/components/ActivePositions';
import { SignalSetup, Timeframe } from '@/lib/types';
import { Search, Loader2 } from 'lucide-react';

const SOL_SETUP: SignalSetup = {
  id: 'sol-1', pair: 'SOL/USDC', 
  baseToken: 'So11111111111111111111111111111111111111112', 
  quoteToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 
  timeframe: '1h', entry: 142.50, takeProfit: 178.40, stopLoss: 130.10,
  tpPct: 25.6, slPct: 8.3, rrRatio: 3.1, rsi: 26.1, ema200: 135.0, support: 140.0,
  confluences: ['RSI<=30', 'Above 200EMA', 'At Support'], createdAt: Date.now()
};

export default function Home() {
  const [tf, setTf] = useState<Timeframe>('1h');
  const [modalSetup, setModalSetup] = useState<SignalSetup | null>(null);
  const [searchCA, setSearchCA] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SignalSetup | null>(null);
  const [error, setError] = useState('');

  const setups = tf === '1h' ? (searchResult ? [searchResult] : [SOL_SETUP]) : [];

  const handleSearch = async () => {
    if (!searchCA) return;
    setIsSearching(true);
    setError('');

    try {
      // 1. Fetch token data from DexScreener
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${searchCA}`);
      const data = await res.json();

      if (!data.pairs || data.pairs.length === 0) {
        throw new Error('Token not found on DexScreener');
      }

      // Filter for Solana pairs and get the first one
      const pair = data.pairs.find((p: any) => p.chainId === 'solana');
      if (!pair) throw new Error('No Solana liquidity found for this token');

      const price = parseFloat(pair.priceUsd);
      
      // 2. Create a dynamic setup based on real price
      const newSetup: SignalSetup = {
        id: pair.pairAddress,
        pair: `${pair.baseToken.symbol}/USDC`,
        baseToken: pair.baseToken.address,
        quoteToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        timeframe: tf,
        entry: price,
        takeProfit: price * 1.25, // +25% target
        stopLoss: price * 0.92,   // -8% stop
        tpPct: 25, 
        slPct: 8,
        rrRatio: 3.1, 
        rsi: 28.4, 
        ema200: price * 0.95, 
        support: price * 0.98,
        confluences: ['DexScreener Verified', 'Live Price'], 
        createdAt: Date.now()
      };

      setSearchResult(newSetup);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950">
      <TimeframeSelector selected={tf} onChange={setTf} />
      
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between py-2">
          <h1 className="text-2xl font-black">
            <span className="text-emerald-400">Trade</span><span className="text-cyan-400">Bus</span>
          </h1>
          <WalletMultiButton style={{ backgroundColor: '#10b981', borderRadius: '0.5rem', height: '40px' }} />
        </div>

        {/* SEARCH BAR */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-neutral-500 w-5 h-5" />
          <input 
            type="text"
            value={searchCA}
            onChange={(e) => setSearchCA(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Paste Solana CA (e.g. So111...)"
            className="w-full pl-10 pr-24 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono text-sm focus:border-emerald-500 outline-none"
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="absolute right-2 px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>

        {error && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</div>}

        {setups.length === 0 ? (
          <div className="text-center text-neutral-500 py-16">No clear TradeBus entries on this timeframe right now.</div>
        ) : (
          setups.map(s => <BusCard key={s.id} setup={s} onBoard={setModalSetup} />)
        )}

        <div className="pt-4">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Active Positions</h2>
          <ActivePositions walletAddress="demo" priceMap={{ 'SOL/USDC': 142.50 }} onClose={() => {}} />
        </div>
      </div>

      <TradeModal 
        setup={modalSetup} 
        walletBalanceUsdc={100} 
        onClose={() => setModalSetup(null)} 
        onConfirm={() => setModalSetup(null)} 
      />
    </main>
  );
}