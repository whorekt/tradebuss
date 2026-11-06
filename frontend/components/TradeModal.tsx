'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ArrowRight } from 'lucide-react';
import { SignalSetup } from '@/lib/types';
interface Props {
  setup: SignalSetup | null; walletBalanceUsdc: number;
  onClose: () => void;
  onConfirm: (p: { mode:'default'|'custom'; sizeUsdc:number; takeProfit:number; stopLoss:number }) => void;
}
export default function TradeModal({ setup, walletBalanceUsdc, onClose, onConfirm }: Props) {
  const [mode, setMode] = useState<'default'|'custom'>('default');
  const [pct, setPct] = useState(25);
  const [tp, setTp] = useState('');
  const [sl, setSl] = useState('');
  const sizeUsdc = useMemo(() => (walletBalanceUsdc * (mode==='default'?25:pct)) / 100, [mode, pct, walletBalanceUsdc]);
  if (!setup) return null;
  const finalTp = mode==='custom' && tp ? Number(tp) : setup.takeProfit;
  const finalSl = mode==='custom' && sl ? Number(sl) : setup.stopLoss;
  const validTp = finalTp > setup.entry;
  const validSl = finalSl < setup.entry && finalSl > 0;
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Board {setup.pair}<span className="ml-2 text-xs text-cyan-300">({setup.timeframe})</span></h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-950 mb-4">
            {(['default','custom'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`py-2 rounded-lg text-sm font-semibold transition ${mode===m?'bg-emerald-500 text-black':'text-neutral-400'}`}>
                {m==='default'?'Default 25%':'Custom'}
              </button>
            ))}
          </div>
          {mode==='custom' && (
            <div className="mb-4">
              <label className="text-xs text-neutral-400 mb-1 block">Position size — {pct}%</label>
              <input type="range" min={10} max={100} step={1} value={pct} onChange={e => setPct(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
          )}
          <div className="rounded-xl bg-neutral-950 p-3 mb-4 space-y-1 text-sm">
            <div className="flex justify-between text-neutral-300"><span>Size</span><span className="font-mono font-bold text-white">{sizeUsdc.toFixed(2)} USDC</span></div>
            <div className="flex justify-between text-neutral-300"><span>Entry</span><span className="font-mono text-cyan-300">{setup.entry}</span></div>
            <div className="flex justify-between text-emerald-400"><span>Take Profit</span><span className="font-mono">{finalTp}</span></div>
            <div className="flex justify-between text-red-400"><span>Stop Loss</span><span className="font-mono">{finalSl}</span></div>
            <div className="flex justify-between text-neutral-500 text-xs pt-1 border-t border-neutral-800"><span>1% fee</span><span>{(sizeUsdc*0.01).toFixed(2)} USDC</span></div>
          </div>
          {mode==='custom' && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Custom TP</label>
                <input type="number" value={tp} placeholder={String(setup.takeProfit)} onChange={e => setTp(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-sm font-mono focus:border-emerald-500 outline-none" />
                {!validTp && tp && <span className="text-[11px] text-red-400">Must be &gt; entry</span>}
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Custom SL</label>
                <input type="number" value={sl} placeholder={String(setup.stopLoss)} onChange={e => setSl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-sm font-mono focus:border-red-500 outline-none" />
                {!validSl && sl && <span className="text-[11px] text-red-400">Must be &lt; entry</span>}
              </div>
            </div>
          )}
          <button disabled={!validTp || !validSl || sizeUsdc < 1}
            onClick={() => onConfirm({ mode, sizeUsdc, takeProfit: finalTp, stopLoss: finalSl })}
            className="w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-emerald-400 to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Wallet className="w-4 h-4" /> Confirm & Swap <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
