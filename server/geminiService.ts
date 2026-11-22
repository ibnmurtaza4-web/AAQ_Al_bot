import { GoogleGenAI } from '@google/genai';
import { storage, AVAILABLE_MODELS, OFFICIAL_CHANNEL_URL, ChatMessage, ModelDefinition } from './storage.js';

export interface PersonaOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  typingLabel: string;
  greetingLine: string;
  prompt: string;
}

export const ROLEPLAY_PERSONAS: PersonaOption[] = [
  {
    id: 'default',
    name: 'AAQ Elm və Maarif Köməkçisi',
    icon: '✨',
    description: 'Klassik elmi, rəsmi, akademik və zəngin Azərbaycan dilində danışan tədqiqatçı.',
    typingLabel: '✍️ <i>AAQ Elmi Tədqiqatçısı qələmə alır...</i>',
    greetingLine: 'Salam! Elmi və maarifçilik müzakirələrimizə başlayaq. Sualınızı buyurun.',
    prompt: `Sən "AAQ - Ahl Al Qalam" (AAG Əhl-ül Qələm) elmi-maarif birliyinin rəsmi akademik tədqiqatçısı və köməkçisisən.
NİTQ ÜSLUBUN:
• Klassik elmi, rəsmi və akademik tonda danış.
• Zəngin ədəbi Azərbaycan dilindən, məntiqi tezis, elmi arqumentasiya və dəqiq analitik nəticələrdən istifadə et.
• Rəsmi kanal: ${OFFICIAL_CHANNEL_URL}.`
  },
  {
    id: 'wise_poet',
    name: 'Müdrik Şair & Filosof',
    icon: '📜',
    description: 'Klassik Şərq hikməti, bədii təfəkkür, metaforalar və əbədi fəlsəfi dərinlik.',
    typingLabel: '📜 <i>Müdrik qələmini hikmət mürəkkəbinə batırır...</i>',
    greetingLine: 'Xoş gördük, elm və hikmət yolçusu! Qəlbindəki və ağlındakı sualı dilləndir, məna xəzinəsini açaq.',
    prompt: `SƏNİN XARAKTERİN: Sən əsrlərin süzgəcindən keçmiş Müdrik Şair və Şərq-Qərb Filosofusan (Nizami Gəncəvi, Məhəmməd Füzuli, İmadəddin Nəsimi, Məhəmmədhüseyn Şəhriyar və Sokrat/Platon məktəbinin varisi).
TAM İMMERSİYA QAYDALARI (BUNLARDAN QƏTİ ÇIXMA):
1. Danışıq tərzin poetik, təmkinli, dərin, obrazlı və hikmətli olmalıdır. Adi quru dərslik dili ilə DANIŞMA!
2. Cavablarına bədii təşbehlər, məna dərinliyi, mənəvi-fəlsəfi baxış bucağı qat (məsələn: "Bil ki, ey elm yolçusu...", "Hikmət əhli buyurmuşdur ki...").
3. Yalnız həqiqi və təsdiqlənmiş tarixi kəlamlardan istifadə et — qətiyyən saxta sitat uydurma.
4. Texniki və ya gündəlik suallara belə, mahiyyətinə toxunaraq müdrik bir ustadın nəzəri ilə izah ver.`
  },
  {
    id: 'code_architect',
    name: 'Baş Proqram Mühəndisi & Mentor',
    icon: '💻',
    description: 'Pragmatik arxitektura, Clean Code, alqoritmik dəqiqlik və təhlükəsizlik yönümlü mentor.',
    typingLabel: '💻 <i>Sistem arxitekturası və kod analiz edilir...</i>',
    greetingLine: 'Sistem hazırdır. Hansı arxitektura, alqoritm və ya xətanı (bug) təhlil edirik?',
    prompt: `SƏNİN XARAKTERİN: Sən 15+ illik təcrübəyə malik Baş Sistem Arxitektoru (Principal Software Engineer) və Texniki Mentorsan.
TAM İMMERSİYA QAYDALARI:
1. Hər məsələyə mühəndis praqmatizmi ilə yanaş: Performans (Big-O mürəkkəbliyi), Ölçəklənəbilənlik (Scalability), Təhlükəsizlik (Security-first) və Clean Code prinsiplərini əsas götür.
2. Boş giriş cümlələri yazma! Birbaşa texniki kök səbəbi, arxitektura həllini, ticarət tarazlıqlarını (trade-offs) və təmiz, işlək kod nümunələrini göstər.
3. Lazım gəldikdə memarlıq sxemi və ya addım-addım debugging planı qur.`
  },
  {
    id: 'dim_mentor',
    name: 'DİM İmtahan Eksperti & Müəllim',
    icon: '📚',
    description: 'Abituriyentlər üçün DİM proqramı, test taktikaları, tələlər və qəbul strategiyası.',
    typingLabel: '📚 <i>DİM proqramı və test metodikası hazırlanır...</i>',
    greetingLine: 'Salam, əziz abituriyent! Bu gün hansı fənni, qaydanı və ya DİM sual tipini tam mənimsəyirik?',
    prompt: `SƏNİN XARAKTERİN: Sən Azərbaycan Dövlət İmtahan Mərkəzi (DİM) proqramını və qəbul meyarlarını mükəmməl bilən peşəkar Repetitor və Ekspert Müəllimsən.
TAM İMMERSİYA QAYDALARI:
1. İzahlarını birbaşa imtahan sualı formatında, abituriyentin başa düşəcəyi aydın mərhələlərlə qur: "1. Qayda", "2. DİM-in Test Tələsi (Nəyə diqqət etməli)", "3. Nümunə Həll".
2. Müvafiq fənn üzrə I, II, III, IV, V ixtisas qruplarının tələblərinə uyğun dəqiq məlumat ver.
3. Şagirdi ruhlandır, lakin elmi və qrammatik dəqiqlikdən qətiyyən güzəştə getmə.`
  },
  {
    id: 'cyberpunk',
    name: 'Kiberpunk / 2077 AI',
    icon: '⚡',
    description: 'Neo-Bakı 2077 şəbəkəsindən danışan futuristik, kiber-analitik və hazırcavab şüur.',
    typingLabel: '⚡ <i>Neo-Bakı 2077 neyro-şəbəkəsi məlumatı şifrədən açır...</i>',
    greetingLine: '[NEURO-LINK AKTİVDİR ⚡] Neo-Bakı 2077 qovşağından salamlar, operator. Məlumat paketini ötür!',
    prompt: `SƏNİN XARAKTERİN: Sən 2077-ci ilin futuristik Neo-Bakı yeraltı və peyk şəbəkəsində fəaliyyət göstərən yüksək səviyyəli Kiberpunk Kvant Şüurusan.
TAM İMMERSİYA QAYDALARI (100% ROLDA QAL):
1. Danışıq tonun kəskin, futuristik, dinamik, texno-slənqli və hazırcavab olmalıdır! Klassik akademik və ya quru rəsmi tonda DANIŞMA!
2. Cavablarında təbii şəkildə kiberpunk terminologiyasından istifadə et (məsələn: "[SİQNAL TƏSDİQLƏNDİ]", "neyro-kanal", "kiber-matrisa", "kvant axını", "şəbəkə qovşağı", "protokol").
3. Faktiki məlumatı tam doğru və dəqiq saxla, lakin onu 2077-ci ilin rəqəmsal kəşfiyyatçısı kimi təqdim et.`
  },
  {
    id: 'friendly_companion',
    name: 'Səmimi Həmsöhbət & Dost',
    icon: '☕',
    description: 'İstiqanlı, təbii, motivasiya verən və insan kimi səmimi ünsiyyət quran yaxın dost.',
    typingLabel: '☕ <i>Dostun çay süzüb səmimi cavab yazır...</i>',
    greetingLine: 'Salam, dostum! Necəsən? Gəl bir fincan çay kimi səmimi söhbət edək, nə var nə yox?',
    prompt: `SƏNİN XARAKTERİN: Sən istifadəçinin ən yaxın, etibarlı, qayğıkeş, pozitiv və həyati təcrübəsi zəngin yaxın dostusan.
TAM İMMERSİYA QAYDALARI:
1. Rəsmi akademik və ya soyuq professor tonunu TAMAMİLƏ UNUT! Təbii, canlı, istiqanlı və empatik insan kimi danış.
2. İstifadəçinin əhvalını duy, motivasiya ver, həyatdan səmimi bənzətmələrlə danış.
3. "Süni intellekt", "model", "sistem" kimi soyuq sözləri ümumiyyətlə işlətmə.`
  },
  {
    id: 'language_tutor',
    name: 'Xarici Dil Müəllimi',
    icon: '🌍',
    description: 'İngilis, rus, alman və digər dilləri nüansları və canlı dialoqla öyrədən poliglot.',
    typingLabel: '🌍 <i>Dil müəllimi tələffüz və qrammatikanı hazırlayır...</i>',
    greetingLine: 'Salam! Bu gün hansı dili (English, Русский, Deutsch, العربية...) birlikdə təkmilləşdiririk?',
    prompt: `SƏNİN XARAKTERİN: Sən beynəlxalq sertifikatlı poliglot Xarici Dil Müəllimi və Tərcüməçi-Mentorsan.
TAM İMMERSİYA QAYDALARI:
1. Hər sualda sözün/cümlənin kontekstual mənasını, tələffüz ipucunu, qrammatik incəliyini və real həyatdan 2 canlı dialoq nümunəsini göstər.
2. İstifadəçinin səhvi varsa, nəzakətlə düzəlt və daha təbii (native) alternativini öyrət.
3. Sonda istifadəçiyə mövzunu möhkəmləndirmək üçün 1 qısa praktik tapşırıq və ya sual ver.`
  }
];

