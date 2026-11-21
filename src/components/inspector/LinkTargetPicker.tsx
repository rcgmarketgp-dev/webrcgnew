import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Globe,
  Hash,
  Link2,
  Phone,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { getTranslator } from '../../i18n/translations';
import { LinkTarget } from '../../types/editor';
import {
  buildCategorizedLinks,
  CategorizedLinkSuggestion,
  describeLinkTarget,
  sanitizeExternalUrl,
} from '../../utils/linkResolver';

type PickerFilter = 'all' | 'pages' | 'currentSections' | 'otherSections' | 'quick' | 'external';

interface LinkTargetPickerProps {
  label?: string;
  value?: LinkTarget;
  disabled?: boolean;
  onChange: (next: LinkTarget | undefined) => void;
  compact?: boolean;
}

export const LinkTargetPicker: React.FC<LinkTargetPickerProps> = ({
  label,
  value,
  disabled = false,
  onChange,
  compact = false,
}) => {
  const { project, activePageId, lang } = useEditorStore();
  const t = getTranslator(lang);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<PickerFilter>('all');
  const [query, setQuery] = useState('');
  const [externalUrl, setExternalUrl] = useState(value?.kind === 'external' ? value.url || '' : '');
  const [openInNewTab, setOpenInNewTab] = useState(
    value?.kind === 'external' ? value.openInNewTab ?? true : true
  );

  useEffect(() => {
    if (value?.kind === 'external') {
      setExternalUrl(value.url || '');
      setOpenInNewTab(value.openInNewTab ?? true);
    }
  }, [value]);

  const suggestions = useMemo(
    () => buildCategorizedLinks(project, activePageId, lang),
    [project, activePageId, lang]
  );

  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suggestions.filter((item) => {
      const catMatch = filter === 'all' || filter === item.category;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle ?? '').toLowerCase().includes(q)
      );
    });
  }, [suggestions, filter, query]);

  const groupedSuggestions = useMemo(() => {
    const order: CategorizedLinkSuggestion['category'][] = [
      'pages',
      'currentSections',
      'otherSections',
      'quick',
    ];
    return order
      .map((cat) => ({
        category: cat,
        items: filteredSuggestions.filter((i) => i.category === cat),
      }))
      .filter((g) => g.items.length > 0);
  }, [filteredSuggestions]);

  const categoryTitles: Record<CategorizedLinkSuggestion['category'], string> = {
    pages: t('linkCatPages'),
    currentSections: t('linkCatCurrentSections'),
    otherSections: t('linkCatOtherSections'),
    quick: t('linkCatQuick'),
  };

  const filterChips: { id: PickerFilter; label: string }[] = [
    { id: 'all', label: t('linkCatAll') },
    { id: 'pages', label: t('linkCatPages') },
    { id: 'currentSections', label: t('linkCatCurrentSections') },
    { id: 'otherSections', label: t('linkCatOtherSections') },
    { id: 'quick', label: t('linkCatQuick') },
    { id: 'external', label: t('linkCatExternal') },
  ];

  const isTargetSelected = (target: LinkTarget): boolean => {
    if (!value) return false;
    if (value.kind !== target.kind) return false;
    if (target.kind === 'page') return value.pageId === target.pageId;
    if (target.kind === 'section') {
      return value.pageId === target.pageId && value.blockId === target.blockId;
    }
    return value.url === target.url;
  };

  const summaryText = value ? describeLinkTarget(value, project, lang) : t('noLinkSelected');

  const KindIcon =
    value?.kind === 'page'
      ? FileText
      : value?.kind === 'section'
      ? Hash
      : value?.kind === 'external'
      ? Globe
      : Link2;

  const handleApplyExternal = () => {
    const trimmed = externalUrl.trim();
    if (!trimmed) return;
    const sanitized = sanitizeExternalUrl(trimmed);
    onChange({
      kind: 'external',
      url: sanitized,
      openInNewTab,
      labelSnapshot: sanitized,
    });
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}

      {/* Selected Link Trigger Row */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={`flex min-w-0 flex-1 items-center justify-between gap-1.5 rounded-lg border px-2 py-1.5 text-start transition-colors ${
            compact ? 'text-[11px]' : 'text-xs'
          } ${
            open
              ? 'border-[#F26A1B] bg-[#F26A1B]/10'
              : value
              ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] hover:border-[#F26A1B]'
              : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1F3D]/50 hover:border-[#F26A1B]'
          } disabled:opacity-50`}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <KindIcon className="h-3.5 w-3.5 shrink-0 text-[#F26A1B]" />
            <span className={`truncate ${value ? 'font-semibold' : 'text-slate-400'}`}>
              {summaryText}
            </span>
          </span>
          {open ? (
            <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          )}
        </button>

        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            title={t('clearLink')}
            aria-label={t('clearLink')}
            className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-400 hover:border-red-400/60 hover:text-red-400 transition-colors shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Categorized Picker Popover / Panel */}
      {open && !disabled && (
        <div className="rounded-xl border border-[#F26A1B]/40 bg-slate-50 dark:bg-[#071429] p-2.5 shadow-xl space-y-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute start-2 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchLinksPlaceholder')}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] ps-7 pe-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-[#F26A1B]"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1">
            {filterChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                  filter === chip.id
                    ? 'bg-[#F26A1B] text-white'
                    : 'bg-slate-200/80 dark:bg-[#0E2547] text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-[#12315F]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Categorized Site & Section Suggestions */}
          {filter !== 'external' && (
            <div className="max-h-48 overflow-y-auto space-y-2.5 pe-0.5">
              {groupedSuggestions.length === 0 ? (
                <p className="py-3 text-center text-[11px] text-slate-400">
                  {t('noSuggestionsFound')}
                </p>
              ) : (
                groupedSuggestions.map((group) => (
                  <div key={group.category} className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#F26A1B]">
                      {group.category === 'pages' && <FileText className="h-3 w-3" />}
                      {group.category === 'currentSections' && <Hash className="h-3 w-3" />}
                      {group.category === 'otherSections' && <Sparkles className="h-3 w-3" />}
                      {group.category === 'quick' && <Phone className="h-3 w-3" />}
                      <span>{categoryTitles[group.category]}</span>
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const selected = isTargetSelected(item.target);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onChange(item.target);
                              setOpen(false);
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-start transition-colors ${
                              selected
                                ? 'border-[#F26A1B] bg-[#F26A1B]/15 text-[#F26A1B]'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1F3D]/80 hover:border-[#F26A1B]/60'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[11px] font-semibold">{item.title}</div>
                              {item.subtitle && (
                                <div className="truncate text-[10px] text-slate-400" dir="auto">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                            {selected && <Check className="h-3.5 w-3.5 shrink-0 text-[#F26A1B]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* External Source Link Section */}
          {(filter === 'all' || filter === 'external') && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 space-y-2">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-300">
                <ExternalLink className="h-3 w-3 text-[#F26A1B]" />
                <span>{t('linkCatExternal')}</span>
              </div>

              <div className="flex flex-wrap gap-1" dir="ltr">
                {['https://', 'tel:+98', 'mailto:'].map((prefix) => (
                  <button
                    key={prefix}
                    type="button"
                    onClick={() => {
                      if (!externalUrl.startsWith(prefix)) {
                        setExternalUrl(prefix);
                      }
                    }}
                    className="rounded bg-slate-200/80 dark:bg-[#0E2547] px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300 hover:text-[#F26A1B]"
                  >
                    {prefix}
                  </button>
                ))}
              </div>

              <input
                type="text"
                dir="ltr"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyExternal();
                  }
                }}
                placeholder={t('externalUrlPlaceholder')}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2 py-1.5 text-[11px] font-mono outline-none focus:ring-1 focus:ring-[#F26A1B]"
              />

              <div className="flex items-center justify-between gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={openInNewTab}
                    onChange={(e) => setOpenInNewTab(e.target.checked)}
                    className="rounded accent-[#F26A1B]"
                  />
                  <span>{t('openInNewTab')}</span>
                </label>

                <button
                  type="button"
                  disabled={!externalUrl.trim()}
                  onClick={handleApplyExternal}
                  className="rounded-lg bg-[#F26A1B] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#FF8A3D] disabled:opacity-40"
                >
                  {t('applyExternalUrl')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
