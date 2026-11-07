'use client';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function Portfolio() {
  const { publicKey } = useWallet();
  const [showAth, setShowAth] = useState(false);

  // Demo balances (We will connect real RPC later)
  const solBalance = 2.5;
  const usdcBalance = 150;
  const solPrice = 145.20;

  const solValue = solBalance * solPrice;
  const totalValue = solValue + usdcBalance;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Your Portfolio</h2>
        <Wallet className="w-4 h-4 text-emerald-400" />
      </div>

      {!publicKey ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
          <p className="text-sm text-neutral-400">Connect wallet to view holdings</p>
        </div>
      ) : (
        <>
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
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">SOL</div>
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
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">USDC</div>
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
        </>
      )}
    </div>
  );
}