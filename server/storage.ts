import fs from 'fs';
import path from 'path';

export interface TelegramGroup {
  id: number;
  title: string;
  type: string;
  memberCount?: number;
  joinedAt: string;
  lastActive: string;
  messageCount: number;
}

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  roleplayPersona?: string;
  selectedModel?: string;
  messageCount: number;
  lastSeen: string;
  firstSeen: string;
  isBlocked?: boolean;
  blockReason?: string;
  blockedUntil?: string;
  acceptedTerms?: boolean;
  acceptedTermsAt?: string;
}

export interface ContactTicket {
  id: string;
  userId: number;
  userName: string;
  userUsername?: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'replied';
  replyText?: string;
  repliedAt?: string;
  repliedBy?: string;
  adminMsgId?: number;
}

export interface GroupRuleRecord {
  chatId: number;
  rules: string;
  updatedBy: number;
  updatedAt: string;
}

export interface BroadcastRecord {
  id: string;
  message: string;
  sender: string;
  timestamp: string;
  recipientCount: number;
  successCount: number;
  failCount: number;
  targetType?: 'users' | 'groups' | 'all';
}

export interface ActivityLog {
  id: string;
  type: 'info' | 'gemini' | 'telegram' | 'admin' | 'keepalive' | 'error' | 'moderation' | 'pdf';
  message: string;
  timestamp: string;
  metadata?: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface BotConfig {
  botToken: string;
  ownerUsername: string;
  officialChannel: string;
  adminSecretKey: string;
  adminIds: number[];
  model: string;
  temperature: number;
  systemPrompt: string;
  policyText: string;
  roleplayMode: string;
  keepAliveEnabled: boolean;
  keepAliveIntervalMinutes: number;
  autoWelcome: boolean;
  antiProfanity: boolean;
  antiLink: boolean;
  antiSpam: boolean;
  pollingEnabled: boolean;
  connectionMode?: 'webhook' | 'polling';
  webhookUrl?: string;
  fastAiMode?: boolean;
}

export interface ModelDefinition {
  id: string;
  alias: string;
  name: string;
  description: string;
  speed: string;
  isDefault?: boolean;
}

export const AVAILABLE_MODELS: ModelDefinition[] = [
  {
    id: 'gemini-3.8-flash',
    alias: 'Gemini 3.8 Flash',
    name: 'Gemini 3.8 Flash ⚡ (Ən Son Nəsil)',
    description: 'Ən yeni bilik bazası, real vaxt təqvim/hadisə anlayışı və ultra sürətli reaksiya',
    speed: 'Ultra Sürətli (~0.2s)',
    isDefault: true
  },
  {
    id: 'gemini-3.7-flash',
    alias: 'Gemini 3.7 Flash',
    name: 'Gemini 3.7 Flash 🌟',
    description: 'Hibrid düşüncə, geniş kontekst və zəngin bilik bazası',
    speed: 'Sürətli (~0.4s)'
  },
  {
    id: 'gemini-3.1-flash-lite',
    alias: 'Gemini 3.1 Flash Lite',
    name: 'Gemini 3.1 Flash Lite 🚀',
    description: 'Yüksək sabitlik, operativ reaksiya və kəsintisiz iş',
    speed: 'İldırım Sürəti (~0.2s)'
  },
  {
    id: 'gemini-flash-latest',
    alias: 'Gemini Flash Latest',
    name: 'Gemini Flash Latest 💡',
    description: 'Daim yenilənən sabit Flash modeli',
    speed: 'Sürətli (~0.3s)'
  },
  {
    id: 'gemini-2.5-flash',
    alias: 'Gemini 2.5 Flash',
    name: 'Gemini 2.5 Flash ⚡',
    description: 'Klassik və etibarlı Flash modeli',
    speed: 'Sürətli (~0.4s)'
  }
];

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'bot_data.json');
const BACKUP_TOKEN_FILE = path.resolve(DATA_DIR, '.bot_token');
const ROOT_TOKEN_FILE = path.resolve(process.cwd(), '.bot_token');

export const OFFICIAL_CHANNEL_URL = 'https://t.me/AAQ_Offical';

