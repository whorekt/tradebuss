'use client';
import { SignalSetup } from '@/lib/types';

interface Props {
  setup: SignalSetup;
  height?: number;
}

export default function LongPositionBox({ setup, height = 320 }: Props) {
  const totalRange = setup.takeProfit - setup.stopLoss;
  const tpShare = totalRange > 0 ? (setup.takeProfit - setup.entry) / totalRange : 0.5;
  const tpHeightPct = Math.max(0.2, Math.min(0.8, tpShare)) * 100;

  return (
    <div className="relative w-20 rounded-xl overflow-hidden border border-neutral-700 shadow-lg shadow-black/50 flex-shrink-0" style={{ height }} title={`${setup.pair} long box`}>
      <div className="absolute top-0 left-0 w-full flex flex-col items-center justify-start pt-2 bg-gradient-to-b from-emerald-500/60 to-emerald-500/20" style={{ height: `${tpHeightPct}%` }}>
        <span className="text-[9px] font-semibold text-emerald-100 tracking-wider">TP</span>
        <span className="text-[10px] font-mono text-emerald-50">{setup.takeProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        <span className="text-[9px] font-bold text-emerald-200">+{setup.tpPct.toFixed(1)}%</span>
      </div>
      <div className="absolute left-0 w-full h-[3px] bg-white shadow-[0_0_10px_rgba(56,189,248,0.9)] z-20" style={{ top: `${tpHeightPct}%` }}>
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-cyan-300 whitespace-nowrap">ENTRY</span>
      </div>
      <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-end pb-2 bg-gradient-to-t from-red-600/60 to-red-600/20" style={{ height: `${100 - tpHeightPct}%` }}>
        <span className="text-[9px] font-bold text-red-200">-{setup.slPct.toFixed(1)}%</span>
        <span className="text-[10px] font-mono text-red-50">{setup.stopLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        <span className="text-[9px] font-semibold text-red-100 tracking-wider">SL</span>
      </div>
    </div>
  );
}