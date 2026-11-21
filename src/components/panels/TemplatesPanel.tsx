import React, { useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  FilePlus2,
  Globe,
  Layers,
  LayoutTemplate,
  Link2,
  Maximize2,
  Minimize2,
  Palette,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { BlockRenderer } from '../../blocks/BlockRenderer';
import { EXTERNAL_TEMPLATES, parseExternalTemplatePayload } from '../../data/externalTemplates';
import { formatNumerals, getTranslator } from '../../i18n/translations';
import { translateBlockLocally } from '../../i18n/siteContentTranslator';
import { useEditorStore } from '../../store/useEditorStore';
import { PageTemplate, TemplateCategory } from '../../types/editor';

export const TemplatesPanel: React.FC = () => {
  const {
    project,
    customTemplates,
    lang,
    numerals,
    addCustomTemplate,
    deleteCustomTemplate,
    applyTemplateToCurrentPage,
    createPageFromTemplate,
    setPreviewTemplateId,
    showToast,
  } = useEditorStore();
  const t = getTranslator(lang);
  const fmt = (v: string | number) => formatNumerals(v, numerals);

  const [category, setCategory] = useState<TemplateCategory>('all');
  const [importOpen, setImportOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [includeTheme, setIncludeTheme] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allTemplates = useMemo(
    () => [...customTemplates, ...EXTERNAL_TEMPLATES],
    [customTemplates]
  );

  const filteredTemplates = useMemo(
    () =>
      allTemplates.filter((tpl) =>
        category === 'all' ? true : tpl.category === category
      ),
    [allTemplates, category]
  );

  const categories: { id: TemplateCategory; label: string }[] = [
    { id: 'all', label: t('tplCatAll') },
    { id: 'landing', label: t('tplCatLanding') },
    { id: 'catalog', label: t('tplCatCatalog') },
    { id: 'corporate', label: t('tplCatCorporate') },
    { id: 'service', label: t('tplCatService') },
    { id: 'external', label: t('tplCatExternal') },
  ];

  const handleFetchExternalUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setFetching(true);
    setImportError(null);
    try {
      const res = await fetch(trimmed);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const parsed = parseExternalTemplatePayload(json, trimmed);
      if (!parsed) {
        setImportError(t('tplImportError'));
        return;
      }
      addCustomTemplate(parsed);
      setUrlInput('');
      setCategory('external');
      showToast(t('tplImportSuccess'), 'success');
    } catch {
      setImportError(t('tplImportError'));
    } finally {
      setFetching(false);
    }
  };

  const handleUploadTemplateFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        const parsed = parseExternalTemplatePayload(json);
        if (!parsed) {
          setImportError(t('tplImportError'));
          return;
        }
        addCustomTemplate(parsed);
        setCategory('external');
        showToast(t('tplImportSuccess'), 'success');
      } catch {
        setImportError(t('tplImportError'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3 p-3 text-xs">
      {/* Intro & External Import Trigger */}
      <div className="space-y-2">
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          {t('templatesSubtitle')}
        </p>

        <button
          type="button"
          onClick={() => setImportOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#0B1F3D]/80 px-3 py-2 font-semibold hover:border-[#F26A1B] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-[#F26A1B]" />
            <span>{t('tplImportExternalTitle')}</span>
          </span>
          {importOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {importOpen && (
          <div className="rounded-xl border border-[#F26A1B]/40 bg-slate-50 dark:bg-[#0B1F3D] p-2.5 space-y-2">
            <form onSubmit={handleFetchExternalUrl} className="space-y-1.5">
              <div className="relative">
                <Link2 className="pointer-events-none absolute start-2 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="url"
                  dir="ltr"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={t('tplUrlPlaceholder')}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] ps-7 pe-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-[#F26A1B]"
                />
              </div>
              <div className="flex gap-1.5">
                <button
                  type="submit"
                  disabled={fetching || !urlInput.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-[#F26A1B] py-1.5 text-[11px] font-semibold text-white hover:bg-[#FF8A3D] disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${fetching ? 'animate-spin' : ''}`} />
                  <span>{fetching ? t('tplFetching') : t('tplFetchUrl')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] px-2.5 py-1.5 text-[11px] font-semibold hover:border-[#F26A1B]"
                >
                  <Upload className="h-3 w-3 text-[#F26A1B]" />
                  <span>{t('tplUploadJson')}</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleUploadTemplateFile}
                className="hidden"
              />
            </form>
            {importError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-[11px] text-red-400">
                {importError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap ${
              category === c.id
                ? 'bg-[#F26A1B] text-white'
                : 'bg-slate-200/70 dark:bg-[#0B1F3D] text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-[#1E4A8A]/60'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Include Template Theme Toggle */}
      <label className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1F3D]/60 px-2.5 py-1.5 cursor-pointer">
        <span className="flex items-center gap-1.5 text-[11px] font-medium">
          <Palette className="h-3.5 w-3.5 text-[#F26A1B]" />
          <span>{t('tplIncludeTheme')}</span>
        </span>
        <input
          type="checkbox"
          checked={includeTheme}
          onChange={(e) => setIncludeTheme(e.target.checked)}
          className="accent-[#F26A1B]"
        />
      </label>

      {/* Showcase Cards */}
      <div className="space-y-3">
        {filteredTemplates.map((tpl) => (
          <TemplateShowcaseCard
            key={tpl.id}
            template={tpl}
            expanded={expandedCardId === tpl.id}
            onToggleExpand={() =>
              setExpandedCardId((prev) => (prev === tpl.id ? null : tpl.id))
            }
            onFullPreview={() => setPreviewTemplateId(tpl.id)}
            onApplyCurrent={() => {
              applyTemplateToCurrentPage(tpl, includeTheme);
              showToast(t('tplAppliedToast'), 'success', true);
            }}
            onCreatePage={() => {
              createPageFromTemplate(tpl, includeTheme);
              showToast(t('tplAppliedToast'), 'success', true);
            }}
            onDelete={
              tpl.isExternalImported ? () => deleteCustomTemplate(tpl.id) : undefined
            }
            includeTheme={includeTheme}
            fmt={fmt}
          />
        ))}
      </div>
    </div>
  );
};

interface TemplateShowcaseCardProps {
  template: PageTemplate;
  expanded: boolean;
  includeTheme: boolean;
  onToggleExpand: () => void;
  onFullPreview: () => void;
  onApplyCurrent: () => void;
  onCreatePage: () => void;
  onDelete?: () => void;
  fmt: (v: string | number) => string;
}

const TemplateShowcaseCard: React.FC<TemplateShowcaseCardProps> = ({
  template,
  expanded,
  onToggleExpand,
  onFullPreview,
  onApplyCurrent,
  onCreatePage,
  onDelete,
  fmt,
}) => {
  const { project, lang, numerals } = useEditorStore();
  const t = getTranslator(lang);

  const previewTheme = useMemo(
    () => ({
      ...project.theme,
      ...(template.themePatch ?? {}),
    }),
    [project.theme, template.themePatch]
  );

  const title = lang === 'fa' ? template.nameFa : template.nameEn;
  const source = lang === 'fa' ? template.sourceFa : template.sourceEn;
  const desc = lang === 'fa' ? template.descriptionFa : template.descriptionEn;

  // Virtual 1080px canvas scaled to ~272px inside the drawer showcase card
  const scaleFactor = 0.252;
  const visibleBlocks = expanded ? template.blocks : template.blocks.slice(0, 3);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0B1F3D]/85 shadow-sm transition-colors hover:border-[#F26A1B]/70">
      {/* Live Mini Showcase Viewport */}
      <div
        className={`relative w-full border-b border-slate-200 dark:border-slate-800 transition-all ${
          expanded ? 'h-80 overflow-y-auto overflow-x-hidden' : 'h-40 overflow-hidden'
        }`}
        style={{ backgroundColor: previewTheme.bg }}
      >
        <div
          className="pointer-events-none select-none"
          style={{
            width: '1080px',
            transform: `scale(${scaleFactor})`,
            transformOrigin: lang === 'fa' ? 'top right' : 'top left',
            backgroundColor: previewTheme.bg,
            color: previewTheme.text,
          }}
        >
          {visibleBlocks.map((blk, idx) => (
            <BlockRenderer
              key={`${template.id}-mini-${idx}`}
              block={translateBlockLocally({ ...blk, id: `${template.id}-mini-${idx}` }, lang)}
              theme={previewTheme}
              deviceMode="desktop"
              navMenu={project.navMenu}
              numerals={numerals}
              lang={lang}
              editable={false}
              replayKey={0}
              onUpdateContent={() => {}}
            />
          ))}
        </div>

        {/* Bottom gradient fade when compact */}
        {!expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#071429]/85 to-transparent" />
        )}

        {/* Top-bar overlay controls on card preview */}
        <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-1">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#071429]/85 px-2 py-0.5 text-[10px] font-semibold text-slate-200 backdrop-blur-sm border border-white/10">
            <LayoutTemplate className="h-3 w-3 text-[#F26A1B]" />
            <span className="truncate max-w-[130px]">{source}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleExpand}
              title={expanded ? t('tplInlineCollapse') : t('tplInlineExpand')}
              className="rounded-md bg-[#071429]/85 p-1 text-slate-200 hover:bg-[#F26A1B] hover:text-white backdrop-blur-sm border border-white/10 transition-colors"
            >
              {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onClick={onFullPreview}
              title={t('tplFullPreview')}
              className="inline-flex items-center gap-1 rounded-md bg-[#F26A1B] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#FF8A3D] shadow"
            >
              <Eye className="h-3 w-3" />
              <span>{t('tplFullPreview')}</span>
            </button>
          </div>
        </div>

        {/* Block count & theme dots */}
        <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-center justify-between text-[10px] text-white">
          <span className="inline-flex items-center gap-1 rounded bg-[#071429]/85 px-1.5 py-0.5 font-medium border border-white/10">
            <Layers className="h-2.5 w-2.5 text-[#F26A1B]" />
            <span>
              {fmt(template.blocks.length)} {t('tplBlocksUnit')}
            </span>
          </span>
          <div className="flex items-center gap-1 rounded bg-[#071429]/85 px-1.5 py-1 border border-white/10">
            <span
              className="h-2.5 w-2.5 rounded-sm border border-white/20"
              style={{ backgroundColor: previewTheme.bg }}
            />
            <span
              className="h-2.5 w-2.5 rounded-sm border border-white/20"
              style={{ backgroundColor: previewTheme.primary }}
            />
            <span
              className="h-2.5 w-2.5 rounded-sm border border-white/20"
              style={{ backgroundColor: previewTheme.accent }}
            />
          </div>
        </div>
      </div>

      {/* Showcase Card Details & Actions */}
      <div className="p-2.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-xs font-bold leading-snug">{title}</h3>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">
              {desc}
            </p>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title={t('delete')}
              className="rounded p-1 text-slate-400 hover:bg-red-500/15 hover:text-red-400 shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={onApplyCurrent}
            className="rounded-lg bg-[#1E4A8A] px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-[#3366B0] transition-colors whitespace-nowrap truncate"
          >
            {t('tplApplyCurrent')}
          </button>
          <button
            type="button"
            onClick={onCreatePage}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#12284A] px-2 py-1.5 text-[11px] font-semibold hover:border-[#F26A1B] transition-colors whitespace-nowrap truncate"
          >
            <FilePlus2 className="h-3 w-3 text-[#F26A1B] shrink-0" />
            <span className="truncate">{t('tplCreatePage')}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
