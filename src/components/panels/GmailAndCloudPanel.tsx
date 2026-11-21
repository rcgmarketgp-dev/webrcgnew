import React, { useEffect, useState } from 'react';
import {
  Archive,
  BookmarkPlus,
  Check,
  CloudUpload,
  FolderPlus,
  Inbox,
  LogOut,
  Mail,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import {
  CloudInquiryRecord,
  getAccessToken,
  googleSignIn,
  initAuth,
  logout,
  saveInquiryToCloud,
  subscribeInquiries,
  updateInquiryStatus,
} from '../../firebase/firebaseClient';
import { useEditorStore } from '../../store/useEditorStore';
import { GoogleSignInButton } from '../auth/GoogleSignInButton';

interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  fromEmail: string;
  date: string;
  snippet: string;
  unread: boolean;
}

function parseFromHeader(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.*?)<([^>]+)>$/);
  if (match) {
    return { name: match[1].replace(/"/g, '').trim() || match[2], email: match[2].trim() };
  }
  return { name: raw.trim() || 'Unknown', email: raw.trim() || 'unknown@example.com' };
}

function encodeBase64UrlUtf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

type PendingAction =
  | { kind: 'send'; to: string; subject: string; body: string }
  | { kind: 'trash'; messageId: string; subject: string }
  | { kind: 'markRead'; messageId: string; subject: string }
  | null;

export const GmailAndCloudPanel: React.FC = () => {
  const {
    lang,
    showToast,
    authUser,
    activeProjectId,
    cloudProjects,
    cloudSyncStatus,
    selectCloudProject,
    createCloudProject,
    deleteCloudProject,
    syncNowToCloud,
  } = useEditorStore();
  const isFa = lang === 'fa';

  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');

  // Cloud Inquiries state
  const [inquiries, setInquiries] = useState<CloudInquiryRecord[]>([]);

  // Gmail state
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMail, setLoadingMail] = useState(false);
  const [mailError, setMailError] = useState<string | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<GmailMessageSummary | null>(null);

  // Compose state
  const [composeOpen, setComposeOpen] = useState(false);
  const [toInput, setToInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');

  // Mandatory explicit confirmation dialog for mutating/destructive Gmail operations
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    const unsub = initAuth(
      (_u, tkn) => {
        if (tkn) setToken(tkn);
      },
      () => {
        setToken(null);
        setMessages([]);
      }
    );
    return () => unsub();
  }, []);

  // Subscribe to user's Firestore CRM inquiries when authenticated
  useEffect(() => {
    if (!authUser) {
      setInquiries([]);
      return;
    }
    const unsubInq = subscribeInquiries(authUser.uid, setInquiries);
    return () => {
      unsubInq();
    };
  }, [authUser]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      setToken(res.accessToken);
      showToast(isFa ? 'اتصال حساب گوگل و جیمیل برقرار شد' : 'Signed in with Google & Gmail', 'success');
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchGmailMessages = async (overrideToken?: string) => {
    const activeToken = overrideToken || token || getAccessToken();
    if (!activeToken) return;
    setLoadingMail(true);
    setMailError(null);
    try {
      const qParam = searchQuery.trim() ? `&q=${encodeURIComponent(searchQuery.trim())}` : '';
      const listRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10${qParam}`,
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      if (listRes.status === 401) {
        setToken(null);
        setMailError(isFa ? 'نشست جیمیل منقضی شده است؛ لطفاً دوباره وارد شوید.' : 'Gmail session expired; please sign in again.');
        return;
      }
      if (!listRes.ok) {
        const errBody = await listRes.text();
        setMailError(`Gmail API (${listRes.status}): ${errBody.slice(0, 140)}`);
        return;
      }
      const listData = await listRes.json();
      const ids: { id: string; threadId: string }[] = listData.messages || [];

      const details = await Promise.all(
        ids.slice(0, 8).map(async (m) => {
          const msgRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${activeToken}` } }
          );
          const msgData = await msgRes.json();
          const headers: { name: string; value: string }[] = msgData.payload?.headers || [];
          const getH = (n: string) => headers.find((h) => h.name.toLowerCase() === n.toLowerCase())?.value || '';
          const parsedFrom = parseFromHeader(getH('From'));
          return {
            id: msgData.id,
            threadId: msgData.threadId,
            subject: getH('Subject') || (isFa ? '(بدون عنوان)' : '(No Subject)'),
            from: parsedFrom.name,
            fromEmail: parsedFrom.email,
            date: getH('Date'),
            snippet: msgData.snippet || '',
            unread: Array.isArray(msgData.labelIds) && msgData.labelIds.includes('UNREAD'),
          } as GmailMessageSummary;
        })
      );
      setMessages(details);
    } catch (err: unknown) {
      setMailError(err instanceof Error ? err.message : 'Failed to fetch Gmail messages');
    } finally {
      setLoadingMail(false);
    }
  };

  useEffect(() => {
    if (token) {
      void fetchGmailMessages(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSyncProject = async () => {
    if (!authUser) return;
    await syncNowToCloud();
    showToast(isFa ? 'پروژه با Firestore همگام‌سازی شد' : 'Project synced to Firestore', 'success');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    await createCloudProject(newProjectName);
    setNewProjectName('');
    showToast(isFa ? 'پروژه جدید در Firestore ایجاد شد' : 'New project created in Firestore', 'success');
  };

  const executeConfirmedGmailAction = async () => {
    if (!pendingAction || !token) return;
    const action = pendingAction;
    setPendingAction(null);

    try {
      if (action.kind === 'send') {
        const mime = [
          `To: ${action.to}`,
          `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(action.subject)))}?=`,
          'Content-Type: text/plain; charset="UTF-8"',
          '',
          action.body,
        ].join('\r\n');

        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodeBase64UrlUtf8(mime) }),
        });
        if (!res.ok) throw new Error(`Send failed (${res.status})`);
        setComposeOpen(false);
        setToInput('');
        setSubjectInput('');
        setBodyInput('');
        showToast(isFa ? 'ایمیل با موفقیت ارسال شد' : 'Email sent via Gmail', 'success');
        void fetchGmailMessages();
      } else if (action.kind === 'trash') {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${action.messageId}/trash`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error(`Trash failed (${res.status})`);
        setSelectedMsg(null);
        showToast(isFa ? 'پیام به زباله‌دان منتقل شد' : 'Message moved to Trash', 'info');
        void fetchGmailMessages();
      } else if (action.kind === 'markRead') {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${action.messageId}/modify`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
          }
        );
        if (!res.ok) throw new Error(`Modify failed (${res.status})`);
        showToast(isFa ? 'وضعیت پیام به خوانده‌شده تغییر یافت' : 'Marked as read', 'success');
        void fetchGmailMessages();
      }
    } catch (err: unknown) {
      setMailError(err instanceof Error ? err.message : 'Gmail action failed');
    }
  };

  return (
    <div className="space-y-4 p-3 text-xs">
      {/* Header / Auth State */}
      {!authUser ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-[#0B1F3D]/80 p-3 space-y-3">
          <div className="font-bold flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-[#F26A1B]" />
            <span>{isFa ? 'اتصال گوگل، جیمیل و Firestore' : 'Google, Gmail & Firestore'}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {isFa
              ? 'برای ذخیره خودکار پروژه‌ها و صفحات در Firestore و مدیریت ایمیل‌های مشتریان در جیمیل، با حساب گوگل خود وارد شوید.'
              : 'Sign in with Google to persist your projects and pages in Firestore and manage customer inquiries in Gmail.'}
          </p>
          {authError && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-[11px] text-red-400">
              {authError}
            </div>
          )}
          <GoogleSignInButton
            onClick={handleLogin}
            disabled={isLoggingIn}
            label={isLoggingIn ? '...' : isFa ? 'ورود با حساب گوگل' : 'Sign in with Google'}
          />
        </div>
      ) : (
        <>
          {/* Signed-in Bar */}
          <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-[#0B1F3D]/80 p-2.5">
            <div className="min-w-0">
              <div className="font-bold truncate">{authUser.displayName || authUser.email}</div>
              <div className="text-[10px] text-slate-400 truncate" dir="ltr">
                {authUser.email}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              title={isFa ? 'خروج' : 'Sign Out'}
              className="rounded-lg border border-slate-300 dark:border-slate-700 p-1.5 text-slate-400 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Firestore Cloud Projects & Auto-Sync */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-[#0B1F3D]/70 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold">{isFa ? 'پروژه‌های ابری Firestore' : 'Firestore Projects'}</span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {cloudProjects.length} {isFa ? 'پروژه' : 'projects'}
              </span>
            </div>

            {cloudProjects.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {cloudProjects.map((cp) => {
                  const isActive = cp.id === activeProjectId;
                  return (
                    <div
                      key={cp.id}
                      className={`flex items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors ${
                        isActive
                          ? 'border-[#F26A1B] bg-[#F26A1B]/10'
                          : 'border-slate-200 dark:border-slate-700/70 hover:border-slate-400'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => selectCloudProject(cp.id)}
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-start"
                      >
                        {isActive && <Check className="h-3 w-3 shrink-0 text-[#F26A1B]" />}
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{cp.projectName}</div>
                          <div className="text-[10px] text-slate-400">
                            {cp.pageCount} {isFa ? 'صفحه' : 'pages'} · {cp.blockCount}{' '}
                            {isFa ? 'بلوک' : 'blocks'}
                          </div>
                        </div>
                      </button>
                      {cloudProjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => void deleteCloudProject(cp.id)}
                          title={isFa ? 'حذف پروژه' : 'Delete project'}
                          className="rounded p-1 text-slate-400 hover:bg-red-500/15 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="flex gap-1.5">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder={isFa ? 'نام پروژه جدید...' : 'New project name...'}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#12284A] px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-[#F26A1B]"
              />
              <button
                type="submit"
                title={isFa ? 'ساخت پروژه ابری' : 'Create Cloud Project'}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#12315F] px-2 py-1 text-[11px] font-semibold hover:border-[#F26A1B]"
              >
                <FolderPlus className="h-3.5 w-3.5 text-[#F26A1B]" />
                <span>{isFa ? 'جدید' : 'New'}</span>
              </button>
            </form>

            <button
              type="button"
              disabled={cloudSyncStatus === 'saving'}
              onClick={handleSyncProject}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1E4A8A] py-2 font-semibold text-white hover:bg-[#3366B0] disabled:opacity-50"
            >
              <CloudUpload className="h-3.5 w-3.5" />
              <span>
                {cloudSyncStatus === 'saving'
                  ? '...'
                  : isFa
                  ? 'همگام‌سازی فوری در ابر'
                  : 'Sync Project Now'}
              </span>
            </button>
          </div>

          {!token ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-[#0B1F3D]/80 p-3 space-y-2.5">
              <div className="font-bold flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-[#F26A1B]" />
                <span>{isFa ? 'اتصال مجدد صندوق جیمیل' : 'Reconnect Gmail Inbox'}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isFa
                  ? 'ذخیره ابری Firestore فعال است؛ برای خواندن و ارسال ایمیل در جیمیل مجوز دسترسی را تایید کنید.'
                  : 'Firestore sync is active. Authorize Gmail access to read and reply to customer emails.'}
              </p>
              <GoogleSignInButton
                onClick={handleLogin}
                disabled={isLoggingIn}
                label={isLoggingIn ? '...' : isFa ? 'اتصال جیمیل' : 'Connect Gmail'}
              />
            </div>
          ) : (
            <>

          {/* Gmail Inbox Toolbar */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-700/70 pt-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold flex items-center gap-1.5">
                <Inbox className="h-3.5 w-3.5 text-[#F26A1B]" />
                <span>{isFa ? 'صندوق ورودی جیمیل' : 'Gmail Inbox'}</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setComposeOpen((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-md bg-[#F26A1B] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#FF8A3D]"
                >
                  <Send className="h-3 w-3" />
                  <span>{isFa ? 'ارسال ایمیل' : 'Compose'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void fetchGmailMessages()}
                  className="rounded-md border border-slate-300 dark:border-slate-700 p-1 hover:border-[#F26A1B]"
                  title={isFa ? 'به‌روزرسانی' : 'Refresh'}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingMail ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void fetchGmailMessages();
              }}
              className="flex gap-1.5"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute start-2 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isFa ? 'جستجو در جیمیل...' : 'Search Gmail...'}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] ps-7 pe-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#F26A1B]"
                />
              </div>
            </form>

            {mailError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-[11px] text-red-400">
                {mailError}
              </div>
            )}

            {/* Compose Form */}
            {composeOpen && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!toInput.trim() || !subjectInput.trim()) return;
                  setPendingAction({
                    kind: 'send',
                    to: toInput.trim(),
                    subject: subjectInput.trim(),
                    body: bodyInput,
                  });
                }}
                className="rounded-xl border border-[#F26A1B]/50 bg-slate-50 dark:bg-[#0B1F3D] p-2.5 space-y-2"
              >
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] px-2 py-1 text-xs outline-none"
                />
                <input
                  type="text"
                  required
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder={isFa ? 'موضوع ایمیل' : 'Subject'}
                  className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] px-2 py-1 text-xs outline-none"
                />
                <textarea
                  rows={3}
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  placeholder={isFa ? 'متن پیام...' : 'Message body...'}
                  className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] px-2 py-1 text-xs outline-none"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setComposeOpen(false)}
                    className="rounded px-2.5 py-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {isFa ? 'انصراف' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-[#F26A1B] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#FF8A3D]"
                  >
                    {isFa ? 'تایید و ارسال' : 'Send'}
                  </button>
                </div>
              </form>
            )}

            {/* Message List */}
            <div className="space-y-1.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMsg(selectedMsg?.id === msg.id ? null : msg)}
                  className={`cursor-pointer rounded-lg border p-2 transition-colors ${
                    selectedMsg?.id === msg.id
                      ? 'border-[#F26A1B] bg-[#F26A1B]/10'
                      : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0B1F3D]/70 hover:bg-slate-50 dark:hover:bg-[#12315F]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`truncate ${msg.unread ? 'font-extrabold text-[#FF8A3D]' : 'font-semibold'}`}>
                      {msg.from}
                    </span>
                  </div>
                  <div className="truncate font-medium mt-0.5">{msg.subject}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{msg.snippet}</p>

                  {selectedMsg?.id === msg.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-700/50 pt-2"
                    >
                      <button
                        type="button"
                        onClick={async () => {
                          await saveInquiryToCloud(authUser, {
                            gmailMessageId: msg.id,
                            senderName: msg.from,
                            senderEmail: msg.fromEmail,
                            subject: msg.subject,
                            snippet: msg.snippet,
                          });
                          showToast(isFa ? 'در سرنخ‌های Firestore ثبت شد' : 'Saved to Firestore CRM', 'success');
                        }}
                        className="inline-flex items-center gap-1 rounded bg-[#1E4A8A] px-2 py-1 text-[10px] font-semibold text-white"
                      >
                        <BookmarkPlus className="h-3 w-3" />
                        <span>{isFa ? 'ثبت سرنخ' : 'Save Lead'}</span>
                      </button>

                      {msg.unread && (
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAction({ kind: 'markRead', messageId: msg.id, subject: msg.subject })
                          }
                          className="rounded border border-slate-600 px-2 py-1 text-[10px] hover:border-[#F26A1B]"
                        >
                          {isFa ? 'خوانده شد' : 'Mark Read'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setPendingAction({ kind: 'trash', messageId: msg.id, subject: msg.subject })
                        }
                        className="inline-flex items-center gap-1 rounded border border-red-500/40 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/15"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>{isFa ? 'حذف' : 'Trash'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Saved Inquiries in Firestore */}
          {inquiries.length > 0 && (
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-700/70 pt-3">
              <div className="font-bold">
                {isFa ? 'سرنخ‌های ذخیره‌شده در Firestore' : 'Saved CRM Inquiries'}
              </div>
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0B1F3D]/70 p-2 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold truncate">{inq.senderName}</span>
                    <span className="text-[10px] text-[#FF8A3D]">{inq.status}</span>
                  </div>
                  <div className="text-[11px] truncate text-slate-400">{inq.subject}</div>
                  {inq.status !== 'archived' && (
                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => void updateInquiryStatus(inq.id, 'replied')}
                        className="rounded bg-emerald-700/40 px-2 py-0.5 text-[10px] text-emerald-200"
                      >
                        {isFa ? 'پاسخ داده‌شد' : 'Replied'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateInquiryStatus(inq.id, 'archived')}
                        className="inline-flex items-center gap-1 rounded bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-200"
                      >
                        <Archive className="h-2.5 w-2.5" />
                        <span>{isFa ? 'بایگانی' : 'Archive'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
            </>
          )}
        </>
      )}

      {/* Mandatory User Confirmation Modal for Destructive / Mutating Gmail Operations */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#0B1F3D] p-5 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#FF8A3D]">
              {isFa ? 'تایید عملیات جیمیل' : 'Confirm Gmail Action'}
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              {pendingAction.kind === 'send' &&
                (isFa
                  ? `آیا مطمئن هستید که می‌خواهید این ایمیل را به «${pendingAction.to}» با موضوع «${pendingAction.subject}» ارسال کنید؟`
                  : `Send email to "${pendingAction.to}" with subject "${pendingAction.subject}"?`)}
              {pendingAction.kind === 'trash' &&
                (isFa
                  ? `آیا مطمئن هستید که می‌خواهید پیام «${pendingAction.subject}» را به زباله‌دان جیمیل منتقل کنید؟`
                  : `Move message "${pendingAction.subject}" to Gmail Trash?`)}
              {pendingAction.kind === 'markRead' &&
                (isFa
                  ? `آیا می‌خواهید برچسب خوانده‌نشده را از پیام «${pendingAction.subject}» بردارید؟`
                  : `Mark message "${pendingAction.subject}" as read?`)}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs hover:bg-slate-800"
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeConfirmedGmailAction}
                className="rounded-lg bg-[#F26A1B] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#FF8A3D]"
              >
                {isFa ? 'تایید' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
