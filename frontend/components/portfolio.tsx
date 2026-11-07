'use client';
import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export default function Portfolio() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [solBalance, setSolBalance] = useState<number>(0);
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showAth, setShowAth] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    const fetchBalances = async () => {
      setLoading(true);
      try {
        const solBal = await connection.getBalance(publicKey);
        setSolBalance(solBal / LAMPORTS_PER_SOL);

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: new PublicKey(USDC_MINT) });
        if (tokenAccounts.value.length > 0) {
          setUsdcBalance(tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBalances();
  }, [publicKey, connection]);

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-neutral-900 border border-neutral-800 rounded-xl mt-4">
        <p className="text-neutral-400 text-sm">Connect wallet to view portfolio</p>
      </div>
    );
  }

  const solValueUsd = solBalance * 142.50;
  const totalUsd = solValueUsd + usdcBalance;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Your Holdings</h2>
        {loading && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
      </div>

      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl p-4">
        <p className="text-xs text-neutral-500 mb-1">Total Portfolio Value</p>
        <h3 className="text-3xl font-black text-white">${totalUsd.toFixed(2)}</h3>
        
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
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">SOL</div>
            <div>
              <p className="font-bold text-white text-sm">Solana</p>
              <p className="text-xs text-neutral-500">{solBalance.toFixed(4)} SOL</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-white">${solValueUsd.toFixed(2)}</p>
            <p className="text-xs text-emerald-400">{showAth ? 'ATH: $260' : 'ATL: $0.50'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">USDC</div>
            <div>
              <p className="font-bold text-white text-sm">USD Coin</p>
              <p className="text-xs text-neutral-500">{usdcBalance.toFixed(2)} USDC</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-white">${usdcBalance.toFixed(2)}</p>
            <p className="text-xs text-neutral-500">Stablecoin</p>
          </div>
        </div>
      </div>
    </div>
  );
}