'use client';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function Portfolio() {
  const { publicKey } = useWallet();
  const [showAth, setShowAth] = useState(false);

  const solBalance = 2.5;
  const usdcBalance = 150;
  const solPrice = 145.20;
  const solValue = solBalance * solPrice;
  const totalValue = solValue + usdcBalance;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl p-4">
        <p className="text-xs text-neutral-500 mb-1">Total Balance</p>
        <h3 className="text-3xl font-black text-white">${totalValue.toFixed(2)}</h3>
        
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => setShowAth(!showAth)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${showAth ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-emerald-400'}`}
          >
            {showAth ? 'Showing ATH' : 'View ATH'} <TrendingUp className="w-3 h-3" />
          </button>
          <button 
            onClick={() => setShowAth(!showAth)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${!showAth ? 'bg-red-500 text-black' : 'bg-neutral-800 text-red-400'}`}
          >
            {!showAth ? 'Showing ATL' : 'View ATL'} <TrendingDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* SOL Row */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            {/* SOL Logo SVG */}
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 397.7 311.3">
                <linearGradient id="sol-grad" x1="360.879" x2="141.213" y1="351.455" y2="-69.294" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#00FFA3" /><stop offset="1" stopColor="#DC1FFF" />
                </linearGradient>
                <path fill="url(#sol-grad)" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"/>
                <path fill="url(#sol-grad)" d="M64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"/>
                <path fill="url(#sol-grad)" d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-white text-sm">Solana</p>
              <p className="text-xs text-neutral-500">{solBalance} SOL</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-white">${solValue.toFixed(2)}</p>
            <p className="text-xs text-emerald-400">{showAth ? 'ATH: $260' : 'ATL: $0.50'}</p>
          </div>
        </div>

        {/* USDC Row */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {/* USDC Logo SVG */}
            <div className="w-10 h-10 rounded-full bg-[#2775CA] flex items-center justify-center border-2 border-white/20">
               <svg className="w-6 h-6 text-white" viewBox="0 0 2000 2000" fill="currentColor">
                 <path d="M1000 0C447.7 0 0 447.7 0 1000s447.7 1000 1000 1000 1000-447.7 1000-1000S1552.3 0 1000 0zm0 1850c-469.3 0-850-380.7-850-850S530.7 150 1000 150s850 380.7 850 850-380.7 850-850 850z"/>
                 <path d="M1275 1130c0-125-75-170-225-190-110-15-130-40-130-85 0-45 35-75 95-75 50 0 85 15 105 55 5 10 15 15 25 15h65c15 0 25-10 25-25 0-80-65-145-155-160V580c0-15-10-25-25-25h-55c-15 0-25 10-25 25v80c-95 15-155 80-155 175 0 120 75 165 220 185 105 15 135 35 135 85 0 55-45 90-110 90-65 0-105-25-120-70-5-10-15-15-25-15h-70c-15 0-25 10-25 25 0 85 70 155 170 170v80c0 15 10 25 25 25h55c15 0 25-10 25-25v-85c100-15 165-85 165-180z"/>
               </svg>
            </div>
            <div>
              <p className="font-bold text-white text-sm">USD Coin</p>
              <p className="text-xs text-neutral-500">{usdcBalance} USDC</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-white">${usdcBalance.toFixed(2)}</p>
            <p className="text-xs text-neutral-500">Stablecoin</p>
          </div>
        </div>
      </div>
    </div>
  );
}