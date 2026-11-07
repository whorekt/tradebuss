'use client';
import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import TimeframeSelector from '@/frontend/components/TimeframeSelector';
import BusCard from '@/frontend/components/BusCard';
import TradeModal from '@/frontend/components/TradeModal';
import Portfolio from '@/frontend/components/Portfolio';
import TokenList from '@/frontend/components/TokenList';
import BottomNav from '@/frontend/components/BottomNav';
import Settings from '@/frontend/components/Settings';
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
  
  // TAB STATE
  const [activeTab, setActiveTab] = useState('trade');

  const setups = tf === '1h' ? (searchResult ? [searchResult] : [SOL_SETUP]) : [];

  const handleSearch = async (caToSearch?: string) => {
    const address = caToSearch || searchCA;
    if (!address) return;
    
    setSearchCA(address);
    setIsSearching(true);
    setError('');
    setActiveTab('trade'); // Auto-switch to trade tab when searching
    
    try {
      const res = await fetch('https://api.dexscreener.com/latest/dex/tokens/' + address);
      const data = await res.json();
      if (!data.pairs || data.pairs.length === 0) throw new Error('Token not found');
      
      const pair = data.pairs.find((p: any) => p.chainId === 'solana');
      if (!pair) throw new Error('No Solana liquidity found');

      const price = parseFloat(pair.priceUsd);
      const newSetup: SignalSetup = {
        id: pair.pairAddress, 
        pair: pair.baseToken.symbol + '/USDC', 
        baseToken: pair.baseToken.address, 
        quoteToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 
        timeframe: tf, 
        entry: price, 
        takeProfit: price * 1.25, 
        stopLoss: price * 0.92, 
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
    <main className="min-h-screen bg-neutral-950 pb-24">
      
      {/* HEADER & SEARCH */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between py-2">
          <h1 className="text-2xl font-black">
            <span className="text-emerald-400">Trade</span><span className="text-cyan-400">Bus</span>
          </h1>
          <WalletMultiButton style={{ backgroundColor: '#10b981', borderRadius: '0.5rem', height: '40px' }} />
        </div>

        <div className="relative flex items-center mb-6">
          <Search className="absolute left-3 text-neutral-500 w-5 h-5" />
          <input 
            type="text" 
            value={searchCA} 
            onChange={(e) => setSearchCA(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
            placeholder="Search token CA..." 
            className="w-full pl-10 pr-24 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono text-sm focus:border-emerald-500 outline-none" 
          />
          <button 
            onClick={() => handleSearch()} 
            disabled={isSearching} 
            className="absolute right-2 px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>

        {error && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</div>}

        {/* --- TAB CONTENT --- */}
        
        {/* 1. MARKET TAB */}
        {activeTab === 'market' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Market</h2>
            <TokenList onTokenSelect={handleSearch} />
          </div>
        )}

        {/* 2. TRADE TAB */}
        {activeTab === 'trade' && (
          <div className="space-y-4">
            <TimeframeSelector selected={tf} onChange={setTf} />
            
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Live Setups</h2>
            {setups.length === 0 ? (
              <div className="text-center text-neutral-500 py-8 bg-neutral-900 rounded-xl border border-neutral-800">
                No clear entries on this timeframe.
              </div>
            ) : (
              setups.map(s => <BusCard key={s.id} setup={s} onBoard={setModalSetup} />)
            )}
          </div>
        )}

        {/* 3. PORTFOLIO TAB */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Portfolio</h2>
            <Portfolio />
          </div>
        )}

        {/* 4. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Settings</h2>
            <Settings />
          </div>
        )}
      </div>

      <TradeModal setup={modalSetup} walletBalanceUsdc={100} onClose={() => setModalSetup(null)} onConfirm={() => setModalSetup(null)} />
      
      {/* BOTTOM NAVIGATION */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}