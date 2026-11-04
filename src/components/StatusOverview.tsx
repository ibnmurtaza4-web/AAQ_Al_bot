import React, { useState } from 'react';
import { 
  Users, 
  Activity, 
  Cpu, 
  Key, 
  Shield, 
  Copy, 
  Check, 
  Play, 
  Square,
  AlertTriangle,
  Terminal,
  Zap,
  Globe,
  Building2,
  ExternalLink,
  Radio,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  GitBranch,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { AppStatus, BotConfig } from '../types';

interface StatusOverviewProps {
  status: AppStatus | null;
  config: BotConfig | null;
  onUpdateConfig: (partial: Partial<BotConfig>) => Promise<void>;
  onStartBot: (token?: string) => Promise<void>;
  onStopBot: () => Promise<void>;
  onPingNow: () => Promise<void>;
  onSetupWebhook?: (customUrl?: string) => Promise<any>;
  onRemoveWebhook?: () => Promise<any>;
  isLoading: boolean;
}

export const StatusOverview: React.FC<StatusOverviewProps> = ({
  status,
  config,
  onUpdateConfig,
  onStartBot,
  onStopBot,
  onPingNow,
  onSetupWebhook,
  onRemoveWebhook,
  isLoading
}) => {
  const LOCAL_TOKEN_KEY = 'aaq_bot_token_backup';
  const [tokenInput, setTokenInput] = useState(() => {
    return config?.botToken || (typeof window !== 'undefined' ? localStorage.getItem(LOCAL_TOKEN_KEY) || '' : '');
  });
  const [ownerInput, setOwnerInput] = useState(config?.ownerUsername || 'muntazir_admin');
  const [adminInput, setAdminInput] = useState('');
  const [webhookInput, setWebhookInput] = useState(status?.webhookUrl || '');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [webhookActionMsg, setWebhookActionMsg] = useState<string | null>(null);

  // GitHub Auto-Export / Sync state
  const [githubRepoInput, setGithubRepoInput] = useState('');
  const [githubTokenInput, setGithubTokenInput] = useState('');
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [isGithubSyncing, setIsGithubSyncing] = useState(false);
  const [githubSyncResult, setGithubSyncResult] = useState<any>(null);
  const [githubSyncError, setGithubSyncError] = useState<string | null>(null);

  const handleSyncToGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubRepoInput.trim() || !githubTokenInput.trim()) {
      setGithubSyncError('Zəhmət olmasa GitHub Repo linkini və giriş açarını (PAT) daxil edin.');
      return;
    }
    setIsGithubSyncing(true);
    setGithubSyncError(null);
    setGithubSyncResult(null);
    try {
      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: githubRepoInput.trim(),
          githubToken: githubTokenInput.trim()
        })
      });
      const data = await res.json();
      if (!data.success) {
        setGithubSyncError(data.message || 'GitHub-a yüklənmə zamanı xəta baş verdi.');
      } else {
        setGithubSyncResult(data);
      }
    } catch (err: any) {
      setGithubSyncError(err?.message || 'Serverlə əlaqə xətası.');
    } finally {
      setIsGithubSyncing(false);
    }
  };

  React.useEffect(() => {
    if (config?.botToken) {
      setTokenInput(config.botToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_TOKEN_KEY, config.botToken);
      }
    } else if (typeof window !== 'undefined') {
      const localBackup = localStorage.getItem(LOCAL_TOKEN_KEY);
      if (localBackup && localBackup.trim()) {
        setTokenInput(localBackup.trim());
        // Automatically sync to backend if backend lost it after container sleep
        onUpdateConfig({ botToken: localBackup.trim() }).catch(() => {});
      }
    }
    if (config?.ownerUsername) {
      setOwnerInput(config.ownerUsername);
    }
  }, [config?.botToken, config?.ownerUsername]);

  const handleSaveSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = tokenInput.trim();
    if (typeof window !== 'undefined' && cleanToken) {
      localStorage.setItem(LOCAL_TOKEN_KEY, cleanToken);
    }
    await onUpdateConfig({ 
      botToken: cleanToken,
      ownerUsername: ownerInput.replace(/^@/, '').trim()
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(adminInput.trim(), 10);
    if (!isNaN(id) && config) {
      const current = config.adminIds || [];
      if (!current.includes(id)) {
        await onUpdateConfig({ adminIds: [...current, id] });
        setAdminInput('');
      }
    }
  };

  const handleRemoveAdmin = async (id: number) => {
    if (config) {
      const updated = (config.adminIds || []).filter(x => x !== id);
      await onUpdateConfig({ adminIds: updated });
    }
  };

  React.useEffect(() => {
    if (status?.webhookUrl && !webhookInput) {
      setWebhookInput(status.webhookUrl);
    }
  }, [status?.webhookUrl]);

  const handleActivateWebhook = async () => {
    if (!onSetupWebhook) return;
    const url = webhookInput.trim() || undefined;
    const res = await onSetupWebhook(url);
    if (res?.success) {
      setWebhookActionMsg('Webhook uğurla aktivləşdirildi! Telegram artıq konteyneri 24/7 oyadacaq.');
    } else {
      setWebhookActionMsg(res?.message || 'Webhook quraşdırılmadı');
    }
    setTimeout(() => setWebhookActionMsg(null), 4000);
  };

  const handleSwitchToPolling = async () => {
    if (!onRemoveWebhook) return;
    const res = await onRemoveWebhook();
    if (res?.success) {
      setWebhookActionMsg('Polling rejiminə keçildi.');
    } else {
      setWebhookActionMsg(res?.message || 'Polling rejiminə keçid uğursuz oldu');
    }
    setTimeout(() => setWebhookActionMsg(null), 4000);
  };

  const copyWebhookUrl = () => {
    const urlToCopy = webhookInput || status?.webhookUrl || '';
    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy);
      setCopiedWebhookUrl(true);
      setTimeout(() => setCopiedWebhookUrl(false), 2000);
    }
  };

  const copyPingUrl = () => {
    if (status?.keepAlive?.externalPingUrl) {
      navigator.clipboard.writeText(status.keepAlive.externalPingUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const uptimeMin = status ? Math.floor(status.keepAlive.uptimeSeconds / 60) : 0;
  const isOnline = status?.botRunning;
  const officialChannelUrl = status?.officialChannel || 'https://t.me/AAQ_Offical';
  const isWebhook = status?.connectionMode === 'webhook' || status?.isWebhookActive;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert if Token is missing */}
      {!config?.botToken && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3 shadow-lg shadow-amber-500/5">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <h3 className="font-semibold text-amber-300">Bot Token Qeyd Edilməyib</h3>
            <p className="mt-1 text-amber-200/80">
              Botu oyatmaq üçün Telegram-da <span className="font-mono text-amber-300 font-bold">@BotFather</span>-dən aldığınız bot tokenini daxil edin və <strong>"Botu Oyadın & İşə Salın"</strong> düyməsinə klikləyin.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Status */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Bot Vəziyyəti</span>
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-xl font-bold tracking-tight ${isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isOnline ? 'Oyaq / Aktiv' : 'Dayandırılıb'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">
            {status?.botInfo ? `@${status.botInfo.username}` : 'Token daxil edin'}
          </p>
        </div>

        {/* Total Users & Groups */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">İstifadəçilər & Qruplar</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {status?.totalUsers || 0}
            </span>
            <span className="text-xs text-slate-400">istifadəçi / {status?.totalGroups || 0} qrup</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Avtomatik qeydiyyat və izləmə
          </p>
        </div>

        {/* Keep-Alive Pings / Mode */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Oyaq Qalma Rejimi</span>
            {isWebhook ? (
              <Zap className="w-4 h-4 text-emerald-400" />
            ) : (
              <Activity className="w-4 h-4 text-cyan-400" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-base font-bold tracking-tight truncate ${isWebhook ? 'text-emerald-400' : 'text-cyan-400'}`}>
              {isWebhook ? '⚡ Webhook 24/7' : '🔄 Polling'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">
            {status?.keepAlive?.totalPings || 0} nabız | {status?.keepAlive?.webhookPings || 0} wh oyanma
          </p>
        </div>

        {/* Leadership Organization */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Təşkilat & Kanal</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xs font-bold text-amber-300 truncate">
              AAQ - Ahl Al Qalam
            </span>
          </div>
          <a 
            href={officialChannelUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-1 text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 truncate"
          >
            <span>t.me/AAQ_Offical</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Webhook & Instant Wake-Up & Fast AI Master Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isWebhook ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'}`}>
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">Telegram Webhook & 24/7 Fasiləsiz Dinləmə</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${
                  isWebhook 
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {isWebhook ? '⚡ Webhook Rejimi (Avto-Oyanma)' : '🔄 Polling Rejimi'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isWebhook 
                  ? 'Cloud Run konteyneri yuxuya getdikdə belə, Telegram istifadəçi mesaj yazan kimi dərhal HTTPS vasitəsilə serveri oyadır və cavab verir.'
                  : 'Polling rejimində sayt yatdıqda sorğular dayana bilər. Konteynerin daimi oyaq qalması üçün Webhook rejimini aktivləşdirin.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isWebhook ? (
              <button
                type="button"
                onClick={handleSwitchToPolling}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Polling Rejiminə Keç</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleActivateWebhook}
                disabled={isLoading || !config?.botToken}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Webhook-u Aktivləşdir (24/7)</span>
              </button>
            )}
          </div>
        </div>

        {/* Webhook Feedback Message if any */}
        {webhookActionMsg && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{webhookActionMsg}</span>
          </div>
        )}

        {/* Webhook URL bar & controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
          <div className="lg:col-span-2 space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Telegram Webhook Endpoint URL (HTTPS):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookInput}
                onChange={(e) => setWebhookInput(e.target.value)}
                placeholder="https://...run.app/api/telegram/webhook"
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={copyWebhookUrl}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1 transition"
                title="URL-i Kopyala"
              >
                {copiedWebhookUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleActivateWebhook}
                disabled={isLoading || !config?.botToken}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 flex items-center gap-1 flex-shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Yenilə</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Bu endpoint Telegram API-yə <code>setWebhook</code> əmri ilə qeyd olunur və hər mesajda konteynerə anlıq təkan verir.
            </p>
          </div>

          {/* Webhook Diagnostic metrics */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Növbədəki mesajlar:</span>
              <span className="font-mono text-white font-semibold">
                {status?.webhookInfo?.pending_update_count ?? 0} ədəd
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Son oyanma səbəbi:</span>
              <span className="font-mono text-cyan-300 truncate max-w-[140px]" title={status?.keepAlive?.lastWakeReason || 'start'}>
                {status?.keepAlive?.lastWakeReason || 'start'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Webhook ilə oyanmalar:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {status?.keepAlive?.webhookPings ?? 0} dəfə
              </span>
            </div>
            {status?.webhookInfo?.last_error_message && (
              <div className="mt-1 p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px]">
                Xəta: {status.webhookInfo.last_error_message}
              </div>
            )}
          </div>
        </div>

        {/* Fast AI Optimization Switch */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-xs font-semibold text-white">Sürətli AI Cavab Rejimi (Boşuna Gecikdirmələrsiz)</span>
              <p className="text-[11px] text-slate-400">
                Gərəksiz Google Search və daxili mesaj statusu dövrlərini aradan qaldırır, ümumi suallara cavab sürətini ~400–800ms-ə qədər sürətləndirir.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={config?.fastAiMode ?? true}
              onChange={(e) => onUpdateConfig({ fastAiMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      {/* GitHub Auto-Export & Secret Env Sync Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 transition shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">GitHub Avtomatik Eksport & Sinxronizasiya</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  Birbaşa Git Push
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Botun tam kod bazası GitHub reponuza yüklənir. Gizli API açarları koddan təcrid edilir və təhlükəsiz qalır.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>.env Qorunur</span>
          </div>
        </div>

        {/* Error message if any */}
        {githubSyncError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{githubSyncError}</span>
            </div>
            <button
              onClick={() => setGithubSyncError(null)}
              className="text-rose-400 hover:text-white font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Success message & secrets overview */}
        {githubSyncResult && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{githubSyncResult.message}</span>
              </div>
              {githubSyncResult.repoUrl && (
                <a
                  href={githubSyncResult.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 flex items-center gap-1 text-[11px] font-medium transition"
                >
                  <span>Reponu Aç</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Secrets overview table */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-emerald-500/20 space-y-2">
              <span className="text-[11px] font-semibold text-slate-200 block">
                🔐 Təhlükəsiz Şəkildə Ayrılmış Gizli Dəyişənlər (GitHub Repository Secrets):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {(githubSyncResult.secretsSummary || []).map((s: any) => (
                  <div key={s.key} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <code className="text-cyan-300 font-mono font-bold">{s.key}</code>
                      <p className="text-slate-400 text-[10px]">{s.description}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      Hazırdır
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                💡 Bu gizli dəyişənlər heç vaxt GitHub-ın açıq kod bölməsinə yüklənmir. Reponuzun <strong>Settings → Secrets and variables → Actions</strong> bölməsində istifadə üçün hazırdır.
              </p>
            </div>
          </div>
        )}

        {/* Sync Form */}
        <form onSubmit={handleSyncToGithub} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                GitHub Repo Linki
              </label>
              <input
                type="text"
                value={githubRepoInput}
                onChange={(e) => setGithubRepoInput(e.target.value)}
                placeholder="https://github.com/istifadeci/aaq-telegram-bot"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                GitHub Personal Access Token (PAT)
              </label>
              <div className="relative">
                <input
                  type={showGithubToken ? 'text' : 'password'}
                  value={githubTokenInput}
                  onChange={(e) => setGithubTokenInput(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  title={showGithubToken ? 'Gizlə' : 'Göstər'}
                >
                  {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-400">
              Açar almaq üçün: GitHub → <strong>Settings → Developer settings → Personal access tokens (classic)</strong> → <code className="text-cyan-300 font-bold">repo</code> icazəsi.
            </p>
            <button
              type="submit"
              disabled={isGithubSyncing || !githubRepoInput.trim() || !githubTokenInput.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 disabled:opacity-50 active:scale-95 flex-shrink-0"
            >
              {isGithubSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>GitHub-a Yüklənir...</span>
                </>
              ) : (
                <>
                  <GitBranch className="w-4 h-4" />
                  <span>Kodu GitHub-a Yüklə & Sinxron Et</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Main Grid: Bot Setup + Keep-Alive System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Telegram Bot Token & Owner Setup */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Telegram Bot Token & Rəhbərlik</h2>
            </div>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Saxlanıldı
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSetup} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Telegram Bot Token (BotFather)
              </label>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Baş Rəhbər (Owner Username)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">@</span>
                <input
                  type="text"
                  value={ownerInput}
                  onChange={(e) => setOwnerInput(e.target.value)}
                  placeholder="muntazir_admin"
                  className="w-full pl-8 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-95 disabled:opacity-50 shadow-md shadow-indigo-600/20"
              >
                Məlumatları Saxla
              </button>

              {isOnline ? (
                <button
                  type="button"
                  onClick={() => onStopBot()}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition flex items-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Botu Dayandır
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onStartBot(tokenInput)}
                  disabled={isLoading || !tokenInput.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Botu Oyadın & İşə Salın
                </button>
              )}
            </div>
          </form>

          {/* Admin IDs Management */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-300">Admin Telegram ID-ləri</span>
              </div>
              <span className="text-[11px] text-slate-500">Gizli admin əmrləri üçün</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(config?.adminIds || []).map((id) => (
                <span 
                  key={id} 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300"
                >
                  <span>{id}</span>
                  <button 
                    onClick={() => handleRemoveAdmin(id)}
                    className="hover:text-rose-400 transition"
                    title="Sil"
                  >
                    ×
                  </button>
                </span>
              ))}
              {(!config?.adminIds || config.adminIds.length === 0) && (
                <span className="text-xs text-slate-500 italic">Heç bir admin ID əlavə edilməyib</span>
              )}
            </div>

            <form onSubmit={handleAddAdmin} className="flex gap-2">
              <input
                type="number"
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                placeholder="Admin Telegram ID (məs: 746816174)"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!adminInput.trim()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition disabled:opacity-50"
              >
                + Əlavə et
              </button>
            </form>
          </div>

          {/* Moderation Controls Switches */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <span className="text-xs font-semibold text-slate-300 block">Qrup Moderasiya Filtirləri:</span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config?.antiProfanity ?? true}
                  onChange={(e) => onUpdateConfig({ antiProfanity: e.target.checked })}
                  className="rounded accent-indigo-500"
                />
                <span className="text-slate-300 text-[11px]">Anti-Söyüş</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config?.antiLink ?? true}
                  onChange={(e) => onUpdateConfig({ antiLink: e.target.checked })}
                  className="rounded accent-indigo-500"
                />
                <span className="text-slate-300 text-[11px]">Anti-Link</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config?.antiSpam ?? true}
                  onChange={(e) => onUpdateConfig({ antiSpam: e.target.checked })}
                  className="rounded accent-indigo-500"
                />
                <span className="text-slate-300 text-[11px]">Anti-Spam</span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 2: Keep-Alive System & Health Monitor */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Oyaq Qalma (Keep-Alive) Mexanizmi</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 24/7 Aktiv
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Daxili avtomatik keep-alive xidməti hər <strong className="text-cyan-300">{config?.keepAliveIntervalMinutes || 5} dəqiqədən</strong> bir serverə və Telegram API-yə sorğular göndərərək botun fasiləsiz işləməsini təmin edir.
          </p>

          {/* Keep-Alive Settings */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Daxili İnterval</span>
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={config?.keepAliveIntervalMinutes || 5}
                  onChange={(e) => onUpdateConfig({ keepAliveIntervalMinutes: parseInt(e.target.value, 10) })}
                  className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
                >
                  <option value="1" className="bg-slate-900">Hər 1 dəqiqə</option>
                  <option value="3" className="bg-slate-900">Hər 3 dəqiqə</option>
                  <option value="5" className="bg-slate-900">Hər 5 dəqiqə (Tövsiyə)</option>
                  <option value="10" className="bg-slate-900">Hər 10 dəqiqə</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Server İşi (Uptime)</span>
              <span className="text-sm font-semibold text-emerald-400 font-mono block mt-1">
                {uptimeMin} dəqiqə
              </span>
            </div>
          </div>

          {/* External Ping URL */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                Xarici Ping Webhook URL
              </span>
              <button
                onClick={copyPingUrl}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? 'Kopyalandı!' : 'Kopyala'}</span>
              </button>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-[11px] font-mono text-slate-400 truncate border border-slate-800">
              {status?.keepAlive?.externalPingUrl || 'http://localhost:3000/api/health'}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onPingNow}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>İndi Canlı Nabız Göndər (Test Ping)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin & User Commands Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">AAQ - Ahl Al Qalam Əmrlər Şəbəkəsi (Brain Matrix)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <code className="text-indigo-400 font-bold font-mono">/start & /help</code>
            <p className="text-slate-400 mt-1">İnteraktiv açılış menyusu və ətraflı bələdçi.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <code className="text-purple-400 font-bold font-mono">/pdf & /sorus</code>
            <p className="text-slate-400 mt-1">PDF sənəd analizi və Gemini AI sual-cavab.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <code className="text-cyan-400 font-bold font-mono">/sozluk & /hesabla</code>
            <p className="text-slate-400 mt-1">Azərbaycan izahlı lüğəti və riyazi həllər.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <code className="text-emerald-400 font-bold font-mono">/sitat & /tarix</code>
            <p className="text-slate-400 mt-1">Dahi şəxsiyyətlərdən real kəlamlar və tarixi gün.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <code className="text-amber-400 font-bold font-mono">/hava & /dim</code>
            <p className="text-slate-400 mt-1">Canlı şəhər havası və DİM imtahan bələdçisi.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <code className="text-rose-400 font-bold font-mono">/panel & /elan</code>
            <p className="text-slate-400 mt-1">AAQ Rəhbər idarə paneli və toplu elan yayımı.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <code className="text-blue-400 font-bold font-mono">/qruplar & /msg</code>
            <p className="text-slate-400 mt-1">Canlı qrupların siyahısı və istifadəçiyə cavab.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <code className="text-teal-400 font-bold font-mono">/sozlesme & /elaqe</code>
            <p className="text-slate-400 mt-1">Gizlilik sözləşməsi və rəhbərliklə təhlükəsiz əlaqə.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
