import { storage } from './storage.js';

export interface KeepAliveStatus {
  enabled: boolean;
  intervalMinutes: number;
  totalPings: number;
  webhookPings: number;
  lastPingTime: string | null;
  lastPingStatus: 'success' | 'warning' | 'error' | 'idle';
  lastPingLatencyMs: number;
  uptimeSeconds: number;
  startedAt: string;
  externalPingUrl: string;
  lastWakeReason?: string;
  appUrl: string;
}

export class KeepAliveService {
  private timer: NodeJS.Timeout | null = null;
  private watchdogTimer: NodeJS.Timeout | null = null;
  private startedAt: Date = new Date();
  private totalPings: number = 0;
  private webhookPings: number = 0;
  private lastPingTime: string | null = null;
  private lastPingStatus: 'success' | 'warning' | 'error' | 'idle' = 'idle';
  private lastPingLatencyMs: number = 0;
  private lastWakeReason: string = 'server_boot';
  private checkBotCallback: (() => Promise<boolean>) | null = null;

  constructor() {
    this.start();
  }

  public recordWake(reason: string, details?: any) {
    this.totalPings++;
    if (reason.includes('webhook')) {
      this.webhookPings++;
    }
    this.lastPingTime = new Date().toISOString();
    this.lastPingStatus = 'success';
    this.lastWakeReason = reason;
    this.lastPingLatencyMs = 1;
    storage.addLog(
      'keepalive',
      `⚡ Oyanma Tətiyi [${reason}]: Server fəallaşdı və sorğu qəbul edildi.`,
      details
    );
  }

  public registerBotChecker(callback: () => Promise<boolean>) {
    this.checkBotCallback = callback;
  }

  public start() {
    this.stop();
    const config = storage.getConfig();
    if (!config.keepAliveEnabled) {
      storage.addLog('keepalive', 'Oyaq qalma (Keep-Alive) xidməti deaktiv edildi.');
      return;
    }

    const intervalMinutes = Math.max(1, config.keepAliveIntervalMinutes || 2);
    const intervalMs = intervalMinutes * 60 * 1000;
    storage.addLog('keepalive', `Keep-Alive 2.0 & Watchdog işə salındı. İnterval: ${intervalMinutes} dəqiqə.`);

    this.timer = setInterval(() => {
      this.executePing('scheduled');
    }, intervalMs);

    // Sub-minute polling/container watchdog (every 45s) to catch stalls immediately
    this.watchdogTimer = setInterval(async () => {
      if (this.checkBotCallback) {
        try {
          const ok = await this.checkBotCallback();
          if (ok) {
            this.lastPingStatus = 'success';
          }
        } catch {
          // handled inside callback
        }
      }
    }, 45000);

    // Initial ping after 2 seconds to wake all subsystems immediately on boot
    setTimeout(() => {
      this.executePing('initial');
    }, 2000);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  public async executePing(source: 'scheduled' | 'manual' | 'initial' | 'wake' = 'manual'): Promise<{
    success: boolean;
    latencyMs: number;
    message: string;
    botOnline: boolean;
  }> {
    const startTime = Date.now();
    this.totalPings++;
    this.lastPingTime = new Date().toISOString();
    this.lastWakeReason = source;

    let botOnline = false;
    let details = '';

    try {
      // 1. Self-ping internal health endpoint
      const port = process.env.PORT || 3000;
      try {
        const res = await fetch(`http://localhost:${port}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(4000)
        });
        if (res.ok) {
          details += 'Daxili server OK. ';
        }
      } catch (e: any) {
        details += `Local ping: ${e?.message || 'ok'}. `;
      }

      // 2. If APP_URL is present, ping external URL to keep container awake
      const appUrl = (process.env.APP_URL || '').trim();
      if (appUrl && appUrl.startsWith('http')) {
        try {
          await fetch(`${appUrl.replace(/\/$/, '')}/api/health`, {
            method: 'GET',
            headers: { 'User-Agent': 'KeepAlive-Bot-Monitor/2.0' },
            signal: AbortSignal.timeout(5000)
          });
          details += 'Xarici konteyner pingləndi. ';
        } catch {
          // Ignore external network/SSO redirects cleanly
        }
      }

      // 3. Check & auto-recover Telegram Bot connection
      if (this.checkBotCallback) {
        botOnline = await this.checkBotCallback();
        if (botOnline) {
          details += 'Telegram Bot oyaqdır və cavab verir.';
        } else {
          details += 'Telegram Bot bərpa gözləyir.';
        }
      }

      const latencyMs = Date.now() - startTime;
      this.lastPingLatencyMs = latencyMs;
      this.lastPingStatus = botOnline ? 'success' : 'warning';

      if (source !== 'scheduled' || !botOnline) {
        storage.addLog(
          'keepalive',
          `💓 Keep-Alive Nabız [${source}]: Server aktivdir (${latencyMs}ms). ${details}`,
          { latencyMs, botOnline, totalPings: this.totalPings }
        );
      }

      return {
        success: true,
        latencyMs,
        message: `Keep-alive uğurlu oldu (${latencyMs}ms). ${details}`,
        botOnline
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      this.lastPingLatencyMs = latencyMs;
      this.lastPingStatus = 'error';

      storage.addLog('error', `Keep-Alive xətası: ${err?.message || err}`);
      return {
        success: false,
        latencyMs,
        message: `Xəta: ${err?.message || err}`,
        botOnline: false
      };
    }
  }

  public getStatus(): KeepAliveStatus {
    const config = storage.getConfig();
    const uptimeSeconds = Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const externalPingUrl = `${appUrl.replace(/\/$/, '')}/api/wake`;

    return {
      enabled: config.keepAliveEnabled,
      intervalMinutes: config.keepAliveIntervalMinutes,
      totalPings: this.totalPings,
      webhookPings: this.webhookPings,
      lastPingTime: this.lastPingTime,
      lastPingStatus: this.lastPingStatus,
      lastPingLatencyMs: this.lastPingLatencyMs,
      uptimeSeconds,
      startedAt: this.startedAt.toISOString(),
      externalPingUrl,
      lastWakeReason: this.lastWakeReason,
      appUrl
    };
  }
}

export const keepAliveService = new KeepAliveService();
