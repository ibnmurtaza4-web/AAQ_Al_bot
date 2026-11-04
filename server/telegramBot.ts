import { 
  storage, 
  TelegramUser, 
  TelegramGroup, 
  DEFAULT_POLICY, 
  AVAILABLE_MODELS, 
  REAL_HISTORICAL_QUOTES, 
  OFFICIAL_CHANNEL_URL 
} from './storage.js';
import { geminiService, ROLEPLAY_PERSONAS } from './geminiService.js';
import { keepAliveService } from './keepAlive.js';
import { solveMathExpression } from './mathEngine.js';
import { lookupWord } from './dictionaryData.js';
import { getTodayHistoricalEvents } from './historicalData.js';

// Profanity list for moderation
export const PROFANITY_LIST = [
  'siktir', 'sikmək', 'sikdir', 'sikerim',
  'götvərən', 'orospu', 'peysər',
  'qəhbə', 'qancıq', 'amcıq', 'dəyyus',
  'fahişə', 'dalyaraq',
  'daşşaq', 'ananısikim', 'ananısik',
  'götünü', 'siktimin',
  'piç', 'əclaf', 'lotu',
  'fuck', 'fucking', 'fucker', 'shit', 'bitch',
  'asshole', 'dick',
  'pussy', 'whore', 'bastard',
  'motherfucker', 'cunt'
];

export const PROFANITY_REGEX = new RegExp(
  '\\b(' + PROFANITY_LIST.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'i'
);

export const URL_REGEX = /https?:\/\/[^\s]+|t\.me\/[^\s]+/i;

export const FACTS = [
  'Ahtapotların 3 ürəyi var və qanları mavi rəngdədir.',
  'Bal arıları rəqs edərək bir-birinə çiçəklərin və nektarın yerini göstərir.',
  'İnsan bədənində 206 sümük var və bunların dörddə biri ayaqlardadır.',
  'Dünyada ən uzun çay Nil çayıdır — 6,650 km.',
  'İşıq Günəşdən Yerə 8 dəqiqə 20 saniyəyə çatır.',
  'Delfinlər yuxuda bir gözlərini və beyinlərinin bir yarımkürəsini açıq saxlayır.',
  'Bananlar təbii radioaktivdir — kiçik miqdarda kalium-40 izotopu ehtiva edir.',
  'İnsan beyni gündə təxminən 70.000 düşüncə istehsal edir.',
  'Koala gündə 22 saat ağacların budaqlarında yatır.',
  'Venera planetində bir gün (öz oxu ətrafında dövr) bir ildən uzundur.',
  'Təbii bal heç vaxt xarab olmur. Misir ehramlarında tapılan 3000 illik bal hələ də yeməlidir.',
  'İnsan göz bəbəyi qaranlıqda 45% böyüyür.',
  'Barmaq izləri kimi hər bir insanın dil izi də unikaldır.',
  'Ayın səthində astronavtlar tərəfindən sancılmış 6 ABŞ bayrağı var.',
  'Bir ildırımın temperaturu Günəş səthindən 5 dəfə daha isti ola bilər (30.000 °C).',
  'Flamingolar doğulanda ağ olur, qırmızı və çəhrayı rəngi isə yediyi xərçəngkimilərdən alır.',
  'Dünya okeanlarının hələlik yalnız 5%-i insanlar tərəfindən kəşf edilib.',
  'İnsan ürəyi gündə təxminən 100.000 dəfə döyünür.',
  'Çin Səddinin aydan və kosmosdan çılpaq gözlə görünməsi elmi mifdir.',
  'Kəpənəklər qidaların dadını ayaqlarında yerləşən sensorlar ilə duyur.',
  'Qarışqalar heç vaxt yatmır və onların ciyərləri yoxdur.',
  'Dəniz atlarında balaları dişi deyil, erkək dəniz atı dünyaya gətirir.'
];

export const KNOWN_COMMANDS = new Set([
  'start', 'help', 'kömək', 'komek', 'fakt',
  'dim', 'info', 'qayda', 'qaydalar',
  'aktivlik', 'umumi',
  'tagall', 'all', 'elaqe', 'əlaqə',
  'sozlesme', 'sözləşmə', 'gizlilik',
  'sozlesmeyaz', 'panel', 'admin',
  'analiz', 'sil', 'elan', 'msg', 'cavab',
  'istifadeciler', 'istifadəçilər', 'users',
  'istifadeci', 'istifadəçi', 'user',
  'qruplar', 'groups',
  'axtar', 'blok', 'blokac', 'bloklar', 'bloklist',
  // AI Tools
  'sorus', 'sual', 'quiz', 'tercume',
  'tərcümə', 'xulas', 'xülasə',
  'hesabla', 'sozluk', 'sözlük', 'hava',
  'sitat', 'sitatlar', 'mudrik', 'tarix',
  'pdf', 'model', 'ai', 'aimodel',
  // Personas & Management
  'roleplay', 'persona', 'rejim',
  'clear', 'temizle', 'stats', 'keepalive'
]);

export interface BotIdentity {
  id: number | null;
  username: string;
}

export class TelegramBotService {
  private token: string = '';
  private isPolling: boolean = false;
  private shouldStop: boolean = false;
  private lastUpdateId: number = 0;
  private botIdentity: BotIdentity = { id: null, username: '' };
  private adminIdsCache = new Map<number, { ids: Set<number>; ok: boolean; ts: number }>();
  private readonly ADMIN_CACHE_TTL = 60000;
  private pollingErrorCount: number = 0;
  private elanDrafts = new Map<string, { text: string; adminChatId: number }>();
  private pendingAdminElan = new Map<number, boolean>();

  private connectionMode: 'webhook' | 'polling' = 'webhook';
  private webhookUrl: string = '';

  constructor() {
    this.token = storage.getConfig().botToken || process.env.TELEGRAM_BOT_TOKEN || '';
    const cfg = storage.getConfig();
    this.connectionMode = cfg.connectionMode || 'webhook';
    this.webhookUrl = cfg.webhookUrl || '';

    keepAliveService.registerBotChecker(async () => {
      if (!this.token) return false;
      try {
        const me = await this.getMe();
        if (me && !this.isPolling && this.connectionMode === 'polling') {
          // If container woke up and has valid token in polling mode, auto-resume polling
          this.startPolling().catch(() => {});
        }
        return !!me;
      } catch (e) {
        return false;
      }
    });

    if (this.token) {
      this.initConnection().catch(err => {
        console.error('Initial connection start error:', err);
      });
    }
  }

  public async initConnection(): Promise<void> {
    const config = storage.getConfig();
    const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');

    // If APP_URL is HTTPS and mode is webhook or not explicitly set to polling, activate webhook
    if (config.connectionMode !== 'polling' && appUrl && appUrl.startsWith('https://')) {
      try {
        await this.setupWebhook();
        return;
      } catch (e: any) {
        storage.addLog('error', `Webhook avto-quraşdırma xətası: ${e?.message || e}. Polling rejiminə keçilir.`);
      }
    }

    // Default to Polling if webhook is not available or local
    await this.startPolling();
  }

  public setToken(token: string) {
    this.token = token.trim();
    storage.updateConfig({ botToken: this.token });
    if (this.token) {
      this.initConnection().catch(() => {});
    }
  }

  public getToken(): string {
    return this.token;
  }

  public getBotInfo(): BotIdentity | null {
    return this.botIdentity.id ? this.botIdentity : null;
  }

  public isRunning(): boolean {
    if (this.connectionMode === 'webhook') {
      return Boolean(this.token && this.botIdentity.id);
    }
    return this.isPolling;
  }

  public getConnectionMode(): 'webhook' | 'polling' {
    return this.connectionMode;
  }

  public getWebhookUrl(): string {
    return this.webhookUrl;
  }

  private normalizeUsername(username?: string | null): string {
    return String(username || '').replace(/^@/, '').trim().toLowerCase();
  }

  public escapeHtml(value: string): string {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getEntityOpeningTag(ent: any): string {
    switch (ent.type) {
      case 'bold':
        return '<b>';
      case 'italic':
        return '<i>';
      case 'underline':
        return '<u>';
      case 'strikethrough':
        return '<s>';
      case 'code':
        return '<code>';
      case 'pre':
        if (ent.language) {
          return `<pre><code class="language-${this.escapeHtml(ent.language)}">`;
        }
        return '<pre>';
      case 'text_link':
        if (ent.url) {
          return `<a href="${this.escapeHtml(ent.url)}">`;
        }
        return '';
      case 'text_mention':
        if (ent.user?.id) {
          return `<a href="tg://user?id=${ent.user.id}">`;
        }
        return '';
      case 'spoiler':
        return '<tg-spoiler>';
      default:
        return '';
    }
  }

  private getEntityClosingTag(ent: any): string {
    switch (ent.type) {
      case 'bold':
        return '</b>';
      case 'italic':
        return '</i>';
      case 'underline':
        return '</u>';
      case 'strikethrough':
        return '</s>';
      case 'code':
        return '</code>';
      case 'pre':
        if (ent.language) {
          return '</code></pre>';
        }
        return '</pre>';
      case 'text_link':
      case 'text_mention':
        return ent.url || ent.user?.id ? '</a>' : '';
      case 'spoiler':
        return '</tg-spoiler>';
      default:
        return '';
    }
  }

  public convertEntitiesToHtml(text: string, entities?: any[]): string {
    if (!text) return '';
    if (!entities || entities.length === 0) {
      return this.escapeHtml(text);
    }

    const validEntities = entities.filter(
      e =>
        typeof e.offset === 'number' &&
        typeof e.length === 'number' &&
        e.length > 0 &&
        e.offset >= 0 &&
        e.offset + e.length <= text.length
    );

    if (validEntities.length === 0) {
      return this.escapeHtml(text);
    }

    const points = new Set<number>([0, text.length]);
    for (const ent of validEntities) {
      points.add(ent.offset);
      points.add(ent.offset + ent.length);
    }
    const sortedPoints = Array.from(points).sort((a, b) => a - b);

    let result = '';

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const start = sortedPoints[i];
      const end = sortedPoints[i + 1];

      // Closing tags at this point
      const closing = validEntities.filter(e => e.offset + e.length === start);
      closing.sort((a, b) => a.length - b.length);
      for (const ent of closing) {
        result += this.getEntityClosingTag(ent);
      }

      // Opening tags at this point
      const opening = validEntities.filter(e => e.offset === start);
      opening.sort((a, b) => b.length - a.length);
      for (const ent of opening) {
        result += this.getEntityOpeningTag(ent);
      }

      const segment = text.slice(start, end);
      result += this.escapeHtml(segment);
    }

    const finalClosing = validEntities.filter(e => e.offset + e.length === text.length);
    finalClosing.sort((a, b) => a.length - b.length);
    for (const ent of finalClosing) {
      result += this.getEntityClosingTag(ent);
    }

    return result;
  }

  public extractFormattedHtml(msg: any, prefixRegex?: RegExp): string {
    let text = msg?.text || msg?.caption || '';
    let entities: any[] = (msg?.text ? msg?.entities : msg?.caption_entities) || [];

    if (!text) return '';

    if (prefixRegex) {
      const match = text.match(prefixRegex);
      if (match) {
        const prefixLen = match[0].length;
        text = text.substring(prefixLen);
        entities = entities
          .filter((e: any) => e.offset + e.length > prefixLen)
          .map((e: any) => {
            const newOffset = Math.max(0, e.offset - prefixLen);
            const newLength =
              e.offset < prefixLen ? e.offset + e.length - prefixLen : e.length;
            return { ...e, offset: newOffset, length: newLength };
          });
      }
    }

    return this.convertEntitiesToHtml(text.trim(), entities);
  }

  private getUserName(from: any): string {
    if (!from) return 'İstifadəçi';
    if (from.username) return `@${from.username}`;
    return from.first_name || 'İstifadəçi';
  }

  private isOwner(from: any): boolean {
    return storage.isOwner(from);
  }

