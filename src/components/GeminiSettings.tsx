import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  Check, 
  Sliders, 
  FileText, 
  RotateCcw,
  Zap,
  FileSearch,
  ExternalLink,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { BotConfig, PersonaOption, ModelDefinition, ProviderKeysStatus } from '../types';

interface GeminiSettingsProps {
  config: BotConfig | null;
  personas: PersonaOption[];
  models?: ModelDefinition[];
  providerKeys?: ProviderKeysStatus;
  onUpdateConfig: (partial: Partial<BotConfig>) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_MODELS_LIST: ModelDefinition[] = [
  {
    id: 'gemini-3.8-flash',
    alias: 'Gemini 3.8 Flash',
    name: '🔵 Gemini 3.8 Flash ⚡ (Ən Son Nəsil)',
    description: 'Ən yeni bilik bazası, real vaxt təqvim/axtarış anlayışı və sürətli reaksiya',
    speed: 'Ultra Sürətli (~0.3s)',
    provider: 'gemini',
    requiresKeyEnv: 'GEMINI_API_KEY',
    isDefault: true
  },
  {
    id: 'gemini-2.5-flash',
    alias: 'Gemini 2.5 Flash',
    name: '🔵 Gemini 2.5 Flash ⚡ (Yüksək Sabitlik)',
    description: '503 yüklənmələrinə qarşı ən stabil, etibarlı və səlis Google Flash modeli',
    speed: 'Sürətli (~0.3s)',
    provider: 'gemini',
    requiresKeyEnv: 'GEMINI_API_KEY'
  },
  {
    id: 'gemini-3.1-flash-lite',
    alias: 'Gemini 3.1 Flash Lite',
    name: '🔵 Gemini 3.1 Flash Lite 🚀',
    description: 'Operativ reaksiya, minimum gecikmə və kəsintisiz iş',
    speed: 'İldırım Sürəti (~0.2s)',
    provider: 'gemini',
    requiresKeyEnv: 'GEMINI_API_KEY'
  },
  {
    id: 'deepseek/deepseek-r1:free',
    alias: 'DeepSeek R1 (Free)',
    name: '🟣 DeepSeek R1 🧠 (OpenRouter Pulsuz)',
    description: 'Dərin elmi, fəlsəfi və riyazi mühakimə aparan açıq mənbəli Reasoning modeli',
    speed: 'Dərin Analiz (~1.5s)',
    provider: 'openrouter',
    requiresKeyEnv: 'OPENROUTER_API_KEY'
  },
  {
    id: 'deepseek/deepseek-chat:free',
    alias: 'DeepSeek V3 (Free)',
    name: '🟣 DeepSeek V3 🌌 (OpenRouter Pulsuz)',
    description: '671B parametrli akademik səviyyəli nitq, proqramlaşdırma və elmi izah modeli',
    speed: 'Sürətli (~0.7s)',
    provider: 'openrouter',
    requiresKeyEnv: 'OPENROUTER_API_KEY'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    alias: 'Llama 3.3 70B (OpenRouter)',
    name: '🟣 Llama 3.3 70B 🏛️ (OpenRouter Pulsuz)',
    description: 'Meta-nın zəngin kontekstli, insan tərzinə yaxın 70B intellektual modeli',
    speed: 'Sürətli (~0.6s)',
    provider: 'openrouter',
    requiresKeyEnv: 'OPENROUTER_API_KEY'
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    alias: 'Qwen 2.5 72B (Free)',
    name: '🟠 Qwen 2.5 72B 📜 (OpenRouter Pulsuz)',
    description: 'Azərbaycan və Şərq dillərində yüksək sintaktik dəqiqlik və elmi ifadə gücü',
    speed: 'Sürətli (~0.7s)',
    provider: 'openrouter',
    requiresKeyEnv: 'OPENROUTER_API_KEY'
  },
  {
    id: 'llama-3.3-70b-versatile',
    alias: 'Groq Llama 3.3 70B',
    name: '🟢 Groq Llama 3.3 70B ⚡ (LPU Pulsuz)',
    description: 'Groq LPU mühərriki ilə saniyədə 400+ token sürəti və ani cavab axını',
    speed: 'LPU İldırım (~0.15s)',
    provider: 'groq',
    requiresKeyEnv: 'GROQ_API_KEY'
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    alias: 'Groq DeepSeek R1 70B',
    name: '🟢 Groq DeepSeek R1 70B 🚀 (LPU Pulsuz)',
    description: 'DeepSeek R1 məntiqi ilə Groq LPU sürətinin birləşməsi (elmi/STEM həllər)',
    speed: 'LPU Sürətli (~0.25s)',
    provider: 'groq',
    requiresKeyEnv: 'GROQ_API_KEY'
  }
];

export const GeminiSettings: React.FC<GeminiSettingsProps> = ({
  config,
  personas,
  models = DEFAULT_MODELS_LIST,
  providerKeys,
  onUpdateConfig,
  isLoading
}) => {
  const [selectedModel, setSelectedModel] = useState(config?.model || 'gemini-3.8-flash');
  const [temperature, setTemperature] = useState(config?.temperature ?? 0.5);
  const [roleplayMode, setRoleplayMode] = useState(config?.roleplayMode || 'default');
  const [systemPrompt, setSystemPrompt] = useState(config?.systemPrompt || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (config) {
      setSelectedModel(config.model || 'gemini-3.8-flash');
      setTemperature(config.temperature ?? 0.5);
      setRoleplayMode(config.roleplayMode || 'default');
      setSystemPrompt(config.systemPrompt || '');
    }
  }, [config]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateConfig({
      model: selectedModel,
      temperature,
      roleplayMode,
      systemPrompt
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetPrompt = () => {
    setSystemPrompt(
      `Sən "AAQ - Ahl Al Qalam" (AAG Əhl-ül Qələm) elmi-maarif birliyi tərəfindən yaradılmış rəsmi akademik köməkçisən. Rəsmi kanal: https://t.me/AAQ_Offical.

Əsas Prinsiplər:
1. Klassik Elmi və Akademik Ton: Cavabların zəngin, təmkinli və dərin elmi üslubda olmalıdır.
2. Süni Robot Şablonlarından Qaç: "Bir süni intellekt olaraq...", "Bir dil modeli kimi..." ifadələri qəti qadağandır.
3. Məxfilik: Adminlərin və rəhbərin şəxsi adlarını heç vaxt açıqlama. Onları "AAQ Rəhbərliyi" adlandır.
4. Dəqiqlik: Saxta sitat və uydurma fakt qətiyyən yazma.`
    );
  };

  const activeModelList = models && models.length > 0 ? models : DEFAULT_MODELS_LIST;

  const isProviderConfigured = (provider?: string) => {
    if (!provider || provider === 'gemini') return providerKeys?.gemini ?? true;
    if (provider === 'openrouter') return providerKeys?.openrouter ?? false;
    if (provider === 'groq') return providerKeys?.groq ?? false;
    return false;
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Save action floating header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-sm font-semibold text-white">Multi-Model AI & Dərin Personaj İdarəetməsi</h2>
            <p className="text-xs text-slate-400">Gemini, OpenRouter (DeepSeek/Llama/Qwen) və Groq LPU mühərrikləri</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Dəyişikliklər tətbiq edildi!
            </span>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
          >
            Yadda Saxla
          </button>
        </div>
      </div>

      {/* Free External AI Providers & Direct Key Retrieval Links */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-indigo-950/30 to-slate-900/90 border border-indigo-500/25 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Ödənişsiz Professional AI Provayderləri & Birbaşa Açar Keçidləri</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Mühit Dəyişənləri (.env / Secrets)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Google Gemini */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-cyan-300">🔵 Google Gemini</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                  providerKeys?.gemini
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}>
                  {providerKeys?.gemini ? 'Aktivdir' : 'Gözləyir'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Gemini 3.8 Flash, 2.5 Flash və PDF/Səs multimodal analizi. Dəyişən: <code className="text-cyan-400">GEMINI_API_KEY</code>
              </p>
            </div>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-semibold transition"
            >
              <span>Google AI Studio Açar</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* OpenRouter */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/25 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-purple-300">🟣 OpenRouter (:free)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                  providerKeys?.openrouter
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}>
                  {providerKeys?.openrouter ? 'Aktivdir' : 'Açar Lazımdır'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                DeepSeek R1, DeepSeek V3 (671B), Llama 3.3 70B və Qwen 2.5 72B pulsuz açar. Dəyişən: <code className="text-purple-300">OPENROUTER_API_KEY</code>
              </p>
            </div>
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 text-[11px] font-semibold transition"
            >
              <span>OpenRouter Açar Götür (Pulsuz)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Groq Console */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/25 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-300">🟢 Groq LPU (Pulsuz)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                  providerKeys?.groq
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}>
                  {providerKeys?.groq ? 'Aktivdir' : 'Açar Lazımdır'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Saniyədə 400+ token sürəti ilə Llama 3.3 70B & DeepSeek R1 70B. Dəyişən: <code className="text-emerald-300">GROQ_API_KEY</code>
              </p>
            </div>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 text-[11px] font-semibold transition"
            >
              <span>Groq Açar Götür (Pulsuz)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Təhlükəsizlik üçün API açarları yalnız server mühitində (<code className="text-slate-200">.env</code> və ya Cloud/GitHub Secrets) saxlanılır; açarı olmayan model seçildikdə sistem itikisiz kaskad ilə aktiv ehtiyat modeldən cavab verir.</span>
        </p>
      </div>

      {/* Model Selection */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Bütün AI Modelləri Kataloqu (Avto-Kaskad Qorunmalı)</h3>
          </div>
          <span className="text-xs text-cyan-400 font-mono">
            Aktiv Model: {activeModelList.find(m => m.id === selectedModel)?.alias || selectedModel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeModelList.map((m) => {
            const isSelected = selectedModel === m.id;
            const ready = isProviderConfigured(m.provider);
            return (
              <div
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-300 border-indigo-500/20 font-mono">
                    {m.speed}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {!ready && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                        Açar gözləyir
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                </div>
                <h4 className="text-xs font-bold text-white font-mono">{m.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{m.description}</p>
              </div>
            );
          })}
        </div>

        {/* Temperature slider */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              Cavab Səlisliyi və Yaradıcılıq (Temperature): <strong className="text-cyan-300 font-mono">{temperature}</strong>
            </span>
            <span className="text-slate-500 text-[11px]">0.2 (Ciddi & Faktiki) — 0.9 (Bədii & Rol İfası)</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
          />
        </div>
      </div>

      {/* Roleplay Personas Gallery */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">AI Xarakterlər (Tam İmmersiya Protokolu)</h3>
          </div>
          <span className="text-xs text-slate-400">İstifadəçilər /roleplay əmri ilə dəyişə bilər</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {personas.map((persona) => {
            const isActive = roleplayMode === persona.id;
            return (
              <div
                key={persona.id}
                onClick={() => setRoleplayMode(persona.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{persona.icon}</span>
                  {isActive && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Aktiv
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white">{persona.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{persona.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom System Instruction Editor */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">AAQ Sistem Təlimatı (Default Xarakter Üçün)</h3>
          </div>
          <button
            type="button"
            onClick={handleResetPrompt}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılana Sıfırla</span>
          </button>
        </div>

        <textarea
          rows={5}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono leading-relaxed placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          placeholder="AI-nin əməl etməli olduğu qaydalar, AAQ kimliyi və təlimatlar..."
        />
        <p className="text-[11px] text-slate-500">
          Qeyd: Xüsusi personajlar (məs: Müdrik Filosof və ya Kiberpunk 2077) seçildikdə, rol tam immersiyasını qorumaq üçün personajın öz xarakter təlimatı əsas prioritet götürülür.
        </p>
      </div>

      {/* Features: PDF Analysis & Audio Transcribe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
          <FileSearch className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-slate-200">PDF Sənəd Analizi & Xülasə</h4>
            <p className="text-slate-400 mt-0.5">
              İstifadəçi şəxsi çatda PDF göndərdikdə Gemini Document multimodal mühərriki sənədi oxuyur, xülasəsini çıxarır və sualları cavablandırır.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
          <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-slate-200">Səsli Mesajların Tanınması</h4>
            <p className="text-slate-400 mt-0.5">
              Səsli mesajlar Gemini Audio mühərriki ilə Azərbaycan dilində operativ şəkildə mətnə çevrilir və seçilmiş personajla cavablandırılır.
            </p>
          </div>
        </div>
      </div>

    </form>
  );
};
