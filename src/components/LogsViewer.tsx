import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  Filter, 
  Search,
  Activity,
  Bot,
  Sparkles,
  Shield,
  AlertCircle
} from 'lucide-react';
import { ActivityLog } from '../types';

interface LogsViewerProps {
  logs: ActivityLog[];
  onClearLogs: () => Promise<void>;
  onRefreshLogs: () => void;
  isLoading: boolean;
}

export const LogsViewer: React.FC<LogsViewerProps> = ({
  logs,
  onClearLogs,
  onRefreshLogs,
  isLoading
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSearch = !search || log.message.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.type.toUpperCase()}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeBadge = (type: ActivityLog['type']) => {
    switch (type) {
      case 'telegram':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
            <Bot className="w-2.5 h-2.5" /> TG
          </span>
        );
      case 'gemini':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </span>
        );
      case 'keepalive':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <Activity className="w-2.5 h-2.5" /> PING
          </span>
        );
      case 'admin':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Shield className="w-2.5 h-2.5" /> ADMIN
          </span>
        );
      case 'error':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" /> XƏTA
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
      
      {/* Top Header with Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-semibold text-white">Canlı Hadisə və Əməliyyat Loqları</h2>
            <p className="text-xs text-slate-400">Gələn mesajlar, AI cavabları, Keep-Alive nabızları və xətalar</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={onRefreshLogs}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Yenilə"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Copy logs */}
          <button
            onClick={handleCopyLogs}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Kopyalandı' : 'Bütün Loqları Kopyala'}</span>
          </button>

          {/* Clear logs */}
          <button
            onClick={onClearLogs}
            className="px-3 py-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Təmizlə</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'all', label: 'Hamısı' },
            { id: 'telegram', label: 'Telegram' },
            { id: 'gemini', label: 'Gemini AI' },
            { id: 'keepalive', label: 'Keep-Alive' },
            { id: 'admin', label: 'Admin' },
            { id: 'error', label: 'Xətalar' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterType === item.id
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Loq daxilində axtar..."
            className="w-full pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-700"
          />
        </div>
      </div>

      {/* Terminal View */}
      <div
        ref={logContainerRef}
        className="h-96 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800/80 p-3 font-mono text-[11px] space-y-1.5 shadow-inner"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-slate-600 font-sans text-xs">
            Heç bir loq qeydə alınmayıb və ya filterə uyğun nəticə yoxdur.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2 py-0.5 hover:bg-slate-900/50 px-1.5 rounded transition-colors group"
            >
              <span className="text-slate-600 flex-shrink-0 select-none">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
              </span>
              <div className="flex-shrink-0">{getTypeBadge(log.type)}</div>
              <span
                className={`break-all leading-relaxed ${
                  log.type === 'error'
                    ? 'text-rose-400'
                    : log.type === 'keepalive'
                    ? 'text-emerald-400/90'
                    : log.type === 'admin'
                    ? 'text-amber-300'
                    : log.type === 'gemini'
                    ? 'text-purple-300'
                    : 'text-slate-300'
                }`}
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
