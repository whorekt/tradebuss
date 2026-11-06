'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
export interface PositionRow {
  id:string;pair:string;entry_price:number;entry_amount_usdc:number;token_amount:number;
  take_profit:number;stop_loss:number;status:'open'|'tp_hit'|'sl_hit'|'manual_close';
  exit_price?:number;exit_amount_usdc?:number;fee_usdc:number;created_at:number;
}
interface Props { walletAddress: string; priceMap: Record<string, number>; onClose: (id:string, p:number) => void; }
export default function ActivePositions({ walletAddress, priceMap, onClose }: Props) {
  const [rows, setRows] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState(true);
  async function load() {
    try { const r = await fetch(`/api/positions/${walletAddress}`); const j = await r.json(); setRows(j.positions ?? []); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (walletAddress) load(); const t = setInterval(load, 10_000); return () => clearInterval(t); }, [walletAddress]);
  const open = rows.filter(r => r.status === 'open');
  if (loading) return <div className="text-neutral-500 text-sm">Loading positions…</div>;
  if (open.length === 0) return <div className="text-neutral-500 text-sm text-center py-8">No active positions.</div>;
  return (
    <div className="space-y-3">
      {open.map(p => {
        const price = priceMap[p.pair] ?? p.entry_price;
        const pnlUsd = p.token_amount * price - p.entry_amount_usdc;
        const pnlPct = (pnlUsd / p.entry_amount_usdc) * 100;
        const tpProgress = Math.max(0, Math.min(1, (price - p.entry_price) / (p.take_profit - p.entry_price)));
        const positive = pnlPct >= 0;
        return (
          <motion.div key={p.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
            className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{p.pair}</span>
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${positive?'bg-emerald-500/15 text-emerald-300':'bg-red-500/15 text-red-300'}`}>
                  {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{pnlPct.toFixed(2)}%
                </span>
              </div>
              <button onClick={() => onClose(p.id, price)} className="text-neutral-500 hover:text-red-400" title="Manual close"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-xs text-neutral-400 grid grid-cols-3 gap-2 mb-2">
              <div>Entry <span className="text-white font-mono">{p.entry_price}</span></div>
              <div>TP <span className="text-emerald-300 font-mono">{p.take_profit}</span></div>
              <div>SL <span className="text-red-300 font-mono">{p.stop_loss}</span></div>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all" style={{ width: `${tpProgress*100}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
              <span>PnL ${pnlUsd.toFixed(2)}</span><span>Fee ${p.fee_usdc.toFixed(2)}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
