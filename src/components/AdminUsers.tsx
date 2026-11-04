import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Send, 
  MessageSquare, 
  Shield, 
  Copy, 
  Check, 
  Radio, 
  Clock,
  Building2,
  Lock,
  Unlock,
  Key,
  Inbox,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TelegramUser, TelegramGroup, BotConfig, ContactTicket } from '../types';

interface AdminUsersProps {
  users: TelegramUser[];
  groups: TelegramGroup[];
  tickets: ContactTicket[];
  config: BotConfig | null;
  onSendBroadcast: (message: string, targetType: 'all' | 'users' | 'groups') => Promise<{ successCount: number; failCount: number; recipientCount: number }>;
  onSendMessageToTarget: (targetId: number, text: string) => Promise<boolean>;
  onReplyToTicket: (ticketId: string, replyText: string) => Promise<boolean>;
  onBlockUser: (userId: number, reason: string) => Promise<boolean>;
  onUnblockUser: (userId: number) => Promise<boolean>;
  onRefreshData: () => void;
  isLoading: boolean;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  groups,
  tickets,
  config,
  onSendBroadcast,
  onSendMessageToTarget,
  onReplyToTicket,
  onBlockUser,
  onUnblockUser,
  onRefreshData,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'tickets'>('tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<{ id: number; name: string; isGroup: boolean } | null>(null);
  const [directMsgText, setDirectMsgText] = useState('');
  const [directMsgLoading, setDirectMsgLoading] = useState(false);
  const [directMsgStatus, setDirectMsgStatus] = useState<string | null>(null);

  const [selectedTicket, setSelectedTicket] = useState<ContactTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketReplyLoading, setTicketReplyLoading] = useState(false);

  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastTargetType, setBroadcastTargetType] = useState<'all' | 'users' | 'groups'>('all');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    successCount: number;
    failCount: number;
    recipientCount: number;
  } | null>(null);

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const username = (u.username || '').toLowerCase();
    const id = String(u.id);
    return name.includes(term) || username.includes(term) || id.includes(term);
  });

  const filteredGroups = groups.filter((g) => {
    const term = searchTerm.toLowerCase();
    const title = (g.title || '').toLowerCase();
    const id = String(g.id);
    return title.includes(term) || id.includes(term);
  });

  const filteredTickets = tickets.filter((t) => {
    const term = searchTerm.toLowerCase();
    const name = (t.userName || '').toLowerCase();
    const msg = (t.message || '').toLowerCase();
    const id = String(t.userId);
    return name.includes(term) || msg.includes(term) || id.includes(term);
  });

  const handleCopyId = (id: number) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopySecretKey = () => {
    const key = config?.adminSecretKey || 'admin_secret';
    navigator.clipboard.writeText(`/admin ${key}`);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget || !directMsgText.trim()) return;

    setDirectMsgLoading(true);
    setDirectMsgStatus(null);
    try {
      const ok = await onSendMessageToTarget(selectedTarget.id, directMsgText.trim());
      if (ok) {
        setDirectMsgStatus('Mesaj uğurla göndərildi!');
        setDirectMsgText('');
        setTimeout(() => {
          setSelectedTarget(null);
          setDirectMsgStatus(null);
        }, 1800);
      } else {
        setDirectMsgStatus('Xəta: Mesaj göndərilə bilmədi.');
      }
    } catch (err: any) {
      setDirectMsgStatus(`Xəta: ${err?.message || 'Bilinməyən xəta'}`);
    } finally {
      setDirectMsgLoading(false);
    }
  };

  const handleReplyTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;

    setTicketReplyLoading(true);
    try {
      const ok = await onReplyToTicket(selectedTicket.id, ticketReplyText.trim());
      if (ok) {
        setTicketReplyText('');
        setSelectedTicket(null);
        onRefreshData();
      }
    } catch (err: any) {
      alert(`Cavab göndərilmədi: ${err?.message || err}`);
    } finally {
      setTicketReplyLoading(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    setBroadcastLoading(true);
    setBroadcastResult(null);
    try {
      const result = await onSendBroadcast(broadcastText.trim(), broadcastTargetType);
      setBroadcastResult(result);
      setBroadcastText('');
    } catch (err: any) {
      alert(`Elan göndərilmədi: ${err?.message || err}`);
    } finally {
      setBroadcastLoading(false);
    }
  };

  const pendingCount = tickets.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Top Split: Broadcast Elan Studio + Admin Authorization Key */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Broadcast Studio */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h2 className="text-sm font-semibold text-white">AAQ Toplu Rəsmi Elan Studio</h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-indigo-300 font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                👥 {users.length} İstifadəçi
              </span>
              <span className="text-cyan-300 font-medium px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                🏛️ {groups.length} Qrup
              </span>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-3">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
              <span className="text-slate-400">Hədəf:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={broadcastTargetType === 'all'}
                  onChange={() => setBroadcastTargetType('all')}
                  className="accent-indigo-500"
                />
                <span>Hamısı (İstifadəçilər & Qruplar)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="users"
                  checked={broadcastTargetType === 'users'}
                  onChange={() => setBroadcastTargetType('users')}
                  className="accent-indigo-500"
                />
                <span>Yalnız İstifadəçilər</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="groups"
                  checked={broadcastTargetType === 'groups'}
                  onChange={() => setBroadcastTargetType('groups')}
                  className="accent-indigo-500"
                />
                <span>Yalnız Qruplar</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Elan Mətni (Rəsmi AAQ bildirişi kimi çatdırılacaq)
              </label>
              <textarea
                rows={3}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Hörmətli istifadəçilər! AAQ - Ahl Al Qalam sistemində yeniliklər tətbiq edildi..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Broadcast Result Banner */}
            {broadcastResult && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <div>
                  <strong className="font-semibold block text-emerald-200">Elan uğurla göndərildi!</strong>
                  <span>Çatdırıldı: {broadcastResult.successCount} / Xəta: {broadcastResult.failCount} / Cəmi: {broadcastResult.recipientCount}</span>
                </div>
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Elan təhlükəsiz batch interval ilə göndərilir.
              </span>
              <button
                type="submit"
                disabled={broadcastLoading || !broadcastText.trim() || (users.length === 0 && groups.length === 0)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{broadcastLoading ? 'Göndərilir...' : 'Elanı Yayımla'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Admin Secret Key & Commands */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Admin Giriş Şifrəsi</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              /admin
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Telegram-da bota <code>/admin {config?.adminSecretKey || 'admin_secret'}</code> yazaraq dərhal öz hesabınızı rəsmi admin kimi qeydiyyatdan keçirə bilərsiniz.
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="font-mono text-xs text-cyan-300">
              /admin {config?.adminSecretKey || 'admin_secret'}
            </div>
            <button
              onClick={handleCopySecretKey}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
              <span className="text-cyan-400 font-bold">/panel</span> — Rəhbər idarəetmə paneli
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
              <span className="text-indigo-400 font-bold">/msg &lt;id&gt; &lt;mətn&gt;</span> — Şəxsi cavab
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs: Tickets / Users / Groups */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'tickets'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>İstifadəçi Müraciətləri</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>İstifadəçilər ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('groups')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'groups'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Qruplar ({groups.length})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ad, @username və ya ID axtar..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tab 1: Tickets (/elaqe) List */}
        {activeTab === 'tickets' && (
          <div>
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {tickets.length === 0 
                  ? 'Hələlik /elaqe əmri ilə heç bir müraciət daxil olmayıb.'
                  : 'Axtarışa uyğun müraciət tapılmadı.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((t) => {
                  const isReplied = t.status === 'replied';
                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isReplied
                          ? 'bg-slate-950/40 border-slate-800/80'
                          : 'bg-indigo-950/20 border-indigo-500/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${isReplied ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                          <div>
                            <span className="font-semibold text-xs text-slate-200">
                              {t.userName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono ml-2">
                              (ID: {t.userId} {t.userUsername ? `@${t.userUsername}` : ''})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 text-[11px]">
                            {new Date(t.createdAt).toLocaleString('az-AZ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            isReplied
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}>
                            {isReplied ? 'Cavablandı' : 'Gözləyir'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap">
                        💬 <strong>Müraciət:</strong> {t.message}
                      </div>

                      {t.replyText && (
                        <div className="mt-2 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
                          ✅ <strong>AAQ Rəhbərlik Cavabı:</strong> {t.replyText}
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            {t.repliedAt ? new Date(t.repliedAt).toLocaleString('az-AZ') : ''}
                          </span>
                        </div>
                      )}

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isReplied ? 'Yenidən Cavab Yaz' : 'Cavab Göndər'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Users Table */}
        {activeTab === 'users' && (
          <div>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {users.length === 0 
                  ? 'Hələlik heç bir istifadəçi qeydə alınmayıb.'
                  : 'Axtarışa uyğun istifadəçi tapılmadı.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-medium">
                      <th className="pb-3 pl-2">İstifadəçi</th>
                      <th className="pb-3">Telegram ID</th>
                      <th className="pb-3">Sözləşmə</th>
                      <th className="pb-3">Mesaj Sayı</th>
                      <th className="pb-3">Aktiv Model</th>
                      <th className="pb-3">Son Fəallıq</th>
                      <th className="pb-3 text-right pr-2">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((user) => {
                      const isAdmin = (config?.adminIds || []).includes(user.id);
                      return (
                        <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 pl-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-indigo-950 border border-slate-700 flex items-center justify-center font-bold text-indigo-300 text-xs">
                                {(user.first_name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-slate-200 flex items-center gap-1.5">
                                  <span>{user.first_name || 'Adsız'} {user.last_name || ''}</span>
                                  {isAdmin && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                      ADMIN
                                    </span>
                                  )}
                                  {user.isBlocked && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                      BLOK
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {user.username ? `@${user.username}` : 'username yoxdur'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3">
                            <button
                              onClick={() => handleCopyId(user.id)}
                              className="flex items-center gap-1 font-mono text-slate-400 hover:text-indigo-400 transition"
                              title="ID-ni Kopyala"
                            >
                              <span>{user.id}</span>
                              {copiedId === user.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-600" />
                              )}
                            </button>
                          </td>

                          <td className="py-3">
                            {user.acceptedTerms ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Qəbul edib
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" /> Gözləyir
                              </span>
                            )}
                          </td>

                          <td className="py-3 font-mono text-slate-300">
                            {user.messageCount} mesaj
                          </td>

                          <td className="py-3 font-mono text-cyan-400 text-[11px]">
                            {user.selectedModel || 'Standart'}
                          </td>

                          <td className="py-3 text-slate-400">
                            {new Date(user.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          <td className="py-3 text-right pr-2">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedTarget({ id: user.id, name: user.first_name || 'İstifadəçi', isGroup: false })}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 transition text-xs font-medium flex items-center gap-1"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Mesaj</span>
                              </button>
                              
                              {user.isBlocked ? (
                                <button
                                  onClick={() => onUnblockUser(user.id)}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition"
                                  title="Blokdan Çıxar"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => onBlockUser(user.id, 'Qaydaların pozulması')}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                                  title="İstifadəçini Blokla"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Groups Table */}
        {activeTab === 'groups' && (
          <div>
            {filteredGroups.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {groups.length === 0 
                  ? 'Bot hələlik heç bir qrupda iştirak etmir.'
                  : 'Axtarışa uyğun qrup tapılmadı.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-medium">
                      <th className="pb-3 pl-2">Qrup Adı</th>
                      <th className="pb-3">Qrup ID</th>
                      <th className="pb-3">Növ</th>
                      <th className="pb-3">Mesaj Sayı</th>
                      <th className="pb-3">Son Fəallıq</th>
                      <th className="pb-3 text-right pr-2">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredGroups.map((group) => (
                      <tr key={group.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pl-2 font-medium text-slate-200">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-cyan-400" />
                            <span>{group.title}</span>
                          </div>
                        </td>

                        <td className="py-3 font-mono text-slate-400">
                          {group.id}
                        </td>

                        <td className="py-3 capitalize text-slate-400">
                          {group.type}
                        </td>

                        <td className="py-3 font-mono text-slate-300">
                          {group.messageCount} mesaj
                        </td>

                        <td className="py-3 text-slate-400">
                          {new Date(group.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={() => setSelectedTarget({ id: group.id, name: group.title, isGroup: true })}
                            className="px-3 py-1.5 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 transition text-xs font-medium flex items-center gap-1.5 ml-auto"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Qrupa Mesaj Göndər</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Ticket Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">
                  İstifadəçi Müraciətinə Cavab ({selectedTicket.userName})
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-200 text-lg"
              >
                ×
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-500 block mb-1">Müraciət Mətni:</span>
              {selectedTicket.message}
            </div>

            <form onSubmit={handleReplyTicketSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  AAQ Rəhbərliyi Adından Cavabınız:
                </label>
                <textarea
                  rows={4}
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  placeholder="Hörmətli istifadəçi, müraciətinizlə bağlı..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={ticketReplyLoading || !ticketReplyText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{ticketReplyLoading ? 'Göndərilir...' : 'Cavabı İstifadəçiyə Çatdır'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Message Modal */}
      {selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {selectedTarget.isGroup ? 'Qrupa Bildiriş Göndər' : 'İstifadəçiyə Şəxsi Mesaj'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hədəf: <strong>{selectedTarget.name}</strong> (ID: <code className="font-mono text-cyan-300">{selectedTarget.id}</code>)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTarget(null)}
                className="text-slate-400 hover:text-slate-200 text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSendDirectMessage} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Mesajınız (AAQ Rəhbərlik adından göndəriləcək)
                </label>
                <textarea
                  rows={4}
                  value={directMsgText}
                  onChange={(e) => setDirectMsgText(e.target.value)}
                  placeholder="Salam! AAQ Rəhbərliyi tərəfindən bildiriş..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {directMsgStatus && (
                <div className={`p-3 rounded-xl text-xs ${
                  directMsgStatus.includes('Xəta') ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                }`}>
                  {directMsgStatus}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={directMsgLoading || !directMsgText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{directMsgLoading ? 'Göndərilir...' : 'Mesajı Çatdır'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
