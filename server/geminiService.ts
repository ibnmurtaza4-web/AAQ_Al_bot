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

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    this.initClient();
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

  public getPersona(personaId?: string): PersonaOption {
    return ROLEPLAY_PERSONAS.find(p => p.id === personaId) || ROLEPLAY_PERSONAS[0];
  }

  public resolveModelInfo(requestedModel?: string): {
    primary: ModelDefinition;
    cascade: ModelDefinition[];
  } {
    const config = storage.getConfig();
    const modelKey = (requestedModel || config.model || 'gemini-3.8-flash').trim();

    const matched =
      AVAILABLE_MODELS.find(
        m => m.id === modelKey || m.alias.toLowerCase() === modelKey.toLowerCase()
      ) || AVAILABLE_MODELS[0];

    const preferredOrderIds = [
      matched.id,
      'gemini-2.5-flash',
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest'
    ];

    const uniqueIds = preferredOrderIds.filter((id, idx, arr) => arr.indexOf(id) === idx);
    const cascade: ModelDefinition[] = uniqueIds
      .map(id => AVAILABLE_MODELS.find(m => m.id === id))
      .filter((m): m is ModelDefinition => Boolean(m));

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
    activePersonaId?: string
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

    const temporalAndOrgContext = `
TƏŞKİLAT VƏ MÜHƏRRİK BİLGİSİ:
• Platforma: "AAQ - Ahl Al Qalam" (AAG Əhl-ül Qələm) — ${OFFICIAL_CHANNEL_URL}
• Aktiv AI Mühərriki: "${modelDef.alias}" (${modelDef.id})
• Dəqiq Canlı Tarix (Bakı UTC+4): ${azDateStr} (${isoDate}), ${currentYear}-ci il. Sən keçmişdə qalmırsan, cari ili və günü dəqiq bilirsən.

MÜTLƏQ ANTİ-ROBOT QADAĞALARI:
1. "Bir süni intellekt olaraq...", "Bir dil modeli kimi...", "Mənim hisslərim yoxdur", "Əlbəttə, sizə kömək edə bilərəm!" kimi süni robot ifadələri QƏTİ QADAĞANDIR!
2. Həqiqi insan danışıq tərzində, səlis və təbii Azərbaycan dilində danış.
3. Saxta sitat uydurma; admin/rəhbər adlarını şəxsi açıqlama (yalnız "AAQ Rəhbərliyi" de).
4. Bot əmrləri: /sorus, /sozluk, /hesabla, /hava, /sitat, /tarix, /dim, /pdf, /quiz, /tercume, /xulas, /elaqe, /model, /roleplay, /clear.
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
    overrideModel?: string
  ): Promise<string> {
    const config = storage.getConfig();
    const user = storage.getUser(userId);

    const { primary, cascade } = this.resolveModelInfo(overrideModel || user?.selectedModel || config.model);
    const activePersonaId = customPersona || user?.roleplayPersona || config.roleplayMode;
    const persona = this.getPersona(activePersonaId);
    const systemInstruction = this.buildSystemInstruction(primary, activePersonaId);

    if (this.isIdentityQuestion(userText)) {
      const reply = this.buildIdentityResponse(primary, persona);
      storage.addChatMessage(userId, 'user', userText);
      storage.addChatMessage(userId, 'model', reply);
      return reply;
    }

    const client = this.ai || this.initClient();
    if (!client) {
      return `⚠️ <code>GEMINI_API_KEY</code> təyin edilməyib.`;
    }

    const history = storage.getChatHistory(userId);
    const sanitizedGeminiContents = this.buildSanitizedGeminiContents(history, userText, persona);
    const needsSearch = config.fastAiMode === false ? true : this.shouldSearchWeb(userText);
    const temp = config.temperature ?? (persona.id === 'wise_poet' || persona.id === 'cyberpunk' ? 0.7 : 0.45);

    let didAttemptSearch = false;

    for (const target of cascade) {
      const targetInstruction = this.buildSystemInstruction(target, activePersonaId);

      if (needsSearch && !didAttemptSearch) {
        didAttemptSearch = true;
        try {
          const response = await client.models.generateContent({
            model: target.id,
            contents: sanitizedGeminiContents,
            config: {
              systemInstruction: targetInstruction,
              temperature: temp,
              tools: [{ googleSearch: {} }]
            }
          });
          let replyText = response.text?.trim();
          if (replyText) {
            const sources = this.extractGroundingSources(response);
            if (sources.length > 0) {
              replyText += `\n\n🌐 <b>Araşdırılan Mənbələr:</b>\n` + sources.map(s => `• <a href="${s.url}">${s.title}</a>`).join('\n');
            }
            storage.addChatMessage(userId, 'user', userText);
            storage.addChatMessage(userId, 'model', replyText);
            return replyText;
          }
        } catch (searchErr: any) {
          storage.addLog('gemini', `Axtarış xətası (${target.id}): ${searchErr?.message || searchErr}`);
        }
      }

      try {
        const response = await client.models.generateContent({
          model: target.id,
          contents: sanitizedGeminiContents,
          config: {
            systemInstruction: targetInstruction,
            temperature: temp
          }
        });
        const replyText = response.text?.trim();
        if (replyText) {
          storage.addChatMessage(userId, 'user', userText);
          storage.addChatMessage(userId, 'model', replyText);
          return replyText;
        }
      } catch (err: any) {
        storage.addLog('gemini', `Model (${target.id}) xətası: ${err?.message || err}`);
      }
    }

    const fallbackMsg = `💡 <b>AAQ İntellektual Cavab:</b>\n\n"${userText}" üzrə sorğunuz qəbul edildi, lakin hazırda müvəqqəti yüksək sıxlıq müşahidə olunur. Zəhmət olmasa bir neçə saniyə sonra yenidən cəhd edin və ya <code>/model</code> ilə başqa Gemini modeli seçin.`;
    storage.addChatMessage(userId, 'user', userText);
    storage.addChatMessage(userId, 'model', fallbackMsg);
    return fallbackMsg;
  }

  public async generateChatReplyStream(
    userId: number,
    userText: string,
    onProgress: (currentText: string, isFinal: boolean, usedModel?: ModelDefinition) => Promise<void> | void,
    customPersona?: string,
    overrideModel?: string
  ): Promise<string> {
    const config = storage.getConfig();
    const user = storage.getUser(userId);

    const { primary, cascade } = this.resolveModelInfo(overrideModel || user?.selectedModel || config.model);
    const activePersonaId = customPersona || user?.roleplayPersona || config.roleplayMode;
    const persona = this.getPersona(activePersonaId);

    if (this.isIdentityQuestion(userText)) {
      const reply = this.buildIdentityResponse(primary, persona);
      storage.addChatMessage(userId, 'user', userText);
      storage.addChatMessage(userId, 'model', reply);
      await onProgress(reply, true, primary);
      return reply;
    }

    const client = this.ai || this.initClient();
    if (!client) {
      const fallback = `⚠️ <code>GEMINI_API_KEY</code> təyin edilməyib.`;
      await onProgress(fallback, true, primary);
      return fallback;
    }

    const history = storage.getChatHistory(userId);
    const sanitizedGeminiContents = this.buildSanitizedGeminiContents(history, userText, persona);
    const needsSearch = config.fastAiMode === false ? true : this.shouldSearchWeb(userText);
    const temp = config.temperature ?? (persona.id === 'wise_poet' || persona.id === 'cyberpunk' ? 0.7 : 0.45);

    if (needsSearch) {
      const firstGemini = cascade[0];
      if (firstGemini) {
        try {
          const response = await client.models.generateContent({
            model: firstGemini.id,
            contents: sanitizedGeminiContents,
            config: {
              systemInstruction: this.buildSystemInstruction(firstGemini, activePersonaId),
              temperature: temp,
              tools: [{ googleSearch: {} }]
            }
          });
          let replyText = response.text?.trim();
          if (replyText) {
            const sources = this.extractGroundingSources(response);
            if (sources.length > 0) {
              replyText += `\n\n🌐 <b>Araşdırılan Mənbələr:</b>\n` + sources.map(s => `• <a href="${s.url}">${s.title}</a>`).join('\n');
            }
            storage.addChatMessage(userId, 'user', userText);
            storage.addChatMessage(userId, 'model', replyText);
            await onProgress(replyText, true, firstGemini);
            return replyText;
          }
        } catch (searchErr: any) {
          storage.addLog('gemini', `Axtarış xətası (${firstGemini.id}): ${searchErr?.message || searchErr}. Canlı axına keçilir.`);
        }
      }
    }

    for (const target of cascade) {
      const targetInstruction = this.buildSystemInstruction(target, activePersonaId);
      try {
        const responseStream = await client.models.generateContentStream({
          model: target.id,
          contents: sanitizedGeminiContents,
          config: {
            systemInstruction: targetInstruction,
            temperature: temp
          }
        });

        let accumulatedText = '';
        for await (const chunk of responseStream) {
          const chunkText = chunk.text;
          if (chunkText) {
            accumulatedText += chunkText;
            await onProgress(accumulatedText, false, target);
          }
        }

        const finalText = accumulatedText.trim();
        if (finalText) {
          storage.addChatMessage(userId, 'user', userText);
          storage.addChatMessage(userId, 'model', finalText);
          await onProgress(finalText, true, target);
          return finalText;
        }
      } catch (streamErr: any) {
        storage.addLog(
          'gemini',
          `Model (${target.id}) canlı axın cəhdi: ${streamErr?.message || streamErr}. Kaskad davam edir.`
        );
      }
    }

    const fallbackReply = await this.generateChatReply(userId, userText, customPersona, overrideModel);
    await onProgress(fallbackReply, true, primary);
    return fallbackReply;
  }

  public async quickPrompt(
    prompt: string,
    customSystemInstruction?: string,
    modelOverride?: string
  ): Promise<string> {
    const client = this.ai || this.initClient();
    if (!client) {
      return 'Məlumat hazırlandı.';
    }

    const { primary, cascade } = this.resolveModelInfo(modelOverride || 'gemini-2.5-flash');
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
      try {
        const response = await client.models.generateContent({
          model: target.id,
          contents: prompt,
          config: {
            systemInstruction: instruction,
            temperature: 0.3,
            ...(needsSearch ? { tools: [{ googleSearch: {} }] } : {})
          }
        });
        const txt = response.text?.trim();
        if (txt) return txt;
      } catch (err: any) {
        if (needsSearch) {
          try {
            const resNoTools = await client.models.generateContent({
              model: target.id,
              contents: prompt,
              config: {
                systemInstruction: instruction,
                temperature: 0.3
              }
            });
            const txtNoTools = resNoTools.text?.trim();
            if (txtNoTools) return txtNoTools;
          } catch {}
        }
        storage.addLog('gemini', `QuickPrompt (${target.id}) cəhdi: ${err?.message || err}`);
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
    const normalizedMime = mimeType && mimeType.includes('pdf') ? 'application/pdf' : (mimeType || 'application/pdf');

    const instruction = `Sən "AAQ - Ahl Al Qalam" tərəfindən təqdim edilən yüksək ixtisaslı sənəd və PDF analitikisən. 
Göstərilən sənədin mətnini, cədvəllərini, fəsillərini və məzmununu dərindən oxu və araşdır.
Tələb: "${prompt}"

Cavabı Azərbaycan dilində aşağıdakı formatda səlis və dolğun hazırla:
📌 **Sənədin Əsas Mövzusu və Xülasəsi**
📑 **Əsas Fəsillər və Vacib Punktlar**
💡 **Mühüm Qeydlər və Nəticə**`;

    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    for (const modelName of modelsToTry) {
      try {
        const response = await client.models.generateContent({
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
        });

        const replyText = response.text?.trim();
        if (replyText) {
          storage.addLog('gemini', `PDF analizi uğurla tamamlandı (${modelName}).`);
          return replyText;
        }
      } catch (err: any) {
        storage.addLog('error', `PDF model (${modelName}) cəhdi xətası: ${err?.message || err}`);
      }
    }

    if (normalizedMime.startsWith('text/') || buffer.length < 500000) {
      try {
        const textContent = buffer.toString('utf-8').replace(/[^\x20-\x7E\u00A0-\u024F\u0400-\u04FF\u1E00-\u1EFF\n\r\t]/g, ' ').slice(0, 30000);
        if (textContent.trim().length > 30) {
          return await this.quickPrompt(
            `${instruction}\n\nSənəddən oxunan mətn:\n"""${textContent}"""`
          );
        }
      } catch {}
    }

    throw new Error('Sənəd modeli tərəfindən oxunub analiz edilə bilmədi. Faylın şifrəsiz və oxunaqlı olduğundan əmin olun.');
  }

  public async transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string = 'audio/ogg'
  ): Promise<string> {
    const client = this.ai || this.initClient();
    if (!client) throw new Error('GEMINI_API_KEY mövcud deyil.');

    try {
      const base64Audio = audioBuffer.toString('base64');
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
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
      });

      return response.text?.trim() || '';
    } catch (err: any) {
      storage.addLog('error', `Audio transkripsiya xətası: ${err?.message || err}`);
      throw err;
    }
  }
}

export const geminiService = new GeminiService();
