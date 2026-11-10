'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Home, Layers, Heart, PieChart, Bell, BarChart3, 
  Megaphone, ArrowLeftRight, Settings as SettingsIcon, 
  LogOut, ChevronRight 
} from 'lucide-react';

export default function Settings() {
  const { disconnect, publicKey } = useWallet();

  const menuItems = [
    { name: 'Home', icon: Home, active: false },
    { name: 'Assets', icon: Layers, active: false },
    { name: 'Watchlist', icon: Heart, active: false },
    { name: 'Portfolio', icon: PieChart, active: true }, // Highlighted in your screenshot
    { name: 'Price Alerts', icon: Bell, active: false },
    { name: 'Market', icon: BarChart3, active: false },
    { name: 'News', icon: Megaphone, active: false },
    { name: 'Convert', icon: ArrowLeftRight, active: false },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 pb-10">
      
      {/* MENU SECTION */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 px-2">Menu</h3>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                item.active 
                  ? 'bg-neutral-800 text-white' 
                  : 'text-neutral-300 hover:bg-neutral-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.active ? 'text-blue-400' : 'text-neutral-400'}`} />
              <span className="text-sm font-semibold">{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* SETTINGS SECTION */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 px-2">Settings</h3>
        
        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-neutral-300 hover:bg-neutral-800/50 transition-colors">
          <SettingsIcon className="w-5 h-5 text-neutral-400" />
          <span className="text-sm font-semibold">Settings</span>
        </button>

        <div className="w-full h-[1px] bg-neutral-800 my-2" />

        {/* Currency & Language */}
        <button className="w-full flex items-center justify-between px-4 py-4 rounded-xl text-neutral-300 hover:bg-neutral-800/50 transition-colors">
          <span className="text-sm font-semibold">Currency</span>
          <span className="text-sm text-neutral-500">USD</span>
        </button>

        <button className="w-full flex items-center justify-between px-4 py-4 rounded-xl text-neutral-300 hover:bg-neutral-800/50 transition-colors">
          <span className="text-sm font-semibold">Language</span>
          <span className="text-lg">🇺🇸</span>
        </button>
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