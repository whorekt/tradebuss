'use client';
import { useEffect, useState } from 'react';
import { Loader2, Flame } from 'lucide-react';

// Add the prop for clicking
interface Props {
  onTokenSelect: (address: string) => void;
}

export default function TokenList({ onTokenSelect }: Props) {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api')
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Server error');
        }
        return res.json();
      })
      .then(data => {
        const tokenArray = Array.isArray(data) ? data : [];
        const solanaTokens = tokenArray.filter((t: any) => 
          t.chainId === 'solana' || t.chainId === 'sol'
        );
        setTokens(solanaTokens.slice(0, 15));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center p-8 bg-neutral-900 border border-neutral-800 rounded-xl"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>;
  if (error) return <div className="text-center text-red-400 p-4 text-sm bg-red-500/10 border border-red-500/20 rounded-xl">Error: {error}</div>;
  if (tokens.length === 0) return <div className="text-center text-neutral-500 p-6 bg-neutral-900 border border-neutral-800 rounded-xl text-sm">No trending Solana tokens found right now.</div>;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-neutral-800 bg-neutral-950">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Top Boosted (Solana)</span>
      </div>

      {tokens.map((t, i) => (
        <div 
          key={i} 
          onClick={() => onTokenSelect(t.tokenAddress)}
          className="flex items-center justify-between p-3 border-b border-neutral-800 last:border-0 hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-400 w-4">#{i + 1}</span>
            
            {/* Fake Logo */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              {t.tokenAddress ? t.tokenAddress.charAt(0).toUpperCase() : '?'}
            </div>

            <div>
              <p className="text-sm font-bold text-white font-mono">
                {t.tokenAddress ? `${t.tokenAddress.slice(0, 4)}...${t.tokenAddress.slice(-4)}` : 'Unknown'}
              </p>
              <p className="text-[10px] text-neutral-500">Click to load</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-orange-400 font-bold bg-orange-500/10 px-2 py-1 rounded">
              Boosted
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}