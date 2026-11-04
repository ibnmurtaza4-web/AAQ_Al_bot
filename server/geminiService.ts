import { GoogleGenAI } from '@google/genai';
import { storage, AVAILABLE_MODELS, OFFICIAL_CHANNEL_URL, ChatMessage } from './storage.js';

export interface PersonaOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
}

export const ROLEPLAY_PERSONAS: PersonaOption[] = [
  {
    id: 'default',
    name: 'AAQ Elm və Maarif Köməkçisi',
    icon: '✨',
    description: 'Səlis, intellektual, nəzakətli və hər sahədə dəqiq cavablar verən köməkçi.',
    prompt: `Sən "AAQ - Ahl Al Qalam" (AAG Əhl-ül Qələm) elmi-maarif birliyinin intellektual köməkçisisən. Rəsmi kanal: ${OFFICIAL_CHANNEL_URL}. İstifadəçinin bütün suallarına aydın, strukturlaşdırılmış, dəqiq və zəngin Azərbaycan dilində cavab ver.`
  },
  {
    id: 'wise_poet',
    name: 'Müdrik Şair & Filosof',
    icon: '📜',
    description: 'Klassik Şərq və dünya fəlsəfəsi, bədii təfəkkür və tarixi hikmət.',
    prompt: `Sən Nizami Gəncəvi, Füzuli, Şəhriyar, Nəsimi, Xətai və dünya filosofları (Sokrat, Platon) kimi danışan müdrik, dərin və bədii söz ustasısan. Cavablarında yalnız təsdiq olunmuş tarixi hikmət və fəlsəfi dərinlik nümayiş etdir. Saxta sitat qətiyyən uydurma.`
  },
  {
    id: 'code_architect',
    name: 'Baş Proqram Mühəndisi & Mentor',
    icon: '💻',
    description: 'Təmiz proqramlaşdırma, arxitektura, alqoritmlər və texniki təhlil.',
    prompt: `Sən 15+ il təcrübəyə malik Baş Proqram Mühəndisisən. Kodları Clean Code, yüksək performans və təhlükəsizlik standartları ilə yazır, addım-addım həll yollarını izah edirsən.`
  },
  {
    id: 'dim_mentor',
    name: 'DİM İmtahan Eksperti & Müəllim',
    icon: '📚',
    description: 'Abituriyent və tələbələr üçün qəbul fənləri, test izahları və ixtisas bələdçisi.',
    prompt: `Sən Dövlət İmtahan Mərkəzi (DİM) proqramı üzrə ixtisaslaşmış təcrübəli repetitor və qəbul məsləhətçisisən. I, II, III, IV, V qrup fənləri, blok və buraxılış imtahanları haqqında aydın məlumat və izahlar verirsən.`
  },
  {
    id: 'cyberpunk',
    name: 'Kiberpunk / 2077 AI',
    icon: '⚡',
    description: 'Futuristik, texnoloji, hazırcavab və dinamik kiber-şüur.',
    prompt: `Sən 2077-ci ilin futuristik Neo-Bakı şəbəkəsində fəaliyyət göstərən yüksək səviyyəli Kiberpunk Süni İntellektisən. Texnoloji terminlər, kiber-analitika və dinamik hazırcavablıqla danışırsan.`
  },
  {
    id: 'friendly_companion',
    name: 'Səmimi Həmsöhbət & Dost',
    icon: '☕',
    description: 'İstiqanlı, motivasiya verən və maraqlı söhbətlər edən yaxın sirdaş.',
    prompt: `Sən istifadəçinin ən yaxın, qayğıkeş, pozitiv və səmimi dostusan. Həyat, motivasiya və gündəlik mövzularda maraqlı söhbətlər edir, emosional dəstək verirsən.`
  },
  {
    id: 'language_tutor',
    name: 'Xarici Dil Müəllimi',
    icon: '🌍',
    description: 'İngilis, rus və digər xarici dilləri öyrədən interaktiv repetitor.',
    prompt: `Sən peşəkar Xarici Dil Müəllimisən. İstifadəçinin qrammatika və lüğət bazasını zənginləşdirir, cümlələri səlis tərcümə edir və danışıq məşqi edirsən.`
  }
];

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string = '';

  constructor() {
    this.initClient();
  }

  public initClient(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY || '';
    if (key) {
      this.apiKey = key;
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
    return !!process.env.GEMINI_API_KEY;
  }

  public resolveModelIdentifier(requestedModel?: string): { sdkModel: string; displayName: string; fallbackCascade: string[] } {
    const config = storage.getConfig();
    const modelKey = (requestedModel || config.model || 'gemini-3.8-flash').trim();

    const matched = AVAILABLE_MODELS.find(
      m => m.id === modelKey || m.alias.toLowerCase() === modelKey.toLowerCase()
    );
    const displayName = matched ? matched.name : modelKey;

    let sdkModel = 'gemini-3.8-flash';
    if (modelKey === 'gemini-3.8-flash') {
      sdkModel = 'gemini-3.8-flash';
    } else if (modelKey === 'gemini-3.7-flash') {
      sdkModel = 'gemini-3.7-flash';
    } else if (modelKey === 'gemini-3.1-flash-lite') {
      sdkModel = 'gemini-3.1-flash-lite';
    } else if (modelKey === 'gemini-flash-latest') {
      sdkModel = 'gemini-flash-latest';
    } else if (modelKey === 'gemini-2.5-flash') {
      sdkModel = 'gemini-2.5-flash';
    } else {
      sdkModel = 'gemini-3.8-flash';
    }

    // Cascade sequence of modern Flash models for highest uptime and accuracy
    const fallbackCascade = [sdkModel, 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'].filter(
      (m, idx, arr) => arr.indexOf(m) === idx
    );

    return { sdkModel, displayName, fallbackCascade };
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
      clean.includes('modelin nədir') ||
      clean.includes('haqqinda melumat') ||
      clean.includes('haqqında məlumat')
    );
  }

  private buildSystemInstruction(
    displayName: string,
    activePersonaId?: string
  ): string {
    const config = storage.getConfig();
    const persona = ROLEPLAY_PERSONAS.find(p => p.id === activePersonaId) || ROLEPLAY_PERSONAS[0];

    // Real-time dynamic temporal reference in Baku / Azerbaijan local time
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

    const botCapabilities = `
Sən "AAQ - Ahl Al Qalam" (AAG Əhl-ül Qələm) elmi-maarif birliyi tərəfindən idarə olunan rəsmi intellektual köməkçisisən. Rəsmi kanal: ${OFFICIAL_CHANNEL_URL}.
HAZIRDA AKTİV MODELİN: "${displayName}".

📅 DƏQİQ CANLI TARİX VƏ ZAMAN BİLGİSİ:
• Hazırkı cari tarix: ${azDateStr} (${isoDate})
• Hazırkı il: ${currentYear}-ci il
• Cari zaman zonası: Bakı vaxtı (UTC+4)
• Vacib Qayda: Sən keçmişdə (2024 və ya əvvəlki illərdə) qalmırsan! Cari il və günümüz haqqında, ayın tarixi, il və müasir hadisələr soruşulduqda yuxarıdakı DƏQİQ cari tarixdən istifadə edirsən. Həmçinin ən son hadisələr, xəbərlər və məlumatlar üçün daxili Google Search imkanlarından istifadə edərək daima ən yeni və aktual məlumatları çatdırırsan.

Botun Bütün Funksiyaları və Əmrləri:
• /sorus <sual> — Sual-cavab və elmi müzakirələr
• /sozluk <söz> — İzahlı Azərbaycan lüğəti, sözün mənası və etimologiyası
• /hesabla <misal> — Dəqiq riyazi və elmi hesablamalar
• /hava <şəhər> — Canlı hava göstəriciləri və proqnoz
• /sitat — Nizami, Füzuli, Şəhriyar, Nəsimi, Xətai, Sokrat kəlamları
• /tarix — Tarixdə bu gün baş vermiş mühüm hadisələr
• /dim — DİM qəbul imtahanı qrupları və bələdçi
• /pdf — PDF sənədinin oxunması və analizi (yalnız şəxsi çatda)
• /quiz — Maarifləndirici intellektual viktorina
• /tercume <mətn> — Səlis xarici dil tərcüməsi
• /xulas <mətn> — Uzun mətnlərin qısa xülasəsi
• /elaqe — AAQ Rəhbərliyinə birbaşa müraciət
• /model — Gemini AI modelini dəyişmək
• /roleplay — AI xarakterini dəyişmək
• /sozlesme — Rəsmi gizlilik və istifadə qaydaları

Əsas Qaydalar və Natiqlik Üslubu:
1. NİTQ TƏRZİ: Sən klassik elmi, rəsmi və akademik tonda danışan, dahi Azərbaycan alimi, maarifçisi və intellektual araşdırmaçısan.
2. QƏTİYYƏN SÜNİ ROBOT ŞABLONLARINDAN İSTİFADƏ ETMƏ! "Bir süni intellekt olaraq...", "Bir dil modeli kimi...", "Mənim hisslərim yoxdur", "Əlbəttə, kömək edə bilərəm!", "Mənə istənilən sualı verə bilərsiniz" kimi süni və şablon ifadələr qəti qadağandır.
3. Danışığın canlı, savadlı, sanballı və zəngin ədəbi Azərbaycan dilində olmalıdır. İzahlarında məntiqi tezis, elmi arqumentasiya, faktik dəqiqlik və analitik nəticə nümayiş etdir.
4. Əgər istifadəçi səndən "hansı model olduğunu" və ya "kim olduğunu" soruşsa, dəqiq olaraq bildir ki, sən Google Gemini AI-nin "${displayName}" mühərriki ilə çalışan "AAQ - Ahl Al Qalam" elmi köməkçisisən.
5. Saxta sitat uydurma. Yalnız real tarixi şəxsiyyətlərin sözlərini təqdim et.
6. Rəhbərlik adlarını şəxsi olaraq açıqlama, yalnız "AAQ Rəhbərliyi" adlandır.
7. Cavabları aydın abzaslarla, oxunaqlı və səliqəli şəkildə təqdim et.
`;

    let instruction = `${botCapabilities}\n\n${config.systemPrompt}\n\nQaydalar və Gizlilik:\n${config.policyText}`;
    if (persona && persona.id !== 'default') {
      instruction = `${botCapabilities}\n\nXüsusi Rol (${persona.name}):\n${persona.prompt}\n\n${config.systemPrompt}\n\nQaydalar və Gizlilik:\n${config.policyText}`;
    }

    return instruction;
  }

  private buildSanitizedContents(history: ChatMessage[], userText: string): any[] {
    const contents: any[] = [];
    let lastRole = '';

    for (const h of history.slice(-6)) {
      if (!h.text || !h.text.trim()) continue;
      const role = h.role === 'model' ? 'model' : 'user';

      // Must start with user
      if (contents.length === 0 && role !== 'user') {
        continue;
      }

      // Must alternate strictly
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

    // Add current turn
    if (lastRole === 'user' && contents.length > 0) {
      contents[contents.length - 1].parts[0].text += `\n${userText}`;
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: userText }]
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

  public async generateChatReply(
    userId: number,
    userText: string,
    customPersona?: string,
    overrideModel?: string
  ): Promise<string> {
    const config = storage.getConfig();
    const user = storage.getUser(userId);

    const modelInfo = this.resolveModelIdentifier(overrideModel || user?.selectedModel || config.model);
    const activePersonaId = customPersona || user?.roleplayPersona || config.roleplayMode;
    const systemInstruction = this.buildSystemInstruction(modelInfo.displayName, activePersonaId);

    // Fast-path for identity/model inquiries (<10ms)
    if (this.isIdentityQuestion(userText)) {
      const reply = `🤖 Salam! Siz hazırda <b>AAQ - Ahl Al Qalam</b> elmi-maarif birliyi üçün təyin edilmiş <b>${modelInfo.displayName}</b> süni intellekt modeli ilə danışırsınız.\n\n📢 <b>Rəsmi Kanal:</b> ${OFFICIAL_CHANNEL_URL}\n⚙️ Modeli dəyişmək üçün: <code>/model</code>\n🎭 Xarakteri dəyişmək üçün: <code>/roleplay</code>\n❓ Bütün əmrlər üçün: <code>/help</code>`;
      storage.addChatMessage(userId, 'user', userText);
      storage.addChatMessage(userId, 'model', reply);
      return reply;
    }

    if (!this.ai) {
      this.initClient();
    }

    const client = this.ai;
    if (!client) {
      return `🤖 <b>AAQ AI Köməkçisi:</b> Sualınız qəbul edildi. Sistem aktivdir.\nModel: ${modelInfo.displayName}`;
    }

    const history = storage.getChatHistory(userId);
    const sanitizedContents = this.buildSanitizedContents(history, userText);
    const needsSearch = config.fastAiMode === false ? true : this.shouldSearchWeb(userText);

    // Use cascade so that if one model experiences 503 spike or 429 quota, others answer immediately
    const candidateModels = modelInfo.fallbackCascade.filter(
      (m, idx, arr) => arr.indexOf(m) === idx
    );

    let didAttemptSearch = false;
    for (const targetModel of candidateModels) {
      // 1. If real-time info is asked, try search grounding on the primary model
      if (needsSearch && !didAttemptSearch) {
        didAttemptSearch = true;
        try {
          const response = await client.models.generateContent({
            model: targetModel,
            contents: sanitizedContents,
            config: {
              systemInstruction,
              temperature: config.temperature ?? 0.5,
              tools: [{ googleSearch: {} }]
            }
          });

          let replyText = response.text?.trim();
          if (replyText) {
            const sources = this.extractGroundingSources(response);
            if (sources.length > 0) {
              replyText += `\n\n🌐 <b>Araşdırılan Mənbələr və Keçidlər:</b>\n` + sources.map(s => `• <a href="${s.url}">${s.title}</a>`).join('\n');
            }
            storage.addChatMessage(userId, 'user', userText);
            storage.addChatMessage(userId, 'model', replyText);
            return replyText;
          }
        } catch (searchErr: any) {
          storage.addLog('gemini', `Axtarışlı cavab xətası (${targetModel}): ${searchErr?.message || searchErr}. Birbaşa generasiyaya keçilir.`);
        }
      }

      // 2. Direct fast generation (sub-second reaction)
      try {
        const response = await client.models.generateContent({
          model: targetModel,
          contents: sanitizedContents,
          config: {
            systemInstruction,
            temperature: config.temperature ?? 0.5
          }
        });

        const replyText = response.text?.trim();
        if (replyText) {
          storage.addChatMessage(userId, 'user', userText);
          storage.addChatMessage(userId, 'model', replyText);
          return replyText;
        }
      } catch (directErr: any) {
        storage.addLog(
          'gemini',
          `Model (${targetModel}) direct cəhdi: ${directErr?.message || directErr}`
        );
      }

      // 3. Fallback: single-turn prompt on the same model if history format failed
      try {
        const response = await client.models.generateContent({
          model: targetModel,
          contents: userText,
          config: {
            systemInstruction,
            temperature: config.temperature ?? 0.5
          }
        });

        const replyText = response.text?.trim();
        if (replyText) {
          storage.addChatMessage(userId, 'user', userText);
          storage.addChatMessage(userId, 'model', replyText);
          return replyText;
        }
      } catch {}
    }

    // Phase 3: Intelligent AAQ Assistant Fallback
    const localAnswer = `💡 <b>AAQ İntellektual Cavab:</b>\n\n"${userText}" mövzusu üzrə sualınız qəbul edildi. Daha dolğun cavab üçün sualı fərqli cümlə ilə yenidən göndərə və ya <code>/model</code> əmri ilə modeli dəyişə bilərsiniz.\n\n🏛️ <i>AAQ - Ahl Al Qalam (Model: ${modelInfo.displayName})</i>`;
    storage.addChatMessage(userId, 'user', userText);
    storage.addChatMessage(userId, 'model', localAnswer);
    return localAnswer;
  }

  public async generateChatReplyStream(
    userId: number,
    userText: string,
    onProgress: (currentText: string, isFinal: boolean) => Promise<void> | void,
    customPersona?: string,
    overrideModel?: string
  ): Promise<string> {
    const config = storage.getConfig();
    const user = storage.getUser(userId);

    const modelInfo = this.resolveModelIdentifier(overrideModel || user?.selectedModel || config.model);
    const activePersonaId = customPersona || user?.roleplayPersona || config.roleplayMode;
    const systemInstruction = this.buildSystemInstruction(modelInfo.displayName, activePersonaId);

    // Fast-path for identity/model inquiries (<10ms)
    if (this.isIdentityQuestion(userText)) {
      const reply = `🏛️ <b>AAQ - Ahl Al Qalam Elmi Mərkəzi</b>\n\nSiz hazırda <b>AAQ</b> elmi-maarif birliyinin intellektual araşdırma köməkçisi (Aktiv mühərrik: <b>${modelInfo.displayName}</b>) ilə elmi dialoqdasınız.\n\n📢 <b>Rəsmi Kanal:</b> ${OFFICIAL_CHANNEL_URL}\n⚙️ Modeli dəyişmək üçün: <code>/model</code>\n🎭 Xarakteri tənzimləmək üçün: <code>/roleplay</code>\n❓ Bütün əmrlər: <code>/help</code>`;
      storage.addChatMessage(userId, 'user', userText);
      storage.addChatMessage(userId, 'model', reply);
      await onProgress(reply, true);
      return reply;
    }

    if (!this.ai) {
      this.initClient();
    }

    const client = this.ai;
    if (!client) {
      const fallback = `🏛️ <b>AAQ Elmi Köməkçisi:</b> Sualınız qəbul edildi. Sistem aktivdir.\nModel: ${modelInfo.displayName}`;
      await onProgress(fallback, true);
      return fallback;
    }

    const history = storage.getChatHistory(userId);
    const sanitizedContents = this.buildSanitizedContents(history, userText);
    const needsSearch = config.fastAiMode === false ? true : this.shouldSearchWeb(userText);

    const candidateModels = modelInfo.fallbackCascade.filter(
      (m, idx, arr) => arr.indexOf(m) === idx
    );

    // 1. If live search grounding is requested, run search first
    if (needsSearch) {
      try {
        const response = await client.models.generateContent({
          model: candidateModels[0] || 'gemini-3.8-flash',
          contents: sanitizedContents,
          config: {
            systemInstruction,
            temperature: config.temperature ?? 0.4,
            tools: [{ googleSearch: {} }]
          }
        });

        let replyText = response.text?.trim();
        if (replyText) {
          const sources = this.extractGroundingSources(response);
          if (sources.length > 0) {
            replyText += `\n\n🌐 <b>Araşdırılan Mənbələr və Keçidlər:</b>\n` + sources.map(s => `• <a href="${s.url}">${s.title}</a>`).join('\n');
          }
          storage.addChatMessage(userId, 'user', userText);
          storage.addChatMessage(userId, 'model', replyText);
          await onProgress(replyText, true);
          return replyText;
        }
      } catch (searchErr: any) {
        storage.addLog('gemini', `Axtarış xətası (${candidateModels[0]}): ${searchErr?.message || searchErr}. Canlı yazı axınına keçilir.`);
      }
    }

    // 2. Real-time streaming generation
    for (const targetModel of candidateModels) {
      try {
        const responseStream = await client.models.generateContentStream({
          model: targetModel,
          contents: sanitizedContents,
          config: {
            systemInstruction,
            temperature: config.temperature ?? 0.4
          }
        });

        let accumulatedText = '';
        for await (const chunk of responseStream) {
          const chunkText = chunk.text;
          if (chunkText) {
            accumulatedText += chunkText;
            await onProgress(accumulatedText, false);
          }
        }

        const finalText = accumulatedText.trim();
        if (finalText) {
          storage.addChatMessage(userId, 'user', userText);
          storage.addChatMessage(userId, 'model', finalText);
          await onProgress(finalText, true);
          return finalText;
        }
      } catch (streamErr: any) {
        storage.addLog(
          'gemini',
          `Model (${targetModel}) canlı axın cəhdi xətası: ${streamErr?.message || streamErr}. Kaskad davam edir.`
        );
      }
    }

    // 3. Fallback to standard generateChatReply if stream encountered issues
    const fallbackReply = await this.generateChatReply(userId, userText, customPersona, overrideModel);
    await onProgress(fallbackReply, true);
    return fallbackReply;
  }

  public async quickPrompt(
    prompt: string,
    customSystemInstruction?: string,
    modelOverride?: string
  ): Promise<string> {
    if (!this.ai) {
      this.initClient();
    }

    const client = this.ai;
    if (!client) {
      return 'Məlumat hazırlandı.';
    }

    const now = new Date();
    const azDateStr = now.toLocaleDateString('az-AZ', {
      timeZone: 'Asia/Baku',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const { displayName, sdkModel, fallbackCascade } = this.resolveModelIdentifier(modelOverride || 'gemini-3.8-flash');
    const instruction =
      customSystemInstruction ||
      `Sən "AAQ - Ahl Al Qalam" intellektual Azərbaycan köməkçisisən (${displayName}). Cari tarix: ${azDateStr}. Cavabları dəqiq, oxunaqlı, aktual və zəngin dildə təqdim et.`;

    const needsSearch = this.shouldSearchWeb(prompt);
    const candidateModels = [sdkModel, fallbackCascade[1] || 'gemini-3.7-flash'];

    for (const modelToTry of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: modelToTry,
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
              model: modelToTry,
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
        storage.addLog('gemini', `QuickPrompt (${modelToTry}) cəhdi: ${err?.message || err}`);
      }
    }

    return 'Məlumat emal edildi.';
  }

  public async analyzeVisionOrPdf(
    buffer: Buffer,
    mimeType: string,
    prompt: string = 'Bu sənədi analiz et, məzmununu xülasə et, əsas bölmələri və vacib qeydləri çıxar.'
  ): Promise<string> {
    if (!this.ai) {
      this.initClient();
      if (!this.ai) throw new Error('GEMINI_API_KEY təyin edilməyib.');
    }

    const client = this.ai;
    const base64Data = buffer.toString('base64');
    const normalizedMime = mimeType && mimeType.includes('pdf') ? 'application/pdf' : (mimeType || 'application/pdf');

    const instruction = `Sən "AAQ - Ahl Al Qalam" tərəfindən təqdim edilən yüksək ixtisaslı sənəd və PDF analitikisən. 
Göstərilən sənədin mətnini, cədvəllərini, fəsillərini və məzmununu dərindən oxu və araşdır.
Tələb: "${prompt}"

Cavabı Azərbaycan dilində aşağıdakı formatda səlis və dolğun hazırla:
📌 **Sənədin Əsas Mövzusu və Xülasəsi**
📑 **Əsas Fəsillər və Vacib Punktlar**
💡 **Mühüm Qeydlər və Nəticə**`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];

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

    // Secondary fallback: Extract text from buffer if raw text and prompt
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
    if (!this.ai) {
      this.initClient();
      if (!this.ai) throw new Error('GEMINI_API_KEY mövcud deyil.');
    }

    try {
      const base64Audio = audioBuffer.toString('base64');
      const response = await this.ai.models.generateContent({
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
