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
  
  const [activeTab, setActiveTab] = useState('market');

  const setups = tf === '1h' ? (searchResult ? [searchResult] : [SOL_SETUP]) : [];

  const handleSearch = async (caToSearch?: string) => {
    const address = caToSearch || searchCA;
    if (!address) return;
    
    setSearchCA(address);
    setIsSearching(true);
    setError('');
    setActiveTab('trade');
    
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
    <main className="min-h-screen bg-neutral-950 pb-28">
      
      <div className="max-w-2xl mx-auto p-4">
        
        {/* 1. MARKET TAB (Default) */}
        {activeTab === 'market' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* HEADER & WALLET */}
            <div className="flex items-center justify-between pt-2">
              <h1 className="text-2xl font-black tracking-tighter">
                <span className="text-emerald-400">Trade</span><span className="text-cyan-400">Bus</span>
              </h1>
              <WalletMultiButton style={{ backgroundColor: '#10b981', borderRadius: '0.75rem', height: '40px', fontSize: '14px', fontWeight: 'bold' }} />
            </div>

            {/* SEARCH BAR */}
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-neutral-500 w-5 h-5" />
              <input 
                type="text" 
                value={searchCA} 
                onChange={(e) => setSearchCA(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                placeholder="Search token by CA..." 
                className="w-full pl-12 pr-28 py-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-white font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner" 
              />
              <button 
                onClick={() => handleSearch()} 
                disabled={isSearching} 
                className="absolute right-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 transition-colors"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </div>

            {error && <div className="text-red-400 text-sm text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</div>}

            <div>
              <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Trending Markets</h2>
              <TokenList onTokenSelect={handleSearch} />
            </div>
          </div>
        )}

        {/* 2. TRADE TAB */}
        {activeTab === 'trade' && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TimeframeSelector selected={tf} onChange={setTf} />
            
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Live Setups</h2>
            {setups.length === 0 ? (
              <div className="text-center text-neutral-500 py-12 bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col items-center">
                <Search className="w-8 h-8 mb-2 opacity-50" />
                <p>No clear entries on this timeframe.</p>
                <p className="text-xs mt-1">Try searching a token in the Market tab.</p>
              </div>
            ) : (
              setups.map(s => <BusCard key={s.id} setup={s} onBoard={setModalSetup} />)
            )}
          </div>
        )}

        {/* 3. PORTFOLIO TAB */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-white mb-2">Portfolio</h2>
            <Portfolio />
          </div>
        )}

        {/* 4. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-white mb-4">Profile & Settings</h2>
            <Settings />
          </div>
        )}
      </div>

      <TradeModal setup={modalSetup} walletBalanceUsdc={100} onClose={() => setModalSetup(null)} onConfirm={() => setModalSetup(null)} />
      
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}