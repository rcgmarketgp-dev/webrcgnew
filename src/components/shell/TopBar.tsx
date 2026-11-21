import React, { useEffect, useState } from 'react';
import {
  Command,
  Download,
  Eye,
  EyeOff,
  HelpCircle,
  Languages,
  Loader2,
  Mail,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Redo2,
  Save,
  Smartphone,
  Sun,
  Tablet,
  Undo2,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { getTranslator } from '../../i18n/translations';
import { RCG_LOGO_DARK_BG, RCG_LOGO_LIGHT_BG } from '../../data/seedSite';
import { getAccessToken, googleSignIn, initAuth } from '../../firebase/firebaseClient';

export const TopBar: React.FC = () => {
  const {
    project,
    past,
    future,
    activePageId,
    selectedBlockId,
    deviceMode,
    previewMode,
    editorTheme,
    lang,
    numerals,
    translatingLanguage,
    leftSidebarOpen,
    inspectorOpen,
    inspectorEnabled,
    setProjectName,
    undo,
    redo,
    setActivePage,
    setDeviceMode,
    togglePreview,
    setEditorTheme,
    setLanguage,
    setNumerals,
    toggleLeftSidebar,
    toggleInspector,
    saveSnapshot,
    setCommandPaletteOpen,
    setShortcutsModalOpen,
    setExportModalOpen,
    setLeftTab,
    showToast,
    authUser,
  } = useEditorStore();
  const t = getTranslator(lang);

  const [hasToken, setHasToken] = useState<boolean>(() => Boolean(getAccessToken()));
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsub = initAuth(
      (_u, tkn) => {
        setHasToken(Boolean(tkn || getAccessToken()));
      },
      () => {
        setHasToken(false);
      }
    );
    return () => unsub();
  }, []);

  const handleAccountClick = async () => {
    if (authUser) {
      setLeftTab('gmail');
      return;
    }
    setSigningIn(true);
    try {
      const res = await googleSignIn();
      setHasToken(Boolean(res.accessToken));
      setLeftTab('gmail');
      showToast(
        lang === 'fa' ? 'اتصال حساب گوگل و جیمیل برقرار شد' : 'Signed in with Google & Gmail',
        'success'
      );
    } catch {
      setLeftTab('gmail');
    } finally {
      setSigningIn(false);
    }
  };

  const isDark = editorTheme === 'dark';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-1.5 sm:gap-3 border-b border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#071429] px-2 sm:px-3 text-xs overflow-x-auto">
      {/* Zone 1: Brand + Project Title + Active Page Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0 sm:shrink">
        <img
          src={isDark ? RCG_LOGO_DARK_BG : RCG_LOGO_LIGHT_BG}
          alt="RCG"
          className="h-6 sm:h-7 w-auto shrink-0 object-contain"
        />
        <input
          type="text"
          value={project.projectName}
          onChange={(e) => setProjectName(e.target.value)}
          aria-label={t('projectTitlePlaceholder')}
          className="w-24 sm:w-36 md:w-44 truncate rounded-lg border border-transparent bg-transparent px-1.5 sm:px-2 py-1 text-xs font-bold outline-none hover:border-slate-300 dark:hover:border-slate-700 focus:border-[#F26A1B]"
        />

        <select
          value={activePageId}
          onChange={(e) => setActivePage(e.target.value)}
          aria-label={t('tabPages')}
          className="hidden sm:block max-w-[140px] rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#0E2547] px-2 py-1 text-xs font-medium outline-none"
        >
          {project.pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Zone 2: Undo/Redo + Responsive Device Switcher */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E2547] p-0.5">
          <button
            type="button"
            disabled={past.length === 0}
            onClick={undo}
            title={`${t('undo')} (Ctrl+Z)`}
            aria-label={t('undo')}
            className="rounded-md p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#12315F] disabled:opacity-30"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={future.length === 0}
            onClick={redo}
            title={`${t('redo')} (Ctrl+Shift+Z)`}
            aria-label={t('redo')}
            className="rounded-md p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#12315F] disabled:opacity-30"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E2547] p-0.5">
          {(
            [
              ['desktop', Monitor, t('desktop'), 'Alt+1'],
              ['tablet', Tablet, t('tablet'), 'Alt+2'],
              ['mobile', Smartphone, t('mobile'), 'Alt+3'],
            ] as const
          ).map(([mode, Icon, label, shortcut]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDeviceMode(mode)}
              title={`${label} (${shortcut})`}
              aria-label={label}
              className={`rounded-md p-1.5 transition-colors ${
                deviceMode === mode
                  ? 'bg-[#F26A1B] text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Zone 3: Studio Utilities + Preview + Export CTA */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          title={`${t('commandPalette')} (Ctrl+K)`}
          aria-label={t('commandPalette')}
          className="hidden md:inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E2547] px-2 py-1.5 text-[11px] font-medium hover:border-[#F26A1B]"
        >
          <Command className="h-3.5 w-3.5 text-[#F26A1B]" />
          <span className="hidden xl:inline">{t('commandPalette')}</span>
        </button>

        <button
          type="button"
          onClick={() => setShortcutsModalOpen(true)}
          title={`${t('shortcuts')} (?)`}
          aria-label={t('shortcuts')}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E2547] p-1.5 hover:border-[#F26A1B]"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>

        {!previewMode && (
          <button
            type="button"
            onClick={toggleLeftSidebar}
            title={t('toggleToolsMenu')}
            aria-label={t('toggleToolsMenu')}
            aria-pressed={leftSidebarOpen}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
              leftSidebarOpen
                ? 'border-[#F26A1B]/50 bg-[#F26A1B]/10 text-[#F26A1B]'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E2547] hover:border-[#F26A1B]'
            }`}
          >
            {lang === 'fa' ? (
              leftSidebarOpen ? (
                <PanelRightClose className="h-3.5 w-3.5" />
              ) : (
                <PanelRightOpen className="h-3.5 w-3.5" />
              )
            ) : leftSidebarOpen ? (
              <PanelLeftClose className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            )}
            <span className="hidden xl:inline">{lang === 'fa' ? 'ابزارها' : 'Tools'}</span>
          </button>
        )}

        {!previewMode && (
          <button
            type="button"
            onClick={() => {
              const wasEnabled = inspectorEnabled;
              const hadSelection = Boolean(selectedBlockId);
              toggleInspector();
              if (!hadSelection) {
                showToast(
                  wasEnabled ? t('toastInspectorHidden') : t('toastInspectorEnabled'),
                  'info'
                );
              }
            }}
            title={
              !inspectorEnabled
                ? t('inspectorHiddenHint')
                : `${t('toggleInspectorMenu')} (Ctrl+I)`
            }
            aria-label={t('toggleInspectorMenu')}
            aria-pressed={inspectorOpen && inspectorEnabled}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
              inspectorOpen && selectedBlockId
                ? 'border-[#F26A1B]/50 bg-[#F26A1B]/10 text-[#F26A1B]'
                : !inspectorEnabled
                ? 'border-dashed border-slate-300 dark:border-slate-700 bg-transparent text-slate-400 opacity-75 hover:opacity-100 hover:border-[#F26A1B]'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E2547] hover:border-[#F26A1B]'
            }`}
          >
            {lang === 'fa' ? (
              inspectorOpen && selectedBlockId ? (
                <PanelLeftClose className="h-3.5 w-3.5" />
              ) : (
                <PanelLeftOpen className="h-3.5 w-3.5" />
              )
            ) : inspectorOpen && selectedBlockId ? (
              <PanelRightClose className="h-3.5 w-3.5" />
            ) : (
              <PanelRightOpen className="h-3.5 w-3.5" />
            )}
            <span className="hidden xl:inline">{t('inspectorLabel')}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setLanguage(lang === 'fa' ? 'en' : 'fa')}
          disabled={translatingLanguage}
          title={
            translatingLanguage
              ? t('translatingSiteContent')
              : lang === 'fa'
              ? 'Switch site & studio to English (LTR)'
              : 'تغییر کل سایت و استودیو به فارسی (RTL)'
          }
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E2547] px-2 py-1.5 text-[11px] font-bold hover:border-[#F26A1B] whitespace-nowrap disabled:opacity-70"
        >
          {translatingLanguage ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F26A1B]" />
          ) : (
            <Languages className="h-3.5 w-3.5" />
          )}
          <span>{lang === 'fa' ? 'FA' : 'EN'}</span>
        </button>

        <button
          type="button"
          onClick={() => setNumerals(numerals === 'fa' ? 'en' : 'fa')}
          title={numerals === 'fa' ? t('numeralsFa') : t('numeralsEn')}
          className="hidden lg:inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E2547] px-2 py-1.5 text-[11px] font-bold tabular-nums hover:border-[#F26A1B]"
        >
          {numerals === 'fa' ? '۱۲۳' : '123'}
        </button>

        <button
          type="button"
          onClick={() => setEditorTheme(isDark ? 'light' : 'dark')}
          title={isDark ? t('lightMode') : t('darkMode')}
          aria-label={isDark ? t('lightMode') : t('darkMode')}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E2547] p-1.5 hover:border-[#F26A1B]"
        >
          {isDark ? <Sun className="h-3.5 w-3.5 text-amber-300" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => {
            saveSnapshot();
            showToast(t('toastSnapshotSaved'), 'success');
          }}
          title={`${t('saveSnapshot')} (Ctrl+S)`}
          aria-label={t('saveSnapshot')}
          className="hidden sm:inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E2547] p-1.5 hover:border-[#F26A1B]"
        >
          <Save className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={togglePreview}
          title={`${t('preview')} (Ctrl+P)`}
          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap ${
            previewMode
              ? 'border-[#F26A1B] bg-[#F26A1B]/15 text-[#F26A1B]'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E2547] hover:border-[#F26A1B]'
          }`}
        >
          {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span className="hidden md:inline">{previewMode ? t('editMode') : t('preview')}</span>
        </button>

        <button
          type="button"
          onClick={handleAccountClick}
          disabled={signingIn}
          title={
            authUser
              ? authUser.email || t('tabGmail')
              : lang === 'fa'
              ? 'ورود با گوگل برای ذخیره ابری و جیمیل'
              : 'Sign in with Google for Cloud Sync & Gmail'
          }
          className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
            authUser
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 hover:border-emerald-400'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E2547] hover:border-[#F26A1B]'
          }`}
        >
          <Mail className={`h-3.5 w-3.5 ${authUser ? (hasToken ? 'text-emerald-500' : 'text-[#F26A1B]') : 'text-[#F26A1B]'}`} />
          <span className="max-w-[110px] truncate">
            {signingIn
              ? '...'
              : authUser
              ? authUser.displayName || authUser.email || t('tabGmail')
              : lang === 'fa'
              ? 'اتصال گوگل'
              : 'Google Sign-In'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setExportModalOpen(true)}
          title={`${t('exportBtn')} (Ctrl+E)`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26A1B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#FF8A3D] active:bg-[#C2500E] whitespace-nowrap shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{t('exportBtn')}</span>
        </button>
      </div>
    </header>
  );
};
