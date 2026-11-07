'use client';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ShieldCheck, Zap, SlidersHorizontal, LogOut, Copy, Check } from 'lucide-react';

export default function Settings() {
  const { disconnect, publicKey } = useWallet();
  const [slippage, setSlippage] = useState('1.0');
  const [priorityFee, setPriorityFee] = useState('high');
  const [copied, setCopied] = useState(false);

  const treasuryWallet = "WhoRekt1111111111111111111111111111111111"; // Replace with your real treasury later

  const copyTreasury = () => {
    navigator.clipboard.writeText(treasuryWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Slippage Setting */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Slippage Tolerance</h3>
        </div>
        <div className="flex gap-2">
          {['0.5', '1.0', '2.0'].map((val) => (
            <button
              key={val}
              onClick={() => setSlippage(val)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                slippage === val ? 'bg-cyan-500 text-black' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {val}%
            </button>
          ))}
          <div className="flex-1 relative">
             <input 
               type="number" 
               value={slippage}
               onChange={(e) => setSlippage(e.target.value)}
               className="w-full py-2 pl-3 pr-6 rounded-lg bg-neutral-800 text-white text-sm font-bold outline-none border border-neutral-700 focus:border-cyan-500"
             />
             <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500">%</span>
          </div>
        </div>
      </div>

      {/* Priority Fee Setting */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Priority Fee (Speed)</h3>
        </div>
        <div className="flex gap-2">
          {['normal', 'high', 'turbo'].map((val) => (
            <button
              key={val}
              onClick={() => setPriorityFee(val)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition ${
                priorityFee === val ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-neutral-500 mt-2">Higher priority fees ensure your trades go through faster on Solana.</p>
      </div>

      {/* Protocol Fee Info */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Protocol Fee</h3>
        </div>
        <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-lg border border-neutral-800">
          <div>
            <p className="text-xs text-neutral-500 mb-1">1% Fee goes to Treasury</p>
            <p className="text-xs font-mono text-white">{treasuryWallet.slice(0, 6)}...{treasuryWallet.slice(-4)}</p>
          </div>
          <button onClick={copyTreasury} className="p-2 rounded-md hover:bg-neutral-800 text-neutral-400">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Disconnect Wallet */}
      {publicKey && (
        <button
          onClick={() => disconnect()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition"
        >
          <LogOut className="w-4 h-4" /> Disconnect Wallet
        </button>
      )}
    </div>
  );
}