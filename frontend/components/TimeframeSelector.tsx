'use client';
import { motion } from 'framer-motion';
import { TIMEFRAMES, Timeframe } from '@/lib/types';

interface Props {
  selected: Timeframe;
  onChange: (tf: Timeframe) => void;
}

export default function TimeframeSelector({ selected, onChange }: Props) {
  return (
    <nav className="w-full flex items-center justify-center gap-1 p-2 bg-neutral-950/80 border-b border-neutral-800 sticky top-0 z-30 backdrop-blur-md overflow-x-auto">
      {TIMEFRAMES.map(tf => {
        const active = tf === selected;
        return (
          <button key={tf} onClick={() => onChange(tf)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition ${active ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'}`}>
            {active && <motion.span layoutId="tf-pill" className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/40 rounded-lg" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
            <span className="relative z-10">{tf}</span>
          </button>
        );
      })}
    </nav>
  );
}