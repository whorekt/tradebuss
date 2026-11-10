'use client';
import { useEffect, useState } from 'react';
import { Loader2, Flame } from 'lucide-react';

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
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        // Jupiter returns an array of tokens directly
        const tokenArray = Array.isArray(data) ? data : [];
        setTokens(tokenArray.slice(0, 15));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>;
  if (error) return <div className="text-center text-red-400 p-4 text-sm bg-red-500/10 rounded-xl">Error: {error}</div>;
  if (tokens.length === 0) return <div className="text-center text-neutral-500 p-6">No recent tokens found.</div>;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-neutral-800 bg-neutral-950">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Recent Tokens</span>
      </div>

      {tokens.map((t, i) => (
        <div 
          key={i} 
          onClick={() => onTokenSelect(t.id)}
          className="flex items-center justify-between p-3 border-b border-neutral-800 last:border-0 hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-400 w-4">#{i + 1}</span>
            
            {/* REAL LOGO */}
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
              {t.icon ? (
                <img src={t.icon} alt={t.symbol} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                <span className="text-xs font-bold text-neutral-400">{t.symbol?.charAt(0) || '?'}</span>
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-white">{t.symbol || 'Unknown'}</p>
              <p className="text-[10px] text-neutral-500">{t.name || 'Token'}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">
              New
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}