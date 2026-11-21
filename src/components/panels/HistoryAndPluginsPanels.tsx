import React, { useEffect, useState } from 'react';
import { History, Plug, RotateCcw, Save, Sparkles, Wand2, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { getTranslator, formatNumerals } from '../../i18n/translations';
import { pluginRegistry } from '../../plugins/registry';
import { createBaseStyle } from '../../data/seedSite';
import { BlockType } from '../../types/editor';

export const HistoryPanel: React.FC = () => {
  const { snapshots, lang, numerals, saveSnapshot, restoreSnapshot, showToast } = useEditorStore();
  const t = getTranslator(lang);

  return (
    <div className="space-y-3 p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 text-[#F26A1B]" />
          <span>{t('historyTitle')}</span>
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          saveSnapshot();
          showToast(t('toastSnapshotSaved'), 'success');
        }}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#F26A1B] py-2 font-semibold text-white hover:bg-[#FF8A3D]"
      >
        <Save className="h-3.5 w-3.5" />
        <span>{t('createSnapshotNow')}</span>
      </button>

      {snapshots.length === 0 ? (
        <p className="text-slate-400">{t('noSnapshots')}</p>
      ) : (
        <div className="space-y-2">
          {snapshots.map((snap) => {
            const timeStr = new Date(snap.timestamp).toLocaleString(
              lang === 'fa' ? 'fa-IR' : 'en-US',
              { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }
            );
            return (
              <div
                key={snap.id}
                className="rounded-lg border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-[#0B1F3D]/80 p-2.5 space-y-2"
              >
                <div className="font-semibold">{snap.label}</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {formatNumerals(timeStr, numerals)}
                  </span>
                  {(snap.projectData || snap.projectJson) && (
                    <button
                      type="button"
                      onClick={() => {
                        restoreSnapshot(snap.id);
                        showToast(t('toastSnapshotRestored'), 'success', true);
                      }}
                      className="inline-flex items-center gap-1 rounded bg-[#1E4A8A] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#3366B0]"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>{t('restoreSnapshot')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const PluginsPanel: React.FC = () => {
  const { project, lang, updateConnector } = useEditorStore();
  const t = getTranslator(lang);
  const connectors = pluginRegistry.getConnectors();
  const customPanels = pluginRegistry.getPanels();

  return (
    <div className="space-y-4 p-3 text-xs">
      <div className="space-y-1">
        <div className="font-bold flex items-center gap-1.5">
          <Plug className="h-3.5 w-3.5 text-[#F26A1B]" />
          <span>{t('connectorsTitle')}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          {t('connectorsDesc')}
        </p>
      </div>

      <div className="space-y-3">
        {connectors.map((conn) => {
          const cfg = project.connectors[conn.id] ?? { enabled: false, values: {} };
          return (
            <div
              key={conn.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-[#0B1F3D]/80 p-3 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">{lang === 'fa' ? conn.nameFa : conn.nameEn}</span>
                <button
                  type="button"
                  onClick={() => updateConnector(conn.id, !cfg.enabled, cfg.values)}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    cfg.enabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-[#12315F] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cfg.enabled ? t('enabled') : t('disabled')}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'fa' ? conn.descriptionFa : conn.descriptionEn}
              </p>

              <div className="space-y-2 pt-1">
                {conn.fields.map((field) => (
                  <label key={field.key} className="block space-y-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lang === 'fa' ? field.labelFa : field.labelEn}
                    </span>
                    {field.type === 'select' ? (
                      <select
                        value={cfg.values[field.key] ?? field.options?.[0]?.value ?? ''}
                        onChange={(e) =>
                          updateConnector(conn.id, cfg.enabled, {
                            ...cfg.values,
                            [field.key]: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#12284A] px-2.5 py-1.5 text-xs outline-none"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {lang === 'fa' ? opt.labelFa : opt.labelEn}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        dir="ltr"
                        value={cfg.values[field.key] ?? ''}
                        placeholder={field.placeholder}
                        onChange={(e) =>
                          updateConnector(conn.id, cfg.enabled, {
                            ...cfg.values,
                            [field.key]: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#12284A] px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#F26A1B]"
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {customPanels.map((p) => (
        <div key={p.id} className="border-t border-slate-700/60 pt-3">
          {p.render()}
        </div>
      ))}
    </div>
  );
};

interface PaletteSuggestion {
  name: string;
  primary: string;
  primaryHover: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
}

export const AiAssistantPanel: React.FC = () => {
  const {
    project,
    activePageId,
    selectedBlockId,
    lang,
    insertCustomBlock,
    updateBlockContent,
    updateTheme,
    showToast,
  } = useEditorStore();
  const t = getTranslator(lang);

  const [available, setAvailable] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'section' | 'rewrite' | 'palette'>('section');
  const [sectionPrompt, setSectionPrompt] = useState('');
  const [tone, setTone] = useState('technical');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [palettes, setPalettes] = useState<PaletteSuggestion[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((d) => {
        if (active) setAvailable(Boolean(d.available));
      })
      .catch(() => {
        if (active) setAvailable(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activePage = project.pages.find((p) => p.id === activePageId);
  const selectedBlock = activePage?.blocks.find((b) => b.id === selectedBlockId);

  const runGenerateSection = async () => {
    if (!sectionPrompt.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-section', payload: { description: sectionPrompt, lang } }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || 'AI error');
        return;
      }
      const r = data.result;
      const validTypes: BlockType[] = [
        'hero',
        'features',
        'products',
        'stats',
        'testimonials',
        'pricing',
        'faq',
        'contact',
        'cta',
        'richtext',
      ];
      const blockType: BlockType = validTypes.includes(r.type) ? r.type : 'features';
      insertCustomBlock({
        type: blockType,
        variant: r.variant === 'b' ? 'b' : 'a',
        label: r.label || 'بخش هوش مصنوعی',
        locked: false,
        hidden: false,
        content: {
          heading: r.title,
          headline: r.title,
          subheading: r.subtitle,
          subheadline: r.subtitle,
          description: r.subtitle,
          ctaLabel: r.ctaText || 'درخواست مشاوره',
          primaryCta: r.ctaText || 'درخواست مشاوره',
          body: r.subtitle,
          items: Array.isArray(r.items)
            ? r.items.map((it: { title: string; description: string; meta?: string }, idx: number) => ({
                index: `0${idx + 1}`,
                title: it.title,
                description: it.description,
                value: it.meta || 'نمونه',
                label: it.title,
                question: it.title,
                answer: it.description,
              }))
            : [],
        },
        style: createBaseStyle({ paddingY: 56 }),
        animation: { type: 'slide-up', duration: 280, delay: 0 },
      });
      setSectionPrompt('');
      showToast(t('toastBlockAdded'), 'success', true);
    } catch {
      setErrorMsg('Network error');
    } finally {
      setLoading(false);
    }
  };

  const runRewrite = async () => {
    if (!selectedBlock) return;
    const targetKey =
      'headline' in selectedBlock.content
        ? 'headline'
        : 'heading' in selectedBlock.content
        ? 'heading'
        : 'body' in selectedBlock.content
        ? 'body'
        : null;
    if (!targetKey) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rewrite-text',
          payload: { text: selectedBlock.content[targetKey], tone, lang },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || 'AI error');
        return;
      }
      updateBlockContent(selectedBlock.id, { [targetKey]: data.result.text });
      showToast('متن بازنویسی و اعمال شد', 'success', true);
    } catch {
      setErrorMsg('Network error');
    } finally {
      setLoading(false);
    }
  };

  const runPalette = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest-palette',
          payload: { primary: project.theme.primary, accent: project.theme.accent, lang },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || 'AI error');
        return;
      }
      if (Array.isArray(data.result)) setPalettes(data.result);
    } catch {
      setErrorMsg('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="font-bold flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#F26A1B]" />
          <span>{t('aiTitle')}</span>
        </div>
        {available === true && (
          <span className="text-[11px] font-medium text-emerald-500">
            {lang === 'fa' ? 'متصل و فعال' : 'Active'}
          </span>
        )}
      </div>

      {available === false && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{t('aiUnavailableTitle')}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">{t('aiUnavailableDesc')}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-200/80 dark:bg-[#071429] p-1">
        {(
          [
            ['section', t('aiModeSection')],
            ['rewrite', t('aiModeRewrite')],
            ['palette', t('aiModePalette')],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md px-1.5 py-1.5 text-[11px] font-semibold transition-colors ${
              mode === m ? 'bg-[#F26A1B] text-white' : 'text-slate-500 dark:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-[11px] text-red-300">
          {errorMsg}
        </div>
      )}

      {mode === 'section' && (
        <div className="space-y-2.5">
          <p className="text-[11px] text-slate-400">{t('aiSectionPrompt')}</p>
          <textarea
            rows={3}
            value={sectionPrompt}
            onChange={(e) => setSectionPrompt(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] p-2 text-xs outline-none focus:ring-2 focus:ring-[#F26A1B]"
          />
          <button
            type="button"
            disabled={loading || available === false || !sectionPrompt.trim()}
            onClick={runGenerateSection}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#F26A1B] py-2 font-semibold text-white hover:bg-[#FF8A3D] disabled:opacity-45"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>{loading ? '...' : t('aiGenerateBtn')}</span>
          </button>
        </div>
      )}

      {mode === 'rewrite' && (
        <div className="space-y-2.5">
          <label className="block space-y-1">
            <span className="text-[11px] text-slate-400">{t('aiToneLabel')}</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none"
            >
              <option value="formal">{t('aiToneFormal')}</option>
              <option value="technical">{t('aiToneTechnical')}</option>
              <option value="persuasive">{t('aiTonePersuasive')}</option>
              <option value="concise">{t('aiToneConcise')}</option>
            </select>
          </label>
          <button
            type="button"
            disabled={loading || available === false || !selectedBlock}
            onClick={runRewrite}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#F26A1B] py-2 font-semibold text-white hover:bg-[#FF8A3D] disabled:opacity-45"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>{loading ? '...' : t('aiRewriteBtn')}</span>
          </button>
          {!selectedBlock && <p className="text-[11px] text-slate-400">{t('selectBlockPrompt')}</p>}
        </div>
      )}

      {mode === 'palette' && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={loading || available === false}
            onClick={runPalette}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#F26A1B] py-2 font-semibold text-white hover:bg-[#FF8A3D] disabled:opacity-45"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{loading ? '...' : t('aiPaletteBtn')}</span>
          </button>

          {palettes.map((p, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-700/70 bg-[#0B1F3D] p-2.5 space-y-2"
            >
              <div className="font-semibold">{p.name}</div>
              <div className="flex gap-1.5">
                {[p.primary, p.accent, p.bg, p.surface, p.text].map((hex, i) => (
                  <span
                    key={i}
                    className="h-5 flex-1 rounded border border-white/10"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  updateTheme({
                    primary: p.primary,
                    primaryHover: p.primaryHover,
                    accent: p.accent,
                    bg: p.bg,
                    surface: p.surface,
                    text: p.text,
                  })
                }
                className="w-full rounded bg-[#1E4A8A] py-1 text-[11px] font-semibold text-white hover:bg-[#3366B0]"
              >
                {t('aiApplyPalette')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