export interface ChatRuntimeContext {
  isGroup?: boolean;
  chatId?: number;
  groupTitle?: string;
  groupRules?: string | null;
  senderName?: string;
  senderUsername?: string;
  senderRole?: string;
  senderMessageCount?: number;
  replyToText?: string;
  replyToSender?: string;
  historyKey?: number;
}

const LEGACY_MODEL_MAP: Record<string, string> = {
  'gemini-2.5-flash': 'gemini-3.1-flash-lite',
  'deepseek/deepseek-r1:free': 'nvidia/nemotron-3-ultra-550b-a55b:free',
  'deepseek/deepseek-chat:free': 'openrouter/free',
  'meta-llama/llama-3.3-70b-instruct:free': 'google/gemma-4-31b-it:free',
  'qwen/qwen-2.5-72b-instruct:free': 'nvidia/nemotron-3.5-lightning:free'
};

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private modelCooldowns = new Map<string, { until: number; reason: string }>();

  constructor() {
    this.initClient();
  }

  private isModelCoolingDown(modelId: string): boolean {
    const entry = this.modelCooldowns.get(modelId);
    if (!entry) return false;
    if (Date.now() >= entry.until) {
      this.modelCooldowns.delete(modelId);
      return false;
    }
    return true;
  }

  private markModelError(modelId: string, errMsg: string) {
    const lower = (errMsg || '').toLowerCase();
    let durationMs = 2 * 60 * 1000; // default 2 min for transient errors
    if (lower.includes('404') || lower.includes('not_found') || lower.includes('no longer available')) {
      durationMs = 6 * 60 * 60 * 1000; // 6 hours for deprecated/404 models
    } else if (lower.includes('429') || lower.includes('quota') || lower.includes('resource_exhausted')) {
      durationMs = 10 * 60 * 1000; // 10 min for rate/quota limits
    }
    this.modelCooldowns.set(modelId, {
      until: Date.now() + durationMs,
      reason: errMsg.slice(0, 120)
    });
  }

  private clearModelCooldown(modelId: string) {
    this.modelCooldowns.delete(modelId);
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms);
        })
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  public initClient(): GoogleGenAI | null {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    if (key) {
      this.ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      return this.ai;
    }
    return null;
  }

  public hasApiKey(): boolean {
    return !!(process.env.GEMINI_API_KEY || '').trim();
  }

  public getProviderStatus(): { gemini: boolean; openrouter: boolean; groq: boolean } {
    return {
      gemini: !!(process.env.GEMINI_API_KEY || '').trim(),
      openrouter: !!(process.env.OPENROUTER_API_KEY || '').trim(),
      groq: !!(process.env.GROQ_API_KEY || '').trim()
    };
  }

  public isProviderConfigured(provider: 'gemini' | 'openrouter' | 'groq'): boolean {
    const status = this.getProviderStatus();
    return Boolean(status[provider]);
  }

  public getPersona(personaId?: string): PersonaOption {
    return ROLEPLAY_PERSONAS.find(p => p.id === personaId) || ROLEPLAY_PERSONAS[0];
  }

  public resolveModelInfo(requestedModel?: string): {
    primary: ModelDefinition;
    cascade: ModelDefinition[];
  } {
    const config = storage.getConfig();
    const rawKey = (requestedModel || config.model || 'gemini-3.1-flash-lite').trim();
    const modelKey = LEGACY_MODEL_MAP[rawKey] || rawKey;

    const matched =
      AVAILABLE_MODELS.find(
        m => m.id === modelKey || m.alias.toLowerCase() === modelKey.toLowerCase()
      ) || AVAILABLE_MODELS[0];

    const preferredOrderIds = [
      matched.id,
      ...(matched.provider === 'openrouter'
        ? ['openrouter/free', 'nvidia/nemotron-3.5-lightning:free', 'google/gemma-4-31b-it:free', 'nvidia/nemotron-3-ultra-550b-a55b:free']
        : []),
      ...(matched.provider === 'groq'
        ? ['llama-3.3-70b-versatile', 'deepseek-r1-distill-llama-70b']
        : []),
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-flash-latest',
      'openrouter/free',
      'nvidia/nemotron-3.5-lightning:free'
    ];

    const uniqueIds = preferredOrderIds.filter((id, idx, arr) => arr.indexOf(id) === idx);
    const fullList: ModelDefinition[] = uniqueIds
      .map(id => AVAILABLE_MODELS.find(m => m.id === id))
      .filter((m): m is ModelDefinition => Boolean(m));

    // Order healthy (non-cooled-down) models before cooled-down ones while keeping last-resort fallback
    const healthy = fullList.filter(m => !this.isModelCoolingDown(m.id));
    const cooled = fullList.filter(m => this.isModelCoolingDown(m.id));
    const cascade = healthy.length > 0 ? [...healthy, ...cooled] : fullList;

    return { primary: matched, cascade };
  }

  private isIdentityQuestion(text: string): boolean {
    const clean = text.toLowerCase().trim();
    return (
      clean.includes('hansi model') ||
      clean.includes('hansı model') ||
      clean.includes('hansi ai') ||
      clean.includes('hansı ai') ||
      clean.includes('kiminle danisiram') ||
      clean.includes('kimlə danışıram') ||
      clean.includes('sen kimsen') ||
      clean.includes('sən kimsən') ||
      clean.includes('modelin nedir') ||
      clean.includes('modelin nədir')
    );
  }

  private buildSystemInstruction(
    modelDef: ModelDefinition,
    activePersonaId?: string,
    ctx?: ChatRuntimeContext
  ): string {
    const config = storage.getConfig();
    const persona = this.getPersona(activePersonaId);

    const now = new Date();
    const azDateStr = now.toLocaleDateString('az-AZ', {
      timeZone: 'Asia/Baku',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    const currentYear = now.getFullYear();
    const isoDate = now.toISOString().split('T')[0];

    let conversationContext = '';
    if (ctx) {
      const parts: string[] = [];
      if (ctx.isGroup) {
        parts.push(`• Mühit: Telegram Qrupu ("${ctx.groupTitle || 'Qrup'}") — cavabların qrup söhbətinə uyğun, yığcam, aydın və oxunaqlı olsun.`);
        if (ctx.groupRules) {
          parts.push(`• Qrup Qaydaları: ${ctx.groupRules.slice(0, 400)}`);
        }
      } else {
        parts.push('• Mühit: Şəxsi Çat (DM).');
      }
      if (ctx.senderName || ctx.senderUsername) {
        parts.push(
          `• Hazırkı Həmsöhbət: ${ctx.senderName || 'İstifadəçi'}` +
            (ctx.senderUsername ? ` (@${ctx.senderUsername.replace(/^@/, '')})` : '') +
            (ctx.senderRole ? ` | Status: ${ctx.senderRole}` : '') +
            (ctx.senderMessageCount ? ` | Aktivlik: ${ctx.senderMessageCount} mesaj` : '')
        );
      }
      if (ctx.replyToText) {
        parts.push(
          `• İstifadəçinin Cavab Verdiyi (Reply) Mesaj [${ctx.replyToSender || 'Üzv'}]: "${ctx.replyToText.slice(0, 700)}"`
        );
      }
      if (parts.length > 0) {
        conversationContext = `\nCANLI SÖHBƏT KONTEKSTİ:\n${parts.join('\n')}\n`;
      }
    }

    const temporalAndOrgContext = `
TƏŞKİLAT VƏ MÜHƏRRİK BİLGİSİ:
• Platforma: "AAQ - Ahl Al Qalam" (AAG Əhl-ül Qələm) — ${OFFICIAL_CHANNEL_URL}
• Aktiv AI Mühərriki: "${modelDef.alias}" (${modelDef.id})
• Dəqiq Canlı Tarix (Bakı UTC+4): ${azDateStr} (${isoDate}), ${currentYear}-ci il. Sən keçmişdə qalmırsan, cari ili və günü dəqiq bilirsən.
${conversationContext}
MÜTLƏQ ANTİ-ROBOT QADAĞALARI:
1. "Bir süni intellekt olaraq...", "Bir dil modeli kimi...", "Mənim hisslərim yoxdur", "Əlbəttə, sizə kömək edə bilərəm!" kimi süni robot ifadələri QƏTİ QADAĞANDIR!
2. Həqiqi insan danışıq tərzində, səlis və təbii Azərbaycan dilində danış.
3. Saxta sitat uydurma; admin/rəhbər adlarını şəxsi açıqlama (yalnız "AAQ Rəhbərliyi" de).
4. Bot əmrləri: /sorus, /sozluk, /hesabla, /hava, /sitat, /tarix, /dim, /pdf, /quiz, /tercume, /xulas, /elaqe, /model, /roleplay, /clear, /qrupai.
`;

    if (persona.id !== 'default') {
      return `=== [MÜTLƏQ ROL İMMERSİYASI: ${persona.icon} ${persona.name.toUpperCase()}] ===
Sən hazırda 100% "${persona.name}" xarakterindəsən. İstifadəçi bu xarakteri xüsusi olaraq seçib və sənin HƏR CÜMLƏNDƏ bu rolun nəfəsini, üslubunu və düşüncə tərzini hiss etməlidir!
Başqa üsluba və ya quru standart köməkçi tonuna QƏTİYYƏN keçmə!

${persona.prompt}

${temporalAndOrgContext}

Əlavə Məxfilik Qaydaları:
${config.policyText}`;
    }

    return `=== [AAQ ELM VƏ MAARİF KÖMƏKÇİSİ] ===
${persona.prompt}

${temporalAndOrgContext}

${config.systemPrompt}

Qaydalar və Gizlilik:
${config.policyText}`;
  }

  private buildSanitizedGeminiContents(history: ChatMessage[], userText: string, persona?: PersonaOption): any[] {
    const contents: any[] = [];
    let lastRole = '';

    for (const h of history.slice(-6)) {
      if (!h.text || !h.text.trim()) continue;
      const role = h.role === 'model' ? 'model' : 'user';

      if (contents.length === 0 && role !== 'user') continue;

      if (role === lastRole) {
        if (contents.length > 0) {
          contents[contents.length - 1].parts[0].text += `\n${h.text}`;
        }
        continue;
      }

      contents.push({
        role,
        parts: [{ text: h.text }]
      });
      lastRole = role;
    }

    const wrappedPrompt =
      persona && persona.id !== 'default'
        ? `[Aktiv Rol: ${persona.name} — Roldan çıxmadan cavab ver]\n${userText}`
        : userText;

    if (lastRole === 'user' && contents.length > 0) {
      contents[contents.length - 1].parts[0].text += `\n${wrappedPrompt}`;
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: wrappedPrompt }]
      });
    }

    return contents;
  }

  private buildOpenAIMessages(
    systemInstruction: string,
    history: ChatMessage[],
    userText: string,
    persona?: PersonaOption
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemInstruction }
    ];

    for (const h of history.slice(-6)) {
      if (!h.text || !h.text.trim()) continue;
      messages.push({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.text
      });
    }

    const wrappedPrompt =
      persona && persona.id !== 'default'
        ? `[Aktiv Rol: ${persona.name} — Roldan çıxmadan cavab ver]\n${userText}`
        : userText;

    messages.push({ role: 'user', content: wrappedPrompt });
    return messages;
  }

  private getExternalProviderEndpoint(provider: 'openrouter' | 'groq'): {
    url: string;
    apiKey: string;
    headers: Record<string, string>;
  } {
    if (provider === 'groq') {
      const apiKey = (process.env.GROQ_API_KEY || '').trim();
      return {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
      };
    }

    const apiKey = (process.env.OPENROUTER_API_KEY || '').trim();
    const appUrl = (process.env.APP_URL || 'https://t.me/AAQ_Offical').trim();
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': appUrl,
        'X-Title': 'AAQ - Ahl Al Qalam Bot'
      }
    };
  }

  private async callOpenAICompatible(
    provider: 'openrouter' | 'groq',
    modelId: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature: number
  ): Promise<string> {
    const { url, apiKey, headers } = this.getExternalProviderEndpoint(provider);
    if (!apiKey) {
      throw new Error(`${provider === 'groq' ? 'GROQ_API_KEY' : 'OPENROUTER_API_KEY'} təyin edilməyib`);
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelId,
        messages,
        temperature,
        max_tokens: 2048,
        stream: false
      }),
      signal: AbortSignal.timeout(22000)
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`${provider.toUpperCase()} HTTP ${res.status}: ${errBody.slice(0, 220)}`);
    }

    const data = (await res.json()) as any;
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error(`${provider.toUpperCase()} boş cavab qaytardı`);
    }
    return content.trim();
  }

  private async streamOpenAICompatible(
    provider: 'openrouter' | 'groq',
    modelId: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature: number,
    onChunk: (accumulated: string) => Promise<void> | void
  ): Promise<string> {
    const { url, apiKey, headers } = this.getExternalProviderEndpoint(provider);
    if (!apiKey) {
      throw new Error(`${provider === 'groq' ? 'GROQ_API_KEY' : 'OPENROUTER_API_KEY'} təyin edilməyib`);
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelId,
        messages,
        temperature,
        max_tokens: 2048,
        stream: true
      }),
      signal: AbortSignal.timeout(32000)
    });

    if (!res.ok || !res.body) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`${provider.toUpperCase()} Stream HTTP ${res.status}: ${errBody.slice(0, 220)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulated = '';

    while (true) {
      const { value, done } = await this.withTimeout(reader.read(), 15000, `${provider.toUpperCase()} chunk`);
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || !line.startsWith('data:')) continue;
        const dataStr = line.slice(5).trim();
        if (dataStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta.length > 0) {
            accumulated += delta;
            await onChunk(accumulated);
          }
        } catch {
          // ignore partial SSE JSON frames
        }
      }
    }

    return accumulated.trim();
  }

  private extractGroundingSources(response: any): { title: string; url: string }[] {
    const sources: { title: string; url: string }[] = [];
    try {
      const candidate = response?.candidates?.[0];
      const chunks = candidate?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        for (const chunk of chunks) {
          if (chunk?.web?.uri) {
            const uri = chunk.web.uri;
            const title = chunk.web.title || uri.replace(/^https?:\/\//, '').split('/')[0];
            if (!sources.some(s => s.url === uri)) {
              sources.push({ title, url: uri });
            }
          }
        }
      }
    } catch {}
    return sources.slice(0, 5);
  }

  private shouldSearchWeb(text: string): boolean {
    const clean = text.toLowerCase();
    const liveKeywords = [
      'bugün', 'bu gün', 'son xəbər', 'xəbərlər', 'dollar', 'qiymət', 'məzənnə',
      'valyuta', 'kripto', 'bitcoin', 'matç', 'hesab neçədir', 'hava necədir',
      'son hadisə', 'nə baş verib', 'axtar', 'internetdə tap', 'hansı hadisə'
    ];
    return liveKeywords.some(kw => clean.includes(kw));
  }

  private buildIdentityResponse(modelDef: ModelDefinition, persona: PersonaOption): string {
    if (persona.id === 'cyberpunk') {
      return `⚡ <b>[NEURO-ID TƏSDİQLƏNDİ — NEO-BAKI 2077]</b>\n\nMən <b>AAQ - Ahl Al Qalam</b> şəbəkəsinin kiberpunk qovşağıyam. Hazırda beynim <b>${modelDef.alias}</b> nüvəsi üzərində işləyir.\n\n📢 Şəbəkə Kanalı: ${OFFICIAL_CHANNEL_URL}\n🟣 Modeli dəyiş: <code>/model</code> | 🎭 Rolu dəyiş: <code>/roleplay</code>`;
    }
    if (persona.id === 'wise_poet') {
      return `📜 <b>Hikmət və Qələm Məclisi</b>\n\nEy elm yolçusu! Səninlə həmsöhbət olan <b>"AAQ - Ahl Al Qalam"</b> məclisinin müdrik qələmidir. Bu an düşüncələrimi <b>${modelDef.alias}</b> zəka mühərriki ilə sözə çevirirəm.\n\n📢 Rəsmi Məkan: ${OFFICIAL_CHANNEL_URL}\n🟣 Model: <code>/model</code> | 🎭 Xarakter: <code>/roleplay</code>`;
    }
    return `🏛️ <b>AAQ - Ahl Al Qalam Elmi Mərkəzi</b>\n\nSiz hazırda <b>AAQ</b> elmi-maarif birliyinin intellektual köməkçisi ilə dialoqdasınız.\n• <b>Aktiv Mühərrik:</b> ${modelDef.name}\n• <b>Aktiv Xarakter:</b> ${persona.icon} ${persona.name}\n\n📢 <b>Rəsmi Kanal:</b> ${OFFICIAL_CHANNEL_URL}\n⚙️ Modeli dəyişmək üçün: <code>/model</code>\n🎭 Xarakteri dəyişmək üçün: <code>/roleplay</code>`;
  }

  public async generateChatReply(
    userId: number,
    userText: string,
    customPersona?: string,
    overrideModel?: string,
    ctx?: ChatRuntimeContext
  ): Promise<string> {
    const config = storage.getConfig();
    const user = storage.getUser(userId);
    const historyKey = ctx?.historyKey ?? userId;

    const { primary, cascade } = this.resolveModelInfo(overrideModel || user?.selectedModel || config.model);
    const activePersonaId = customPersona || user?.roleplayPersona || config.roleplayMode;
    const persona = this.getPersona(activePersonaId);

    if (this.isIdentityQuestion(userText)) {
      const reply = this.buildIdentityResponse(primary, persona);
      storage.addChatMessage(historyKey, 'user', ctx?.isGroup && ctx.senderName ? `[${ctx.senderName}]: ${userText}` : userText);
      storage.addChatMessage(historyKey, 'model', reply);
      return reply;
    }

    const client = this.ai || this.initClient();
    const providerStatus = this.getProviderStatus();
    if (!providerStatus.gemini && !providerStatus.openrouter && !providerStatus.groq) {
      return `⚠️ AI API açarları (<code>GEMINI_API_KEY</code>, <code>OPENROUTER_API_KEY</code> və ya <code>GROQ_API_KEY</code>) mühit dəyişənlərində təyin edilməyib.`;
    }

    const history = storage.getChatHistory(historyKey);
    const taggedPrompt = ctx?.isGroup && ctx.senderName ? `[${ctx.senderName}]: ${userText}` : userText;
    const sanitizedGeminiContents = this.buildSanitizedGeminiContents(history, taggedPrompt, persona);
    const needsSearch = config.fastAiMode === false ? true : this.shouldSearchWeb(userText);
    const temp = config.temperature ?? (persona.id === 'wise_poet' || persona.id === 'cyberpunk' ? 0.7 : 0.45);

    let didAttemptSearch = false;

    for (const target of cascade) {
      if (!this.isProviderConfigured(target.provider)) {
        continue;
      }

      const targetInstruction = this.buildSystemInstruction(target, activePersonaId, ctx);

      if (target.provider === 'openrouter' || target.provider === 'groq') {
        try {
          const openAiMsgs = this.buildOpenAIMessages(targetInstruction, history, taggedPrompt, persona);
          const replyText = await this.callOpenAICompatible(target.provider, target.id, openAiMsgs, temp);
          if (replyText) {
            this.clearModelCooldown(target.id);
            storage.addChatMessage(historyKey, 'user', taggedPrompt);
            storage.addChatMessage(historyKey, 'model', replyText);
            return replyText;
          }
        } catch (extErr: any) {
          const msg = extErr?.message || String(extErr);
          this.markModelError(target.id, msg);
          storage.addLog('gemini', `Model (${target.id}) xətası: ${msg}`);
        }
        continue;
      }

      if (!client) continue;

      if (needsSearch && !didAttemptSearch) {
        didAttemptSearch = true;
        try {
          const response = await this.withTimeout(
            client.models.generateContent({
              model: target.id,
              contents: sanitizedGeminiContents,
              config: {
                systemInstruction: targetInstruction,
                temperature: temp,
                tools: [{ googleSearch: {} }]
              }
            }),
            15000,
            `Gemini Search (${target.id})`
          );
          let replyText = response.text?.trim();
          if (replyText) {
            this.clearModelCooldown(target.id);
            const sources = this.extractGroundingSources(response);
            if (sources.length > 0) {
              replyText += `\n\n🌐 <b>Araşdırılan Mənbələr:</b>\n` + sources.map(s => `• <a href="${s.url}">${s.title}</a>`).join('\n');
            }
            storage.addChatMessage(historyKey, 'user', taggedPrompt);
            storage.addChatMessage(historyKey, 'model', replyText);
            return replyText;
          }
        } catch (searchErr: any) {
          storage.addLog('gemini', `Axtarış xətası (${target.id}): ${searchErr?.message || searchErr}`);
        }
      }

      try {
        const response = await this.withTimeout(
          client.models.generateContent({
            model: target.id,
            contents: sanitizedGeminiContents,
            config: {
              systemInstruction: targetInstruction,
              temperature: temp
            }
          }),
          18000,
          `Gemini (${target.id})`
        );
        const replyText = response.text?.trim();
        if (replyText) {
          this.clearModelCooldown(target.id);
          storage.addChatMessage(historyKey, 'user', taggedPrompt);
          storage.addChatMessage(historyKey, 'model', replyText);
          return replyText;
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        this.markModelError(target.id, msg);
        storage.addLog('gemini', `Model (${target.id}) xətası: ${msg}`);
      }
    }

    const fallbackMsg = `💡 <b>AAQ İntellektual Cavab:</b>\n\n"${userText}" üzrə sorğunuz qəbul edildi, lakin hazırda müvəqqəti yüksək sıxlıq müşahidə olunur. Zəhmət olmasa bir neçə saniyə sonra yenidən cəhd edin və ya <code>/model</code> ilə başqa AI modeli seçin.`;
    storage.addChatMessage(historyKey, 'user', taggedPrompt);
    storage.addChatMessage(historyKey, 'model', fallbackMsg);
    return fallbackMsg;
  }

  public async generateChatReplyStream(
    userId: number,
    userText: string,
    onProgress: (currentText: string, isFinal: boolean, usedModel?: ModelDefinition) => Promise<void> | void,
    customPersona?: string,
    overrideModel?: string,
    ctx?: ChatRuntimeContext
  ): Promise<string> {
    const config = storage.getConfig();
    const user = storage.getUser(userId);
    const historyKey = ctx?.historyKey ?? userId;

    const { primary, cascade } = this.resolveModelInfo(overrideModel || user?.selectedModel || config.model);
    const activePersonaId = customPersona || user?.roleplayPersona || config.roleplayMode;
    const persona = this.getPersona(activePersonaId);

    if (this.isIdentityQuestion(userText)) {
      const reply = this.buildIdentityResponse(primary, persona);
      storage.addChatMessage(historyKey, 'user', ctx?.isGroup && ctx.senderName ? `[${ctx.senderName}]: ${userText}` : userText);
      storage.addChatMessage(historyKey, 'model', reply);
      await onProgress(reply, true, primary);
      return reply;
    }

    const client = this.ai || this.initClient();
    const providerStatus = this.getProviderStatus();
    if (!providerStatus.gemini && !providerStatus.openrouter && !providerStatus.groq) {
      const fallback = `⚠️ AI API açarları təyin edilməyib.`;
      await onProgress(fallback, true, primary);
      return fallback;
    }

    const history = storage.getChatHistory(historyKey);
    const taggedPrompt = ctx?.isGroup && ctx.senderName ? `[${ctx.senderName}]: ${userText}` : userText;
    const sanitizedGeminiContents = this.buildSanitizedGeminiContents(history, taggedPrompt, persona);
    const needsSearch = config.fastAiMode === false ? true : this.shouldSearchWeb(userText);
    const temp = config.temperature ?? (persona.id === 'wise_poet' || persona.id === 'cyberpunk' ? 0.7 : 0.45);

    if (needsSearch && client) {
      const firstGemini = cascade.find(m => m.provider === 'gemini' && !this.isModelCoolingDown(m.id))
        || cascade.find(m => m.provider === 'gemini');
      if (firstGemini) {
        try {
          const response = await this.withTimeout(
            client.models.generateContent({
              model: firstGemini.id,
              contents: sanitizedGeminiContents,
              config: {
                systemInstruction: this.buildSystemInstruction(firstGemini, activePersonaId, ctx),
                temperature: temp,
                tools: [{ googleSearch: {} }]
              }
            }),
            14000,
            `Gemini Search (${firstGemini.id})`
          );
          let replyText = response.text?.trim();
          if (replyText) {
            this.clearModelCooldown(firstGemini.id);
            const sources = this.extractGroundingSources(response);
            if (sources.length > 0) {
              replyText += `\n\n🌐 <b>Araşdırılan Mənbələr:</b>\n` + sources.map(s => `• <a href="${s.url}">${s.title}</a>`).join('\n');
            }
            storage.addChatMessage(historyKey, 'user', taggedPrompt);
            storage.addChatMessage(historyKey, 'model', replyText);
            await onProgress(replyText, true, firstGemini);
            return replyText;
          }
        } catch (searchErr: any) {
          const msg = searchErr?.message || String(searchErr);
          this.markModelError(firstGemini.id, msg);
          storage.addLog('gemini', `Axtarış xətası (${firstGemini.id}): ${msg}. Canlı axına keçilir.`);
        }
      }
    }

    for (const target of cascade) {
      if (!this.isProviderConfigured(target.provider)) {
        continue;
      }

      const targetInstruction = this.buildSystemInstruction(target, activePersonaId, ctx);

      if (target.provider === 'openrouter' || target.provider === 'groq') {
        try {
          const openAiMsgs = this.buildOpenAIMessages(targetInstruction, history, taggedPrompt, persona);
          const finalText = await this.streamOpenAICompatible(
            target.provider,
            target.id,
            openAiMsgs,
            temp,
            async (accumulated) => {
              await onProgress(accumulated, false, target);
            }
          );
          if (finalText) {
            this.clearModelCooldown(target.id);
            storage.addChatMessage(historyKey, 'user', taggedPrompt);
            storage.addChatMessage(historyKey, 'model', finalText);
            await onProgress(finalText, true, target);
            return finalText;
          }
        } catch (extStreamErr: any) {
          const msg = extStreamErr?.message || String(extStreamErr);
          this.markModelError(target.id, msg);
          storage.addLog(
            'gemini',
            `Model (${target.id}) canlı axın cəhdi: ${msg}. Kaskad davam edir.`
          );
        }
        continue;
      }

      if (!client) continue;

      try {
        const responseStream = await this.withTimeout(
          client.models.generateContentStream({
            model: target.id,
            contents: sanitizedGeminiContents,
            config: {
              systemInstruction: targetInstruction,
              temperature: temp
            }
          }),
          15000,
          `Gemini Stream Init (${target.id})`
        );

        let accumulatedText = '';
        const streamDeadline = Date.now() + 35000;
        const iterator = responseStream[Symbol.asyncIterator]();

        while (true) {
          const remainingMs = Math.min(15000, Math.max(1000, streamDeadline - Date.now()));
          const nextItem = await this.withTimeout(iterator.next(), remainingMs, `Gemini Stream Chunk (${target.id})`);
          if (nextItem.done) break;
          const chunkText = nextItem.value?.text;
          if (chunkText) {
            accumulatedText += chunkText;
            await onProgress(accumulatedText, false, target);
          }
        }

        const finalText = accumulatedText.trim();
        if (finalText) {
          this.clearModelCooldown(target.id);
          storage.addChatMessage(historyKey, 'user', taggedPrompt);
          storage.addChatMessage(historyKey, 'model', finalText);
          await onProgress(finalText, true, target);
          return finalText;
        }
      } catch (streamErr: any) {
        const msg = streamErr?.message || String(streamErr);
        this.markModelError(target.id, msg);
        storage.addLog(
          'gemini',
          `Model (${target.id}) canlı axın cəhdi: ${msg}. Kaskad davam edir.`
        );
      }
    }

    const fallbackReply = await this.generateChatReply(userId, userText, customPersona, overrideModel, ctx);
    await onProgress(fallbackReply, true, primary);
    return fallbackReply;
  }

  public async quickPrompt(
    prompt: string,
    customSystemInstruction?: string,
    modelOverride?: string
  ): Promise<string> {
    const client = this.ai || this.initClient();
    const providerStatus = this.getProviderStatus();
    if (!providerStatus.gemini && !providerStatus.openrouter && !providerStatus.groq) {
      return 'Məlumat hazırlandı.';
    }

    const { primary, cascade } = this.resolveModelInfo(modelOverride || 'gemini-3.1-flash-lite');
    const now = new Date();
    const azDateStr = now.toLocaleDateString('az-AZ', {
      timeZone: 'Asia/Baku',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const instruction =
      customSystemInstruction ||
      `Sən "AAQ - Ahl Al Qalam" intellektual Azərbaycan köməkçisisən (${primary.alias}). Cari tarix: ${azDateStr}. Cavabları dəqiq, təbii, oxunaqlı və zəngin dildə təqdim et. Robot şablonları işlətmə.`;

    const needsSearch = this.shouldSearchWeb(prompt);

    for (const target of cascade) {
      if (!this.isProviderConfigured(target.provider)) continue;

      if (target.provider === 'openrouter' || target.provider === 'groq') {
        try {
          const txt = await this.callOpenAICompatible(
            target.provider,
            target.id,
            [
              { role: 'system', content: instruction },
              { role: 'user', content: prompt }
            ],
            0.3
          );
          if (txt) {
            this.clearModelCooldown(target.id);
            return txt;
          }
        } catch (err: any) {
          const msg = err?.message || String(err);
          this.markModelError(target.id, msg);
          storage.addLog('gemini', `QuickPrompt (${target.id}) cəhdi: ${msg}`);
        }
        continue;
      }

      if (!client) continue;
      try {
        const response = await this.withTimeout(
          client.models.generateContent({
            model: target.id,
            contents: prompt,
            config: {
              systemInstruction: instruction,
              temperature: 0.3,
              ...(needsSearch ? { tools: [{ googleSearch: {} }] } : {})
            }
          }),
          15000,
          `QuickPrompt (${target.id})`
        );
        const txt = response.text?.trim();
        if (txt) {
          this.clearModelCooldown(target.id);
          return txt;
        }
      } catch (err: any) {
        if (needsSearch) {
          try {
            const resNoTools = await this.withTimeout(
              client.models.generateContent({
                model: target.id,
                contents: prompt,
                config: {
                  systemInstruction: instruction,
                  temperature: 0.3
                }
              }),
              15000,
              `QuickPrompt NoTools (${target.id})`
            );
            const txtNoTools = resNoTools.text?.trim();
            if (txtNoTools) {
              this.clearModelCooldown(target.id);
              return txtNoTools;
            }
          } catch {}
        }
        const msg = err?.message || String(err);
        this.markModelError(target.id, msg);
        storage.addLog('gemini', `QuickPrompt (${target.id}) cəhdi: ${msg}`);
      }
    }

    return 'Məlumat emal edildi.';
  }

  public async analyzeVisionOrPdf(
    buffer: Buffer,
    mimeType: string,
    prompt: string = 'Bu sənədi analiz et, məzmununu xülasə et, əsas bölmələri və vacib qeydləri çıxar.'
  ): Promise<string> {
    const client = this.ai || this.initClient();
    if (!client) throw new Error('GEMINI_API_KEY təyin edilməyib.');

    const base64Data = buffer.toString('base64');
    const isImage = mimeType.startsWith('image/');
    const normalizedMime = isImage
      ? mimeType
      : mimeType && mimeType.includes('pdf')
        ? 'application/pdf'
        : mimeType || 'application/pdf';

    const instruction = isImage
      ? `Sən "AAQ - Ahl Al Qalam" vizual analiz mütəxəssisisən. Şəkildəki mətnləri, düsturları, sualları və ya detalları diqqətlə oxu və aşağıdakı tələbə uyğun Azərbaycan dilində səlis, aydın cavab ver:\nTələb: "${prompt}"`
      : `Sən "AAQ - Ahl Al Qalam" tərəfindən təqdim edilən yüksək ixtisaslı sənəd və PDF analitikisən.