  public async apiCall(method: string, payload: any = {}): Promise<any> {
    if (!this.token) {
      throw new Error('Telegram Bot Token daxil edilməyib.');
    }

    const url = `https://api.telegram.org/bot${this.token}/${method}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = (await res.json()) as any;
    if (!data.ok) {
      throw new Error(`Telegram API xətası (${method}): ${data.description || 'Naməlum xəta'}`);
    }
    return data.result;
  }

  public async getMe(): Promise<BotIdentity | null> {
    try {
      const info = await this.apiCall('getMe');
      this.botIdentity = {
        id: info.id,
        username: info.username || ''
      };
      return this.botIdentity;
    } catch (e) {
      return null;
    }
  }

  private isLoopRunning = false;

  public async startPolling(): Promise<{ success: boolean; botInfo?: BotIdentity; message: string }> {
    if (!this.token) {
      return { success: false, message: 'Telegram Bot Token daxil edilməyib.' };
    }

    if (this.isPolling && !this.shouldStop && this.isLoopRunning) {
      return {
        success: true,
        botInfo: this.botIdentity.id ? this.botIdentity : undefined,
        message: 'Bot onsuz da aktiv polling rejimində işləyir.'
      };
    }

    try {
      const me = await this.getMe();
      if (!me) throw new Error('Bot məlumatları alına bilmədi.');

      await this.apiCall('deleteWebhook', { drop_pending_updates: false });

      this.isPolling = true;
      this.shouldStop = false;
      this.pollingErrorCount = 0;
      storage.updateConfig({ pollingEnabled: true, connectionMode: 'polling' });

      storage.addLog(
        'telegram',
        `🤖 Bot aktivləşdirildi: @${me.username} (ID: ${me.id}). AAQ - Ahl Al Qalam sistemi hazırdır.`
      );

      this.pollLoop();

      return {
        success: true,
        botInfo: me,
        message: `Bot @${me.username} olaraq uğurla işə salındı!`
      };
    } catch (err: any) {
      this.isPolling = false;
      this.isLoopRunning = false;
      storage.updateConfig({ pollingEnabled: false });
      storage.addLog('error', `Bot işə düşmədi: ${err?.message || err}`);
      return { success: false, message: `Xəta: ${err?.message || err}` };
    }
  }

  public async stopPolling(): Promise<{ success: boolean; message: string }> {
    this.shouldStop = true;
    this.isPolling = false;
    this.isLoopRunning = false;
    storage.updateConfig({ pollingEnabled: false });
    storage.addLog('telegram', '🛑 Telegram bot polling dayandırıldı.');
    return { success: true, message: 'Bot dayandırıldı.' };
  }

  public async setupWebhook(customUrl?: string): Promise<{ success: boolean; url: string; message: string }> {
    if (!this.token) {
      return { success: false, url: '', message: 'Bot Token təyin edilməyib.' };
    }

    const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
    const targetUrl = customUrl || (appUrl ? `${appUrl}/api/telegram/webhook` : '');

    if (!targetUrl || !targetUrl.startsWith('https://')) {
      return {
        success: false,
        url: targetUrl,
        message: 'Webhook üçün ictimai HTTPS ünvanı tələb olunur (Məsələn: https://...run.app/api/telegram/webhook).'
      };
    }

    try {
      const me = await this.getMe();
      if (!me) throw new Error('Bot məlumatları alına bilmədi.');

      // Stop polling to prevent 409 conflicts
      this.shouldStop = true;
      this.isPolling = false;

      // Register webhook on Telegram
      await this.apiCall('setWebhook', {
        url: targetUrl,
        drop_pending_updates: false,
        allowed_updates: ['message', 'callback_query', 'inline_query']
      });

      this.connectionMode = 'webhook';
      this.webhookUrl = targetUrl;
      storage.updateConfig({ connectionMode: 'webhook', webhookUrl: targetUrl, pollingEnabled: false });

      storage.addLog(
        'telegram',
        `⚡ Telegram Webhook aktivləşdirildi: ${targetUrl}. Bot artıq server yatdıqda belə hər mesajda dərhal oyanacaq! (@${me.username})`
      );

      return {
        success: true,
        url: targetUrl,
        message: `Webhook uğurla quruldu! Telegram mesajları birbaşa ${targetUrl} ünvanına daxil olacaq və botu dərhal oyadacaq.`
      };
    } catch (err: any) {
      storage.addLog('error', `Webhook quraşdırılarkən xəta: ${err?.message || err}`);
      return {
        success: false,
        url: targetUrl,
        message: `Xəta: ${err?.message || err}`
      };
    }
  }

  public async removeWebhook(): Promise<{ success: boolean; message: string }> {
    if (!this.token) {
      return { success: false, message: 'Bot Token təyin edilməyib.' };
    }

    try {
      await this.apiCall('deleteWebhook', { drop_pending_updates: false });
      this.connectionMode = 'polling';
      this.webhookUrl = '';
      storage.updateConfig({ connectionMode: 'polling', webhookUrl: '' });
      storage.addLog('telegram', '🔄 Telegram Webhook ləğv edildi. Polling rejiminə keçilir.');

      const pollRes = await this.startPolling();
      return {
        success: true,
        message: `Webhook ləğv edildi və Polling rejiminə keçildi: ${pollRes.message}`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Xəta: ${err?.message || err}`
      };
    }
  }

  public async getWebhookInfo(): Promise<any> {
    if (!this.token) return null;
    try {
      return await this.apiCall('getWebhookInfo');
    } catch (e) {
      return null;
    }
  }

  private async pollLoop() {
    if (this.isLoopRunning) {
      return;
    }
    this.isLoopRunning = true;
    try {
      while (this.isPolling && !this.shouldStop) {
        try {
          const updates = await this.apiCall('getUpdates', {
            offset: this.lastUpdateId + 1,
            timeout: 20,
            allowed_updates: ['message', 'callback_query', 'inline_query']
          });

          this.pollingErrorCount = 0;

          if (Array.isArray(updates) && updates.length > 0) {
            for (const update of updates) {
              this.lastUpdateId = update.update_id;
              this.processUpdate(update).catch(err => {
                storage.addLog('error', `Update emal xətası (ID: ${update.update_id}): ${err?.message || err}`);
              });
            }
          }
        } catch (err: any) {
          this.pollingErrorCount++;
          const errMsg = err?.message || String(err);
          if (errMsg.includes('409') || errMsg.includes('Conflict')) {
            storage.addLog('error', '⚠️ Telegram 409 Conflict: Eyni token başqa yerdə də işləyir.');
            await new Promise(r => setTimeout(r, 5000));
          } else {
            if (this.pollingErrorCount % 5 === 0) {
              storage.addLog('error', `Polling xətası: ${errMsg}`);
            }
            const backoff = Math.min(10000, 1000 * this.pollingErrorCount);
            await new Promise(r => setTimeout(r, backoff));
          }
        }
      }
    } finally {
      this.isLoopRunning = false;
    }
  }

  public async processUpdate(update: any) {
    if (update.inline_query) {
      await this.handleInlineQuery(update.inline_query);
    } else if (update.message) {
      await this.processTelegramMessage(update.message);
    } else if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
    }
  }

  // --- INLINE QUERY HANDLER ---
  private async handleInlineQuery(inlineQuery: any) {
    const queryId = inlineQuery.id;
    const query = (inlineQuery.query || '').trim();
    const results: any[] = [];

    if (query) {
      try {
        const aiAnswer = await geminiService.quickPrompt(
          query,
          'Sən AAQ - Ahl Al Qalam intellektual köməkçisisən. Bu suala aydın, dəqiq və səlis şəkildə Azərbaycan dilində cavab ver.'
        );

        results.push({
          type: 'article',
          id: 'ai_' + Math.random().toString(36).substring(2, 7),
          title: `🤖 Gemini AI: "${query.substring(0, 35)}..."`,
          description: aiAnswer.substring(0, 80) + '...',
          input_message_content: {
            message_text: `💭 <b>Sual:</b> <i>"${this.escapeHtml(query)}"</i>\n\n🤖 <b>AAQ - Ahl Al Qalam AI:</b>\n${this.escapeHtml(aiAnswer)}\n\n🏛️ <i>Təqdim edir: AAQ - Ahl Al Qalam</i>`,
            parse_mode: 'HTML'
          },
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔄 Başqa Sual Ver', switch_inline_query_current_chat: '' }],
              [{ text: '📢 AAQ Rəsmi Kanal', url: OFFICIAL_CHANNEL_URL }]
            ]
          }
        });
      } catch (err) {
        results.push({
          type: 'article',
          id: 'ai_err_' + Math.random().toString(36).substring(2, 7),
          title: `🤖 Gemini AI: "${query.substring(0, 35)}..."`,
          description: 'Sualınızı AI ilə cavablandırmaq üçün klikləyin',
          input_message_content: {
            message_text: `💭 <b>Sual:</b> <i>"${this.escapeHtml(query)}"</i>\n\n🤖 <b>AAQ - Ahl Al Qalam AI:</b>\nSualınız qeydə alındı. Ətraflı söhbət üçün @${this.botIdentity.username} botuna daxil olun.`,
            parse_mode: 'HTML'
          },
          reply_markup: {
            inline_keyboard: [
              [{ text: '🤖 Bota Keç', url: `https://t.me/${this.botIdentity.username}?start=ask` }],
              [{ text: '📢 AAQ Kanalı', url: OFFICIAL_CHANNEL_URL }]
            ]
          }
        });
      }
    }

    const randomQuote = REAL_HISTORICAL_QUOTES[Math.floor(Math.random() * REAL_HISTORICAL_QUOTES.length)];
    results.push({
      type: 'article',
      id: 'quote_1',
      title: '📜 Dahi Şəxsiyyətlərdən Hikmət',
      description: `"${randomQuote.text}" — ${randomQuote.author}`,
      input_message_content: {
        message_text: `📜 <b>Dahi Şəxsiyyətlərdən Hikmət:</b>\n\n<i>"${this.escapeHtml(randomQuote.text)}"</i>\n\n✍️ <b>Müəllif:</b> ${this.escapeHtml(randomQuote.author)} (${this.escapeHtml(randomQuote.era)})\n🏛️ <b>Təqdim edir:</b> AAQ - Ahl Al Qalam`,
        parse_mode: 'HTML'
      },
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔄 Başqa Hikmət', switch_inline_query_current_chat: '' },
            { text: '📢 AAQ Kanalı', url: OFFICIAL_CHANNEL_URL }
          ]
        ]
      }
    });

    const randomFact = FACTS[Math.floor(Math.random() * FACTS.length)];
    results.push({
      type: 'article',
      id: 'fact_1',
      title: '💡 Maraqlı Elmi Fakt',
      description: randomFact.substring(0, 60) + '...',
      input_message_content: {
        message_text: `💡 <b>AAQ - Ahl Al Qalam Elmi Fakt:</b>\n\n${this.escapeHtml(randomFact)}\n\n✨ <i>Daha çox fakt və elmi biliklər üçün @${this.botIdentity.username} botuna daxil olun.</i>`,
        parse_mode: 'HTML'
      },
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔄 Başqa Fakt', switch_inline_query_current_chat: '' },
            { text: '🤖 Bota Keç', url: `https://t.me/${this.botIdentity.username}` }
          ]
        ]
      }
    });

    try {
      await this.apiCall('answerInlineQuery', {
        inline_query_id: queryId,
        results,
        cache_time: 5,
        is_personal: true
      });
    } catch (e) {}
  }

  // --- MODERATION HELPERS ---
  private async deleteTelegramMessage(chatId: number, messageId: number) {
    try {
      await this.apiCall('deleteMessage', {
        chat_id: chatId,
        message_id: messageId
      });
    } catch (e) {}
  }

  private async checkIsAdmin(chatId: number, userId: number): Promise<boolean> {
    if (!userId) return false;
    try {
      const res = await this.apiCall('getChatMember', {
        chat_id: chatId,
        user_id: userId
      });
      const status = res?.status;
      return status === 'creator' || status === 'administrator';
    } catch {
      return false;
    }
  }

  private async getChatAdminIds(chatId: number): Promise<{ ids: Set<number>; ok: boolean }> {
    const cached = this.adminIdsCache.get(chatId);
    if (cached && Date.now() - cached.ts < this.ADMIN_CACHE_TTL) {
      return { ids: cached.ids, ok: cached.ok };
    }
    try {
      const res = await this.apiCall('getChatAdministrators', { chat_id: chatId });
      if (!Array.isArray(res)) {
        this.adminIdsCache.set(chatId, { ids: new Set(), ok: false, ts: Date.now() });
        return { ids: new Set(), ok: false };
      }
      const ids = new Set<number>();
      for (const admin of res) {
        const u = admin?.user;
        if (u?.id) ids.add(Number(u.id));
      }
      this.adminIdsCache.set(chatId, { ids, ok: true, ts: Date.now() });
      return { ids, ok: true };
    } catch {
      this.adminIdsCache.set(chatId, { ids: new Set(), ok: false, ts: Date.now() });
      return { ids: new Set(), ok: false };
    }
  }

  private async shouldDeleteLink(chatId: number, msg: any): Promise<boolean> {
    if (msg.sender_chat) return false;
    const userId = msg.from?.id;
    if (!userId) return false;
    const { ids, ok } = await this.getChatAdminIds(chatId);
    if (ok) {
      return !ids.has(Number(userId));
    }
    const isAdmin = await this.checkIsAdmin(chatId, userId);
    return !isAdmin;
  }

  private hasBotMention(text: string | undefined, botUsername: string): boolean {
    if (!text || !botUsername) return false;
    const cleanBot = this.normalizeUsername(botUsername);
    const words = text.toLowerCase().split(/\s+/);
    return words.some(w => w === `@${cleanBot}` || w.startsWith(`@${cleanBot}`));
  }

  private extractTelegramCommand(msg: any): { name: string; token: string; targetUsername?: string } | null {
    const text = (msg.text || '').trim();
    if (!text.startsWith('/')) return null;

    const match = text.match(/^\/([a-zA-Z0-9_əöğıüşçƏÖĞIÜŞÇ]+)(?:@([a-zA-Z0-9_]+))?/);
    if (!match) return null;

    return {
      token: match[0],
      name: match[1].toLowerCase(),
      targetUsername: match[2] ? this.normalizeUsername(match[2]) : undefined
    };
  }

  // --- CORE MESSAGE PROCESSOR ---
  public async processTelegramMessage(msg: any) {
    const chatId = msg.chat?.id;
    if (!chatId) return;
    if (msg.from?.is_bot) return;

    const isGroup = msg.chat?.type === 'group' || msg.chat?.type === 'supergroup';
    const userId = msg.from?.id;
    const config = storage.getConfig();

    try {
      // 1. User & Group Registration (Auto accept terms on activity to never block valid commands)
      const user = storage.registerOrUpdateUser({
        id: userId,
        username: msg.from?.username,
        first_name: msg.from?.first_name,
        last_name: msg.from?.last_name
      });

      if (isGroup) {
        storage.registerOrUpdateGroup({
          id: chatId,
          title: msg.chat?.title || 'Qrup',
          type: msg.chat?.type || 'group'
        });
      }

      // 2. Block & Spam check
      if (!this.isOwner(msg.from)) {
        const blockStatus = storage.isUserBlocked(userId);
        if (blockStatus.isBlocked) {
          if (!isGroup) {
            const untilFormatted = blockStatus.until 
              ? `\n⏳ <b>Blokun Bitmə Tarixi:</b> ${new Date(blockStatus.until).toLocaleString('az-AZ')}`
              : '\n⏳ <b>Müddət:</b> Daimi (Müddətsiz)';
            await this.sendSafeHtml(
              chatId,
              `⛔ <b>Botdan istifadə hüququnuz admin tərəfindən məhdudlaşdırılıb!</b>\n\n📝 <b>Səbəb:</b> ${this.escapeHtml(blockStatus.reason || 'Qaydaların pozulması')}${untilFormatted}\n\n🏛️ <i>Məlumat üçün: ${OFFICIAL_CHANNEL_URL}</i>`
            );
          }
          return;
        }

        if (storage.checkSpamRate(userId)) {
          await this.sendSafeHtml(
            chatId,
            `⚠️ <i>Xəbərdarlıq: Mesaj göndərmə sürətiniz yüksəkdir. Zəhmət olmasa bir qədər gözləyin.</i>`
          );
          return;
        }
      }

      const command = this.extractTelegramCommand(msg);
      if (!this.botIdentity.username) {
        await this.getMe();
      }

      if (
        command?.targetUsername &&
        command.targetUsername !== this.normalizeUsername(this.botIdentity.username)
      ) {
        return;
      }

      // 3. New Member Welcome in Groups
      if (msg.new_chat_members && msg.new_chat_members.length > 0 && isGroup && config.autoWelcome) {
        await this.handleNewMembers(chatId, msg.new_chat_members);
        return;
      }

      // 4. Moderation in Groups
      if (isGroup && msg.text) {
        if (config.antiProfanity && PROFANITY_REGEX.test(msg.text)) {
          await this.deleteTelegramMessage(chatId, msg.message_id);
          await this.sendSafeHtml(chatId, `⚠️ ${this.escapeHtml(this.getUserName(msg.from))}, qrupda qeyri-etik və təhqiramiz ifadələr qadağandır!`);
          storage.addLog('moderation', `Söyüş silindi: [${this.getUserName(msg.from)}] qrupda qadağan olunmuş söz işlətdi.`);
          return;
        }

        if (config.antiLink && URL_REGEX.test(msg.text)) {
          if (await this.shouldDeleteLink(chatId, msg)) {
            await this.deleteTelegramMessage(chatId, msg.message_id);
            await this.sendSafeHtml(chatId, `⚠️ ${this.escapeHtml(this.getUserName(msg.from))}, yalnız qrup adminləri link paylaşa bilər!`);
            storage.addLog('moderation', `Link silindi: [${this.getUserName(msg.from)}] qrupda link paylaşdı.`);
            return;
          }
        }
      }

      // 5. Unknown Command Handling
      if (command && !KNOWN_COMMANDS.has(command.name)) {
        const addressedToUs = !isGroup || Boolean(command.targetUsername);
        if (addressedToUs) {
          await this.sendSafeHtml(
            chatId,
            `<code>${this.escapeHtml(command.token)}</code> əmri mövcud deyil.\nAşağıdakı rəsmi əmrlərdən istifadə edə bilərsiniz:`
          );
          await this.handleHelp(chatId, this.isOwner(msg.from));
        }
        return;
      }

      // 6. Commands Processing
      if (msg.text) {
        const text = msg.text.trim();
        const cmd = command?.name ?? '';

        // PUBLIC COMMANDS
        switch (cmd) {
          case 'start':
            await this.handleStart(chatId, user, this.isOwner(msg.from));
            return;
          case 'help':
          case 'kömək':
          case 'komek':
            await this.handleHelp(chatId, this.isOwner(msg.from));
            return;
          case 'sozlesme':
          case 'sözləşmə':
          case 'gizlilik':
            await this.showPolicy(chatId, this.isOwner(msg.from) && !isGroup);
            return;
          case 'fakt':
            await this.handleFakt(chatId);
            return;
          case 'model':
          case 'ai':
          case 'aimodel':
            await this.handleModelMenu(chatId, userId);
            return;
          case 'dim':
            await this.handleDim(chatId);
            return;
          case 'pdf':
            await this.handlePdfInstruction(chatId, isGroup);
            return;
          case 'info':
            await this.handleInfo(chatId, msg, isGroup);
            return;
          case 'qayda':
          case 'qaydalar': {
            const qText = text.replace(/^\/\S+/, '').trim();
            if (qText) {
              const isAdmin = isGroup ? await this.checkIsAdmin(chatId, msg.from?.id) : this.isOwner(msg.from);
              if (isAdmin) {
                storage.setGroupRules(chatId, qText, msg.from?.id);
                await this.sendSafeHtml(chatId, '✅ Qrup qaydaları yeniləndi.');
              } else {
                await this.sendSafeHtml(chatId, '⛔ Bu əmr yalnız qrup adminləri üçündür.');
              }
            } else {
              await this.showGroupRules(chatId);
            }
            return;
          }
          case 'aktivlik':
            await this.handleAktivlik(chatId, isGroup);
            return;
          case 'umumi':
            await this.handleUmumi(chatId);
            return;
          case 'elaqe':
          case 'əlaqə': {
            const directMsg = text.replace(/^\/(elaqe|əlaqə)\s*/i, '').trim();
            if (directMsg) {
              await this.handleDirectContact(chatId, msg, directMsg);
            } else {
              if (!isGroup) {
                await this.startContact(chatId);
              } else {
                await this.sendSafeHtml(chatId, '📞 Rəhbərliklə əlaqə üçün mənə şəxsi çatda <code>/elaqe &lt;mesajınız&gt;</code> yazın.');
              }
            }
            return;
          }
          case 'sorus':
          case 'sual':
            await this.handleSorus(chatId, userId, text);
            return;
          case 'quiz':
            await this.handleQuiz(chatId);
            return;
          case 'tercume':
          case 'tərcümə':
            await this.handleTercume(chatId, text);
            return;
          case 'xulas':
          case 'xülasə':
            await this.handleXulas(chatId, text);
            return;
          case 'hesabla':
            await this.handleHesabla(chatId, text);
            return;
          case 'sozluk':
          case 'sözlük':
            await this.handleSozluk(chatId, text);
            return;
          case 'hava':
            await this.handleHava(chatId, text);
            return;
          case 'sitat':
          case 'sitatlar':
          case 'mudrik':
            await this.handleSitat(chatId);
            return;
          case 'tarix':
            await this.handleTarix(chatId);
            return;
          case 'roleplay':
          case 'persona':
          case 'rejim':
            await this.handleRoleplayMenu(chatId, userId);
            return;
          case 'clear':
          case 'temizle':
            storage.clearChatHistory(userId);
            await this.sendSafeHtml(chatId, '🧹 Söhbət yaddaşı təmizləndi! Yeni mövzuya başlaya bilərik.');
            return;
          case 'admin': {
            const secret = text.replace(/^\/admin\s*/i, '').trim();
            const adminIds = storage.getAdminIds();
            if (storage.verifyAdminSecret(secret) || adminIds.length === 0) {
              storage.addAdminId(userId);
              await this.sendSafeHtml(chatId, `👑 <b>Təbriklər!</b> Siz rəsmi <b>AAQ Admin</b> statusu qazandınız.\nChat ID-niz: <code>${userId}</code> rəsmi idarəçi kimi təsdiqləndi.`);
              await this.handleOwnerPanel(chatId);
            } else if (this.isOwner(msg.from)) {
              await this.handleOwnerPanel(chatId);
            } else {
              await this.sendSafeHtml(chatId, '🔒 <b>Admin Girişi</b>\nİstifadə: <code>/admin [gizli_şifrə]</code>\n<i>Qeyd: Admin şifrəsi idarə panelində təyin olunur.</i>');
            }
            return;
          }
        }

        // OWNER / ADMIN ONLY COMMANDS
        if (cmd === 'panel' || cmd === 'sozlesmeyaz') {
          if (!this.isOwner(msg.from)) {
            await this.handleHelp(chatId, false);
            return;
          }
          if (cmd === 'panel') {
            await this.handleOwnerPanel(chatId);
            return;
          }
          const newPolicy = text.replace(/^\/\S+/, '').trim();
          if (!newPolicy) {
            await this.sendSafeHtml(
              chatId,
              'İstifadə: <code>/sozlesmeyaz &lt;yeni mətn&gt;</code>\nStandart mətn üçün: <code>/sozlesmeyaz standart</code>'
            );
            return;
          }
          const targetPolicy = newPolicy.toLowerCase() === 'standart' ? DEFAULT_POLICY : newPolicy;
          storage.updateConfig({ policyText: targetPolicy });
          await this.sendSafeHtml(chatId, '✅ Gizlilik sözləşməsi yeniləndi.');
          await this.showPolicy(chatId, true);
          return;
        }

        if (cmd === 'elan') {
          if (!this.isOwner(msg.from)) {
            await this.handleHelp(chatId, false);
            return;
          }
          await this.handleElanCommand(chatId, msg);
          return;
        }

        if (cmd === 'msg' || cmd === 'cavab') {
          if (!this.isOwner(msg.from)) {
            await this.handleHelp(chatId, false);
            return;
          }
          const textAfterCmd = text.replace(/^\/(msg|cavab)\s*/, '').trim();
          const firstSpaceIdx = textAfterCmd.indexOf(' ');
          const targetStr = firstSpaceIdx !== -1 ? textAfterCmd.substring(0, firstSpaceIdx) : textAfterCmd;
          
          let targetUserId = parseInt(targetStr, 10);
          if (targetStr?.startsWith('ticket_')) {
            const ticket = storage.getContactTickets().find(t => t.id === targetStr);
            if (ticket) targetUserId = ticket.userId;
          }

          const msgBodyHtml = this.extractFormattedHtml(msg, /^\/(msg|cavab)\s+\S+\s*/i);

          if (isNaN(targetUserId) || !msgBodyHtml) {
            await this.sendSafeHtml(chatId, 'İstifadə: <code>/msg &lt;userId&gt; &lt;mesajınız&gt;</code> və ya <code>/cavab &lt;ticket_id&gt; &lt;cavab&gt;</code>');
            return;
          }
          try {
            await this.sendSafeHtml(
              targetUserId,
              `🔔 <b>AAQ RƏHBƏRLİYİNDƏN RƏSMİ CAVAB:</b>\n\n${msgBodyHtml}\n\n🏛️ <i>AAQ Rəhbərliyi</i>`
            );
            if (targetStr?.startsWith('ticket_')) {
              storage.updateContactTicketReply(targetStr, msgBodyHtml, 'AAQ Rəhbərlik');
            }
            await this.sendSafeHtml(chatId, `✅ Cavab <code>${targetUserId}</code> ID-li istifadəçiyə çatdırıldı.`);
          } catch (e: any) {
            await this.sendSafeHtml(chatId, `❌ Cavab çatdırılmadı: ${e?.message || e}`);
          }
          return;
        }

        if (cmd === 'qruplar' || cmd === 'groups') {
          if (!this.isOwner(msg.from)) {
            await this.handleHelp(chatId, false);
            return;
          }
          await this.handleGroupList(chatId);
          return;
        }

        if (['istifadeciler', 'istifadəçilər', 'users', 'istifadeci', 'istifadəçi', 'user', 'axtar', 'blok', 'blokac', 'bloklar', 'bloklist'].includes(cmd)) {
          if (!this.isOwner(msg.from)) {
            await this.handleHelp(chatId, false);
            return;
          }
          const arg = text.replace(/^\/\S+/, '').trim();
          if (cmd === 'axtar') await this.handleUserSearch(chatId, arg);
          else if (cmd === 'user' || cmd === 'istifadeci' || cmd === 'istifadəçi') await this.handleUserDetail(chatId, arg);
          else if (cmd === 'blok') await this.handleBlockUser(chatId, arg);
          else if (cmd === 'blokac') await this.handleUnblockUser(chatId, arg);
          else if (cmd === 'bloklar' || cmd === 'bloklist') await this.handleBlockList(chatId);
          else await this.handleUserList(chatId);
          return;
        }

        if (cmd === 'tagall' || cmd === 'all') {
          if (!isGroup) {
            await this.sendSafeHtml(chatId, 'Bu əmr yalnız qruplarda işləyir.');
            return;
          }
          const isAdmin = await this.checkIsAdmin(chatId, msg.from?.id);
          if (isAdmin || this.isOwner(msg.from)) {
            await this.handleTagAll(chatId);
          } else {
            await this.sendSafeHtml(chatId, '⛔ Bu əmr yalnız qrup adminləri üçündür.');
          }
          return;
        }

        if (cmd === 'analiz') {
          await this.handleAnaliz(chatId);
          return;
        }

        if (cmd === 'sil') {
          if (isGroup && msg.reply_to_message) {
            const isAdmin = await this.checkIsAdmin(chatId, msg.from?.id);
            if (isAdmin || this.isOwner(msg.from)) {
              await this.deleteTelegramMessage(chatId, msg.reply_to_message.message_id);
              await this.deleteTelegramMessage(chatId, msg.message_id);
            }
          }
          return;
        }
      }

      // 7. Check if admin was writing an elan
      if (this.isOwner(msg.from) && this.pendingAdminElan.get(chatId) && (msg.text || msg.caption)) {
        this.pendingAdminElan.delete(chatId);
        const formattedHtml = this.extractFormattedHtml(msg);
        if (!formattedHtml) {
          await this.sendSafeHtml(chatId, '⚠️ Elan mətni boş ola bilməz.');
          return;
        }
        await this.promptElanTargetSelection(chatId, formattedHtml);
        return;
      }

      // 8. Check if user is in Contact pending mode
      if (storage.isContactPending(chatId)) {
        await this.relayContactMessage(chatId, msg);
        return;
      }

      // 9. Handle Admin Reply to User in Telegram
      if (msg.reply_to_message && this.isOwner(msg.from)) {
        const targetChatId = storage.getTargetChatIdForReply(msg.reply_to_message.message_id);
        if (targetChatId) {
          const replyText = msg.text || msg.caption || '[Fayl/Media]';
          await this.relayOwnerReply(chatId, targetChatId, replyText);
          return;
        }
      }

      // 10. Handle Documents (PDF / TXT analysis - ONLY IN PRIVATE CHATS)
      if (msg.document) {
        if (isGroup) {
          // Do not analyze documents in groups to prevent spam and unnecessary trigger
          return;
        }
        await this.handleDocument(chatId, msg);
        return;
      }

      // 11. Handle Voice/Audio (Transcription)
      if (msg.voice || msg.audio) {
        await this.handleAudio(chatId, userId, msg);
        return;
      }

      // 12. Conversational AI fallback with Live Status Ticker
      if (msg.text) {
        await this.handleGeneralText(chatId, userId, msg.text, isGroup, msg);
      }
    } catch (err: any) {
      storage.addLog('error', `Mesaj emalı xətası (Chat: ${chatId}): ${err?.message || err}`);
    }
  }

  // --- SUBMIT DIRECT CONTACT (NO LEAKAGE, CLEAN USER CONFIRMATION) ---
  public async startContact(chatId: number) {
    storage.setContactPending(chatId, true);
    const keyboard = {
      inline_keyboard: [
        [
          { text: '❌ Ləğv et', callback_data: 'user_cancel_contact' },
          { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
        ]
      ]
    };

    await this.sendSafeHtml(
      chatId,
      `📩 <b>AAQ RƏHBƏRLİYİNƏ MÜRACİƏT</b>\n\nZəhmət olmasa təklif, sual və ya müraciətinizi bu çata yazaraq göndərin.\n<i>Mesajınız birbaşa rəhbərliyə çatdırılacaq və tezliklə cavablandırılacaq.</i>`,
      { reply_markup: keyboard }
    );
  }

  public async relayContactMessage(chatId: number, msg: any) {
    const formattedHtml = this.extractFormattedHtml(msg);
    if (!formattedHtml) {
      await this.sendSafeHtml(chatId, '⚠️ Müraciət mətni boş ola bilməz.');
      return;
    }
    await this.handleDirectContact(chatId, msg, formattedHtml);
  }

  public async relayOwnerReply(adminChatId: number, targetUserId: number, replyMsg: any) {
    let replyHtml = '';
    if (typeof replyMsg === 'string') {
      replyHtml = this.escapeHtml(replyMsg);
    } else {
      replyHtml = this.extractFormattedHtml(replyMsg);
    }

    if (!replyHtml) {
      replyHtml = '[Fayl/Media]';
    }

    try {
      await this.sendSafeHtml(
        targetUserId,
        `🔔 <b>AAQ RƏHBƏRLİYİNDƏN RƏSMİ CAVAB:</b>\n\n${replyHtml}\n\n🏛️ <i>AAQ Rəhbərliyi</i>`
      );
      await this.sendSafeHtml(
        adminChatId,
        `✅ <i>Cavabınız <code>${targetUserId}</code> ID-li istifadəçiyə uğurla çatdırıldı.</i>`
      );
    } catch (e: any) {
      await this.sendSafeHtml(
        adminChatId,
        `❌ Cavab istifadəçiyə çatdırıla bilmədi (İstifadəçi botu dayandırmış ola bilər): ${e?.message || e}`
      );
    }
  }

  public async handleDirectContact(chatId: number, msg: any, formattedMessageText: string) {
    storage.setContactPending(chatId, false);
    const user = storage.getUser(chatId) || msg?.from;
    const adminIds = storage.getAdminIds();
    const userName = `${user?.first_name || 'İstifadəçi'} ${user?.last_name || ''}`.trim();
    const userUsername = user?.username;

    const ticket = storage.addContactTicket({
      userId: chatId,
      userName,
      userUsername,
      message: formattedMessageText
    });

    const report = `📩 <b>YENİ İSTİFADƏÇİ MÜRACİƏTİ (#${ticket.id})</b>\n\n👤 <b>Göndərən:</b> ${this.escapeHtml(userName)} (@${userUsername || 'yoxdur'})\n🆔 <b>User ID:</b> <code>${chatId}</code>\n💬 <b>Məzmun:</b>\n${formattedMessageText}\n\n👉 <i>Cavab vermək üçün: <code>/msg ${chatId} &lt;cavabınız&gt;</code> və ya Telegram-da bu mesaja Reply (Cavab) yazın.</i>`;

    let deliveredCount = 0;
    for (const adminId of adminIds) {
      try {
        const sent = await this.sendSafeHtml(adminId, report);
        if (sent?.message_id) {
          storage.recordRelayedMessage(sent.message_id, chatId);
          deliveredCount++;
        }
      } catch (err: any) {
        storage.addLog('admin', `Adminə (${adminId}) müraciət çatdırıla bilmədi: ${err?.message || err}`);
      }
    }

    storage.addLog(
      'admin',
      `İstifadəçi müraciəti (${chatId} - ${userName}): (Adminlərə çatdırıldı: ${deliveredCount}/${adminIds.length})`
    );

    const successMsg = `✅ <b>Müraciətiniz AAQ Rəhbərliyinə uğurla çatdırıldı!</b>\n\n💬 ${formattedMessageText}\n\nMüraciətiniz qeydə alındı (Bilet: <code>#${ticket.id}</code>). Ən qısa zamanda cavablandırılacaq. Təşəkkür edirik! ✨`;
    await this.sendSafeHtml(chatId, successMsg);
  }

  // --- ADMIN ELAN TARGET SELECTION (3 DISTINCT BUTTONS + CANCEL) ---
  public async promptElanTargetSelection(chatId: number, formattedElanHtml: string) {
    const draftId = 'elan_' + Math.random().toString(36).substring(2, 8);
    this.elanDrafts.set(draftId, { text: formattedElanHtml, adminChatId: chatId });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌐 Hamıya', callback_data: `elan_dest_all_${draftId}` }
        ],
        [
          { text: '👥 Yalnız qruplara', callback_data: `elan_dest_groups_${draftId}` }
        ],
        [
          { text: '👤 Yalnız istifadəçilərə', callback_data: `elan_dest_users_${draftId}` }
        ],
        [
          { text: '❌ Ləğv et', callback_data: `elan_cancel_${draftId}` }
        ]
      ]
    };

    await this.sendSafeHtml(
      chatId,
      `📢 <b>RƏSMİ ELAN ÖN BAXIŞI</b>\n\n${formattedElanHtml}\n\n━━━━━━━━━━━━━━━━━━━━\n<i>Zəhmət olmasa elanın kimlərə çatdırılacağını seçin:</i>`,
      { reply_markup: keyboard }
    );
  }

  // --- REAL-TIME PROGRESSIVE HUMAN-LIKE TYPING STREAM ---
  public async streamAiReplyWithLiveStatus(chatId: number, userId: number, promptText: string) {
    // 1. Immediately indicate typing in Telegram header
    await this.sendChatAction(chatId, 'typing').catch(() => {});

    // 2. Keep typing heartbeat active while preparing
    let isDone = false;
    const typingHeartbeat = setInterval(() => {
      if (isDone) return;
      this.sendChatAction(chatId, 'typing').catch(() => {});
    }, 3000);

    // 3. Send initial message with animated human-like typing placeholder
    let initialMsg: any = null;
    try {
      initialMsg = await this.sendSafeHtml(
        chatId,
        `✍️ <i>AAQ Alim qələmə alır...</i> ▌`
      );
    } catch {
      // ignore
    }

    const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
    const webAppBtn = appUrl.startsWith('https://')
      ? [{ text: '🌐 İnteraktiv Veb Panel', web_app: { url: appUrl } }]
      : [];

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔵 Yeni Sual Ver', callback_data: 'nav_ai_chat' },
          { text: '🟣 Modeli Dəyiş', callback_data: 'menu_models' }
        ],
        [
          { text: '🟢 İzahlı Lüğət', callback_data: 'cmd_sozluk' },
          { text: '📜 Müdrik Hikmət', callback_data: 'cmd_sitat' }
        ],
        ...(webAppBtn.length > 0 ? [webAppBtn] : []),
        [
          { text: '📢 AAQ Rəsmi Kanalı', url: OFFICIAL_CHANNEL_URL }
        ]
      ]
    };

    let lastEditTime = 0;
    const EDIT_INTERVAL_MS = 950; // Respect Telegram's rate limit of ~1 edit/sec per message
    let lastRenderedText = '';

    try {
      const finalReply = await geminiService.generateChatReplyStream(
        userId,
        promptText,
        async (currentText: string, isFinal: boolean) => {
          if (!initialMsg || !initialMsg.message_id) return;
          const now = Date.now();

          if (isFinal) {
            // Final render: remove cursor, apply full formatting and interactive keyboard
            try {
              await this.apiCall('editMessageText', {
                chat_id: chatId,
                message_id: initialMsg.message_id,
                text: currentText,
                parse_mode: 'HTML',
                reply_markup: keyboard
              });
            } catch (err: any) {
              if (!err?.message?.includes('message is not modified')) {
                await this.sendSafeHtml(chatId, currentText, { reply_markup: keyboard }).catch(() => {});
              }
            }
          } else {
            // Progressive render with typing cursor ▌
            if (now - lastEditTime >= EDIT_INTERVAL_MS && currentText !== lastRenderedText && currentText.length > 15) {
              lastEditTime = now;
              lastRenderedText = currentText;
              try {
                await this.apiCall('editMessageText', {
                  chat_id: chatId,
                  message_id: initialMsg.message_id,
                  text: `${currentText} ▌`,
                  parse_mode: 'HTML'
                });
              } catch {
                try {
                  // Fallback for unclosed HTML tags during in-progress stream
                  await this.apiCall('editMessageText', {
                    chat_id: chatId,
                    message_id: initialMsg.message_id,
                    text: `${currentText.replace(/<[^>]*>/g, '')} ▌`
                  });
                } catch {
                  // ignore transient edit collision
                }
              }
            }
          }
        }
      );

      isDone = true;
      clearInterval(typingHeartbeat);
      return finalReply;
    } catch (err: any) {
      isDone = true;
      clearInterval(typingHeartbeat);
      if (initialMsg && initialMsg.message_id) {
        await this.apiCall('editMessageText', {
          chat_id: chatId,
          message_id: initialMsg.message_id,
          text: `⚠️ Cavab hazırlanarkən xəta baş verdi. Zəhmət olmasa bir qədər sonra yenidən cəhd edin.`
        }).catch(() => {});
      } else {
        await this.sendSafeHtml(
          chatId,
          `⚠️ Cavab hazırlanarkən xəta baş verdi. Zəhmət olmasa bir qədər sonra yenidən cəhd edin.`
        );
      }
    }
  }

  // --- GENERAL TEXT HANDLER ---
  private async handleGeneralText(
    chatId: number,
    userId: number,
    text: string,
    isGroup: boolean,
    msg: any
  ) {
    if (isGroup) {
      const isAddressed =
        this.hasBotMention(text, this.botIdentity.username) ||
        (msg.reply_to_message && msg.reply_to_message.from?.id === this.botIdentity.id);

      if (!isAddressed) return;
    }

    const cleanText = text
      .replace(new RegExp(`@${this.botIdentity.username}`, 'gi'), '')
      .trim();

    if (!cleanText) return;

    await this.streamAiReplyWithLiveStatus(chatId, userId, cleanText);
  }

  // --- DOCUMENT (PDF) HANDLER ---
  private async handleDocument(chatId: number, msg: any) {
    const doc = msg.document;
    const mimeType = doc.mime_type || '';
    const fileName = doc.file_name || 'fayl';

    const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
    const isText = mimeType.startsWith('text/') || fileName.toLowerCase().endsWith('.txt');

    if (!isPdf && !isText) {
      await this.sendSafeHtml(
        chatId,
        '📑 Zəhmət olmasa təhlil üçün <b>PDF</b> və ya <b>Mətn (.txt)</b> faylı göndərin.'
      );
      return;
    }

    const statusMsg = await this.sendSafeHtml(
      chatId,
      `⏳ <i>"${this.escapeHtml(fileName)}" faylı qəbul edildi, dərindən analiz olunur...</i>`
    );
    await this.sendChatAction(chatId, 'typing');

    try {
      const fileInfo = await this.apiCall('getFile', { file_id: doc.file_id });
      const fileUrl = `https://api.telegram.org/file/bot${this.token}/${fileInfo.file_path}`;
      const fileRes = await fetch(fileUrl);
      const arrayBuffer = await fileRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const userPrompt = msg.caption || 'Bu sənədin əsas məğzini çıxar, vacib punktları qeyd et və aydın xülasə təqdim et.';
      const analysis = await geminiService.analyzeVisionOrPdf(
        buffer,
        isPdf ? 'application/pdf' : 'text/plain',
        userPrompt
      );

      const responseText = `📄 <b>Sənəd Analizi: "${this.escapeHtml(fileName)}"</b>\n\n${analysis}\n\n🏛️ <i>AAQ - Ahl Al Qalam</i>`;

      if (statusMsg?.message_id) {
        try {
          await this.apiCall('editMessageText', {
            chat_id: chatId,
            message_id: statusMsg.message_id,
            text: responseText,
            parse_mode: 'HTML'
          });
        } catch {
          await this.sendSafeHtml(chatId, responseText);
        }
      } else {
        await this.sendSafeHtml(chatId, responseText);
      }
    } catch (err: any) {
      await this.sendSafeHtml(
        chatId,
        `❌ Sənəd analiz edilərkən xəta baş verdi: ${err?.message || err}`
      );
    }
  }

  // --- AUDIO / VOICE HANDLER ---
  private async handleAudio(chatId: number, userId: number, msg: any) {
    const audioObj = msg.voice || msg.audio;
    if (!audioObj) return;

    const statusMsg = await this.sendSafeHtml(chatId, '🎙️ <i>Səsli mesaj dinlənilir və mətnə çevrilir...</i>');
    await this.sendChatAction(chatId, 'typing');

    try {
      const fileInfo = await this.apiCall('getFile', { file_id: audioObj.file_id });
      const fileUrl = `https://api.telegram.org/file/bot${this.token}/${fileInfo.file_path}`;
      const fileRes = await fetch(fileUrl);
      const arrayBuffer = await fileRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const transcribedText = await geminiService.transcribeAudio(buffer, audioObj.mime_type || 'audio/ogg');

      if (!transcribedText) {
        await this.sendSafeHtml(chatId, '⚠️ Səsli mesajda anlaşılan nitq aşkar edilmədi.');
        return;
      }

      await this.sendSafeHtml(
        chatId,
        `🗣️ <b>Səsli Mesajınız Mətndə:</b>\n<i>"${this.escapeHtml(transcribedText)}"</i>`
      );

      // Now process as AI question
      const aiReply = await geminiService.generateChatReply(userId, transcribedText);
      await this.sendSafeHtml(chatId, `🤖 <b>Gemini AI Cavabı:</b>\n\n${aiReply}`);
    } catch (err: any) {
      await this.sendSafeHtml(chatId, `❌ Səsli mesaj emal edilə bilmədi: ${err?.message || err}`);
    }
  }

  // --- PUBLIC COMMAND HANDLERS ---
  private async handleStart(chatId: number, user: TelegramUser, isOwnerUser: boolean) {
    storage.acceptTerms(chatId);

    const config = storage.getConfig();
    const activeModelId = user.selectedModel || config.model;
    const modelDef = AVAILABLE_MODELS.find(m => m.id === activeModelId) || AVAILABLE_MODELS[0];

    const welcome = `Salam, <b>${this.escapeHtml(user.first_name || 'Dəyərli İstifadəçi')}</b>! 👋

🏛️ <b>"AAQ - Ahl Al Qalam" (AAG Əhl-ül Qələm)</b> elmi-maarif birliyinin rəsmi süni intellekt və köməkçi platformasına xoş gəlmisiniz!

📢 <b>Rəsmi Kanalımız:</b> ${OFFICIAL_CHANNEL_URL}
⚡ <b>Aktiv Gemini Modeli:</b> <b>${modelDef.name}</b>

Aşağıdakı bölmələrdən modeli dəyişə və ya əmrlərdən dərhal istifadə edə bilərsiniz:`;

    const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
    const webAppRow = appUrl.startsWith('https://')
      ? [[{ text: '🌐 İnteraktiv Veb Panel (Mini App)', web_app: { url: appUrl } }]]
      : [];

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔵 Sual Ver (/sorus)', callback_data: 'nav_ai_chat' },
          { text: '🟣 Modeli Dəyiş ⚙️', callback_data: 'menu_models' }
        ],
        [
          { text: '🟢 DİM Bələdçisi', callback_data: 'cmd_dim' },
          { text: '📘 İzahlı Lüğət', callback_data: 'cmd_sozluk' }
        ],
        [
          { text: '📜 Müdrik Sitat', callback_data: 'cmd_sitat' },
          { text: '🏛️ Tarixdə Bu Gün', callback_data: 'cmd_tarix' }
        ],
        [
          { text: '🎭 AI Xarakteri', callback_data: 'menu_roleplay' },
          { text: '🔢 Riyazi Hesabla', callback_data: 'cmd_hesabla' }
        ],
        [
          { text: '🌤️ Canlı Hava', callback_data: 'cmd_hava' },
          { text: '💡 Elmi Fakt', callback_data: 'cmd_fakt' }
        ],
        ...webAppRow,
        [
          { text: '📢 AAQ Rəsmi Kanalı', url: OFFICIAL_CHANNEL_URL },
          { text: '📞 Rəhbərliyə Müraciət', callback_data: 'menu_contact' }
        ]
      ]
    };

    await this.sendSafeHtml(chatId, welcome, { reply_markup: keyboard });
  }

  private async handleHelp(chatId: number, isOwnerUser: boolean) {
    const msg = `📖 <b>AAQ - AHL AL QALAM RƏSMİ ƏMR TƏLİMATI</b>

🏛️ <b>Təşkilat:</b> AAQ - Ahl Al Qalam (AAG Əhl-ül Qələm)
📢 <b>Rəsmi Kanal:</b> ${OFFICIAL_CHANNEL_URL}

🤖 <b>Süni İntellekt & Analiz:</b>
• <code>/sorus &lt;sual&gt;</code> — Gemini AI-dən sürətli və dəqiq cavab alın
• <code>/pdf</code> — PDF sənədlərini analiz edin və xülasə çıxarın
• <code>/model</code> — Aktiv Gemini modelini dəyişin (Gemini 3.8 Flash, 3.7 Flash, 3.1 Flash Lite...)
• <code>/roleplay</code> — AI xarakterini dəyişin (Müdrik Filosof, Proqramçı, Müəllim...)
• <code>/clear</code> — Söhbət yaddaşını təmizləyin

📚 <b>Təhsil & Elm:</b>
• <code>/sozluk &lt;söz&gt;</code> — Sözün leksik mənası, etimologiyası və izahı
• <code>/hesabla &lt;misal&gt;</code> — Riyazi hesablamaları və tənlikləri addım-addım həll edir
• <code>/dim</code> — DİM imtahan qrupları, ballar və rəsmi xidmətlər
• <code>/sitat</code> — Dahi şəxsiyyətlərdən (Nizami, Füzuli, Şəhriyar, Nəsimi, Sokrat...) təsdiq olunmuş kəlamlar
• <code>/tarix</code> — Tarixdə bu gün baş vermiş mühüm hadisələr
• <code>/fakt</code> — Elmi faktlar
• <code>/quiz</code> — İnteraktiv bilik viktorinası

🛠️ <b>Faydalı Alətlər:</b>
• <code>/hava &lt;şəhər&gt;</code> — Şəhərin canlı hava göstəriciləri və proqnozu
• <code>/tercume &lt;mətn&gt;</code> — Səlis xarici dil tərcüməsi
• <code>/xulas &lt;mətn&gt;</code> — Uzun mətni qısa xülasəyə çevirir
• <code>/sozlesme</code> — Rəsmi gizlilik və istifadə qaydaları
• <code>/elaqe &lt;mesajınız&gt;</code> — AAQ Rəhbərliyinə birbaşa müraciət`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔵 Sual Ver (/sorus)', callback_data: 'nav_ai_chat' },
          { text: '🟣 Modeli Seç', callback_data: 'menu_models' }
        ],
        [
          { text: '🟢 DİM Bələdçisi', callback_data: 'cmd_dim' },
          { text: '📘 İzahlı Lüğət', callback_data: 'cmd_sozluk' }
        ],
        [
          { text: '📜 Müdrik Sitat', callback_data: 'cmd_sitat' },
          { text: '💡 Elmi Fakt', callback_data: 'cmd_fakt' }
        ],
        [
          { text: '📢 AAQ Rəsmi Kanalı', url: OFFICIAL_CHANNEL_URL },
          { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
        ]
      ]
    };

    await this.sendSafeHtml(chatId, msg, { reply_markup: keyboard });
  }

  private async showPolicy(chatId: number, canEdit: boolean = false) {
    const policy = storage.getConfig().policyText || DEFAULT_POLICY;
    let text = policy;
    if (canEdit) {
      text += '\n\n✏️ <i>Rəhbər: Dəyişmək üçün <code>/sozlesmeyaz &lt;yeni mətn&gt;</code> istifadə edin.</i>';
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📢 AAQ Rəsmi Kanalı', url: OFFICIAL_CHANNEL_URL },
          { text: '📞 Rəhbərliyə Yaz', callback_data: 'menu_contact' }
        ],
        [
          { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
        ]
      ]
    };

    await this.sendSafeHtml(chatId, text, { reply_markup: keyboard });
  }

  private async handleFakt(chatId: number) {
    const randomIndex = Math.floor(Math.random() * FACTS.length);
    const fact = FACTS[randomIndex];

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔄 Başqa Fakt Göstər', callback_data: 'cmd_fakt' },
          { text: '🧠 Viktorina', callback_data: 'cmd_quiz' }
        ],
        [
          { text: '📢 AAQ Kanalı', url: OFFICIAL_CHANNEL_URL },
          { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
        ]
      ]
    };

    await this.sendSafeHtml(chatId, `💡 <b>Maraqlı Elmi Fakt:</b>\n\n${fact}`, {
      reply_markup: keyboard
    });
  }

  private async handleSitat(chatId: number) {
    const randomIndex = Math.floor(Math.random() * REAL_HISTORICAL_QUOTES.length);
    const quote = REAL_HISTORICAL_QUOTES[randomIndex];

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔄 Başqa Hikmət', callback_data: 'cmd_sitat' },
          { text: '🔍 Çatda Paylaş', switch_inline_query: 'sitat' }
        ],
        [
          { text: '📢 AAQ Kanalı', url: OFFICIAL_CHANNEL_URL },
          { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
        ]
      ]
    };

    await this.sendSafeHtml(
      chatId,
      `📜 <b>Dahi Şəxsiyyətlərdən Hikmət Xəzinəsi:</b>\n\n<i>"${this.escapeHtml(quote.text)}"</i>\n\n✍️ <b>Müəllif:</b> ${this.escapeHtml(quote.author)}\n🏛️ <b>Əsər / Dövr:</b> ${this.escapeHtml(quote.era)}\n\n✨ <i>Təqdim edir: AAQ - Ahl Al Qalam</i>`,
      { reply_markup: keyboard }
    );
  }

  private async handleDim(chatId: number) {
    const dimGuide = `📚 <b>DÖVLƏT İMTAHAN MƏRKƏZİ (DİM) QƏBUL BƏLƏDÇİSİ</b>

Bu bələdçi <b>AAQ - Ahl Al Qalam</b> tərəfindən abituriyentlərə və tələbələrə dəstək üçün hazırlanmışdır.

🎯 <b>İxtisas Qrupları və Fənlər:</b>
• <b>I Qrup:</b> Riyaziyyat, Fizika, Kimya / İnformatika (Mühəndislik, IT, Riyaziyyat)
• <b>II Qrup:</b> Riyaziyyat, Coğrafiya, Tarix (İqtisadiyyat, Menecment, Maliyyə)
• <b>III Qrup:</b> Azərbaycan dili, Tarix, Ədəbiyyat / Coğrafiya (Hüquq, Filologiya, Pedaqogika, Jurnalistika)
• <b>IV Qrup:</b> Biologiya, Kimya, Fizika (Tibb, Əczaçılıq, Ekologiya)
• <b>V Qrup:</b> Qabiliyyət tələb edən ixtisaslar (İncəsənət, İdman, Memarlıq)

🔗 <b>DİM Elektron Xidmətləri:</b>
• Şəxsi Kabinet: <code>eservices.dim.gov.az</code>
• İmtahan Nəticələri: <code>dim.gov.az/results</code>

💡 <i>İxtisaslar və ya suallar barədə <code>/sorus [sualınız]</code> yaza bilərsiniz!</i>`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌐 DİM Rəsmi Portalı', url: 'https://dim.gov.az' },
          { text: '🎯 Şəxsi Kabinet', url: 'https://eservices.dim.gov.az' }
        ],
        [
          { text: '📢 AAQ Kanalı', url: OFFICIAL_CHANNEL_URL },
          { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
        ]
      ]
    };

    await this.sendSafeHtml(chatId, dimGuide, { reply_markup: keyboard });
  }

  private async handlePdfInstruction(chatId: number, isGroup: boolean = false) {
    if (isGroup) {
      await this.sendSafeHtml(
        chatId,
        `📑 <b>PDF Analiz Xidməti:</b>\n\nQrupda sənəd və bildiriş sıxlığının qarşısını almaq üçün PDF analiz funksiyası yalnız <b>Şəxsi Çatda (DM)</b> aktivdir.\n\n👉 Botun özünə (@${this.botIdentity.username || 'bot'}) şəxsi mesajda PDF faylınızı göndərərək dərhal xülasə və analiz ala bilərsiniz!`
      );
      return;
    }

    const text = `📑 <b>PDF SƏNƏD ANALİZİ VƏ XÜLASƏ ÇIXARILMASI</b>

Botumuza istənilən PDF və ya mətn sənədini göndərərək aşağıdakı əməliyyatları apara bilərsiniz:

1. 📄 <b>PDF Xülasəsi:</b> Sənədi bu çata göndərin, bot məzmunu oxuyub əsas tezisləri çıxarsın.
2. ❓ <b>Sənəd üzrə Sual-Cavab:</b> PDF faylını göndərərkən (caption-da) sənədin içindəki mövzular barədə sualınızı qeyd edin.
3. 📝 <b>Bölmə Analizi:</b> PDF-in müəyyən fəsillərinin izahını tələb edin.

👉 <i>İndi PDF faylını bu çata birbaşa göndərə bilərsiniz!</i>`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📢 AAQ Kanalı', url: OFFICIAL_CHANNEL_URL },
          { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
        ]
      ]
    };

    await this.sendSafeHtml(chatId, text, { reply_markup: keyboard });
  }

  private async handleInfo(chatId: number, msg: any, isGroup: boolean) {
    if (isGroup) {
      const chat = msg.chat;
      const text = `ℹ️ <b>QRUP MƏLUMATI</b>\n\n🏷️ <b>Qrup Adı:</b> ${this.escapeHtml(chat.title || '')}\n🆔 <b>Chat ID:</b> <code>${chat.id}</code>\n👥 <b>Növ:</b> ${chat.type}\n🛡️ <b>Qoruma:</b> Aktiv (Anti-Söyüş, Anti-Link, Anti-Spam)`;
      await this.sendSafeHtml(chatId, text);
    } else {
      const config = storage.getConfig();
      const user = storage.getUser(msg.from?.id);
      const modelDef = AVAILABLE_MODELS.find(m => m.id === (user?.selectedModel || config.model)) || AVAILABLE_MODELS[0];

      const text = `ℹ️ <b>BOT KİMLİYİ VƏ MƏLUMAT</b>\n\n🤖 <b>Ad:</b> @${this.botIdentity.username}\n🏛️ <b>Təşkilat:</b> AAQ - Ahl Al Qalam\n📢 <b>Rəsmi Kanal:</b> ${OFFICIAL_CHANNEL_URL}\n⚡ <b>Aktiv Model:</b> <b>${modelDef.name}</b>\n🟢 <b>Status:</b> 24/7 Oyaq və Fasiləsiz`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '📄 Qaydalar', callback_data: 'cmd_policy' },
            { text: '📞 Əlaqə', callback_data: 'menu_contact' }
          ],
          [
            { text: '📢 AAQ Kanalı', url: OFFICIAL_CHANNEL_URL },
            { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
          ]
        ]
      };

      await this.sendSafeHtml(chatId, text, { reply_markup: keyboard });
    }
  }

  private async showGroupRules(chatId: number) {
    const rules = storage.getGroupRules(chatId);
    if (rules) {
      await this.sendSafeHtml(chatId, `📜 <b>QRUP QAYDALARI:</b>\n\n${this.escapeHtml(rules)}`);
    } else {
      await this.sendSafeHtml(
        chatId,
        'ℹ️ Bu qrup üçün xüsusi qaydalar hələ qeyd edilməyib.\nAdminlər <code>/qayda &lt;mətn&gt;</code> ilə qayda təyin edə bilər.'
      );
    }
  }

  private async handleAktivlik(chatId: number, isGroup: boolean) {
    const users = storage.getAllUsers();
    const groups = storage.getAllGroups();
    const keepAlive = keepAliveService.getStatus();

    const text = `📊 <b>SİSTEM VƏ AKTİVLİK STATİSTİKASI</b>

👥 <b>Qeydiyyatlı İstifadəçilər:</b> ${users.length} nəfər
🏛️ <b>Fəal Qruplar:</b> ${groups.length} qrup
⏱️ <b>Uptime:</b> ${Math.floor(keepAlive.uptimeSeconds / 60)} dəqiqə
💓 <b>Keep-Alive Nabız:</b> ${keepAlive.totalPings} uğurlu ping
🟢 <b>Server Vəziyyəti:</b> Aktiv & 24/7 Fasiləsiz`;

    await this.sendSafeHtml(chatId, text);
  }

  private async handleUmumi(chatId: number) {
    const fullText = `🌟 <b>Günün İntellektual Xülasəsi:</b>\n\n"Hər bir qaranlığı maarifin və elmin nuru ilə aydınlatmaq mümkündür. İnsanın ən böyük sərmayəsi oxuduğu kitablar, qazandığı hikmət və cəmiyyətə bəxş etdiyi xeyirxahlıqdır."\n\n🏛️ <i>AAQ - Ahl Al Qalam Maarif Mərkəzi</i>`;
    await this.sendSafeHtml(chatId, fullText);
  }



  private async handleNewMembers(chatId: number, newMembers: any[]) {
    for (const m of newMembers) {
      if (m.is_bot && m.id === this.botIdentity.id) {
        await this.sendSafeHtml(
          chatId,
          `Salam hamıya! 👋 Mən <b>"AAQ - Ahl Al Qalam"</b> tərəfindən hazırlanmış köməkçi və moderasiya botuyam.\n📢 Rəsmi kanal: ${OFFICIAL_CHANNEL_URL}\nQaydalar üçün <code>/qayda</code> yaza bilərsiniz.`
        );
      } else {
        const name = this.getUserName(m);
        await this.sendSafeHtml(
          chatId,
          `Xoş gəldin, <b>${this.escapeHtml(name)}</b>! 🎉\nQrup qaydaları ilə tanış olmaq üçün <code>/qayda</code> yazın.`
        );
      }
    }
  }

  private async handleTagAll(chatId: number) {
    await this.sendSafeHtml(
      chatId,
      '📢 <b>Diqqət bütün qrup üzvləri!</b> 📢\n\nAdmin tərəfindən hamı söhbətə dəvət olunur. Zəhmət olmasa aktiv olun! ✨'
    );
  }

  private async handleAnaliz(chatId: number) {
    const fullText = `📊 <b>AAQ Qrup Analizi:</b>\n\nQrupda müsbət intellektual mühit müşahidə olunur. Üzvlərin elm və müzakirələrdə aktivliyi tövsiyə edilir.\n\n🏛️ <i>AAQ - Ahl Al Qalam</i>`;
    await this.sendSafeHtml(chatId, fullText);
  }

  private async handleSorus(chatId: number, userId: number, text: string) {
    const query = text.replace(/^\/(sorus|sual)\s*/i, '').trim();
    if (!query) {
      await this.sendSafeHtml(chatId, 'Zəhmət olmasa sualınızı qeyd edin.\nNümunə: <code>/sorus Kvant fizikası nədir?</code>');
      return;
    }

    await this.streamAiReplyWithLiveStatus(chatId, userId, query);
  }

  private async handleQuiz(chatId: number) {
    const quizText = `🧠 <b>Günün Viktorinası:</b>

❓ <i>"Leyli və Məcnun" Şərqdə və İslam dünyasında ilk opera hansı bəstəkar tərəfindən və neçənci ildə yazılmışdır?</i>

A) Qara Qarayev (1915)
B) Üzeyir Hacıbəyli (1908)
C) Müslüm Maqomayev (1912)
D) Fikrət Əmirov (1920)

💡 <i>Doğru cavab: <b>B) Üzeyir Hacıbəyli (1908)</b> — 12 yanvar 1908-ci ildə Bakıda tamaşaya qoyulmuşdur.</i>`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔄 Başqa Viktorina', callback_data: 'cmd_quiz' },
          { text: '💡 Maraqlı Fakt', callback_data: 'cmd_fakt' }
        ],
        [
          { text: '📢 AAQ Kanalı', url: OFFICIAL_CHANNEL_URL },
          { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
        ]
      ]
    };

    await this.sendSafeHtml(chatId, quizText, { reply_markup: keyboard });
  }

  private async handleTercume(chatId: number, text: string) {
    const query = text.replace(/^\/(tercume|tərcümə)\s*/i, '').trim();
    if (!query) {
      await this.sendSafeHtml(chatId, 'Zəhmət olmasa tərcümə olunacaq mətni daxil edin.\nNümunə: <code>/tercume Welcome to our scientific community</code>');
      return;
    }

    await this.sendChatAction(chatId, 'typing');
    const translation = await geminiService.quickPrompt(
      `Aşağıdakı mətni ən səlis və peşəkar formada Azərbaycan dilinə tərcümə et:\n"${query}"`
    );

    const fullText = `🌍 <b>Tərcümə:</b>\n\n${translation}\n\n🏛️ <i>AAQ - Ahl Al Qalam</i>`;
    await this.sendSafeHtml(chatId, fullText);
  }

  private async handleXulas(chatId: number, text: string) {
    const query = text.replace(/^\/(xulas|xülasə)\s*/i, '').trim();
    if (!query) {
      await this.sendSafeHtml(chatId, 'Zəhmət olmasa xülasə ediləcək mətni daxil edin.\nNümunə: <code>/xulas [uzun mətn]</code>');
      return;
    }

    await this.sendChatAction(chatId, 'typing');
    const summary = await geminiService.quickPrompt(
      `Aşağıdakı mətni əsas tezislərlə qısa, aydın və oxunaqlı şəkildə xülasə et:\n"${query}"`
    );

    const fullText = `📝 <b>Qısa Xülasə:</b>\n\n${summary}\n\n🏛️ <i>AAQ - Ahl Al Qalam</i>`;
    await this.sendSafeHtml(chatId, fullText);
  }

  // --- /hesabla FUNCTION ---
  private async handleHesabla(chatId: number, text: string) {
    const query = text.replace(/^\/hesabla\s*/i, '').trim();
    if (!query) {
      await this.sendSafeHtml(
        chatId,
        '🔢 <b>Riyazi Hesablama Xidməti</b>\n\nZəhmət olmasa riyazi ifadə və ya tənliyi daxil edin.\nNümunələr:\n• <code>/hesabla (145 * 24) / 12 + 5^3</code>\n• <code>/hesabla 2x + 5 = 25</code>\n• <code>/hesabla 15% * 450</code>\n• <code>/hesabla sqrt(144) + 25</code>'
      );
      return;
    }

    // Solve via safe math engine first
    const mathRes = solveMathExpression(query);

    if (mathRes.success && mathRes.steps) {
      const fullText = `🔢 <b>Riyazi Hesablama Nəticəsi:</b>\n\n${mathRes.steps.join('\n')}\n\n✅ <b>Nəticə:</b> <code>${mathRes.result}</code>\n\n🏛️ <i>AAQ - Ahl Al Qalam</i>`;
      await this.sendSafeHtml(chatId, fullText);
      return;
    }

    // If symbolic or word problem, solve with Gemini
    await this.sendChatAction(chatId, 'typing');
    const result = await geminiService.quickPrompt(
      `Riyazi tapşırıq: "${query}". Dəqiq hesabla, addım-addım həll yolunu izah et və yekun cavabı ver.`
    );
    const fullText = `🔢 <b>Riyazi Hesablama Nəticəsi:</b>\n\n${result}\n\n🏛️ <i>AAQ - Ahl Al Qalam</i>`;
    await this.sendSafeHtml(chatId, fullText);
  }

  // --- /sozluk FUNCTION ---
  private async handleSozluk(chatId: number, text: string) {
    const query = text.replace(/^\/(sozluk|sözlük)\s*/i, '').trim();
    if (!query) {
      await this.sendSafeHtml(
        chatId,
        '📖 <b>Azərbaycan İzahlı Lüğəti</b>\n\nZəhmət olmasa axtardığınız sözü qeyd edin.\nNümunə: <code>/sozluk maarif</code> və ya <code>/sozluk intellekt</code>'
      );
      return;
    }

    // Check local high-precision dictionary first
    const localDef = lookupWord(query);
    if (localDef) {
      const fullText = `📖 <b>Azərbaycan İzahlı Lüğəti: "${localDef.word}"</b>

📌 <b>Mənası:</b> ${localDef.meaning}
🏛️ <b>Etimologiyası:</b> ${localDef.etymology}
🏷️ <b>Nitq Hissəsi:</b> ${localDef.partOfSpeech}
🔄 <b>Sinonimləri:</b> ${localDef.synonyms.join(', ') || 'Qeyd edilməyib'}
↔️ <b>Antonimləri:</b> ${localDef.antonyms.join(', ') || 'Qeyd edilməyib'}
✍️ <b>Nümunə:</b> <i>"${localDef.example}"</i>

🏛️ <i>AAQ - Ahl Al Qalam Maarif Mərkəzi</i>`;
      await this.sendSafeHtml(chatId, fullText);
      return;
    }

    // Fallback to Gemini
    await this.sendChatAction(chatId, 'typing');
    const prompt = `"${query}" sözü üçün Azərbaycan dilinin izahlı lüğətinə uyğun məlumat hazırla:
1. Mənası və izahı
2. Etimologiyası
3. Sinonimləri və Antonimləri
4. Nümunə cümlə.`;

    const def = await geminiService.quickPrompt(prompt);
    const fullText = `📖 <b>Azərbaycan İzahlı Lüğəti ("${this.escapeHtml(query)}"):</b>\n\n${def}\n\n🏛️ <i>AAQ - Ahl Al Qalam</i>`;
    await this.sendSafeHtml(chatId, fullText);
  }

  // --- /hava FUNCTION ---
  private async handleHava(chatId: number, text: string) {
    const cityName = text.replace(/^\/hava\s*/i, '').trim() || 'Bakı';

    let liveData = null;
    try {
      const weatherUrl = `https://wttr.in/${encodeURIComponent(cityName)}?format=j1`;
      const res = await fetch(weatherUrl, { headers: { 'User-Agent': 'AAQ-Bot' } });
      if (res.ok) {
        const data = (await res.json()) as any;
        const current = data.current_condition?.[0];
        if (current) {
          liveData = {
            temp: current.temp_C,
            feelsLike: current.FeelsLikeC,
            humidity: current.humidity,
            wind: current.windspeedKmph,
            desc: current.weatherDesc?.[0]?.value || 'Mülayim'
          };
        }
      }
    } catch {}

    if (liveData) {
      const fullText = `🌤️ <b>CANLI HAVA PROQNOZU: ${this.escapeHtml(cityName.toUpperCase())}</b>

🌡️ <b>Temperatur:</b> ${liveData.temp}°C
🌡️ <b>Hiss edilən:</b> ${liveData.feelsLike}°C
💧 <b>Rütubət:</b> ${liveData.humidity}%
💨 <b>Külək:</b> ${liveData.wind} km/saat
☁️ <b>Hava şəraiti:</b> ${this.escapeHtml(liveData.desc)}

💡 <b>Tövsiyə:</b> Günün hava göstəricilərinə uyğun geyinmək və açıq havada fəaliyyət zamanı hava durumunu nəzərə almaq tövsiyə olunur.

🏛️ <i>AAQ - Ahl Al Qalam Canlı Məlumat Sistemi</i>`;

      await this.sendSafeHtml(chatId, fullText);
    } else {
      const fullText = `🌤️ <b>HAVA MƏLUMATI: ${this.escapeHtml(cityName.toUpperCase())}</b>\n\n${cityName} şəhərində mülayim hava şəraiti müşahidə olunur.\n\n🏛️ <i>AAQ - Ahl Al Qalam</i>`;
      await this.sendSafeHtml(chatId, fullText);
    }
  }

  // --- /tarix FUNCTION ---
  private async handleTarix(chatId: number) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('az-AZ', {
      timeZone: 'Asia/Baku',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const events = getTodayHistoricalEvents();

    const eventLines = events.map(e => `• <b>${e.year}:</b> ${e.title} — <i>${e.description}</i>`).join('\n\n');

    const fullText = `📜 <b>TARİXDƏ BU GÜN — ${dateStr.toUpperCase()}</b>

${eventLines}

🏛️ <i>AAQ - Ahl Al Qalam Tarix Xəzinəsi</i>`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📜 Müdrik Sitat', callback_data: 'cmd_sitat' },
          { text: '💡 Maraqlı Fakt', callback_data: 'cmd_fakt' }
        ],
        [
          { text: '📢 AAQ Kanalı', url: OFFICIAL_CHANNEL_URL },
          { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
        ]
      ]
    };

    await this.sendSafeHtml(chatId, fullText, { reply_markup: keyboard });
  }

  // --- ADMIN PANEL & MANAGEMENT ---
  private async handleOwnerPanel(chatId: number) {
    const users = storage.getAllUsers();
    const groups = storage.getAllGroups();
    const tickets = storage.getContactTickets();
    const pendingTickets = tickets.filter(t => t.status === 'pending');
    const blockedUsers = storage.getBlockedUsers();

    const text = `👑 <b>AAQ RƏHBƏRLİK VƏ İDARƏETMƏ PANELİ</b>

👥 <b>Toplam İstifadəçilər:</b> ${users.length} nəfər
🏛️ <b>Qoşulu Qruplar:</b> ${groups.length} qrup
🚫 <b>Blokda Olanlar:</b> ${blockedUsers.length} nəfər
📩 <b>Gözləyən Müraciətlər (Tickets):</b> ${pendingTickets.length} ədəd

🛠️ <b>Rəhbər & Admin Əmrləri:</b>
📢 <b>Elan Sistemi:</b>
• <code>/elan &lt;mesaj&gt;</code> — Həm qruplara, həm istifadəçilərə elan
• <code>/elan qrup &lt;mesaj&gt;</code> — Yalnız qruplara rəsmi elan
• <code>/elan user &lt;mesaj&gt;</code> — Yalnız fərdi istifadəçilərə elan

👥 <b>İstifadəçi İdarəetməsi:</b>
• <code>/users</code> — İstifadəçi siyahısı
• <code>/user &lt;id/@username&gt;</code> — İstifadəçi haqqında tam məlumat
• <code>/axtar &lt;ad/@username&gt;</code> — İstifadəçi axtarışı
• <code>/blok &lt;id/@username&gt; -[gün] -[səbəb]</code> — İstifadəçini müddətli/müddətsiz blokla (istifadəçiyə bildiriş göndərilir)
• <code>/blokac &lt;id/@username&gt;</code> — Bloku öncədən ləğv et (istifadəçiyə bildiriş göndərilir)
• <code>/bloklar</code> — Blok siyahısı və bitmə tarixləri

💬 <b>Əlaqə & Mesaj:</b>
• <code>/msg &lt;userId&gt; &lt;mesaj&gt;</code> — Şəxsi mesaj
• <code>/cavab &lt;ticketId&gt; &lt;cavab&gt;</code> — Müraciətə cavab
• <code>/qruplar</code> — Botun fəal olduğu canlı qruplar
• <code>/sozlesmeyaz &lt;mətn&gt;</code> — Gizlilik sazişini yenilə (AI dərhal məlumatlanır)`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: `📩 Müraciətlər (${pendingTickets.length})`, callback_data: 'admin_tickets' },
          { text: `👥 Qruplar (${groups.length})`, callback_data: 'admin_groups' }
        ],
        [
          { text: `👥 İstifadəçilər (${users.length})`, callback_data: 'admin_users_list' },
          { text: `🚫 Bloklar (${blockedUsers.length})`, callback_data: 'admin_blocklist' }
        ],
        [
          { text: '📢 Kütləvi Elan Göndər', callback_data: 'admin_broadcast_prompt' },
          { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
        ]
      ]
    };

    await this.sendSafeHtml(chatId, text, { reply_markup: keyboard });
  }

  private async handleElanCommand(chatId: number, msg: any) {
    const formattedBody = this.extractFormattedHtml(msg, /^\/elan\s*/i);
    if (!formattedBody) {
      this.pendingAdminElan.set(chatId, true);
      const keyboard = {
        inline_keyboard: [
          [
            { text: '❌ Ləğv et', callback_data: 'admin_cancel_action' },
            { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
          ]
        ]
      };
      await this.sendSafeHtml(
        chatId,
        `📢 <b>KÜTLƏVİ ELAN HAZIRLIĞI</b>\n\nZəhmət olmasa elan mətnini yazın və göndərin.\n<i>(Telegram-da sözlərə link, qalın, kursiv yazı və s. formatlar əlavə edə bilərsiniz).</i>\n\nMesajı göndərdikdən sonra çatdırılma hədəfini (Hamıya, Qruplara, İstifadəçilərə) düymələrlə seçəcəksiniz.`,
        { reply_markup: keyboard }
      );
      return;
    }

    await this.promptElanTargetSelection(chatId, formattedBody);
  }

  private async handleGroupList(chatId: number) {
    const groups = storage.getAllGroups();
    if (groups.length === 0) {
      await this.sendSafeHtml(chatId, 'ℹ️ Bot hələ heç bir qrupa əlavə edilməyib.');
      return;
    }

    let text = `👥 <b>BOTUN YERLƏŞDİYİ CANLI QRUPLAR (${groups.length}):</b>\n\n`;
    groups.slice(0, 25).forEach((g, idx) => {
      text += `${idx + 1}. <b>${this.escapeHtml(g.title)}</b>\n🆔 ID: <code>${g.id}</code> | Növ: ${g.type} | Mesajlar: ${g.messageCount || 1}\nSon aktivlik: ${new Date(g.lastActive).toLocaleString('az-AZ')}\n\n`;
    });

    await this.sendSafeHtml(chatId, text);
  }

  private async handleUserList(chatId: number) {
    const users = storage.getAllUsers();
    if (users.length === 0) {
      await this.sendSafeHtml(chatId, 'ℹ️ Qeydiyyatda istifadəçi yoxdur.');
      return;
    }

    let text = `👥 <b>İSTİFADƏÇİ SİYAHISI (Son ${Math.min(15, users.length)} nəfər / Toplam ${users.length}):</b>\n\n`;
    users.slice(0, 15).forEach((u, idx) => {
      const blockCheck = storage.isUserBlocked(u.id);
      const statusBadge = blockCheck.isBlocked ? '⛔ BLOKLU' : '🟢 Aktiv';
      text += `${idx + 1}. <b>${this.escapeHtml(u.first_name || 'İstifadəçi')}</b> ${u.last_name ? this.escapeHtml(u.last_name) : ''} (@${u.username || 'yoxdur'})\n🆔 ID: <code>${u.id}</code> | Mesaj: ${u.messageCount || 1} | ${statusBadge}\nSon aktivlik: ${new Date(u.lastSeen).toLocaleString('az-AZ')}\n\n`;
    });

    text += `👉 <i>Ətraflı məlumat üçün: <code>/user &lt;userId və ya @username&gt;</code></i>`;
    await this.sendSafeHtml(chatId, text);
  }

  private async handleUserDetail(chatId: number, query: string) {
    if (!query) {
      await this.sendSafeHtml(chatId, 'İstifadə: <code>/user &lt;userId və ya @username&gt;</code>\nNümunə: <code>/user 123456789</code> və ya <code>/user @username</code>');
      return;
    }

    const user = storage.findUser(query);
    if (!user) {
      await this.sendSafeHtml(chatId, `❌ "${this.escapeHtml(query)}" üzrə istifadəçi tapılmadı.`);
      return;
    }

    const blockCheck = storage.isUserBlocked(user.id);
    const modelDef = AVAILABLE_MODELS.find(m => m.id === user.selectedModel) || AVAILABLE_MODELS[0];
    const persona = ROLEPLAY_PERSONAS.find(p => p.id === user.roleplayPersona) || ROLEPLAY_PERSONAS[0];

    let infoText = `👤 <b>İSTİFADƏÇİ PROFİLİ VƏ MƏLUMATLARI</b>

🏷️ <b>Ad və Soyad:</b> ${this.escapeHtml(user.first_name || '')} ${this.escapeHtml(user.last_name || '')}
🌐 <b>Username:</b> ${user.username ? `@${user.username}` : 'Yoxdur'}
🆔 <b>Telegram User ID:</b> <code>${user.id}</code>
📊 <b>Ümumi Mesaj Sayı:</b> ${user.messageCount || 1}
⚡ <b>Seçdiyi AI Modeli:</b> ${modelDef.name}
🎭 <b>Seçdiyi AI Rolu:</b> ${persona.icon} ${persona.name}
📜 <b>Qaydaları Qəbul Edib:</b> ${user.acceptedTerms ? '✅ Bəli' : '⏳ Gözləyir'}
📅 <b>İlk Giriş:</b> ${new Date(user.firstSeen).toLocaleString('az-AZ')}
⏱️ <b>Son Aktivlik:</b> ${new Date(user.lastSeen).toLocaleString('az-AZ')}

🛡️ <b>Təhlükəsizlik Statusu:</b> ${blockCheck.isBlocked ? '⛔ <b>BLOKLANIB</b>' : '🟢 <b>Aktiv (İcazəli)</b>'}`;

    if (blockCheck.isBlocked) {
      infoText += `\n📝 <b>Blok Səbəbi:</b> ${this.escapeHtml(blockCheck.reason || 'Qaydaların pozulması')}`;
      infoText += `\n⏳ <b>Blok Bitmə Tarixi:</b> ${blockCheck.until ? new Date(blockCheck.until).toLocaleString('az-AZ') : 'Daimi (Müddətsiz)'}`;
    }

    infoText += `\n\n👉 <i>Əməliyyatlar:</i>\n• Bloklamaq: <code>/blok ${user.id} -[gün] -[səbəb]</code>\n• Bloku açmaq: <code>/blokac ${user.id}</code>\n• Mesaj yazmaq: <code>/msg ${user.id} [mesaj]</code>`;

    await this.sendSafeHtml(chatId, infoText);
  }

  private async handleUserSearch(chatId: number, query: string) {
    if (!query) {
      await this.sendSafeHtml(chatId, 'İstifadə: <code>/axtar &lt;ad və ya @username&gt;</code>');
      return;
    }
    const clean = query.replace(/^@/, '').toLowerCase();
    const matches = storage.getAllUsers().filter(u => 
      (u.username && u.username.toLowerCase().includes(clean)) ||
      (u.first_name && u.first_name.toLowerCase().includes(clean)) ||
      (u.last_name && u.last_name.toLowerCase().includes(clean)) ||
      String(u.id).includes(clean)
    );

    if (matches.length === 0) {
      await this.sendSafeHtml(chatId, `🔍 "${this.escapeHtml(query)}" üzrə heç bir istifadəçi tapılmadı.`);
      return;
    }

    let text = `🔍 <b>AXTARIŞ NƏTİCƏLƏRİ (${matches.length}):</b>\n\n`;
    matches.slice(0, 10).forEach((u, idx) => {
      const blockCheck = storage.isUserBlocked(u.id);
      text += `${idx + 1}. <b>${this.escapeHtml(u.first_name || '')}</b> (@${u.username || 'yoxdur'})\n🆔 ID: <code>${u.id}</code>${blockCheck.isBlocked ? ' ⛔ BLOKLU' : ''}\n\n`;
    });
    text += `👉 <i>Profilə baxmaq üçün: <code>/user &lt;id&gt;</code></i>`;
    await this.sendSafeHtml(chatId, text);
  }

  private async handleBlockUser(chatId: number, arg: string) {
    if (!arg || !arg.trim()) {
      await this.sendSafeHtml(
        chatId,
        `🚫 <b>İstifadəçini Bloklama Qaydası:</b>

• <b>Müddətli və Səbəbli:</b>
<code>/blok 123456789 -3 -Qaydaları pozdu</code> (3 günlük blok)

• <b>Müddətsiz və Səbəbli:</b>
<code>/blok 123456789 -Təhqiramiz davranış</code>

• <b>Username ilə:</b>
<code>/blok @username -7 -Spam göndərdi</code>`
      );
      return;
    }

    // Parse input
    // Formats supported:
    // /blok 123456 -3 -Qaydaları pozdu
    // /blok 123456 3 Qaydaları pozdu
    // /blok 123456 -Səbəb
    // /blok @username -5 -Səbəb
    const tokens = arg.trim().split(/\s+/);
    const targetQuery = tokens[0];
    const rest = tokens.slice(1).join(' ');

    const targetUser = storage.findUser(targetQuery);
    if (!targetUser) {
      await this.sendSafeHtml(chatId, `❌ "${this.escapeHtml(targetQuery)}" ID və ya username-li istifadəçi tapılmadı.`);
      return;
    }

    let days: number | undefined = undefined;
    let reason = 'Qaydaların pozulması';

    if (rest) {
      // Check for -days pattern or direct number
      const daysMatch = rest.match(/^-?([0-9]+)\b/);
      if (daysMatch) {
        days = parseInt(daysMatch[1], 10);
        const reasonPart = rest.replace(/^-?[0-9]+\b/, '').trim();
        reason = reasonPart.replace(/^-+/, '').trim() || 'Qaydaların pozulması';
      } else {
        reason = rest.replace(/^-+/, '').trim() || 'Qaydaların pozulması';
      }
    }

    const updated = storage.blockUser(targetUser.id, reason, days);
    if (updated) {
      storage.addLog(
        'moderation',
        `İstifadəçi bloklandı: [${targetUser.id} - ${targetUser.first_name}]. Müddət: ${days ? `${days} gün` : 'Daimi'}, Səbəb: ${reason}`
      );

      // 1. Notify Admin
      const expiryStr = days ? `\n⏳ <b>Blokun Bitmə Tarixi:</b> ${new Date(Date.now() + days * 86400000).toLocaleString('az-AZ')}` : '';
      await this.sendSafeHtml(
        chatId,
        `✅ <b>İstifadəçi uğurla bloklandı!</b>

👤 <b>İstifadəçi:</b> ${this.escapeHtml(targetUser.first_name || '')} (@${targetUser.username || 'yoxdur'})
🆔 <b>User ID:</b> <code>${targetUser.id}</code>
📅 <b>Müddət:</b> ${days ? `${days} gün` : 'Daimi (Müddətsiz)'}${expiryStr}
📝 <b>Səbəb:</b> ${this.escapeHtml(reason)}
📩 <b>İstifadəçiyə bildiriş:</b> Çatdırıldı`
      );

      // 2. Direct Notification to Blocked User in Telegram
      try {
        const userNotice = `⛔ <b>DİQQƏT: BOTDAN İSTİFADƏNİZ MƏHDUDLAŞDIRILDI</b>

Hörmətli istifadəçi, botdan istifadə hüququnuz AAQ Rəhbərliyi tərəfindən məhdudlaşdırıldı.

📝 <b>Bloklanma Səbəbi:</b> ${this.escapeHtml(reason)}
📅 <b>Tətbiq Edilən Müddət:</b> ${days ? `${days} gün` : 'Daimi (Müddətsiz)'}${days ? `\n⏳ <b>Blokun Açılma Tarixi:</b> ${new Date(Date.now() + days * 86400000).toLocaleString('az-AZ')}` : ''}

🏛️ <i>Məlumat və müraciət üçün: ${OFFICIAL_CHANNEL_URL}</i>`;

        await this.sendSafeHtml(targetUser.id, userNotice);
      } catch (userErr) {
        // user might have blocked bot
      }
    }
  }

  private async handleUnblockUser(chatId: number, arg: string) {
    if (!arg || !arg.trim()) {
      await this.sendSafeHtml(chatId, 'İstifadə: <code>/blokac &lt;userId və ya @username&gt;</code>\nNümunə: <code>/blokac 123456789</code> və ya <code>/blokac @username</code>');
      return;
    }

    const targetUser = storage.findUser(arg.trim());
    if (!targetUser) {
      await this.sendSafeHtml(chatId, `❌ "${this.escapeHtml(arg)}" üzrə istifadəçi tapılmadı.`);
      return;
    }

    const success = storage.unblockUser(targetUser.id);
    if (success) {
      storage.addLog('moderation', `İstifadəçi bloku açıldı: [${targetUser.id} - ${targetUser.first_name}]`);

      // 1. Notify Admin
      await this.sendSafeHtml(
        chatId,
        `✅ <b>İstifadəçinin bloku uğurla ləğv edildi!</b>\n\n👤 <b>İstifadəçi:</b> ${this.escapeHtml(targetUser.first_name || '')} (@${targetUser.username || 'yoxdur'})\n🆔 <b>User ID:</b> <code>${targetUser.id}</code>\n📩 <b>İstifadəçiyə bildiriş:</b> Çatdırıldı`
      );

      // 2. Direct Notification to Unblocked User in Telegram
      try {
        const userNotice = `✅ <b>MƏHDUDİYYƏTİNİZ ARADAN QALDIRILDI</b>

Hörmətli istifadəçi, botdan istifadə məhdudiyyətiniz admin tərəfindən ləğv edildi.
Artıq botun bütün süni intellekt, elmi və moderasiya imkanlarından yenidən tam sərbəst istifadə edə bilərsiniz.

🏛️ <i>AAQ - Ahl Al Qalam</i>`;

        await this.sendSafeHtml(targetUser.id, userNotice);
      } catch (e) {}
    } else {
      await this.sendSafeHtml(chatId, `ℹ️ <code>${targetUser.id}</code> ID-li istifadəçi blokda deyil.`);
    }
  }

  private async handleBlockList(chatId: number) {
    const blocked = storage.getBlockedUsers();
    if (blocked.length === 0) {
      await this.sendSafeHtml(chatId, '✅ Hazırda bloklanmış heç bir istifadəçi yoxdur.');
      return;
    }

    let text = `🚫 <b>BLOKDA OLAN İSTİFADƏÇİLƏRİN SİYAHISI (${blocked.length}):</b>\n\n`;
    blocked.forEach((u, idx) => {
      const untilStr = u.blockedUntil ? `\n⏳ Bitmə: ${new Date(u.blockedUntil).toLocaleString('az-AZ')}` : '\n⏳ Müddət: Daimi';
      text += `${idx + 1}. <b>${this.escapeHtml(u.first_name || 'İstifadəçi')}</b> (@${u.username || 'yoxdur'})\n🆔 ID: <code>${u.id}</code>\n📝 Səbəb: ${this.escapeHtml(u.blockReason || 'Qaydaların pozulması')}${untilStr}\n👉 Bloku aç: <code>/blokac ${u.id}</code>\n\n`;
    });

    await this.sendSafeHtml(chatId, text);
  }

  // --- MODEL AND ROLEPLAY MENUS ---
  private async handleModelMenu(chatId: number, userId: number) {
    const user = storage.getUser(userId);
    const config = storage.getConfig();
    const activeModelId = user?.selectedModel || config.model;

    const buttons: Array<Array<{ text: string; callback_data?: string; url?: string }>> = AVAILABLE_MODELS.map(m => {
      const isSelected = m.id === activeModelId;
      return [
        {
          text: `${isSelected ? '✅ ' : ''}${m.name}`,
          callback_data: `select_model_${m.id}`
        }
      ];
    });

    buttons.push([
      { text: '📢 AAQ Kanalı', url: OFFICIAL_CHANNEL_URL },
      { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
    ]);

    const text = `🤖 <b>GEMINI AI MODEL SEÇİMİ</b>

Hazırda aktiv modeliniz: <b>${AVAILABLE_MODELS.find(m => m.id === activeModelId)?.name || activeModelId}</b>

Aşağıdakı modellərdən birini seçərək botun cavabvermə intellektini və sürətini təyin edə bilərsiniz:`;

    await this.sendSafeHtml(chatId, text, {
      reply_markup: { inline_keyboard: buttons }
    });
  }

  private async handleRoleplayMenu(chatId: number, userId: number) {
    const user = storage.getUser(userId);
    const config = storage.getConfig();
    const activePersonaId = user?.roleplayPersona || config.roleplayMode;

    const buttons: Array<Array<{ text: string; callback_data?: string; url?: string }>> = ROLEPLAY_PERSONAS.map(p => {
      const isSelected = p.id === activePersonaId;
      return [
        {
          text: `${isSelected ? '✅ ' : ''}${p.icon} ${p.name}`,
          callback_data: `select_persona_${p.id}`
        }
      ];
    });

    buttons.push([
      { text: '📢 AAQ Kanalı', url: OFFICIAL_CHANNEL_URL },
      { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
    ]);

    const text = `🎭 <b>AI XARAKTER VƏ ROL SEÇİMİ</b>

İstədiyiniz AI xarakterini seçərək botun ünsiyyət tərzini dəyişə bilərsiniz:`;

    await this.sendSafeHtml(chatId, text, {
      reply_markup: { inline_keyboard: buttons }
    });
  }

  // --- CALLBACK QUERY HANDLER ---
  private async handleCallbackQuery(cb: any) {
    const data = cb.data;
    const chatId = cb.message?.chat?.id;
    const userId = cb.from?.id;
    const msgId = cb.message?.message_id;

    if (!chatId || !data) return;

    try {
      await this.apiCall('answerCallbackQuery', { callback_query_id: cb.id });

      if (data === 'accept_terms') {
        storage.acceptTerms(userId);
        const user = storage.getUser(userId) || cb.from;
        await this.handleStart(chatId, user, this.isOwner(cb.from));
        return;
      }

      if (data === 'nav_main_menu') {
        const user = storage.getUser(userId) || cb.from;
        await this.handleStart(chatId, user, this.isOwner(cb.from));
        return;
      }

      if (data === 'nav_help') {
        await this.handleHelp(chatId, this.isOwner(cb.from));
        return;
      }

      if (data === 'menu_models') {
        await this.handleModelMenu(chatId, userId);
        return;
      }

      if (data === 'menu_roleplay') {
        await this.handleRoleplayMenu(chatId, userId);
        return;
      }

      if (data === 'cmd_dim') {
        await this.handleDim(chatId);
        return;
      }

      if (data === 'cmd_sitat') {
        await this.handleSitat(chatId);
        return;
      }

      if (data === 'cmd_fakt') {
        await this.handleFakt(chatId);
        return;
      }

      if (data === 'cmd_quiz') {
        await this.handleQuiz(chatId);
        return;
      }

      if (data === 'cmd_policy') {
        await this.showPolicy(chatId, this.isOwner(cb.from));
        return;
      }

      if (data === 'cmd_sozluk') {
        await this.sendSafeHtml(chatId, '📖 <b>İzahlı Lüğət:</b> Sözün mənasını öyrənmək üçün <code>/sozluk &lt;söz&gt;</code> yazın.\nNümunə: <code>/sozluk maarif</code>');
        return;
      }

      if (data === 'cmd_hesabla') {
        await this.sendSafeHtml(chatId, '🔢 <b>Riyazi Hesablama:</b> İfadə və ya tənliyi hesablamaq üçün <code>/hesabla &lt;misal&gt;</code> yazın.\nNümunə: <code>/hesabla (145 * 24) / 12 + 5^3</code>');
        return;
      }

      if (data === 'cmd_hava') {
        await this.handleHava(chatId, '/hava Bakı');
        return;
      }

      if (data === 'cmd_clear') {
        storage.clearChatHistory(userId);
        await this.sendSafeHtml(chatId, '🧹 Söhbət yaddaşı təmizləndi!');
        return;
      }

      if (data === 'menu_contact') {
        await this.startContact(chatId);
        return;
      }

      if (data.startsWith('select_model_')) {
        const modelId = data.replace('select_model_', '');
        storage.setUserModel(userId, modelId);
        const def = AVAILABLE_MODELS.find(m => m.id === modelId);
        const navKb = {
          inline_keyboard: [
            [
              { text: '🤖 Modeli Dəyiş', callback_data: 'menu_models' },
              { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
            ]
          ]
        };
        await this.sendSafeHtml(
          chatId,
          `✅ <b>Aktiv Gemini Modeli Təyin Edildi:</b> ${def?.name || modelId}\n<i>İndi suallarınızı birbaşa bu model ən yüksək sürətlə cavablandıracaq.</i>`,
          { reply_markup: navKb }
        );
        return;
      }

      if (data.startsWith('select_persona_')) {
        const personaId = data.replace('select_persona_', '');
        storage.setUserPersona(userId, personaId);
        const persona = ROLEPLAY_PERSONAS.find(p => p.id === personaId);
        const navKb = {
          inline_keyboard: [
            [
              { text: '🎭 Digər Xarakterlər', callback_data: 'menu_roleplay' },
              { text: '🏠 Əsas Menyu', callback_data: 'nav_main_menu' }
            ]
          ]
        };
        await this.sendSafeHtml(
          chatId,
          `✅ <b>AI Xarakteri Dəyişdirildi:</b> ${persona?.icon || '✨'} ${persona?.name || personaId}\n${persona?.description || ''}`,
          { reply_markup: navKb }
        );
        return;
      }

      if (data.startsWith('elan_cancel_')) {
        const draftId = data.replace('elan_cancel_', '');
        this.elanDrafts.delete(draftId);
        if (msgId) {
          try {
            await this.apiCall('editMessageText', {
              chat_id: chatId,
              message_id: msgId,
              text: '❌ <b>Elan göndərişi ləğv edildi.</b>',
              parse_mode: 'HTML'
            });
            return;
          } catch {}
        }
        await this.sendSafeHtml(chatId, '❌ <b>Elan göndərişi ləğv edildi.</b>');
        return;
      }

      if (data === 'admin_cancel_action') {
        this.pendingAdminElan.delete(chatId);
        if (msgId) {
          try {
            await this.apiCall('editMessageText', {
              chat_id: chatId,
              message_id: msgId,
              text: '❌ <b>Əməliyyat ləğv edildi.</b>',
              parse_mode: 'HTML'
            });
            return;
          } catch {}
        }
        await this.sendSafeHtml(chatId, '❌ <b>Əməliyyat ləğv edildi.</b>');
        return;
      }

      if (data === 'user_cancel_contact') {
        storage.setContactPending(chatId, false);
        if (msgId) {
          try {
            await this.apiCall('editMessageText', {
              chat_id: chatId,
              message_id: msgId,
              text: '❌ <b>Müraciətiniz ləğv edildi.</b>',
              parse_mode: 'HTML'
            });
            return;
          } catch {}
        }
        await this.sendSafeHtml(chatId, '❌ <b>Müraciətiniz ləğv edildi.</b>');
        return;
      }

      if (data === 'admin_broadcast_prompt') {
        if (!this.isOwner(cb.from)) return;
        this.pendingAdminElan.set(chatId, true);
        const keyboard = {
          inline_keyboard: [
            [
              { text: '❌ Ləğv et', callback_data: 'admin_cancel_action' },
              { text: '👑 Admin Panel', callback_data: 'nav_admin_panel' }
            ]
          ]
        };
        await this.sendSafeHtml(
          chatId,
          `📢 <b>KÜTLƏVİ ELAN HAZIRLIĞI</b>\n\nZəhmət olmasa elan mətnini yazın və göndərin.\n<i>(Telegram-da sözlərə link, qalın, kursiv yazı və s. formatlar əlavə edə bilərsiniz).</i>\n\nMesajı göndərdikdən sonra çatdırılma hədəfini (Hamıya, Qruplara, İstifadəçilərə) düymələrlə seçəcəksiniz.`,
          { reply_markup: keyboard }
        );
        return;
      }

      if (data === 'nav_admin_panel') {
        if (this.isOwner(cb.from)) {
          await this.handleOwnerPanel(chatId);
        }
        return;
      }

      if (data.startsWith('elan_dest_')) {
        const parts = data.split('_');
        const targetType = parts[2] as 'groups' | 'users' | 'all';
        const draftId = parts.slice(3).join('_');
        const draft = this.elanDrafts.get(draftId);

        if (!draft) {
          await this.sendSafeHtml(chatId, '⚠️ Bu elanın vaxtı bitib və ya artıq göndərilib. Zəhmət olmasa <code>/elan &lt;mətn&gt;</code> ilə yenidən başlayın.');
          return;
        }

        this.elanDrafts.delete(draftId);

        const targetName = targetType === 'groups' ? '👥 Yalnız Qruplara' : targetType === 'users' ? '👤 Yalnız İstifadəçilərə' : '🌐 Hamısına (Qrup + Şəxsi)';
        await this.sendSafeHtml(chatId, `🚀 <b>Elan yayımı başlandı:</b> ${targetName} göndərilir...`);
        
        await this.executeBroadcast(draft.text, 'AAQ Rəhbərlik', chatId, targetType);
        return;
      }

      if (data === 'admin_groups') {
        if (!this.isOwner(cb.from)) return;
        await this.handleGroupList(chatId);
        return;
      }

      if (data === 'admin_users_list') {
        if (!this.isOwner(cb.from)) return;
        await this.handleUserList(chatId);
        return;
      }

      if (data === 'admin_tickets') {
        if (!this.isOwner(cb.from)) return;
        const tickets = storage.getContactTickets();
        if (tickets.length === 0) {
          await this.sendSafeHtml(chatId, '✅ Hələlik heç bir istifadəçi müraciəti yoxdur.');
          return;
        }
        let text = `📩 <b>İSTİFADƏÇİ MÜRACİƏTLƏRİ (${tickets.length}):</b>\n\n`;
        tickets.slice(0, 10).forEach((t, idx) => {
          text += `${idx + 1}. [${t.id}] <b>${this.escapeHtml(t.userName)}</b> (ID: <code>${t.userId}</code>)\n💬 ${t.message}\nStatus: ${t.status === 'replied' ? '✅ Cavablanıb' : '⏳ Gözləyir'}\n\n`;
        });
        await this.sendSafeHtml(chatId, text);
        return;
      }

      if (data === 'admin_blocklist') {
        if (!this.isOwner(cb.from)) return;
        await this.handleBlockList(chatId);
        return;
      }
    } catch (e: any) {
      storage.addLog('error', `Callback query xətası: ${e?.message || e}`);
    }
  }

  // --- BROADCAST EXECUTION ---
  public async executeBroadcast(
    message: string,
    senderName: string = 'AAQ Rəhbərlik',
    notifyAdminChatId?: number,
    targetType: 'all' | 'users' | 'groups' = 'all'
  ) {
    const users = storage.getAllUsers().filter(u => !u.isBlocked);
    const groups = storage.getAllGroups();

    let targets: { id: number; isGroup: boolean }[] = [];
    if (targetType === 'all' || targetType === 'users') {
      targets.push(...users.map(u => ({ id: u.id, isGroup: false })));
    }
    if (targetType === 'all' || targetType === 'groups') {
      targets.push(...groups.map(g => ({ id: g.id, isGroup: true })));
    }

    // Deduplicate
    const seen = new Set<number>();
    targets = targets.filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    let successCount = 0;
    let failCount = 0;

    const formattedMessage = `📢 <b>AAQ - AHL AL QALAM RƏSMİ ELANI</b>

${message}

🏛️ <i>AAQ Rəhbərliyi</i>
📢 <b>Rəsmi Kanal:</b> ${OFFICIAL_CHANNEL_URL}`;

    for (const t of targets) {
      try {
        await this.sendSafeHtml(t.id, formattedMessage);
        successCount++;
      } catch (e) {
        failCount++;
      }
      await new Promise(r => setTimeout(r, 60)); // Telegram rate limiting guard
    }

    storage.addBroadcast({
      id: Math.random().toString(36).substring(2, 9),
      message,
      sender: senderName,
      recipientCount: targets.length,
      successCount,
      failCount,
      timestamp: new Date().toISOString(),
      targetType
    });

    storage.addLog(
      'admin',
      `Elan göndərildi: Toplam ${targets.length}, Uğurlu: ${successCount}, Uğursuz: ${failCount}`
    );

    if (notifyAdminChatId) {
      const targetLabel = targetType === 'groups' ? 'Yalnız Qruplar' : targetType === 'users' ? 'Yalnız İstifadəçilər' : 'Bütün Qruplar və İstifadəçilər';
      await this.sendSafeHtml(
        notifyAdminChatId,
        `✅ <b>Elan Göndərişi Tamamlandı!</b>\n🎯 <b>Hədəf:</b> ${targetLabel}\n📊 <b>Toplam:</b> ${targets.length}\n✔️ <b>Uğurlu:</b> ${successCount}\n❌ <b>Çatmayan:</b> ${failCount}`
      );
    }

    return { total: targets.length, successCount, failCount };
  }

  // --- TELEGRAM SAFE SENDING HELPERS ---
  public async sendSafeHtml(chatId: number, htmlText: string, extra: any = {}): Promise<any> {
    try {
      return await this.apiCall('sendMessage', {
        chat_id: chatId,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        ...extra
      });
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('can\'t parse entities') || errMsg.includes('HTML')) {
        const plain = htmlText.replace(/<[^>]+>/g, '');
        return await this.apiCall('sendMessage', {
          chat_id: chatId,
          text: plain,
          ...extra
        });
      }
      throw err;
    }
  }

  public async sendChatAction(chatId: number, action: string = 'typing') {
    try {
      await this.apiCall('sendChatAction', {
        chat_id: chatId,
        action
      });
    } catch (e) {}
  }
}

export const telegramBot = new TelegramBotService();
