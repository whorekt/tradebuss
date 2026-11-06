'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { SignalSetup } from '@/lib/types';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';

interface Props {
  setup: SignalSetup | null;
  walletBalanceUsdc: number;
  onClose: () => void;
  onConfirm: (p: any) => void;
}

export default function TradeModal({ setup, walletBalanceUsdc, onClose }: Props) {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  
  const [mode, setMode] = useState<'default' | 'custom'>('default');
  const [pct, setPct] = useState(25);
  const [isSwapping, setIsSwapping] = useState(false);
  const [status, setStatus] = useState('');

  const sizeUsdc = useMemo(() => (walletBalanceUsdc * (mode === 'default' ? 25 : pct)) / 100, [mode, pct, walletBalanceUsdc]);

  if (!setup) return null;

  const handleSwap = async () => {
    if (!publicKey || !signTransaction) {
      setStatus('Please connect your wallet first!');
      return;
    }

    setIsSwapping(true);
    setStatus('Getting quote from Jupiter...');

    try {
      // 1. Get Quote from Jupiter API
      const amountInLamports = Math.floor(sizeUsdc * 1_000_000).toString(); // USDC has 6 decimals
      const quoteResponse = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${setup.quoteToken}&outputMint=${setup.baseToken}&amount=${amountInLamports}&slippageBps=50`
      ).then(res => res.json());

      if (!quoteResponse || quoteResponse.error) throw new Error('Failed to get quote');

      setStatus('Preparing transaction...');

      // 2. Get Swap Transaction
      const { swapTransaction } = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: publicKey.toString(),
          wrapAndUnwrapSol: true,
        })
      }).then(res => res.json());

      setStatus('Please approve in your wallet...');

      // 3. Sign and Send Transaction
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      const signedTransaction = await signTransaction(transaction);
      
      const rawTransaction = signedTransaction.serialize();
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
      });

      setStatus(`Success! TX: ${txid.slice(0, 8)}...`);
      setTimeout(() => {
        setIsSwapping(false);
        onClose();
      }, 4000);

    } catch (error: any) {
      console.error(error);
      setStatus(error.message || 'Swap failed');
      setIsSwapping(false);
    }
  };

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
              <button key={m} onClick={() => setMode(m)} disabled={isSwapping}
                className={`py-2 rounded-lg text-sm font-semibold transition ${mode===m?'bg-emerald-500 text-black':'text-neutral-400'}`}>
                {m==='default'?'Default 25%':'Custom'}
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-neutral-950 p-3 mb-4 space-y-1 text-sm">
            <div className="flex justify-between text-neutral-300"><span>Size</span><span className="font-mono font-bold text-white">{sizeUsdc.toFixed(2)} USDC</span></div>
            <div className="flex justify-between text-emerald-400"><span>Target TP</span><span className="font-mono">{setup.takeProfit}</span></div>
            <div className="flex justify-between text-red-400"><span>Stop Loss</span><span className="font-mono">{setup.stopLoss}</span></div>
          </div>

          {status && <div className="text-xs text-center text-cyan-300 mb-2 font-mono break-all">{status}</div>}

          <button disabled={isSwapping}
            onClick={handleSwap}
            className="w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-emerald-400 to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSwapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
            {isSwapping ? 'Swapping...' : 'Confirm & Swap'}
            {!isSwapping && <ArrowRight className="w-4 h-4" />}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}