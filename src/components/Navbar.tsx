import React from 'react';
import { 
  Bot, 
  Activity, 
  Sparkles, 
  Play, 
  Square, 
  Send, 
  ShieldCheck, 
  ExternalLink,
  RefreshCw,
  FileSearch
} from 'lucide-react';
import { AppStatus } from '../types';

interface NavbarProps {
  status: AppStatus | null;
  onStartBot: () => void;
  onStopBot: () => void;
  onPingNow: () => void;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  onStartBot,
  onStopBot,
  onPingNow,
  isLoading,
  activeTab,
  setActiveTab
}) => {
  const isOnline = status?.botRunning;
  const botUsername = status?.botInfo?.username;
  const officialChannelUrl = status?.officialChannel || 'https://t.me/AAQ_Offical';

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Bot Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span 
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`} 
              />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight truncate">
                  AAQ - Ahl Al Qalam Bot
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3" /> Gemini AI
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {botUsername ? (
                  <a 
                    href={`https://t.me/${botUsername}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                  >
                    @{botUsername}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-500 font-mono">Token gözlənilir</span>
                )}
                <span className="text-slate-700">•</span>
                <span className={isOnline ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                  {isOnline ? 'Canlı & İnline Aktiv' : 'Dayandırılıb'}
                </span>
                <span className="text-slate-700 hidden md:inline">•</span>
                <a 
                  href={officialChannelUrl}
                  target="_blank" 
                  rel="noreferrer" 
                  className="hidden md:flex text-indigo-400 hover:text-indigo-300 items-center gap-1"
                >
                  <span>Kanal</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Ping Now */}
            <button
              onClick={onPingNow}
              disabled={isLoading}
              title="Keep-Alive Nabız Göndər"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition flex items-center gap-1.5 active:scale-95"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">Nabız (Ping)</span>
            </button>

            {/* Start / Stop Button */}
            {isOnline ? (
              <button
                onClick={onStopBot}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Dayandır</span>
              </button>
            ) : (
              <button
                onClick={onStartBot}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500/30 transition flex items-center gap-1.5 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Botu Oyadın</span>
              </button>
            )}

            {botUsername && (
              <a
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 transition items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegramda Aç</span>
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-900 text-xs">
          {[
            { id: 'overview', label: 'İcmal & Nəzarət', icon: Bot },
            { id: 'admin', label: 'Admin, Qruplar & İstifadəçilər', icon: ShieldCheck },
            { id: 'gemini', label: 'Gemini Modelləri & Təlimat', icon: Sparkles },
            { id: 'simulator', label: 'Bot Söhbət & Əmr Testi', icon: Send },
            { id: 'logs', label: 'Canlı Loqlar', icon: Activity },
            { id: 'keepalive', label: '24/7 Oyaq Qalma Mexanizmi', icon: RefreshCw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
