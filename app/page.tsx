'use client';
import { useState } from 'react';
import TimeframeSelector from '@/frontend/components/TimeframeSelector';
import BusCard from '@/frontend/components/BusCard';
import TradeModal from '@/frontend/components/TradeModal';
import ActivePositions from '@/frontend/components/ActivePositions';
import { SignalSetup, Timeframe } from '@/lib/types';

const DEMO: SignalSetup[] = [
  { id:'1', pair:'ETH/USDC', baseToken:'0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', quoteToken:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', timeframe:'1h', entry:2736.4, takeProfit:3420.5, stopLoss:2545.2, tpPct:25, slPct:7, rrRatio:3.5, rsi:28.4, ema200:2600, support:2700, confluences:['RSI<=30','Above 200EMA','At Support'], createdAt:Date.now() },
  { id:'2', pair:'SOL/USDC', baseToken:'0x7dD8b07e0eA6a2c74fE9d5E1b4a5D5b8f6c9E1a2', quoteToken:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', timeframe:'4h', entry:142, takeProfit:178.4, stopLoss:130.1, tpPct:25.6, slPct:8.3, rrRatio:3.1, rsi:26.1, ema200:135, support:140, confluences:['RSI<=30','Above 200EMA','At Support'], createdAt:Date.now() },
];

export default function Home() {
  const [tf, setTf] = useState<Timeframe>('1h');
  const [modalSetup, setModalSetup] = useState<SignalSetup | null>(null);
  const setups = DEMO.filter(s => s.timeframe === tf);

  return (
    <main className="min-h-screen bg-neutral-950">
      <TimeframeSelector selected={tf} onChange={setTf} />
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between py-2">
          <h1 className="text-2xl font-black"><span className="text-emerald-400">Trade</span><span className="text-cyan-400">Bus</span></h1>
          <span className="text-xs text-neutral-500">Setups: <span className="text-white font-bold">{setups.length}</span></span>
        </div>
        {setups.length === 0 ? (
          <div className="text-center text-neutral-500 py-16">No clear TradeBus entries on this timeframe right now.</div>
        ) : setups.map(s => <BusCard key={s.id} setup={s} onBoard={setModalSetup} />)}
        <div className="pt-4">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Active Positions</h2>
          <ActivePositions walletAddress="0x0000000000000000000000000000000000000000" priceMap={{}} onClose={()=>{}} />
        </div>
      </div>
      <TradeModal setup={modalSetup} walletBalanceUsdc={250} onClose={()=>setModalOpenState(null)} onConfirm={(p)=>{ console.log('Trade:', p); setModalSetup(null); }} />
    </main>
  );
  function setModalOpenState(_: null) { setModalSetup(null); }
}
