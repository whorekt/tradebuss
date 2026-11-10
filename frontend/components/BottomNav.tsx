'use client';
import { TrendingUp, Crosshair, Wallet, Settings as SettingsIcon } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: Props) {
  const tabs = [
    { id: 'market', label: 'Market', icon: TrendingUp },
    { id: 'trade', label: 'Trade', icon: Crosshair },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-neutral-950/80 backdrop-blur-lg border-t border-neutral-800 pb-safe z-50">
      <div className="flex items-center justify-around p-2 max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
                isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}