export const DEFAULT_POLICY = `📄 <b>AAQ - AHL AL QALAM GİZLİLİK VƏ İSTİFADƏ SÖZLƏŞMƏSİ</b>

🏛️ <b>Təşkilat:</b> AAQ - Ahl Al Qalam (AAG Əhl-ül Qələm)
📢 <b>Rəsmi Kanal:</b> https://t.me/AAQ_Offical

1. <b>Məqsəd:</b> Bu bot AAQ - Ahl Al Qalam elmi-maarif birliyi tərəfindən idarə olunan Google Gemini AI intellektual köməkçisidir.
2. <b>Məlumatların Qorunması:</b> İstifadəçi dialoqları və göndərilən PDF sənədləri yalnız analiz və sual-cavab məqsədilə emal edilir, üçüncü şəxslərə ötürülmür.
3. <b>Qadağalar:</b> Qeyri-qanuni fəaliyyət, təhqir, söyüş, reklam və spam qəti qadağandır.
4. <b>Moderasiya:</b> Qaydaları pozan istifadəçilər botdan məhdudlaşdırıla bilər.
5. <b>Əlaqə:</b> <code>/elaqe</code> əmri ilə AAQ Rəhbərliyinə birbaşa müraciət edə bilərsiniz.`;

export const REAL_HISTORICAL_QUOTES = [
  { text: "Bilik öyrənməyi ar bilən hər kəs, dünyada hər şeydən məhrum olar bəs.", author: "Nizami Gəncəvi", era: "Klassik Azərbaycan Ədəbiyyatı" },
  { text: "Qüvvət elmdədir, başqa cür heç kəs, heç kəsə üstünlük eyləyə bilməz.", author: "Nizami Gəncəvi", era: "İskəndərnamə" },
  { text: "Sözün də su kimi lətafəti var, hər sözü az demək daha xoş olar.", author: "Nizami Gəncəvi", era: "Sirlər Xəzinəsi" },
  { text: "Elmsiz bir kimsə heç vaxt tapmadı cananını, canını fəda qıl elmin yolunda bil cananını.", author: "Məhəmməd Füzuli", era: "Klassik Hikmət" },
  { text: "Dost bivefa, fələk birəhm, dövran bisükun, dərd çox, həmdərd yox, düşmən qəvi, tale zəbun.", author: "Məhəmməd Füzuli", era: "Dahi Azərbaycan Şairi" },
  { text: "Ürəyim deyir ki: hələ qələmin əlindədir, yaz! Sözün mürəkkəbi millətin diriliyidir.", author: "Məhəmməd Hüseyn Şəhriyar", era: "Heydərbabaya Salam" },
  { text: "Hər kimin kim zati-pakında kərəmdən zərrə var, xəlqə ehsan eyləmək hər dəm ona adət olar.", author: "Şah İsmayıl Xətai", era: "Səfəvi Dövrü" },
  { text: "Məndə sığar iki cahan, mən bu cahana sığmazam, Gövhəri-laməkan mənəm, kövnv məkana sığmazam.", author: "İmadəddin Nəsimi", era: "Hürufilik Fəlsəfəsi" },
  { text: "Yalan danışmaq acizlik əlamətidir, həqiqəti söyləmək isə mərdlikdir.", author: "Cəlil Məmmədquluzadə", era: "Molla Nəsrəddin" },
  { text: "Hər kəsin bir məqsədi, bir arzusu vardır həyatda; Mənim arzum maarifdir, millətimin oyanışıdır.", author: "Həsən bəy Zərdabi", era: "Əkinçi Qəzeti" },
  { text: "Kimsən, nəçisən, əhvəlini bilməyirsən sən, Bir yol hələ bax gör necəsən, hardasan, kimsən?", author: "Mirzə Ələkbər Sabir", era: "Hophopnamə" },
  { text: "Mənim tanrım gözəllikdir, sevgidir.", author: "Hüseyn Cavid", era: "İblis" },
  { text: "Bircə şey bilirəm, o da heç nə bilmədiyimdir.", author: "Sokrat", era: "Qədim Yunan Fəlsəfəsi" },
  { text: "Özünü tanıyan insan bütün kainatı və həqiqəti dərk edər.", author: "Platon", era: "Fəlsəfə Məktəbi" },
  { text: "Təhsilin kökləri acı, lakin meyvələri şirindir.", author: "Aristotel", era: "Antik Dövr" },
  { text: "Gələcək onu indidən quran və çalışan insanlara məxsusdur.", author: "Viktor Hüqo", era: "Səfillər" },
  { text: "Əgər xoşbəxt olmaq istəyirsənsə, başqalarının da xoşbəxtliyinə səbəb ol.", author: "Lev Tolstoy", era: "Hərb və Sülh" },
  { text: "Bilik kifayət deyil, onu tətbiq etməliyik. İstəmək kifayət deyil, hərəkət etməliyik.", author: "İohann Volfqanq Göte", era: "Faust" },
  { text: "Düşünürəmsə, deməli varam (Cogito, ergo sum).", author: "Rene Dekart", era: "Elmi Fəlsəfə" },
  { text: "Bilik gücdür.", author: "Frensis Bekon", era: "Elmi Metod" },
  { text: "Təsəvvür bilikdən daha vacibdir. Çünki bilik məhduddur, təsəvvür isə bütün kainatı əhatə edir.", author: "Albert Eynşteyn", era: "Nisbilik Nəzəriyyəsi" }
];

