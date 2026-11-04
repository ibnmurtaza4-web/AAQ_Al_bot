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

  const pingUrl = keepAlive?.externalPingUrl || 'http://localhost:3000/api/health';

  const copyUrl = () => {
    navigator.clipboard.writeText(pingUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-rose-500" />
            24/7 Oyaq Qalma (Keep-Alive) & Webhook Sistemi
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Botunuzun Heç Vaxt Yatmamasını Necə Təmin Edirik?
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Bulud mühitlərində işləyən tətbiqlər (məsələn, Google Cloud Run) heç bir HTTP sorğusu almadıqda resurslara qənaət məqsədilə konteyneri yuxu (scale-to-zero / idle) rejiminə keçirir. Bizim qurduğumuz <strong>Telegram Webhook + Keep-Alive Mexanizmi</strong> sayəsində Telegram-a yeni mesaj daxil olan kimi server dərhal oyanır və cavab verir.
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
            <span>1. Telegram Webhook (Avto-Oyanma)</span>
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Telegram serverləri hər yeni istifadəçi mesajında Cloud Run konteynerinə dərhal HTTPS təkan göndərir və server 1-2 saniyədə oyanır.
          </p>
        </div>

        {/* Pillar 2: Daxili Nabiz */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white">2. Daxili Avto-Nabız</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Hər 5 dəqiqədən bir daxili taymer <code className="font-mono text-cyan-300">/api/health</code> endpoint-inə sorğu vuraraq yaddaş və resurs axınını canlı saxlayır.
          </p>
        </div>

        {/* Pillar 3: Telegram Connection Monitor */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Server className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white">3. Əlaqə Nəzarəti & Rekonnekt</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Telegram API əlaqəsi və token statusu fasiləsiz yoxlanılır. Şəbəkə kəsildikdə avtomatik yenidən qoşulma tətbiq olunur.
          </p>
        </div>

        {/* Pillar 4: Xarici Uptime Monitor */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white">4. Xarici Uptime Ping</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Pulsuz UptimeRobot və ya Cron xidmətləri üçün sağlamlıq URL-i təqdim olunur və kənardan təyin olunmuş fasilələrlə pinglənir.
          </p>
        </div>

      </div>

      {/* Setup Step-by-Step for UptimeRobot */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Xarici 24/7 Monitorinq Xidməti ilə Bağlamaq (İstəyə görə)</h3>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Sizin Xüsusi Sağlamlıq Ping URL-iniz:</span>
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
              <strong className="text-white">UptimeRobot.com</strong> və ya <strong className="text-white">cron-job.org</strong> saytında pulsuz qeydiyyatdan keçin.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
              2
            </div>
            <p className="text-slate-300">
              <strong>"Add New Monitor"</strong> (HTTP(s)) seçin və yuxarıdakı kopyaladığınız URL-i daxil edin.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
              3
            </div>
            <p className="text-slate-300">
              İntervalı <strong>5 dəqiqə</strong> olaraq qeyd edin və saxlayın. Beləliklə botunuz heç vaxt dayanmayacaq!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
