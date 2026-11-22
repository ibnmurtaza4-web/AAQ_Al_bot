import React, { useState } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileText, 
  HelpCircle,
  Calculator,
  CloudSun,
  BookOpen,
  Scroll,
  Calendar,
  Layers
} from 'lucide-react';
import { PersonaOption, ModelDefinition } from '../types';

interface BotSimulatorProps {
  personas: PersonaOption[];
  activePersona: string;
  models?: ModelDefinition[];
  activeModel?: string;
}

interface SimulatorMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const BotSimulator: React.FC<BotSimulatorProps> = ({
  personas,
  activePersona,
  models,
  activeModel = 'gemini-3.8-flash'
}) => {
  const [messages, setMessages] = useState<SimulatorMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: `Salam! 👋 Mən **"AAQ - Ahl Al Qalam"** elmi-maarif birliyi tərəfindən hazırlanmış və **Google Gemini AI** tərəfindən gücləndirilmiş bot simulyatoruyam.\n\nMənə istənilən sualınızı yaza və ya əmrləri (/sozluk, /hesabla, /hava, /sitat, /tarix, /dim) buradan canlı test edə bilərsiniz!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedPersona, setSelectedPersona] = useState(activePersona);
  const [selectedModel, setSelectedModel] = useState(activeModel);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const quickCommands = [
    { label: '📖 /sozluk maarif', cmd: '/sozluk maarif' },
    { label: '🔢 /hesabla (150*12)/5 + 4^3', cmd: '/hesabla (150*12)/5 + 4^3' },
    { label: '🌤️ /hava Bakı', cmd: '/hava Bakı' },
    { label: '📜 /sitat', cmd: '/sitat' },
    { label: '📅 /tarix', cmd: '/tarix' },
    { label: '📚 /dim', cmd: '/dim' },
    { label: '🤖 Hansı modellə danışıram?', cmd: 'Hansı modellə danışıram?' }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isAiLoading) return;

    const userMsg: SimulatorMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsAiLoading(true);

    try {
      let promptToApi = text;

      if (text.startsWith('/sozluk')) {
        const word = text.replace(/^\/sozluk\s*/, '').trim() || 'intellekt';
        promptToApi = `"${word}" sözü üçün Azərbaycan dilinin izahlı lüğətinə uyğun geniş məlumat hazırla: 1. Sözün leksik mənası və izahı 2. Etimologiyası (mənşəyi) 3. Sinonimləri və Antonimləri 4. Nümunə cümlə.`;
      } else if (text.startsWith('/hesabla')) {
        const mathExpr = text.replace(/^\/hesabla\s*/, '').trim();
        promptToApi = `Riyazi hesablama: "${mathExpr}". Dəqiq hesabla, addım-addım həllini və son cavabını göstər.`;
      } else if (text.startsWith('/hava')) {
        const city = text.replace(/^\/hava\s*/, '').trim() || 'Bakı';
        promptToApi = `${city} şəhəri üçün fəsil xüsusiyyətlərinə və iqlimə uyğun hava məlumatı, temperatur və tövsiyələr ver.`;
      } else if (text.startsWith('/sitat')) {
        promptToApi = `Nizami Gəncəvi, Məhəmməd Füzuli, Şah İsmayıl Xətai və ya dünya mütəfəkkirlərindən (Sokrat, Platon, Viktor Hüqo) təsdiq olunmuş tarixi həqiqi bir sitat, əsərinin adını və müəllifini təqdim et.`;
      } else if (text.startsWith('/tarix')) {
        const dateStr = new Date().toLocaleDateString('az-AZ', { month: 'long', day: 'numeric' });
        promptToApi = `Tarixdə bu gün (${dateStr}) baş vermiş ən mühüm tarixi hadisələri və Azərbaycan tarixindəki əhəmiyyətli məqamları təqdim et.`;
      } else if (text.startsWith('/dim')) {
        promptToApi = `Dövlət İmtahan Mərkəzi (DİM) haqqında abituriyentlər üçün ixtisas qrupları və faydalı bələdçi hazırla.`;
      }

      const res = await fetch('/api/gemini/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToApi,
          persona: selectedPersona,
          model: selectedModel
        })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'bot',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'bot',
            text: `⚠️ Cavab alına bilmədi: ${data.error || 'Gemini API xətası'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: `⚠️ Şəbəkə xətası: ${err?.message || err}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 2 Cols: Telegram Chat Simulator */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col h-[640px]">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">AAQ Bot Canlı Dialoq Simulyatoru</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Canlı Gemini Mühərriki
              </p>
            </div>
          </div>

          {/* Model and Persona selectors for simulation */}
          <div className="flex items-center gap-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-indigo-300 rounded-lg px-2.5 py-1 focus:outline-none"
            >
              {(models || []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.alias}
                </option>
              ))}
            </select>

            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-cyan-300 rounded-lg px-2.5 py-1 focus:outline-none"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                    isBot ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {isBot ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`p-3 rounded-2xl text-xs space-y-1.5 shadow-md ${
                    isBot
                      ? 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                      : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                  <span
                    className={`block text-[10px] text-right ${
                      isBot ? 'text-slate-600' : 'text-indigo-200'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isAiLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs italic">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span>⏳ Araşdırıram, hazırlayıram və təqdim edirəm...</span>
            </div>
          )}
        </div>

        {/* Chat input form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2 border-t border-slate-800 pt-3 flex-shrink-0">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Mesajınızı və ya əmrləri (/sozluk, /hesabla, /hava...) daxil edin..."
            className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isAiLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Göndər</span>
          </button>
        </form>
      </div>

      {/* 1 Col: Quick Command Test Suite */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Sürətli Əmr Testləri</h3>
            <p className="text-[11px] text-slate-400">AAQ bot əmrlərini tək toxunuşla sınayın</p>
          </div>
        </div>

        <div className="space-y-2">
          {quickCommands.map((qc, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(qc.cmd)}
              disabled={isAiLoading}
              className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-indigo-500/50 hover:bg-slate-900 text-xs text-slate-300 transition flex items-center justify-between group disabled:opacity-50"
            >
              <span className="font-mono text-[11px]">{qc.label}</span>
              <Send className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition" />
            </button>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Müdrik Sitat Zəmanəti</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Bot bütün sitatları Nizami Gəncəvi, Füzuli, Şah İsmayıl Xətai, Nəsimi, Şəhriyar və dünya filosoflarının təsdiqlənmiş ədəbi əsərlərindən təqdim edir. Saxta sitat yaradılması qəti qadağan edilmişdir.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
          <strong className="block font-semibold text-indigo-200 mb-0.5">Model Şüuru:</strong>
          Model hansı rejimdə işlədiyini bilir və istifadəçi soruşduqda cari aktiv modelin adını operativ söyləyir.
        </div>
      </div>

    </div>
  );
};
