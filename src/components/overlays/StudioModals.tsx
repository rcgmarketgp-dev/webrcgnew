import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Command,
  Download,
  FileJson,
  Keyboard,
  Search,
  Sparkles,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { getTranslator } from '../../i18n/translations';
import { pluginRegistry } from '../../plugins/registry';
import { exportProjectAsJson, exportSiteAsZip } from '../../exporters/siteExporter';

export const CommandPaletteModal: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    project,
    lang,
    addBlock,
    setActivePage,
    setDeviceMode,
    togglePreview,
    saveSnapshot,
    setExportModalOpen,
    setLeftTab,
    undo,
    redo,
    showToast,
  } = useEditorStore();
  const t = getTranslator(lang);
  const [query, setQuery] = useState('');

  if (!commandPaletteOpen) return null;

  const actions = [
    { id: 'act-undo', label: `${t('undo')} (Ctrl+Z)`, run: undo },
    { id: 'act-redo', label: `${t('redo')} (Ctrl+Shift+Z)`, run: redo },
    { id: 'act-desktop', label: `${t('desktop')} (Alt+1)`, run: () => setDeviceMode('desktop') },
    { id: 'act-tablet', label: `${t('tablet')} (Alt+2)`, run: () => setDeviceMode('tablet') },
    { id: 'act-mobile', label: `${t('mobile')} (Alt+3)`, run: () => setDeviceMode('mobile') },
    { id: 'act-preview', label: `${t('preview')} (Ctrl+P)`, run: togglePreview },
    {
      id: 'act-save',
      label: `${t('saveSnapshot')} (Ctrl+S)`,
      run: () => {
        saveSnapshot();
        showToast(t('toastSnapshotSaved'), 'success');
      },
    },
    { id: 'act-export', label: `${t('exportBtn')} (Ctrl+E)`, run: () => setExportModalOpen(true) },
    { id: 'act-templates', label: t('tabTemplates'), run: () => setLeftTab('templates') },
    { id: 'act-toggle-tools', label: t('toggleToolsMenu'), run: () => useEditorStore.getState().toggleLeftSidebar() },
    { id: 'act-toggle-inspector', label: `${t('toggleInspectorMenu')} (Ctrl+I)`, run: () => useEditorStore.getState().toggleInspector() },
    { id: 'act-theme', label: t('tabTheme'), run: () => setLeftTab('theme') },
    { id: 'act-ai', label: t('tabAi'), run: () => setLeftTab('ai') },
    ...project.pages.map((p) => ({
      id: `page-${p.id}`,
      label: `${t('tabPages')}: ${p.title}`,
      run: () => setActivePage(p.id),
    })),
    ...pluginRegistry.getBlocks().map((b) => ({
      id: `blk-${b.type}`,
      label: `+ ${lang === 'fa' ? b.nameFa : b.nameEn}`,
      run: () => {
        addBlock(b.type);
        showToast(t('toastBlockAdded'), 'success', true);
      },
    })),
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div
      onClick={() => setCommandPaletteOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-[#0B1F3D] text-slate-100 shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
          <Search className="h-4 w-4 text-[#F26A1B]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('cmdPlaceholder')}
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                item.run();
                setCommandPaletteOpen(false);
                setQuery('');
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-xs hover:bg-[#12315F]"
            >
              <Command className="h-3.5 w-3.5 text-[#F26A1B] shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export const ShortcutsModal: React.FC = () => {
  const { shortcutsModalOpen, setShortcutsModalOpen, lang } = useEditorStore();
  const t = getTranslator(lang);

  if (!shortcutsModalOpen) return null;

  const list = [
    ['Ctrl/Cmd + Z', lang === 'fa' ? 'واگرد (Undo)' : 'Undo'],
    ['Ctrl/Cmd + Shift + Z', lang === 'fa' ? 'از نو (Redo)' : 'Redo'],
    ['Ctrl/Cmd + D', lang === 'fa' ? 'تکثیر بلوک انتخابی' : 'Duplicate selected block'],
    ['Delete / Backspace', lang === 'fa' ? 'حذف بلوک انتخابی' : 'Delete selected block'],
    ['Ctrl/Cmd + C / V', lang === 'fa' ? 'کپی و جای‌گذاری بلوک' : 'Copy / Paste block'],
    ['Ctrl/Cmd + S', lang === 'fa' ? 'ثبت نسخه پشتیبان' : 'Save snapshot'],
    ['Ctrl/Cmd + P', lang === 'fa' ? 'تغییر حالت پیش‌نمایش' : 'Toggle preview mode'],
    ['Ctrl/Cmd + E', lang === 'fa' ? 'پنجره خروجی / انتشار' : 'Open Export modal'],
    ['Alt + 1 / 2 / 3', lang === 'fa' ? 'نمای دسکتاپ / تبلت / موبایل' : 'Desktop / Tablet / Mobile'],
    ['[  /  ]', lang === 'fa' ? 'جابه‌جایی بلوک به بالا / پایین' : 'Move block up / down'],
    ['Arrow Up / Down', lang === 'fa' ? 'حرکت بین بلوک‌ها' : 'Navigate between blocks'],
    ['Esc', lang === 'fa' ? 'لغو انتخاب بلوک / بستن پنجره' : 'Deselect / Close modal'],
    ['Ctrl/Cmd + \\', lang === 'fa' ? 'نمایش یا مخفی کردن پنل‌های کناری' : 'Toggle sidebars'],
    ['Ctrl/Cmd + I', lang === 'fa' ? 'نمایش یا مخفی کردن پنل بازرس' : 'Toggle inspector panel'],
    ['/', lang === 'fa' ? 'تمرکز روی جستجوی بلوک‌ها' : 'Focus block search'],
    ['Ctrl/Cmd + K', lang === 'fa' ? 'باز کردن فرمان سریع' : 'Open Command Palette'],
    ['?', lang === 'fa' ? 'نمایش راهنمای میانبرها' : 'Show Shortcuts cheat sheet'],
  ];

  return (
    <div
      onClick={() => setShortcutsModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-slate-700 bg-[#0B1F3D] p-5 text-slate-100 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Keyboard className="h-4 w-4 text-[#F26A1B]" />
            <span>{t('shortcutsTitle')}</span>
          </div>
          <button
            type="button"
            onClick={() => setShortcutsModalOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[65vh] overflow-y-auto">
          {list.map(([keys, desc]) => (
            <div
              key={keys}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#12284A]/70 px-3 py-2 text-xs"
            >
              <span className="text-slate-300">{desc}</span>
              <kbd
                dir="ltr"
                className="rounded bg-[#071429] px-2 py-0.5 text-[11px] font-mono text-[#FF8A3D] shrink-0"
              >
                {keys}
              </kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export const ExportModal: React.FC = () => {
  const { exportModalOpen, setExportModalOpen, project, lang, importProjectJson, showToast } =
    useEditorStore();
  const t = getTranslator(lang);
  const [busy, setBusy] = useState(false);

  if (!exportModalOpen) return null;

  const handleZip = async () => {
    setBusy(true);
    try {
      await exportSiteAsZip(project, lang === 'fa' ? 'rtl' : 'ltr');
      showToast(t('toastExportReady'), 'success');
    } finally {
      setBusy(false);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const ok = importProjectJson(reader.result);
        if (ok) {
          showToast(t('toastImportSuccess'), 'success');
          setExportModalOpen(false);
        } else {
          showToast(t('toastImportError'), 'error');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      onClick={() => setExportModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0B1F3D] p-5 text-slate-100 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold">{t('exportTitle')}</h2>
          <button
            type="button"
            onClick={() => setExportModalOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#12284A]/70 p-4 space-y-2.5">
          <div className="text-xs font-bold">{t('exportZipTitle')}</div>
          <p className="text-[11px] leading-relaxed text-slate-400">{t('exportZipDesc')}</p>
          <button
            type="button"
            disabled={busy}
            onClick={handleZip}
            className="inline-flex items-center gap-2 rounded-lg bg-[#F26A1B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#FF8A3D]"
          >
            <Download className="h-4 w-4" />
            <span>{busy ? '...' : t('downloadZip')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-[#12284A]/70 p-4 space-y-2">
            <div className="text-xs font-bold">{t('exportJsonTitle')}</div>
            <p className="text-[11px] text-slate-400">{t('exportJsonDesc')}</p>
            <button
              type="button"
              onClick={() => {
                exportProjectAsJson(project);
                showToast(t('toastExportReady'), 'success');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E4A8A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3366B0]"
            >
              <FileJson className="h-3.5 w-3.5" />
              <span>{t('downloadJson')}</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#12284A]/70 p-4 space-y-2">
            <div className="text-xs font-bold">{t('importJsonTitle')}</div>
            <p className="text-[11px] text-slate-400">{t('importJsonDesc')}</p>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold hover:border-[#F26A1B]">
              <Upload className="h-3.5 w-3.5" />
              <span>{t('chooseJsonFile')}</span>
              <input type="file" accept=".json,application/json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const OnboardingTour: React.FC = () => {
  const { tourStep, setTourStep, lang } = useEditorStore();
  const t = getTranslator(lang);

  if (tourStep === null) return null;

  const steps = [
    { title: t('tourStep1Title'), desc: t('tourStep1Desc') },
    { title: t('tourStep2Title'), desc: t('tourStep2Desc') },
    { title: t('tourStep3Title'), desc: t('tourStep3Desc') },
  ];
  const current = steps[tourStep] ?? steps[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-5 start-5 z-40 w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-[#F26A1B]/60 bg-[#071429]/95 p-4 text-slate-100 shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF8A3D]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{current.title}</span>
        </div>
        <button
          type="button"
          onClick={() => setTourStep(null)}
          aria-label={t('tourSkip')}
          className="text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs leading-relaxed text-slate-300 mb-3">{current.desc}</p>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setTourStep(null)}
          className="text-[11px] text-slate-400 hover:text-white"
        >
          {t('tourSkip')}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 tabular-nums">
            {tourStep + 1} / {steps.length}
          </span>
          <button
            type="button"
            onClick={() => setTourStep(tourStep < steps.length - 1 ? tourStep + 1 : null)}
            className="rounded-lg bg-[#F26A1B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#FF8A3D]"
          >
            {tourStep < steps.length - 1 ? t('tourNext') : t('tourDone')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const ToastStack: React.FC = () => {
  const { toasts, dismissToast, undo, lang } = useEditorStore();
  const t = getTranslator(lang);

  return (
    <div className="fixed bottom-4 end-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#071429]/95 px-3.5 py-2.5 text-xs text-white shadow-xl backdrop-blur-md"
          >
            <span>{toast.message}</span>
            {toast.canUndo && (
              <button
                type="button"
                onClick={() => {
                  undo();
                  dismissToast(toast.id);
                }}
                className="inline-flex items-center gap-1 rounded bg-[#F26A1B]/20 px-2 py-0.5 font-semibold text-[#FF8A3D] hover:bg-[#F26A1B]/30"
              >
                <Undo2 className="h-3 w-3" />
                <span>{t('toastUndoBtn')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
