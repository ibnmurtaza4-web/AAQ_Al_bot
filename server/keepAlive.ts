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
  httpKeepAliveTimeoutMs: number;
  watchdogIntervalSeconds: number;
  webhookHealthOk: boolean;
  lastWebhookCheckAt: string | null;
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
  private webhookHealthOk: boolean = true;
  private lastWebhookCheckAt: string | null = null;
  private httpKeepAliveTimeoutMs: number = 180000; // 3 dəqiqə uzunmüddətli TCP Keep-Alive
  private readonly watchdogIntervalSeconds: number = 30;
  private checkBotCallback: (() => Promise<boolean>) | null = null;
  private checkWebhookCallback: (() => Promise<boolean>) | null = null;

  constructor() {
    this.start();
  }

  public recordWake(reason: string, details?: any) {
    this.totalPings++;
    if (reason.includes('webhook')) {
      this.webhookPings++;
      this.webhookHealthOk = true;
      this.lastWebhookCheckAt = new Date().toISOString();
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

  public registerWebhookChecker(callback: () => Promise<boolean>) {
    this.checkWebhookCallback = callback;
  }

  public setHttpKeepAliveTimeout(ms: number) {
    this.httpKeepAliveTimeoutMs = ms;
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
    storage.addLog(
      'keepalive',
      `Keep-Alive 2.0 & Gücləndirilmiş Watchdog işə salındı. İnterval: ${intervalMinutes} dəqiqə | Watchdog: ${this.watchdogIntervalSeconds}s | Socket Keep-Alive: ${Math.round(this.httpKeepAliveTimeoutMs / 1000)}s.`
    );

    this.timer = setInterval(() => {
      this.executePing('scheduled');
    }, intervalMs);

    // High-frequency 30s watchdog keeps container & bot connections resilient 24/7
    this.watchdogTimer = setInterval(async () => {
      const port = process.env.PORT || 3000;
      try {
        await fetch(`http://localhost:${port}/api/health`, {
          method: 'GET',
          headers: { Connection: 'keep-alive', 'User-Agent': 'AAQ-Watchdog/2.0' },
          signal: AbortSignal.timeout(4000)
        }).catch(() => {});
      } catch {
        // ignore transient self-check issues
      }

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

      if (this.checkWebhookCallback) {
        try {
          this.webhookHealthOk = await this.checkWebhookCallback();
          this.lastWebhookCheckAt = new Date().toISOString();
        } catch {
          this.webhookHealthOk = false;
        }
      }
    }, this.watchdogIntervalSeconds * 1000);

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
    webhookHealthy: boolean;
  }> {
    const startTime = Date.now();
    this.totalPings++;
    this.lastPingTime = new Date().toISOString();
    this.lastWakeReason = source;

    let botOnline = false;
    let webhookHealthy = true;
    let details = '';

    try {
      // 1. Self-ping internal health endpoint with keep-alive header
      const port = process.env.PORT || 3000;
      try {
        const res = await fetch(`http://localhost:${port}/api/health`, {
          method: 'GET',
          headers: { Connection: 'keep-alive', 'User-Agent': 'AAQ-KeepAlive/2.0' },
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          details += 'Daxili server OK. ';
        }
      } catch (e: any) {
        details += `Local ping: ${e?.message || 'ok'}. `;
      }

      // 2. If APP_URL is present, ping external URL (/api/health and /api/telegram/webhook) to prevent scale-to-zero
      const appUrl = (process.env.APP_URL || '').trim();
      if (appUrl && appUrl.startsWith('http')) {
        try {
          const cleanAppUrl = appUrl.replace(/\/$/, '');
          await fetch(`${cleanAppUrl}/api/health`, {
            method: 'GET',
            headers: {
              Connection: 'keep-alive',
              'User-Agent': 'KeepAlive-Bot-Monitor/2.0'
            },
            signal: AbortSignal.timeout(6000)
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
          details += 'Telegram Bot oyaqdır. ';
        } else {
          details += 'Telegram Bot bərpa gözləyir. ';
        }
      }

      // 4. Verify Webhook health if active
      if (this.checkWebhookCallback) {
        webhookHealthy = await this.checkWebhookCallback();
        this.webhookHealthOk = webhookHealthy;
        this.lastWebhookCheckAt = new Date().toISOString();
      }

      const latencyMs = Date.now() - startTime;
      this.lastPingLatencyMs = latencyMs;
      this.lastPingStatus = botOnline ? 'success' : 'warning';

      if (source !== 'scheduled' || !botOnline) {
        storage.addLog(
          'keepalive',
          `💓 Keep-Alive Nabız [${source}]: Server aktivdir (${latencyMs}ms). ${details}`,
          { latencyMs, botOnline, webhookHealthy, totalPings: this.totalPings }
        );
      }

      return {
        success: true,
        latencyMs,
        message: `Keep-alive uğurlu oldu (${latencyMs}ms). ${details}`,
        botOnline,
        webhookHealthy
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
        botOnline: false,
        webhookHealthy: false
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
      appUrl,
      httpKeepAliveTimeoutMs: this.httpKeepAliveTimeoutMs,
      watchdogIntervalSeconds: this.watchdogIntervalSeconds,
      webhookHealthOk: this.webhookHealthOk,
      lastWebhookCheckAt: this.lastWebhookCheckAt
    };
  }
}

export const keepAliveService = new KeepAliveService();
