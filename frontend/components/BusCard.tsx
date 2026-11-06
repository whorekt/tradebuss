'use client';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Info } from 'lucide-react';
import { SignalSetup } from '@/lib/types';
import LongPositionBox from './LongPositionBox';
interface Props { setup: SignalSetup; onBoard: (s: SignalSetup) => void; }
export default function BusCard({ setup, onBoard }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500/40 transition-colors shadow-lg shadow-black/40">
      <LongPositionBox setup={setup} height={300} />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white">{setup.pair}</h3>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">{setup.timeframe}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-neutral-300 mb-3">
            <div><span className="text-neutral-500">R:R </span><span className="font-bold text-emerald-400">{setup.rrRatio.toFixed(1)}:1</span></div>
            <div><span className="text-neutral-500">RSI </span><span className="font-mono">{setup.rsi.toFixed(1)}</span></div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {setup.confluences.map(c => (
              <span key={c} className="px-2 py-0.5 rounded-md text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {c}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-300/80 mb-3">
            <Info className="w-3.5 h-3.5" /><span>1% protocol fee on entry & exit</span>
          </div>
        </div>
        <button onClick={() => onBoard(setup)}
          className="w-full mt-2 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
          <Zap className="w-4 h-4" /> Board This Bus
        </button>
      </div>
    </motion.div>
  );
}
