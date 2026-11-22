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
  FileSearch
} from 'lucide-react';
import { BotConfig, PersonaOption, ModelDefinition } from '../types';

interface GeminiSettingsProps {
  config: BotConfig | null;
  personas: PersonaOption[];
  models?: ModelDefinition[];
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
    isDefault: true
  },
  {
    id: 'gemini-2.5-flash',
    alias: 'Gemini 2.5 Flash',
    name: '🔵 Gemini 2.5 Flash ⚡ (Yüksək Sabitlik)',
    description: 'Yüklənmələrə qarşı ən stabil, etibarlı və səlis Google Flash modeli',
    speed: 'Sürətli (~0.3s)',
    provider: 'gemini'
  },
  {
    id: 'gemini-3.7-flash',
    alias: 'Gemini 3.7 Flash',
    name: '🟣 Gemini 3.7 Flash 🌟',
    description: 'Hibrid düşüncə, geniş kontekst və zəngin bilik bazası',
    speed: 'Sürətli (~0.4s)',
    provider: 'gemini'
  },
  {
    id: 'gemini-3.1-flash-lite',
    alias: 'Gemini 3.1 Flash Lite',
    name: '🟢 Gemini 3.1 Flash Lite 🚀',
    description: 'Operativ reaksiya, minimum gecikmə və kəsintisiz iş',
    speed: 'İldırım Sürəti (~0.2s)',
    provider: 'gemini'
  },
  {
    id: 'gemini-flash-latest',
    alias: 'Gemini Flash Latest',
    name: '🟡 Gemini Flash Latest 💡',
    description: 'Daim yenilənən sabit Google Flash modeli',
    speed: 'Sürətli (~0.3s)',
    provider: 'gemini'
  },
  {
    id: 'deepseek/deepseek-r1:free',
    alias: 'DeepSeek R1',
    name: '🟣 DeepSeek R1 🧠 (Dərin Mühakimə)',
    description: 'Mürəkkəb riyazi, məntiqi və elmi tədqiqat sualları üçün dərin analitik model',
    speed: 'Analitik (~1.2s)',
    provider: 'openrouter'
  },
  {
    id: 'deepseek/deepseek-chat:free',
    alias: 'DeepSeek V3',
    name: '🟣 DeepSeek V3 🌌 (Akademik Analiz)',
    description: 'Geniş erudisiya, yüksək ədəbi ifadə və proqramlaşdırma qabiliyyəti',
    speed: 'Sürətli (~0.7s)',
    provider: 'openrouter'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    alias: 'Llama 3.3 70B',
    name: '🟣 Llama 3.3 70B 🏛️ (Meta AI)',
    description: '70 milyard parametrli güclü çoxdilli akademik və ümumi bilik modeli',
    speed: 'Sürətli (~0.6s)',
    provider: 'openrouter'
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    alias: 'Qwen 2.5 72B',
    name: '🟠 Qwen 2.5 72B 📜 (Alibaba Cloud)',
    description: 'Dəqiq mətn analizi, məntiqi nəticə və çoxdilli tərcümə imkanları',
    speed: 'Sürətli (~0.6s)',
    provider: 'openrouter'
  },
  {
    id: 'llama-3.3-70b-versatile',
    alias: 'Groq Llama 3.3 70B',
    name: '🟢 Groq Llama 3.3 70B ⚡ (LPU Sürəti)',
    description: 'Groq LPU prosessoru üzərində ani reaksiya verən 70B intellektual model',
    speed: 'Hiper Sürət (~0.2s)',
    provider: 'groq'
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    alias: 'Groq DeepSeek R1 70B',
    name: '🟢 Groq DeepSeek R1 70B 🚀 (Hiper Analiz)',
    description: 'DeepSeek R1 zəkası ilə Groq LPU sürətinin birləşməsi',
    speed: 'Hiper Sürət (~0.3s)',
    provider: 'groq'
  }
];

export const GeminiSettings: React.FC<GeminiSettingsProps> = ({
  config,
  personas,
  models = DEFAULT_MODELS_LIST,
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

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Save action floating header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-sm font-semibold text-white">Çoxmühərrikli AI & Dərin Personaj İdarəetməsi</h2>
            <p className="text-xs text-slate-400">AAQ Telegram botunuzun beyni, aktiv modelləri və xarakterini buradan idarə edin</p>
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

      {/* Model Selection */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">AI Modelləri Kataloqu (Gemini, DeepSeek, Llama, Qwen, Groq)</h3>
          </div>
          <span className="text-xs text-cyan-400 font-mono">
            Aktiv Model: {activeModelList.find(m => m.id === selectedModel)?.alias || selectedModel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeModelList.map((m) => {
            const isSelected = selectedModel === m.id;
            const providerLabel =
              m.provider === 'openrouter'
                ? 'OpenRouter'
                : m.provider === 'groq'
                  ? 'Groq LPU'
                  : 'Google Gemini';
            const providerBadgeClass =
              m.provider === 'openrouter'
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                : m.provider === 'groq'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';

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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border font-mono ${providerBadgeClass}`}>
                      {providerLabel}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-300 border-indigo-500/20 font-mono">
                      {m.speed}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
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
