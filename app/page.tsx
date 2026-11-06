'use client';
import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import TimeframeSelector from '@/frontend/components/TimeframeSelector';
import BusCard from '@/frontend/components/BusCard';
import TradeModal from '@/frontend/components/TradeModal';
import ActivePositions from '@/frontend/components/ActivePositions';
import { SignalSetup, Timeframe } from '@/lib/types';

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
  const setups = tf === '1h' ? [SOL_SETUP] : [];

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
        {setups.map(s => <BusCard key={s.id} setup={s} onBoard={setModalSetup} />)}
        <div className="pt-4">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Active Positions</h2>
          <ActivePositions walletAddress="demo" priceMap={{ 'SOL/USDC': 142.50 }} onClose={() => {}} />
        </div>
      </div>
      <TradeModal setup={modalSetup} walletBalanceUsdc={100} onClose={() => setModalSetup(null)} onConfirm={() => setModalSetup(null)} />
    </main>
  );
}