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
    this.webhookPings++;
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

    const intervalMs = Math.max(1, config.keepAliveIntervalMinutes || 2) * 60 * 1000;
    storage.addLog('keepalive', `Keep-Alive işə salındı. İnterval: ${config.keepAliveIntervalMinutes || 2} dəqiqə.`);

    this.timer = setInterval(() => {
      this.executePing('scheduled');
    }, intervalMs);

    // Initial ping after 5 seconds to wake all subsystems quickly
    setTimeout(() => {
      this.executePing('initial');
    }, 5000);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async executePing(source: 'scheduled' | 'manual' | 'initial' = 'manual'): Promise<{
    success: boolean;
    latencyMs: number;
    message: string;
    botOnline: boolean;
  }> {
    const startTime = Date.now();
    this.totalPings++;
    this.lastPingTime = new Date().toISOString();

    let botOnline = false;
    let details = '';

    try {
      // 1. Self-ping internal health endpoint
      const port = process.env.PORT || 3000;
      try {
        const res = await fetch(`http://localhost:${port}/api/health`, { method: 'GET' });
        if (res.ok) {
          details += 'Internal server OK. ';
        }
      } catch (e: any) {
        details += `Local ping info: ${e?.message || 'ok'}. `;
      }

      // 2. If APP_URL is present, ping external URL to keep container alive
      const appUrl = process.env.APP_URL;
      if (appUrl && appUrl.startsWith('http')) {
        try {
          await fetch(`${appUrl.replace(/\/$/, '')}/api/health`, {
            method: 'GET',
            headers: { 'User-Agent': 'KeepAlive-Bot-Monitor/1.0' }
          });
          details += 'Cloud Run container pinged. ';
        } catch (e) {
          // Ignore external network errors
        }
      }

      // 3. Check Telegram Bot connection if checker is registered
      if (this.checkBotCallback) {
        botOnline = await this.checkBotCallback();
        if (botOnline) {
          details += 'Telegram Bot canlıdır və cavab verir.';
        } else {
          details += 'Telegram Bot polling gözləmədədir və ya offline vəziyyətdədir.';
        }
      }

      const latencyMs = Date.now() - startTime;
      this.lastPingLatencyMs = latencyMs;
      this.lastPingStatus = botOnline ? 'success' : 'warning';

      storage.addLog(
        'keepalive',
        `💓 Keep-Alive Nabız [${source}]: Server aktivdir (${latencyMs}ms). ${details}`,
        { latencyMs, botOnline, totalPings: this.totalPings }
      );

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
    const externalPingUrl = `${appUrl.replace(/\/$/, '')}/api/health`;

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