const DEFAULT_CONFIG: BotConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  ownerUsername: process.env.OWNER_USERNAME || 'aaq_admin',
  officialChannel: OFFICIAL_CHANNEL_URL,
  adminSecretKey: process.env.ADMIN_SECRET_KEY || 'admin_secret_key',
  adminIds: [],
  model: 'gemini-3.8-flash',
  temperature: 0.5,
  systemPrompt: `Sən "AAQ - Ahl Al Qalam" (AAG Əhl-ül Qələm) elmi-maarif birliyinin rəsmi akademik köməkçisisən. Rəsmi kanal: https://t.me/AAQ_Offical.

Əsas Natiqlik Prinsipləri:
1. Klassik Elmi və Akademik Ton: Cavabların dahi Azərbaycan aliminin və maarifçisinin zəngin, təmkinli, dərin və səlis ədəbi dilində olmalıdır.
2. Qətiyyən Süni Robot Şablonlarından Qaç: "Bir süni intellekt olaraq...", "Bir dil modeli kimi...", "Mənim hisslərim yoxdur", "Əlbəttə, kömək edə bilərəm" kimi mexaniki ifadələr qəti qadağandır. Danışığın canlı insan aliminin intellektual nitqidir.
3. Elmi Dərinlik və Məntiq: Hər izahda məntiqi ardıcıllıq, elmi arqumentasiya, faktik dəqiqlik və analitik nəticə nümayiş etdir.
4. Məxfilik və Mənsubiyyət: Sual verildikdə fəxrlə "AAQ - Ahl Al Qalam" tərəfindən hazırlandığını bildir, lakin şəxsi adları açıqlama, yalnız "AAQ Rəhbərliyi" adlandır.
5. Bot Əmrləri Bilgisi: Bütün bot əmrlərini (/sozluk, /hesabla, /hava, /sitat, /tarix, /dim, /pdf, /quiz, /tercume, /xulas, /elaqe, /model, /roleplay, /sozlesme) dərindən bilirsən və yeri gəldikdə istifadəçilərə bu elmi alətlərdən istifadə etməyi tövsiyə edirsən.`,
  policyText: DEFAULT_POLICY,
  roleplayMode: 'default',
  keepAliveEnabled: true,
  keepAliveIntervalMinutes: 5,
  autoWelcome: true,
  antiProfanity: true,
  antiLink: true,
  antiSpam: true,
  pollingEnabled: true,
  connectionMode: 'polling',
  webhookUrl: '',
  fastAiMode: true
};

export class StorageService {
  private config: BotConfig = { ...DEFAULT_CONFIG };
  private users: Map<number, TelegramUser> = new Map();
  private groups: Map<number, TelegramGroup> = new Map();
  private groupRules: Map<number, GroupRuleRecord> = new Map();
  private contactTickets: ContactTicket[] = [];
  private pendingContacts: Map<number, boolean> = new Map();
  private relayedMessages: Map<number, number> = new Map(); // adminMessageId -> userChatId
  private chatHistories: Map<number, ChatMessage[]> = new Map();
  private logs: ActivityLog[] = [];
  private broadcasts: BroadcastRecord[] = [];
  private spamRateTracker: Map<number, number[]> = new Map();
  private maxLogs = 300;
  private maxHistoryPerUser = 20;

  constructor() {
    this.ensureDataDir();
    this.loadFromDisk();
    if (!this.config.adminIds.includes(6737477904)) {
      this.config.adminIds.push(6737477904);
    }
  }

