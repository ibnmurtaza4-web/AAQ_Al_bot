import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { storage, AVAILABLE_MODELS, OFFICIAL_CHANNEL_URL } from './server/storage.js';
import { telegramBot } from './server/telegramBot.js';
import { geminiService, ROLEPLAY_PERSONAS } from './server/geminiService.js';
import { keepAliveService } from './server/keepAlive.js';
import { syncToGitHub } from './server/githubSync.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// --- API ENDPOINTS ---

// 1. Health & Keep-Alive Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    botActive: telegramBot.isRunning()
  });
});

// 2. Comprehensive Status
app.get('/api/status', async (req, res) => {
  try {
    const config = storage.getConfig();
    const keepAlive = keepAliveService.getStatus();
    const users = storage.getAllUsers();
    const groups = storage.getAllGroups();
    const tickets = storage.getContactTickets();
    const botInfo = telegramBot.getBotInfo() || (await telegramBot.getMe());
    const webhookInfo = await telegramBot.getWebhookInfo();

    res.json({
      botRunning: telegramBot.isRunning(),
      botInfo,
      hasGeminiApiKey: geminiService.hasApiKey(),
      selectedModel: config.model,
      roleplayMode: config.roleplayMode,
      totalUsers: users.length,
      totalGroups: groups.length,
      totalTickets: tickets.length,
      pendingTickets: tickets.filter(t => t.status === 'pending').length,
      adminSecretKey: config.adminSecretKey,
      adminIds: config.adminIds,
      ownerUsername: config.ownerUsername,
      officialChannel: config.officialChannel || OFFICIAL_CHANNEL_URL,
      keepAlive,
      hasToken: !!config.botToken,
      availableModels: AVAILABLE_MODELS,
      connectionMode: telegramBot.getConnectionMode(),
      webhookUrl: telegramBot.getWebhookUrl(),
      isWebhookActive: telegramBot.getConnectionMode() === 'webhook',
      webhookInfo
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Start Bot
app.post('/api/bot/start', async (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      telegramBot.setToken(token);
    }
    const result = await telegramBot.startPolling();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Stop Bot
app.post('/api/bot/stop', async (req, res) => {
  try {
    const result = await telegramBot.stopPolling();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4.1 Webhook Management
app.post('/api/bot/webhook/setup', async (req, res) => {
  try {
    const { url } = req.body;
    const result = await telegramBot.setupWebhook(url);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/bot/webhook/remove', async (req, res) => {
  try {
    const result = await telegramBot.removeWebhook();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/bot/webhook/info', async (req, res) => {
  try {
    const info = await telegramBot.getWebhookInfo();
    res.json({ success: true, info });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Bot Config
app.get('/api/bot/config', (req, res) => {
  res.json({
    config: storage.getConfig(),
    personas: ROLEPLAY_PERSONAS,
    models: AVAILABLE_MODELS,
    officialChannel: OFFICIAL_CHANNEL_URL
  });
});

app.post('/api/bot/config', async (req, res) => {
  try {
    const {
      botToken,
      ownerUsername,
      adminSecretKey,
      adminIds,
      model,
      temperature,
      systemPrompt,
      policyText,
      roleplayMode,
      keepAliveEnabled,
      keepAliveIntervalMinutes,
      autoWelcome,
      antiProfanity,
      antiLink,
      antiSpam,
      connectionMode,
      webhookUrl,
      fastAiMode
    } = req.body;

    const current = storage.getConfig();
    const tokenChanged = botToken !== undefined && botToken.trim() !== current.botToken;

    const updated = storage.updateConfig({
      ...(botToken !== undefined && { botToken: botToken.trim() }),
      ...(ownerUsername !== undefined && { ownerUsername: ownerUsername.trim() }),
      ...(adminSecretKey !== undefined && { adminSecretKey: adminSecretKey.trim() }),
      ...(adminIds !== undefined && { adminIds }),
      ...(model !== undefined && { model }),
      ...(temperature !== undefined && { temperature }),
      ...(systemPrompt !== undefined && { systemPrompt }),
      ...(policyText !== undefined && { policyText }),
      ...(roleplayMode !== undefined && { roleplayMode }),
      ...(keepAliveEnabled !== undefined && { keepAliveEnabled }),
      ...(keepAliveIntervalMinutes !== undefined && { keepAliveIntervalMinutes }),
      ...(autoWelcome !== undefined && { autoWelcome }),
      ...(antiProfanity !== undefined && { antiProfanity }),
      ...(antiLink !== undefined && { antiLink }),
      ...(antiSpam !== undefined && { antiSpam }),
      ...(connectionMode !== undefined && { connectionMode }),
      ...(webhookUrl !== undefined && { webhookUrl }),
      ...(fastAiMode !== undefined && { fastAiMode })
    });

    if (tokenChanged) {
      telegramBot.setToken(updated.botToken);
    }

    if (keepAliveEnabled !== undefined || keepAliveIntervalMinutes !== undefined) {
      keepAliveService.start();
    }

    storage.addLog('admin', '⚙️ Bot və sistem konfiqurasiyası yeniləndi.');
    res.json({ success: true, config: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Registered Users
app.get('/api/users', (req, res) => {
  res.json({ users: storage.getAllUsers() });
});

// 7. Tracked Groups
app.get('/api/groups', (req, res) => {
  res.json({ groups: storage.getAllGroups() });
});

// 8. Contact Tickets System
app.get('/api/tickets', (req, res) => {
  res.json({ tickets: storage.getContactTickets() });
});

app.post('/api/tickets/reply', async (req, res) => {
  try {
    const { ticketId, replyText, repliedBy } = req.body;
    if (!ticketId || !replyText) {
      return res.status(400).json({ error: 'Bilet ID və cavab mətni tələb olunur.' });
    }

    const ticket = storage.getContactTickets().find(t => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Müraciət bileti tapılmadı.' });
    }

    // Send direct reply to user on Telegram
    await telegramBot.sendSafeHtml(
      ticket.userId,
      `🔔 <b>AAQ - AHL AL QALAM RƏHBƏRLİYİNDƏN CAVAB:</b>\n\n${telegramBot.escapeHtml(replyText)}\n\n<i>Müraciətiniz: "${telegramBot.escapeHtml(ticket.message)}"</i>`
    );

    const updatedTicket = storage.updateContactTicketReply(ticketId, replyText, repliedBy || 'AAQ Rəhbərlik');
    storage.addLog('admin', `Veb paneldən biletə (#${ticketId} - ${ticket.userId}) cavab göndərildi: ${replyText}`);

    res.json({ success: true, ticket: updatedTicket });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Block / Unblock User
app.post('/api/users/block', (req, res) => {
  const { userId, reason } = req.body;
  const user = storage.blockUser(Number(userId), reason);
  res.json({ success: !!user, user });
});

app.post('/api/users/unblock', (req, res) => {
  const { userId } = req.body;
  const ok = storage.unblockUser(Number(userId));
  res.json({ success: ok });
});

// 10. Broadcast Announcement
app.post('/api/broadcast', async (req, res) => {
  try {
    const { message, sender, targetType } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Elan mətni boş ola bilməz.' });
    }

    const result = await telegramBot.executeBroadcast(
      message.trim(),
      sender || 'AAQ Rəhbərlik',
      undefined,
      targetType || 'all'
    );
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Direct Message to User / Group
app.post('/api/message/send', async (req, res) => {
  try {
    const { targetId, text } = req.body;
    if (!targetId || !text) {
      return res.status(400).json({ error: 'Hədəf ID və mesaj mətni tələb olunur.' });
    }

    await telegramBot.sendSafeHtml(
      Number(targetId),
      `🔔 <b>AAQ RƏHBƏRLİYİNDƏN BİLDİRİŞ:</b>\n\n${telegramBot.escapeHtml(text)}`
    );

    storage.addLog('admin', `Veb paneldən (${targetId}) ünvanına mesaj göndərildi: ${text}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Activity Logs
app.get('/api/logs', (req, res) => {
  res.json({ logs: storage.getLogs() });
});

app.post('/api/logs/clear', (req, res) => {
  storage.clearLogs();
  res.json({ success: true });
});

// 13. Manual Keep-Alive Ping
app.post('/api/keepalive/ping', async (req, res) => {
  try {
    const result = await keepAliveService.executePing('manual');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Test Gemini AI Chat from Dashboard
app.post('/api/gemini/test', async (req, res) => {
  try {
    const { prompt, persona, model, userId = 999999999 } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt tələb olunur.' });
    }

    const reply = await geminiService.generateChatReply(userId, prompt, persona, model);
    res.json({ success: true, reply });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Personas & Models list
app.get('/api/metadata', (req, res) => {
  res.json({
    personas: ROLEPLAY_PERSONAS,
    models: AVAILABLE_MODELS,
    channel: OFFICIAL_CHANNEL_URL
  });
});

// 16. Telegram Webhook
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    if (update) {
      keepAliveService.recordWake('telegram_webhook', { updateId: update.update_id });
      telegramBot.processUpdate(update).catch(err => {
        storage.addLog('error', `Webhook update xətası: ${err?.message || err}`);
      });
    }
    res.status(200).send('OK');
  } catch (err: any) {
    res.status(200).send('OK');
  }
});

// 17. GitHub Synchronization & Export
app.post('/api/github/sync', async (req, res) => {
  try {
    const { repoUrl, githubToken } = req.body;
    const result = await syncToGitHub({ repoUrl, githubToken });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Sinxronizasiya xətası' });
  }
});

// --- VITE & STATIC FILES SETUP ---
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AAQ Telegram Bot Server işə düşdü: http://localhost:${PORT}`);
    storage.addLog('info', `Server port ${PORT} üzərində işə salındı.`);
  });
}

startServer();
