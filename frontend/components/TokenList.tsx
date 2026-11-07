'use client';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function TokenList() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from our new api.ts file
    fetch('/api')
      .then(res => res.json())
      .then(data => {
        const solanaTokens = data.filter((t: any) => t.chainId === 'solana');
        setTokens(solanaTokens.slice(0, 10));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-emerald-400" /></div>;
  if (tokens.length === 0) return <div className="text-center text-neutral-500 p-4 text-sm">No tokens found.</div>;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      {tokens.map((t, i) => (
        <div key={i} className="flex items-center justify-between p-3 border-b border-neutral-800 last:border-0 hover:bg-neutral-800 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400">#{i + 1}</span>
            <span className="text-sm font-bold text-white font-mono">{t.tokenAddress.slice(0, 6)}...{t.tokenAddress.slice(-4)}</span>
          </div>
          <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded">Boosted</span>
        </div>
      ))}
    </div>
  );
}