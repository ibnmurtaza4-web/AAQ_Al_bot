/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatusOverview } from './components/StatusOverview';
import { AdminUsers } from './components/AdminUsers';
import { GeminiSettings } from './components/GeminiSettings';
import { LogsViewer } from './components/LogsViewer';
import { BotSimulator } from './components/BotSimulator';
import { KeepAliveGuide } from './components/KeepAliveGuide';
import { AppStatus, BotConfig, TelegramUser, TelegramGroup, ActivityLog, PersonaOption, ModelDefinition, ContactTicket } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [models, setModels] = useState<ModelDefinition[]>([]);
  const [users, setUsers] = useState<TelegramUser[]>([]);
  const [groups, setGroups] = useState<TelegramGroup[]>([]);
  const [tickets, setTickets] = useState<ContactTicket[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Fetch Status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.availableModels) {
          setModels(data.availableModels);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch Config
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        if (data.personas) {
          setPersonas(data.personas);
        }
        if (data.models) {
          setModels(data.models);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch Groups
  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch Tickets
  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch Logs
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatus();
    fetchConfig();
    fetchUsers();
    fetchGroups();
    fetchTickets();
    fetchLogs();

    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
      fetchUsers();
      fetchGroups();
      fetchTickets();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchStatus, fetchConfig, fetchUsers, fetchGroups, fetchTickets, fetchLogs]);

  // Actions
  const handleStartBot = async (tokenOverride?: string) => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/bot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenOverride })
      });
      const data = await res.json();
      if (!data.success) {
        setErrorBanner(data.message || 'Bot işə düşmədi.');
      } else {
        await fetchStatus();
        await fetchConfig();
        await fetchLogs();
      }
    } catch (e: any) {
      setErrorBanner(e.message || 'Server xətası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopBot = async () => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/bot/stop', { method: 'POST' });
      await res.json();
      await fetchStatus();
      await fetchConfig();
      await fetchLogs();
    } catch (e: any) {
      setErrorBanner(e.message || 'Server xətası');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePingNow = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/keepalive/ping', { method: 'POST' });
      await fetchStatus();
      await fetchLogs();
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfig = async (partial: Partial<BotConfig>) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial)
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        await fetchStatus();
        await fetchLogs();
      }
    } catch (e: any) {
      setErrorBanner(e.message || 'Konfiqurasiya yenilənmədi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupWebhook = async (customUrl?: string) => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/bot/webhook/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: customUrl })
      });
      const data = await res.json();
      if (!data.success) {
        setErrorBanner(data.message || 'Webhook quraşdırılmadı');
      }
      await fetchStatus();
      await fetchConfig();
      await fetchLogs();
      return data;
    } catch (e: any) {
      setErrorBanner(e.message || 'Server xətası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveWebhook = async () => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/bot/webhook/remove', { method: 'POST' });
      const data = await res.json();
      await fetchStatus();
      await fetchConfig();
      await fetchLogs();
      return data;
    } catch (e: any) {
      setErrorBanner(e.message || 'Server xətası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBroadcast = async (message: string, targetType: 'all' | 'users' | 'groups' = 'all') => {
    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sender: 'AAQ Rəhbərlik', targetType })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Elan göndərilmədi');
    }
    await fetchLogs();
    return {
      recipientCount: data.recipientCount,
      successCount: data.successCount,
      failCount: data.failCount
    };
  };

  const handleSendMessageToTarget = async (targetId: number, text: string) => {
    const res = await fetch('/api/message/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, text })
    });
    const data = await res.json();
    await fetchLogs();
    return data.success;
  };

  const handleReplyToTicket = async (ticketId: string, replyMessage: string) => {
    const res = await fetch('/api/tickets/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, replyMessage })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Cavab göndərilmədi');
    }
    await fetchTickets();
    await fetchLogs();
    return data.success;
  };

  const handleBlockUser = async (userId: number, reason: string) => {
    const res = await fetch('/api/users/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reason })
    });
    const data = await res.json();
    await fetchUsers();
    await fetchLogs();
    return data.success;
  };

  const handleUnblockUser = async (userId: number) => {
    const res = await fetch('/api/users/unblock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    await fetchUsers();
    await fetchLogs();
    return data.success;
  };

  const handleClearLogs = async () => {
    await fetch('/api/logs/clear', { method: 'POST' });
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        status={status}
        onStartBot={() => handleStartBot()}
        onStopBot={handleStopBot}
        onPingNow={handlePingNow}
        isLoading={isLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error Notification banner if any */}
        {errorBanner && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shadow-lg">
            <span>{errorBanner}</span>
            <button
              onClick={() => setErrorBanner(null)}
              className="text-rose-400 hover:text-rose-200 font-bold ml-4"
            >
              ×
            </button>
          </div>
        )}

        {/* Tab 1: Status & Overview */}
        {activeTab === 'overview' && (
          <StatusOverview
            status={status}
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onStartBot={handleStartBot}
            onStopBot={handleStopBot}
            onPingNow={handlePingNow}
            onSetupWebhook={handleSetupWebhook}
            onRemoveWebhook={handleRemoveWebhook}
            isLoading={isLoading}
          />
        )}

        {/* Tab 2: Admin Center & Users & Groups & Tickets */}
        {activeTab === 'admin' && (
          <AdminUsers
            users={users}
            groups={groups}
            tickets={tickets}
            config={config}
            onSendBroadcast={handleSendBroadcast}
            onSendMessageToTarget={handleSendMessageToTarget}
            onReplyToTicket={handleReplyToTicket}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onRefreshData={() => { fetchUsers(); fetchGroups(); fetchTickets(); }}
            isLoading={isLoading}
          />
        )}

        {/* Tab 3: Gemini AI & Roleplay Settings */}
        {activeTab === 'gemini' && (
          <GeminiSettings
            config={config}
            personas={personas}
            models={models}
            onUpdateConfig={handleUpdateConfig}
            isLoading={isLoading}
          />
        )}

        {/* Tab 4: Simulator & Chat / Command Tester */}
        {activeTab === 'simulator' && (
          <BotSimulator
            personas={personas}
            activePersona={config?.roleplayMode || 'default'}
            models={models}
            activeModel={config?.model || 'gemini-3.8-flash'}
          />
        )}

        {/* Tab 5: Live Activity Logs */}
        {activeTab === 'logs' && (
          <LogsViewer
            logs={logs}
            onClearLogs={handleClearLogs}
            onRefreshLogs={fetchLogs}
            isLoading={isLoading}
          />
        )}

        {/* Tab 6: Keep-Alive Guide */}
        {activeTab === 'keepalive' && (
          <KeepAliveGuide
            keepAlive={status?.keepAlive || null}
            status={status}
            onPingNow={handlePingNow}
            onSetupWebhook={handleSetupWebhook}
            onRemoveWebhook={handleRemoveWebhook}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AAQ - Ahl Al Qalam (AAG Əhl-ül Qələm) Bot & Keep-Alive System</span>
          <a
            href="https://t.me/AAQ_Offical"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            Rəsmi Kanal: t.me/AAQ_Offical
          </a>
        </div>
      </footer>

    </div>
  );
}
