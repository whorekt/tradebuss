'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Layers, Heart, PieChart, Bell, BarChart3, 
  Megaphone, ArrowLeftRight, LogOut, Copy, Check
} from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const { disconnect, publicKey } = useWallet();
  const [copied, setCopied] = useState(false);

  const walletAddress = publicKey?.toString() || '';
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not Connected';

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const menuItems = [
    { name: 'Assets', icon: Layers },
    { name: 'Watchlist', icon: Heart },
    { name: 'Portfolio', icon: PieChart },
    { name: 'Price Alerts', icon: Bell },
    { name: 'Market', icon: BarChart3 },
    { name: 'News', icon: Megaphone },
    { name: 'Convert', icon: ArrowLeftRight },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 pb-10">
      
      {/* PROFILE HEADER */}
      {publicKey && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Connected Wallet</p>
            <h3 className="text-lg font-mono font-bold text-white">{shortAddress}</h3>
          </div>
          <button onClick={copyAddress} className="p-3 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition">
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-neutral-400" />}
          </button>
        </div>
      )}

      {/* MENU SECTION */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 px-2">Menu</h3>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-neutral-300 hover:bg-neutral-800/50 transition-colors"
            >
              <Icon className="w-5 h-5 text-neutral-400" />
              <span className="text-sm font-semibold">{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* SETTINGS SECTION */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 px-2">Preferences</h3>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <button className="w-full flex items-center justify-between px-4 py-4 text-neutral-300 hover:bg-neutral-800/50 transition-colors border-b border-neutral-800">
            <span className="text-sm font-semibold">Currency</span>
            <span className="text-sm text-neutral-500">USD</span>
          </button>

          <button className="w-full flex items-center justify-between px-4 py-4 text-neutral-300 hover:bg-neutral-800/50 transition-colors">
            <span className="text-sm font-semibold">Language</span>
            <span className="text-lg">🇺🇸</span>
          </button>
        </div>
      </div>

      {/* DISCONNECT BUTTON */}
      {publicKey && (
        <div className="pt-4 px-2">
          <button
            onClick={() => disconnect()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition border border-red-500/20"
          >
            <LogOut className="w-4 h-4" /> Disconnect Wallet
          </button>
        </div>
      )}
      
    </div>
  );
}