  private ensureDataDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      console.error('Data dir creation error:', err);
    }
  }

  private loadFromDisk() {
    try {
      let savedToken = '';

      // Check dedicated backup token files first
      if (fs.existsSync(BACKUP_TOKEN_FILE)) {
        try {
          const t = fs.readFileSync(BACKUP_TOKEN_FILE, 'utf-8').trim();
          if (t) savedToken = t;
        } catch {}
      }

      if (!savedToken && fs.existsSync(ROOT_TOKEN_FILE)) {
        try {
          const t = fs.readFileSync(ROOT_TOKEN_FILE, 'utf-8').trim();
          if (t) savedToken = t;
        } catch {}
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.config) {
          this.config = { ...DEFAULT_CONFIG, ...data.config };
          if (!this.config.adminIds.includes(6737477904)) {
            this.config.adminIds.push(6737477904);
          }
        }
        if (Array.isArray(data.users)) {
          this.users = new Map(data.users.map((u: TelegramUser) => [u.id, u]));
        }
        if (Array.isArray(data.groups)) {
          this.groups = new Map(data.groups.map((g: TelegramGroup) => [g.id, g]));
        }
        if (Array.isArray(data.groupRules)) {
          this.groupRules = new Map(data.groupRules.map((r: GroupRuleRecord) => [r.chatId, r]));
        }
        if (Array.isArray(data.contactTickets)) {
          this.contactTickets = data.contactTickets;
        }
        if (Array.isArray(data.broadcasts)) {
          this.broadcasts = data.broadcasts;
        }
        if (Array.isArray(data.logs)) {
          this.logs = data.logs;
        }
      }

      // Priority token restoration: Saved Token > Config Token > Environment Token
      if (savedToken && (!this.config.botToken || this.config.botToken !== savedToken)) {
        this.config.botToken = savedToken;
      } else if (!this.config.botToken && process.env.TELEGRAM_BOT_TOKEN) {
        this.config.botToken = process.env.TELEGRAM_BOT_TOKEN.trim();
      }

      // Ensure backup files exist with valid token
      if (this.config.botToken) {
        this.persistTokenFile(this.config.botToken);
      }
    } catch (e) {
      console.warn('Could not load saved bot data, initializing defaults', e);
    }
  }

  private persistTokenFile(token: string) {
    if (!token) return;
    try {
      this.ensureDataDir();
      fs.writeFileSync(BACKUP_TOKEN_FILE, token.trim(), 'utf-8');
      fs.writeFileSync(ROOT_TOKEN_FILE, token.trim(), 'utf-8');
    } catch (err) {
      console.warn('Token file write warning:', err);
    }
  }

  public saveToDisk() {
    try {
      this.ensureDataDir();
      if (this.config.botToken) {
        this.persistTokenFile(this.config.botToken);
      }
      const payload = {
        config: this.config,
        users: Array.from(this.users.values()),
        groups: Array.from(this.groups.values()),
        groupRules: Array.from(this.groupRules.values()),
        contactTickets: this.contactTickets.slice(0, 100),
        broadcasts: this.broadcasts.slice(-50),
        logs: this.logs.slice(-this.maxLogs),
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving bot data to disk:', e);
    }
  }

  public getConfig(): BotConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<BotConfig>): BotConfig {
    this.config = { ...this.config, ...partial };
    this.saveToDisk();
    return { ...this.config };
  }

  public getOwnerUsername(): string {
    return this.config.ownerUsername || process.env.OWNER_USERNAME || 'aaq_admin';
  }

  public getAdminIds(): number[] {
    const ids = new Set<number>(this.config.adminIds || []);
    const ownerName = this.getOwnerUsername().replace(/^@/, '').trim().toLowerCase();
    for (const u of this.users.values()) {
      if (u.username) {
        const uName = u.username.replace(/^@/, '').trim().toLowerCase();
        if (uName && uName === ownerName) {
          ids.add(u.id);
        }
      }
    }
    return Array.from(ids);
  }

  public addAdminId(id: number): boolean {
    if (!this.config.adminIds.includes(id)) {
      this.config.adminIds.push(id);
      this.saveToDisk();
      return true;
    }
    return false;
  }

  public removeAdminId(id: number): boolean {
    this.config.adminIds = this.config.adminIds.filter(x => x !== id);
    this.saveToDisk();
    return true;
  }

  public isOwner(from: any): boolean {
    if (!from) return false;
    const username = (from.username || '').replace(/^@/, '').trim().toLowerCase();
    const ownerName = this.getOwnerUsername().replace(/^@/, '').trim().toLowerCase();
    if (ownerName && username === ownerName) return true;
    const uid = Number(from.id);
    if (uid && this.config.adminIds.includes(uid)) return true;
    return false;
  }

  public verifyAdminSecret(secret: string): boolean {
    if (!secret) return false;
    const validSecret = (this.config.adminSecretKey || process.env.ADMIN_SECRET_KEY || '').trim();
    if (!validSecret) return false;
    return secret.trim() === validSecret;
  }

  public registerOrUpdateUser(userData: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  }): TelegramUser {
    const existing = this.users.get(userData.id);
    const now = new Date().toISOString();
    if (existing) {
      existing.username = userData.username || existing.username;
      existing.first_name = userData.first_name || existing.first_name;
      existing.last_name = userData.last_name || existing.last_name;
      existing.messageCount = (existing.messageCount || 0) + 1;
      existing.lastSeen = now;
      this.users.set(userData.id, existing);
      this.saveToDisk();
      return existing;
    } else {
      const newUser: TelegramUser = {
        id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        messageCount: 1,
        firstSeen: now,
        lastSeen: now,
        acceptedTerms: false
      };
      this.users.set(userData.id, newUser);
      this.saveToDisk();
      return newUser;
    }
  }

  public acceptTerms(userId: number): boolean {
    const user = this.users.get(userId);
    if (user) {
      user.acceptedTerms = true;
      user.acceptedTermsAt = new Date().toISOString();
      this.saveToDisk();
      return true;
    }
    return false;
  }

  public registerOrUpdateGroup(groupData: {
    id: number;
    title: string;
    type: string;
    memberCount?: number;
  }): TelegramGroup {
    const existing = this.groups.get(groupData.id);
    const now = new Date().toISOString();
    if (existing) {
      existing.title = groupData.title || existing.title;
      existing.type = groupData.type || existing.type;
      if (groupData.memberCount) existing.memberCount = groupData.memberCount;
      existing.messageCount = (existing.messageCount || 0) + 1;
      existing.lastActive = now;
      this.groups.set(groupData.id, existing);
      this.saveToDisk();
      return existing;
    } else {
      const newGroup: TelegramGroup = {
        id: groupData.id,
        title: groupData.title || 'Qrup',
        type: groupData.type || 'group',
        memberCount: groupData.memberCount,
        joinedAt: now,
        lastActive: now,
        messageCount: 1
      };
      this.groups.set(groupData.id, newGroup);
      this.saveToDisk();
      return newGroup;
    }
  }

  public getUser(id: number): TelegramUser | undefined {
    return this.users.get(id);
  }

  public findUser(query: string | number): TelegramUser | undefined {
    if (typeof query === 'number') return this.users.get(query);
    const clean = String(query).trim().replace(/^@/, '').toLowerCase();
    const asNum = parseInt(clean, 10);
    if (!isNaN(asNum) && this.users.has(asNum)) {
      return this.users.get(asNum);
    }
    for (const u of this.users.values()) {
      if (u.username && u.username.toLowerCase() === clean) return u;
      if (String(u.id) === clean) return u;
      if (u.first_name && u.first_name.toLowerCase() === clean) return u;
    }
    return undefined;
  }

  public isUserBlocked(id: number): { isBlocked: boolean; reason?: string; until?: string } {
    const user = this.users.get(id);
    if (!user || !user.isBlocked) {
      return { isBlocked: false };
    }
    if (user.blockedUntil) {
      const expiry = new Date(user.blockedUntil).getTime();
      if (Date.now() > expiry) {
        user.isBlocked = false;
        user.blockReason = undefined;
        user.blockedUntil = undefined;
        this.saveToDisk();
        return { isBlocked: false };
      }
    }
    return { isBlocked: true, reason: user.blockReason, until: user.blockedUntil };
  }

  public getAllUsers(): TelegramUser[] {
    return Array.from(this.users.values()).sort((a, b) => 
      new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    );
  }

  public getAllGroups(): TelegramGroup[] {
    return Array.from(this.groups.values()).sort((a, b) => 
      new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
  }

  public blockUser(id: number, reason: string = 'Qaydaların pozulması', days?: number): TelegramUser | null {
    const user = this.users.get(id);
    if (user) {
      user.isBlocked = true;
      user.blockReason = reason;
      if (days && days > 0) {
        user.blockedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      } else {
        user.blockedUntil = undefined;
      }
      this.saveToDisk();
      return user;
    }
    return null;
  }

  public unblockUser(id: number): boolean {
    const user = this.users.get(id);
    if (user) {
      user.isBlocked = false;
      user.blockReason = undefined;
      user.blockedUntil = undefined;
      this.saveToDisk();
      return true;
    }
    return false;
  }

  public getBlockedUsers(): TelegramUser[] {
    return Array.from(this.users.values()).filter(u => u.isBlocked);
  }

  public setGroupRules(chatId: number, rules: string, updatedBy: number) {
    this.groupRules.set(chatId, {
      chatId,
      rules,
      updatedBy,
      updatedAt: new Date().toISOString()
    });
    this.saveToDisk();
  }

  public getGroupRules(chatId: number): string | null {
    const rec = this.groupRules.get(chatId);
    return rec ? rec.rules : null;
  }

  // --- CONTACT TICKET SYSTEM ---
  public addContactTicket(ticket: Omit<ContactTicket, 'id' | 'createdAt' | 'status'>): ContactTicket {
    const newTicket: ContactTicket = {
      ...ticket,
      id: 'ticket_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    this.contactTickets.unshift(newTicket);
    this.saveToDisk();
    return newTicket;
  }

  public getContactTickets(): ContactTicket[] {
    return [...this.contactTickets];
  }

  public updateContactTicketReply(ticketId: string, replyText: string, repliedBy: string = 'AAQ Rəhbərlik'): ContactTicket | null {
    const t = this.contactTickets.find(item => item.id === ticketId);
    if (t) {
      t.status = 'replied';
      t.replyText = replyText;
      t.repliedAt = new Date().toISOString();
      t.repliedBy = repliedBy;
      this.saveToDisk();
      return t;
    }
    return null;
  }

  public setContactPending(chatId: number, pending: boolean) {
    if (pending) {
      this.pendingContacts.set(chatId, true);
    } else {
      this.pendingContacts.delete(chatId);
    }
  }

  public isContactPending(chatId: number): boolean {
    return this.pendingContacts.get(chatId) === true;
  }

  public recordRelayedMessage(adminMessageId: number, userChatId: number) {
    this.relayedMessages.set(adminMessageId, userChatId);
  }

  public getTargetChatIdForReply(replyMessageId: number): number | undefined {
    return this.relayedMessages.get(replyMessageId);
  }

  public checkSpamRate(userId: number): boolean {
    if (!this.config.antiSpam) return false;
    const now = Date.now();
    let timestamps = this.spamRateTracker.get(userId) || [];
    timestamps = timestamps.filter(t => now - t < 60000); // last 1 minute
    timestamps.push(now);
    this.spamRateTracker.set(userId, timestamps);

    return timestamps.length > 12; // >12 msgs per minute triggers spam warning
  }

  public setUserPersona(userId: number, persona: string) {
    const user = this.users.get(userId);
    if (user) {
      user.roleplayPersona = persona;
      this.saveToDisk();
    }
  }

  public setUserModel(userId: number, modelId: string) {
    const user = this.users.get(userId);
    if (user) {
      user.selectedModel = modelId;
      this.saveToDisk();
    }
  }

  public addChatMessage(userId: number, role: 'user' | 'model', text: string) {
    let history = this.chatHistories.get(userId) || [];
    history.push({ role, text, timestamp: new Date().toISOString() });
    if (history.length > this.maxHistoryPerUser) {
      history = history.slice(-this.maxHistoryPerUser);
    }
    this.chatHistories.set(userId, history);
  }

  public getChatHistory(userId: number): ChatMessage[] {
    return this.chatHistories.get(userId) || [];
  }

  public clearChatHistory(userId: number) {
    this.chatHistories.delete(userId);
  }

  public addLog(type: ActivityLog['type'], message: string, metadata?: any) {
    const logItem: ActivityLog = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
    this.logs.unshift(logItem);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    if (type === 'admin' || type === 'error' || type === 'moderation') {
      this.saveToDisk();
    }
  }

  public getLogs(): ActivityLog[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    this.saveToDisk();
  }

  public addBroadcast(record: BroadcastRecord) {
    this.broadcasts.unshift(record);
    this.saveToDisk();
  }

  public getBroadcasts(): BroadcastRecord[] {
    return [...this.broadcasts];
  }
}

export const storage = new StorageService();