Göstərilən sənədin mətnini, cədvəllərini, fəsillərini və məzmununu dərindən oxu və araşdır.
Tələb: "${prompt}"

Cavabı Azərbaycan dilində aşağıdakı formatda səlis və dolğun hazırla:
📌 **Sənədin Əsas Mövzusu və Xülasəsi**
📑 **Əsas Fəsillər və Vacib Punktlar**
💡 **Mühüm Qeydlər və Nəticə**`;

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-flash-latest']
      .filter(m => !this.isModelCoolingDown(m));
    const finalTryList = modelsToTry.length > 0 ? modelsToTry : ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

    for (const modelName of finalTryList) {
      try {
        const response = await this.withTimeout(
          client.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: normalizedMime,
                      data: base64Data
                    }
                  },
                  {
                    text: instruction
                  }
                ]
              }
            ],
            config: {
              temperature: 0.2
            }
          }),
          25000,
          `Vision/PDF (${modelName})`
        );

        const replyText = response.text?.trim();
        if (replyText) {
          this.clearModelCooldown(modelName);
          storage.addLog('gemini', `${isImage ? 'Şəkil' : 'PDF'} analizi uğurla tamamlandı (${modelName}).`);
          return replyText;
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        this.markModelError(modelName, msg);
        storage.addLog('error', `${isImage ? 'Şəkil' : 'PDF'} model (${modelName}) cəhdi xətası: ${msg}`);
      }
    }

    if (normalizedMime.startsWith('text/') || (!isImage && buffer.length < 500000)) {
      try {
        const textContent = buffer.toString('utf-8').replace(/[^\x20-\x7E\u00A0-\u024F\u0400-\u04FF\u1E00-\u1EFF\n\r\t]/g, ' ').slice(0, 30000);
        if (textContent.trim().length > 30) {
          return await this.quickPrompt(
            `${instruction}\n\nSənəddən oxunan mətn:\n"""${textContent}"""`
          );
        }
      } catch {}
    }

    throw new Error('Fayl modeli tərəfindən oxunub analiz edilə bilmədi. Şəkil/sənədin aydın olduğundan əmin olun.');
  }

  public async transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string = 'audio/ogg'
  ): Promise<string> {
    const client = this.ai || this.initClient();
    if (!client) throw new Error('GEMINI_API_KEY mövcud deyil.');

    const base64Audio = audioBuffer.toString('base64');
    const audioModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-flash-latest']
      .filter(m => !this.isModelCoolingDown(m));
    const finalAudioModels = audioModels.length > 0 ? audioModels : ['gemini-3.1-flash-lite', 'gemini-flash-latest'];

    let lastErr: any = null;
    for (const modelName of finalAudioModels) {
      try {
        const response = await this.withTimeout(
          client.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Audio
                  }
                },
                {
                  text: 'Bu səsli mesajı Azərbaycan dilində tam dəqiq və səlis şəkildə mətnə çevir.'
                }
              ]
            }
          }),
          22000,
          `Audio (${modelName})`
        );

        const text = response.text?.trim() || '';
        if (text) {
          this.clearModelCooldown(modelName);
          return text;
        }
      } catch (err: any) {
        lastErr = err;
        const msg = err?.message || String(err);
        this.markModelError(modelName, msg);
        storage.addLog('error', `Audio transkripsiya (${modelName}) xətası: ${msg}`);
      }
    }

    throw lastErr || new Error('Səsli mesaj mətnə çevrilə bilmədi.');
  }
}

export const geminiService = new GeminiService();
