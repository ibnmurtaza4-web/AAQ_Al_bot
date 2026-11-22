import React, { useState } from 'react';
import { 
  Zap, 
  RefreshCw, 
  Globe, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Server, 
  ArrowRight,
  Heart,
  Radio
} from 'lucide-react';
import { KeepAliveStatus, AppStatus } from '../types';

interface KeepAliveGuideProps {
  keepAlive: KeepAliveStatus | null;
  status?: AppStatus | null;
  onPingNow: () => Promise<void>;
  onSetupWebhook?: (customUrl?: string) => Promise<any>;
  onRemoveWebhook?: () => Promise<any>;
  isLoading: boolean;
}

export const KeepAliveGuide: React.FC<KeepAliveGuideProps> = ({
  keepAlive,
  status,
  onPingNow,
  onSetupWebhook,
  onRemoveWebhook,
  isLoading
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [webhookInput, setWebhookInput] = useState(status?.webhookUrl || '');
  const [webhookFeedback, setWebhookFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    if (status?.webhookUrl && !webhookInput) {
      setWebhookInput(status.webhookUrl);
    }
  }, [status?.webhookUrl]);

  const pingUrl = keepAlive?.externalPingUrl || 'http://localhost:3000/api/wake';
  const isWebhook = status?.connectionMode === 'webhook' || status?.isWebhookActive;

  const copyUrl = () => {
    navigator.clipboard.writeText(pingUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleWebhookActivate = async () => {
    if (!onSetupWebhook) return;
    const res = await onSetupWebhook(webhookInput.trim() || undefined);
    setWebhookFeedback(res?.message || (res?.success ? 'Webhook 24/7 aktivləşdirildi!' : 'Webhook aktivləşdirilmədi'));
    setTimeout(() => setWebhookFeedback(null), 6000);
  };

  const handleWebhookDisable = async () => {
    if (!onRemoveWebhook) return;
    const res = await onRemoveWebhook();
    setWebhookFeedback(res?.message || 'Polling + 30s Watchdog rejiminə keçildi.');
    setTimeout(() => setWebhookFeedback(null), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-rose-500" />
            24/7 Gücləndirilmiş Oyaq Qalma (Keep-Alive) & Hibrid Webhook Sistemi
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Botunuzun Heç Vaxt Yatmamasını Necə Təmin Edirik?
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Bulud mühitlərində (Cloud Run / Kubernetes) server boş qaldıqda konteyneri yuxuya (scale-to-zero) göndərə bilər. Gücləndirilmiş <strong>Hibrid Webhook + 30s Watchdog + 180s Socket Keep-Alive</strong> arxitekturası sayəsində server həm uzun müddət oyaq qalır, həm də hər Telegram mesajında anında oyanır.
          </p>
        </div>
      </div>

      {/* 4-Pillar Architecture Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pillar 1: Telegram Webhook */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-emerald-500/30 space-y-2 relative overflow-hidden group">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>1. Ağıllı Telegram Webhook</span>
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            İctimai HTTPS ünvanında Telegram mesajları <code>max_connections: 40</code> ilə anında <code>/api/telegram/webhook</code> nöqtəsini oyadır. Xəta olarsa avto-bərpa işə düşür.
          </p>
        </div>

        {/* Pillar 2: Daxili Nabiz */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white">2. 180s HTTP Keep-Alive & /api/wake</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Server TCP Keep-Alive müddəti <strong>180 saniyəyə</strong> uzadılıb; daxili taymer <code>/api/health</code> və <code>/api/wake</code> nöqtələrini daim isti saxlayır.
          </p>
        </div>

        {/* Pillar 3: Telegram Connection Monitor */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Server className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white">3. 30s İkiqat Watchdog</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Hər {keepAlive?.watchdogIntervalSeconds || 30} saniyədən bir həm Polling döngüsü, həm də Webhook sağlamlığı yoxlanılır və anında bərpa olunur.
          </p>
        </div>

        {/* Pillar 4: Xarici Uptime Monitor */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white">4. Xarici Uptime Ping</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            UptimeRobot və ya cron-job.org xidmətləri ilə <code>/api/wake</code> ünvanını pingləyərək fasiləsiz 24/7 işləmə əldə edin.
          </p>
        </div>

      </div>

      {/* Live Webhook Configuration & Test Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Telegram Webhook İdarəetməsi (24/7 Avto-Oyanma)</h3>
              <p className="text-[11px] text-slate-400">
                Aktiv Rejim: <strong className={isWebhook ? 'text-emerald-400' : 'text-cyan-400'}>{isWebhook ? '⚡ Webhook 24/7' : '🔄 Polling + 30s Watchdog'}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPingNow}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>İndi Nabız Göndər</span>
            </button>
            {isWebhook ? (
              <button
                type="button"
                onClick={handleWebhookDisable}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
              >
                Polling-ə Keç
              </button>
            ) : (
              <button
                type="button"
                onClick={handleWebhookActivate}
                disabled={isLoading || !status?.hasToken}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Webhook Qur</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={webhookInput}
            onChange={(e) => setWebhookInput(e.target.value)}
            placeholder="https://sizin-cloud-run-domain.run.app/api/telegram/webhook"
            className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleWebhookActivate}
            disabled={isLoading || !status?.hasToken}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
          >
            Yoxla & Tətbiq Et
          </button>
        </div>

        {webhookFeedback && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{webhookFeedback}</span>
          </div>
        )}
      </div>

      {/* Setup Step-by-Step for UptimeRobot */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Xarici 24/7 Monitorinq Xidməti ilə Bağlamaq</h3>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Sizin Xüsusi Oyanma Ping URL-iniz:</span>
            <span className="text-xs font-mono text-cyan-300 break-all select-all font-semibold">
              {pingUrl}
            </span>
          </div>
          <button
            onClick={copyUrl}
            className="px-4 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition flex-shrink-0"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Kopyalandı!' : 'URL-i Kopyala'}</span>
          </button>
        </div>

        <div className="space-y-3 pt-2 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
              1
            </div>
            <p className="text-slate-300">
              <strong className="text-white">UptimeRobot.com</strong> və ya <strong className="text-white">cron-job.org</strong> saytında hesab yaradın.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
              2
            </div>
            <p className="text-slate-300">
              <strong>"Add New Monitor"</strong> (HTTP(s)) seçin və yuxarıdakı <code>/api/wake</code> URL-ini daxil edin.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
              3
            </div>
            <p className="text-slate-300">
              İntervalı <strong>1–5 dəqiqə</strong> olaraq qeyd edin və saxlayın. Beləliklə botunuz heç vaxt yuxuya getməyəcək!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
