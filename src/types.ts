export interface BotInfo {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  username?: string;
}

export interface KeepAliveStatus {
  enabled: boolean;
  intervalMinutes: number;
  totalPings: number;
  webhookPings?: number;
  lastPingTime: string | null;
  lastPingStatus: 'success' | 'warning' | 'error' | 'idle';
  lastPingLatencyMs: number;
  uptimeSeconds: number;
  startedAt: string;
  externalPingUrl: string;
  lastWakeReason?: string;
  appUrl?: string;
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

export interface TelegramGroup {
  id: number;
  title: string;
  type: string;
  memberCount?: number;
  joinedAt: string;
  lastActive: string;
  messageCount: number;
}

export interface ModelDefinition {
  id: string;
  alias: string;
  name: string;
  description: string;
  speed: string;
  isDefault?: boolean;
}

export interface ActivityLog {
  id: string;
  type: 'info' | 'gemini' | 'telegram' | 'admin' | 'keepalive' | 'error' | 'moderation' | 'pdf';
  message: string;
  timestamp: string;
  metadata?: any;
}

export interface PersonaOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
}

export interface BotConfig {
  botToken: string;
  ownerUsername: string;
  officialChannel: string;
  adminSecretKey?: string;
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

export interface AppStatus {
  botRunning: boolean;
  botInfo: BotInfo | null;
  hasGeminiApiKey: boolean;
  selectedModel: string;
  roleplayMode: string;
  totalUsers: number;
  totalGroups: number;
  totalTickets?: number;
  pendingTickets?: number;
  adminSecretKey?: string;
  adminIds: number[];
  ownerUsername: string;
  officialChannel: string;
  keepAlive: KeepAliveStatus;
  hasToken: boolean;
  availableModels?: ModelDefinition[];
  connectionMode?: 'webhook' | 'polling';
  webhookUrl?: string;
  isWebhookActive?: boolean;
  webhookInfo?: any;
}
