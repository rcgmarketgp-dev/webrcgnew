import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Link2, Play, RotateCcw, Plus, Trash2, X } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { getTranslator, formatNumerals } from '../../i18n/translations';
import { resolveEffectiveStyle } from '../../blocks/BlockRenderer';
import { NAVY_SCALE } from '../../data/seedSite';
import {
  ActionButtonItem,
  ActionButtonStyle,
  AnimationType,
  BackgroundType,
  LinkTarget,
  MaxWidthOption,
  ShadowLevel,
  TextAlignOption,
} from '../../types/editor';
import { LinkTargetPicker } from './LinkTargetPicker';
import { ImageFieldControl } from './ImageFieldControl';
import { normalizeLegacyLink } from '../../utils/linkResolver';

export const InspectorPanel: React.FC = () => {
  const {
    project,
    activePageId,
    selectedBlockId,
    deviceMode,
    rightTab,
    lang,
    numerals,
    focusedInspectorTarget,
    setRightTab,
    closeInspector,
    setBlockVariant,
    updateBlockLabel,
    updateBlockContent,
    updateBlockStyle,
    resetBreakpointOverride,
    updateBlockAnimation,
    triggerReplayAnim,
  } = useEditorStore();
  const t = getTranslator(lang);
  const fmt = (v: string | number) => formatNumerals(v, numerals);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  const page = project.pages.find((p) => p.id === activePageId);
  const block = page?.blocks.find((b) => b.id === selectedBlockId);

  useEffect(() => {
    if (!block || !focusedInspectorTarget || focusedInspectorTarget.blockId !== block.id) {
      return;
    }
    const { fieldKey, itemIndex } = focusedInspectorTarget;
    const candidateKeys: string[] = [];
    if (itemIndex !== undefined) {
      if (fieldKey === 'plans' || fieldKey?.startsWith('plan-')) {
        candidateKeys.push(`plan-${itemIndex}`);
      } else if (fieldKey === 'buttons' || fieldKey?.startsWith('button-')) {
        candidateKeys.push(`button-${itemIndex}`, 'buttons');
      } else {
        if (fieldKey) candidateKeys.push(`item-${itemIndex}-${fieldKey}`);
        candidateKeys.push(`item-${itemIndex}`);
      }
    } else if (fieldKey) {
      candidateKeys.push(fieldKey);
    }

    if (candidateKeys.length === 0) return;

    let clearTimer: ReturnType<typeof setTimeout> | undefined;
    const scrollTimer = setTimeout(() => {
      const container = bodyRef.current;
      if (!container) return;
      for (const candidate of candidateKeys) {
        const targetEl = container.querySelector<HTMLElement>(
          `[data-inspector-field="${candidate}"]`
        );
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedField(candidate);
          clearTimer = setTimeout(() => {
            setHighlightedField((curr) => (curr === candidate ? null : curr));
          }, 1800);
          break;
        }
      }
    }, 60);

    return () => {
      clearTimeout(scrollTimer);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [focusedInspectorTarget?.tick, block?.id, rightTab]);

  if (!block) {
    return null;
  }

  const effectiveStyle = resolveEffectiveStyle(block, deviceMode);
  const hasOverride =
    deviceMode !== 'desktop' &&
    Boolean(block.responsiveOverrides?.[deviceMode] && Object.keys(block.responsiveOverrides[deviceMode]!).length > 0);

  const brandSwatches = [
    project.theme.primary,
    project.theme.primaryHover,
    project.theme.primaryDark,
    project.theme.accent,
    project.theme.surface,
    project.theme.bg,
    ...NAVY_SCALE.slice(0, 4).map((s) => s.hex),
    'transparent',
  ];

  const c = block.content;

  return (
    <aside className="fixed top-14 bottom-0 end-0 z-40 flex w-72 sm:w-80 max-w-[88vw] shrink-0 flex-col border-s border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0E2547] text-xs shadow-2xl lg:static lg:z-auto lg:h-full lg:w-72 lg:shadow-none">
      {/* Header & Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800/90 p-2.5 space-y-2">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={block.label}
            onChange={(e) => updateBlockLabel(block.id, e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs font-bold outline-none focus:ring-1 focus:ring-[#F26A1B]"
          />
          <button
            type="button"
            onClick={() => {
              closeInspector();
            }}
            title={t('hideInspectorMenu')}
            aria-label={t('hideInspectorMenu')}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 dark:hover:bg-[#12315F] hover:text-[#F26A1B] transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 dark:bg-[#071429] p-1">
          {(
            [
              ['content', t('inspectorContent')],
              ['style', t('inspectorStyle')],
              ['layout', t('inspectorLayout')],
              ['animation', t('inspectorAnimation')],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setRightTab(id)}
              className={`rounded-md py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                rightTab === id
                  ? 'bg-[#F26A1B] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Breakpoint override notice */}
      {deviceMode !== 'desktop' && (rightTab === 'style' || rightTab === 'layout') && (
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-[#F26A1B]/10 px-3 py-2 text-[11px]">
          <span className="font-semibold text-[#F26A1B]">
            {t('breakpointOverrideHint')} {t(deviceMode)}
          </span>
          {hasOverride && (
            <button
              type="button"
              onClick={() => resetBreakpointOverride(block.id, deviceMode)}
              title={t('resetBreakpointOverride')}
              className="inline-flex items-center gap-1 rounded bg-[#F26A1B]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#F26A1B] hover:bg-[#F26A1B]/30"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{t('resetTheme').split(' ')[0]}</span>
            </button>
          )}
        </div>
      )}

      {/* Inspector Body */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto p-3 space-y-4">
        {block.locked && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
            {t('lockedNotice')}
          </div>
        )}

        {/* CONTENT TAB */}
        {rightTab === 'content' && (
          <div className="space-y-3">
            {/* Variant selector */}
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                {t('variantLabel')}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['a', 'b'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    disabled={block.locked}
                    onClick={() => setBlockVariant(block.id, v)}
                    className={`rounded-lg border py-1.5 font-semibold transition-colors ${
                      block.variant === v
                        ? 'border-[#F26A1B] bg-[#F26A1B]/15 text-[#F26A1B]'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#12315F]/50'
                    }`}
                  >
                    {v === 'a' ? t('variantA') : t('variantB')}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic string fields in block.content */}
            {Object.entries(c).map(([key, value]) => {
              if (key === 'ctaPageId') return null;
              if (typeof value === 'string') {
                const isImageField = key === 'imageUrl' || key === 'logoUrl';
                const isHighlighted = highlightedField === key;
                if (isImageField) {
                  return (
                    <div key={key} data-inspector-field={key}>
                      <ImageFieldControl
                        label={key === 'logoUrl' ? `${t('imageUrl')} (${key})` : t('imageUrl')}
                        value={value}
                        disabled={block.locked}
                        highlighted={isHighlighted}
                        onChange={(nextUrl) => updateBlockContent(block.id, { [key]: nextUrl })}
                      />
                    </div>
                  );
                }

                const isMultiline = value.length > 60 || key === 'body' || key === 'subheadline' || key === 'summary';
                return (
                  <div
                    key={key}
                    data-inspector-field={key}
                    className={`space-y-2 rounded-lg transition-all ${
                      isHighlighted ? 'p-1.5 ring-2 ring-[#F26A1B] bg-[#F26A1B]/10' : ''
                    }`}
                  >
                    <label className="block space-y-1">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {key}
                      </span>
                      {isMultiline ? (
                        <textarea
                          rows={3}
                          disabled={block.locked}
                          value={value}
                          onChange={(e) => updateBlockContent(block.id, { [key]: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#F26A1B]"
                        />
                      ) : (
                        <input
                          type="text"
                          disabled={block.locked}
                          value={value}
                          onChange={(e) => updateBlockContent(block.id, { [key]: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#F26A1B]"
                        />
                      )}
                    </label>

                    {block.type === 'navbar' && key === 'ctaLabel' && (
                      <LinkTargetPicker
                        label={t('ctaButtonLink')}
                        value={normalizeLegacyLink(c.ctaLink, c.ctaPageId)}
                        disabled={block.locked}
                        onChange={(next) =>
                          updateBlockContent(block.id, {
                            ctaLink: next,
                            ctaPageId: next?.kind === 'page' ? next.pageId || '' : '',
                          })
                        }
                      />
                    )}

                    {block.type === 'hero' && key === 'primaryCta' && (
                      <LinkTargetPicker
                        label={t('primaryCtaLink')}
                        value={c.primaryLink as LinkTarget | undefined}
                        disabled={block.locked}
                        onChange={(next) => updateBlockContent(block.id, { primaryLink: next })}
                      />
                    )}

                    {block.type === 'hero' && key === 'secondaryCta' && (
                      <LinkTargetPicker
                        label={t('secondaryCtaLink')}
                        value={c.secondaryLink as LinkTarget | undefined}
                        disabled={block.locked}
                        onChange={(next) => updateBlockContent(block.id, { secondaryLink: next })}
                      />
                    )}

                    {block.type === 'cta' && key === 'ctaLabel' && (
                      <LinkTargetPicker
                        label={t('ctaButtonLink')}
                        value={normalizeLegacyLink(c.ctaLink, 'page-contact')}
                        disabled={block.locked}
                        onChange={(next) => updateBlockContent(block.id, { ctaLink: next })}
                      />
                    )}
                  </div>
                );
              }
              return null;
            })}

            {/* Registered Custom Buttons & Links Manager */}
            <div
              data-inspector-field="buttons"
              className={`space-y-2 border-t border-slate-200 dark:border-slate-700/70 pt-3 rounded-lg transition-all ${
                highlightedField === 'buttons' ? 'p-1.5 ring-2 ring-[#F26A1B] bg-[#F26A1B]/10' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Link2 className="h-3.5 w-3.5 text-[#F26A1B]" />
                  <span>
                    {t('buttonsSection')}
                    {Array.isArray(c.buttons) && c.buttons.length > 0 ? ` (${fmt(c.buttons.length)})` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={block.locked}
                  onClick={() => {
                    const existing: ActionButtonItem[] = Array.isArray(c.buttons) ? c.buttons : [];
                    const defaultPage = project.pages[0];
                    const newBtn: ActionButtonItem = {
                      id: `btn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
                      label: t('defaultButtonLabel'),
                      style: 'primary',
                      link: defaultPage
                        ? { kind: 'page', pageId: defaultPage.id, labelSnapshot: defaultPage.title }
                        : { kind: 'external', url: 'https://', openInNewTab: true },
                    };
                    updateBlockContent(block.id, { buttons: [...existing, newBtn] });
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#F26A1B] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#FF8A3D] disabled:opacity-40"
                >
                  <Plus className="h-3 w-3" />
                  <span>{t('addButtonBtn')}</span>
                </button>
              </div>

              {Array.isArray(c.buttons) && c.buttons.length > 0 && (
                <div className="space-y-2">
                  {(c.buttons as ActionButtonItem[]).map((btn, idx) => {
                    const buttons = c.buttons as ActionButtonItem[];
                    const isBtnHighlighted = highlightedField === `button-${idx}`;
                    return (
                      <div
                        key={btn.id || idx}
                        data-inspector-field={`button-${idx}`}
                        className={`space-y-2 rounded-xl border p-2.5 transition-all ${
                          isBtnHighlighted
                            ? 'border-[#F26A1B] bg-[#F26A1B]/10 ring-2 ring-[#F26A1B]/50'
                            : 'border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-[#0B1F3D]/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-[#F26A1B]">
                            #{fmt(idx + 1)}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={block.locked || idx === 0}
                              onClick={() => {
                                const next = [...buttons];
                                [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                updateBlockContent(block.id, { buttons: next });
                              }}
                              className="rounded p-1 text-slate-400 hover:text-white disabled:opacity-30"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={block.locked || idx === buttons.length - 1}
                              onClick={() => {
                                const next = [...buttons];
                                [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                                updateBlockContent(block.id, { buttons: next });
                              }}
                              className="rounded p-1 text-slate-400 hover:text-white disabled:opacity-30"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={block.locked}
                              onClick={() => {
                                const next = buttons.filter((_, i) => i !== idx);
                                updateBlockContent(block.id, { buttons: next });
                              }}
                              title={t('deleteButton')}
                              className="rounded p-1 text-slate-400 hover:text-red-400 disabled:opacity-30"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          disabled={block.locked}
                          value={btn.label}
                          placeholder={t('buttonLabelPlaceholder')}
                          onChange={(e) => {
                            const next = [...buttons];
                            next[idx] = { ...next[idx], label: e.target.value };
                            updateBlockContent(block.id, { buttons: next });
                          }}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] px-2.5 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#F26A1B]"
                        />

                        <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-200/70 dark:bg-[#071429] p-0.5">
                          {(
                            [
                              ['primary', t('btnStylePrimary')],
                              ['secondary', t('btnStyleSecondary')],
                              ['outline', t('btnStyleOutline')],
                            ] as [ActionButtonStyle, string][]
                          ).map(([styleId, styleLabel]) => (
                            <button
                              key={styleId}
                              type="button"
                              disabled={block.locked}
                              onClick={() => {
                                const next = [...buttons];
                                next[idx] = { ...next[idx], style: styleId };
                                updateBlockContent(block.id, { buttons: next });
                              }}
                              className={`rounded-md py-1 text-[10px] font-semibold transition-colors ${
                                btn.style === styleId
                                  ? 'bg-[#F26A1B] text-white'
                                  : 'text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {styleLabel}
                            </button>
                          ))}
                        </div>

                        <LinkTargetPicker
                          label={t('linkDestination')}
                          value={btn.link}
                          disabled={block.locked}
                          compact
                          onChange={(nextLink) => {
                            const next = [...buttons];
                            next[idx] = {
                              ...next[idx],
                              link: nextLink ?? { kind: 'external', url: '#' },
                            };
                            updateBlockContent(block.id, { buttons: next });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Array items editor (for features, products, stats, faq, testimonials, gallery) */}
            {Array.isArray(c.items) && (
              <div className="space-y-2 border-t border-slate-200 dark:border-slate-700/70 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold">آیتم‌ها ({fmt(c.items.length)})</span>
                  <button
                    type="button"
                    disabled={block.locked}
                    onClick={() => {
                      const template = c.items[0] ? { ...c.items[0] } : { title: 'آیتم جدید', description: 'توضیح نمونه' };
                      updateBlockContent(block.id, { items: [...c.items, template] });
                    }}
                    className="inline-flex items-center gap-1 rounded bg-[#F26A1B]/15 px-2 py-1 text-[11px] font-semibold text-[#F26A1B]"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                {c.items.map((item: Record<string, any>, idx: number) => {
                  const isItemHighlighted = highlightedField === `item-${idx}`;
                  return (
                    <div
                      key={idx}
                      data-inspector-field={`item-${idx}`}
                      className={`space-y-1.5 rounded-lg border p-2 transition-all ${
                        isItemHighlighted
                          ? 'border-[#F26A1B] bg-[#F26A1B]/10 ring-2 ring-[#F26A1B]/50'
                          : 'border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-[#0B1F3D]/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">#{fmt(idx + 1)}</span>
                        {c.items.length > 1 && (
                          <button
                            type="button"
                            disabled={block.locked}
                            onClick={() => {
                              const next = c.items.filter((_: unknown, i: number) => i !== idx);
                              updateBlockContent(block.id, { items: next });
                            }}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      {Object.entries(item).map(([k, v]) => {
                        if (typeof v !== 'string') return null;
                        const fieldMarker = `item-${idx}-${k}`;
                        const isItemImg = k === 'imageUrl' || k === 'url';
                        if (isItemImg) {
                          return (
                            <div key={k} data-inspector-field={fieldMarker}>
                              <ImageFieldControl
                                compact
                                label={k}
                                value={v}
                                disabled={block.locked}
                                highlighted={highlightedField === fieldMarker}
                                onChange={(nextUrl) => {
                                  const next = [...c.items];
                                  next[idx] = { ...next[idx], [k]: nextUrl };
                                  updateBlockContent(block.id, { items: next });
                                }}
                              />
                            </div>
                          );
                        }
                        return (
                          <input
                            key={k}
                            data-inspector-field={fieldMarker}
                            type="text"
                            disabled={block.locked}
                            value={v}
                            placeholder={k}
                            onChange={(e) => {
                              const next = [...c.items];
                              next[idx] = { ...next[idx], [k]: e.target.value };
                              updateBlockContent(block.id, { items: next });
                            }}
                            className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] px-2 py-1 text-[11px] outline-none"
                          />
                        );
                      })}
                      {typeof item.ctaLabel === 'string' && (
                        <LinkTargetPicker
                          label={t('itemCtaLink')}
                          value={item.ctaLink as LinkTarget | undefined}
                          disabled={block.locked}
                          compact
                          onChange={(nextLink) => {
                            const next = [...c.items];
                            next[idx] = { ...next[idx], ctaLink: nextLink };
                            updateBlockContent(block.id, { items: next });
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pricing plans editor */}
            {Array.isArray(c.plans) && (
              <div className="space-y-2 border-t border-slate-200 dark:border-slate-700/70 pt-3">
                <span className="font-bold block">
                  {t('plansSection')} ({fmt(c.plans.length)})
                </span>
                {c.plans.map((plan: Record<string, any>, idx: number) => {
                  const isPlanHighlighted = highlightedField === `plan-${idx}`;
                  return (
                    <div
                      key={idx}
                      data-inspector-field={`plan-${idx}`}
                      className={`space-y-1.5 rounded-lg border p-2 transition-all ${
                        isPlanHighlighted
                          ? 'border-[#F26A1B] bg-[#F26A1B]/10 ring-2 ring-[#F26A1B]/50'
                          : 'border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-[#0B1F3D]/70'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-400">#{fmt(idx + 1)}</span>
                      {(['name', 'price', 'description', 'ctaLabel'] as const).map((fieldKey) =>
                        typeof plan[fieldKey] === 'string' ? (
                          <input
                            key={fieldKey}
                            type="text"
                            disabled={block.locked}
                            value={plan[fieldKey]}
                            placeholder={fieldKey}
                            onChange={(e) => {
                              const next = [...c.plans];
                              next[idx] = { ...next[idx], [fieldKey]: e.target.value };
                              updateBlockContent(block.id, { plans: next });
                            }}
                            className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] px-2 py-1 text-[11px] outline-none"
                          />
                        ) : null
                      )}
                      <LinkTargetPicker
                        label={t('planCtaLink')}
                        value={plan.ctaLink as LinkTarget | undefined}
                        disabled={block.locked}
                        compact
                        onChange={(nextLink) => {
                          const next = [...c.plans];
                          next[idx] = { ...next[idx], ctaLink: nextLink };
                          updateBlockContent(block.id, { plans: next });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STYLE TAB */}
        {rightTab === 'style' && (
          <div className="space-y-4">
            {/* Background Type */}
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                {t('backgroundType')}
              </span>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 dark:bg-[#071429] p-1">
                {(
                  [
                    ['solid', t('bgSolid')],
                    ['gradient', t('bgGradient')],
                    ['image', t('bgImage')],
                  ] as [BackgroundType, string][]
                ).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    disabled={block.locked}
                    onClick={() => updateBlockStyle(block.id, { backgroundType: type }, deviceMode)}
                    className={`rounded-md py-1 text-[11px] font-semibold ${
                      effectiveStyle.backgroundType === type
                        ? 'bg-[#1E4A8A] text-white'
                        : 'text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {effectiveStyle.backgroundType === 'solid' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>{t('bgColor')}</span>
                  <input
                    type="text"
                    dir="ltr"
                    value={effectiveStyle.backgroundColor}
                    onChange={(e) =>
                      updateBlockStyle(block.id, { backgroundColor: e.target.value }, deviceMode)
                    }
                    className="w-24 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2 py-0.5 text-[11px] font-mono"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {brandSwatches.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() =>
                        updateBlockStyle(block.id, { backgroundColor: hex }, deviceMode)
                      }
                      title={hex}
                      className={`h-5 w-5 rounded border border-slate-400/50 ${
                        effectiveStyle.backgroundColor === hex ? 'ring-2 ring-[#F26A1B]' : ''
                      }`}
                      style={{
                        background:
                          hex === 'transparent'
                            ? 'repeating-conic-gradient(#334155 0% 25%, transparent 0% 50%) 50% / 8px 8px'
                            : hex,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {effectiveStyle.backgroundType === 'gradient' && (
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className="text-[11px]">{t('gradientStart')}</span>
                  <input
                    type="color"
                    value={effectiveStyle.gradientFrom}
                    onChange={(e) =>
                      updateBlockStyle(block.id, { gradientFrom: e.target.value }, deviceMode)
                    }
                    className="h-8 w-full cursor-pointer rounded border border-slate-600 bg-transparent"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px]">{t('gradientEnd')}</span>
                  <input
                    type="color"
                    value={effectiveStyle.gradientTo}
                    onChange={(e) =>
                      updateBlockStyle(block.id, { gradientTo: e.target.value }, deviceMode)
                    }
                    className="h-8 w-full cursor-pointer rounded border border-slate-600 bg-transparent"
                  />
                </label>
              </div>
            )}

            {effectiveStyle.backgroundType === 'image' && (
              <div className="space-y-2" data-inspector-field="backgroundImage">
                <ImageFieldControl
                  compact
                  label={t('imageUrl')}
                  value={effectiveStyle.backgroundImage}
                  disabled={block.locked}
                  highlighted={highlightedField === 'backgroundImage'}
                  onChange={(nextUrl) =>
                    updateBlockStyle(block.id, { backgroundImage: nextUrl }, deviceMode)
                  }
                />
                <label className="block space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span>{t('overlayOpacity')}</span>
                    <span className="tabular-nums">{Math.round(effectiveStyle.backgroundOverlayOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.9}
                    step={0.05}
                    value={effectiveStyle.backgroundOverlayOpacity}
                    onChange={(e) =>
                      updateBlockStyle(
                        block.id,
                        { backgroundOverlayOpacity: Number(e.target.value) },
                        deviceMode
                      )
                    }
                    className="w-full accent-[#F26A1B]"
                  />
                </label>
              </div>
            )}

            {/* Text Color */}
            <div className="flex items-center justify-between">
              <span>{t('textColor')}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={effectiveStyle.textColor || project.theme.text}
                  onChange={(e) =>
                    updateBlockStyle(block.id, { textColor: e.target.value }, deviceMode)
                  }
                  className="h-6 w-8 cursor-pointer rounded border border-slate-500/40 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => updateBlockStyle(block.id, { textColor: '' }, deviceMode)}
                  className="text-[10px] text-slate-400 hover:text-slate-200"
                >
                  Auto
                </button>
              </div>
            </div>

            {/* Typography scale */}
            <label className="block space-y-1">
              <div className="flex justify-between">
                <span>{t('headingSize')}</span>
                <span className="tabular-nums">{fmt(effectiveStyle.headingScale)}x</span>
              </div>
              <input
                type="range"
                min={0.75}
                max={1.5}
                step={0.05}
                value={effectiveStyle.headingScale}
                onChange={(e) =>
                  updateBlockStyle(block.id, { headingScale: Number(e.target.value) }, deviceMode)
                }
                className="w-full accent-[#F26A1B]"
              />
            </label>

            <label className="block space-y-1">
              <div className="flex justify-between">
                <span>{t('bodySize')}</span>
                <span className="tabular-nums">{fmt(effectiveStyle.bodyScale)}x</span>
              </div>
              <input
                type="range"
                min={0.85}
                max={1.35}
                step={0.05}
                value={effectiveStyle.bodyScale}
                onChange={(e) =>
                  updateBlockStyle(block.id, { bodyScale: Number(e.target.value) }, deviceMode)
                }
                className="w-full accent-[#F26A1B]"
              />
            </label>

            {/* Radius & Border & Shadow */}
            <label className="block space-y-1">
              <div className="flex justify-between">
                <span>{t('borderRadius')}</span>
                <span className="tabular-nums">{fmt(effectiveStyle.borderRadius)}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={32}
                step={2}
                value={effectiveStyle.borderRadius}
                onChange={(e) =>
                  updateBlockStyle(block.id, { borderRadius: Number(e.target.value) }, deviceMode)
                }
                className="w-full accent-[#F26A1B]"
              />
            </label>

            <label className="block space-y-1">
              <div className="flex justify-between">
                <span>{t('borderWidth')}</span>
                <span className="tabular-nums">{fmt(effectiveStyle.borderWidth)}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={4}
                step={1}
                value={effectiveStyle.borderWidth}
                onChange={(e) =>
                  updateBlockStyle(block.id, { borderWidth: Number(e.target.value) }, deviceMode)
                }
                className="w-full accent-[#F26A1B]"
              />
            </label>

            <label className="block space-y-1">
              <span>{t('shadow')}</span>
              <select
                value={effectiveStyle.shadow}
                onChange={(e) =>
                  updateBlockStyle(block.id, { shadow: e.target.value as ShadowLevel }, deviceMode)
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none"
              >
                <option value="none">{t('shadowNone')}</option>
                <option value="sm">{t('shadowSm')}</option>
                <option value="md">{t('shadowMd')}</option>
                <option value="lg">{t('shadowLg')}</option>
              </select>
            </label>
          </div>
        )}

        {/* LAYOUT TAB */}
        {rightTab === 'layout' && (
          <div className="space-y-4">
            <label className="block space-y-1">
              <span>{t('maxWidth')}</span>
              <select
                value={effectiveStyle.maxWidth}
                onChange={(e) =>
                  updateBlockStyle(block.id, { maxWidth: e.target.value as MaxWidthOption }, deviceMode)
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none"
              >
                <option value="full">{t('widthFull')}</option>
                <option value="xl">{t('widthXl')}</option>
                <option value="lg">{t('widthLg')}</option>
                <option value="md">{t('widthMd')}</option>
              </select>
            </label>

            <div className="space-y-1.5">
              <span>{t('textAlign')}</span>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 dark:bg-[#071429] p-1">
                {(
                  [
                    ['start', t('alignStart')],
                    ['center', t('alignCenter')],
                    ['end', t('alignEnd')],
                  ] as [TextAlignOption, string][]
                ).map(([align, label]) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateBlockStyle(block.id, { textAlign: align }, deviceMode)}
                    className={`rounded-md py-1 text-[11px] font-semibold ${
                      effectiveStyle.textAlign === align
                        ? 'bg-[#1E4A8A] text-white'
                        : 'text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {(
              [
                ['paddingY', t('paddingY'), 0, 140, 4],
                ['paddingX', t('paddingX'), 0, 96, 4],
                ['marginY', t('marginY'), 0, 80, 4],
                ['gap', t('itemGap'), 8, 64, 4],
              ] as const
            ).map(([prop, label, min, max, step]) => (
              <label key={prop} className="block space-y-1">
                <div className="flex justify-between">
                  <span>{label}</span>
                  <span className="tabular-nums">{fmt(effectiveStyle[prop])}px</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={effectiveStyle[prop]}
                  onChange={(e) =>
                    updateBlockStyle(block.id, { [prop]: Number(e.target.value) }, deviceMode)
                  }
                  className="w-full accent-[#F26A1B]"
                />
              </label>
            ))}
          </div>
        )}

        {/* ANIMATION TAB */}
        {rightTab === 'animation' && (
          <div className="space-y-4">
            <label className="block space-y-1">
              <span>{t('animType')}</span>
              <select
                value={block.animation.type}
                onChange={(e) =>
                  updateBlockAnimation(block.id, { type: e.target.value as AnimationType })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none"
              >
                <option value="none">{t('animNone')}</option>
                <option value="fade">{t('animFade')}</option>
                <option value="slide-up">{t('animSlideUp')}</option>
                <option value="slide-start">{t('animSlideStart')}</option>
                <option value="scale">{t('animScale')}</option>
                <option value="stagger">{t('animStagger')}</option>
              </select>
            </label>

            <label className="block space-y-1">
              <div className="flex justify-between">
                <span>{t('animDuration')}</span>
                <span className="tabular-nums">{fmt(block.animation.duration)} ms</span>
              </div>
              <input
                type="range"
                min={120}
                max={600}
                step={20}
                value={block.animation.duration}
                onChange={(e) =>
                  updateBlockAnimation(block.id, { duration: Number(e.target.value) })
                }
                className="w-full accent-[#F26A1B]"
              />
            </label>

            <label className="block space-y-1">
              <div className="flex justify-between">
                <span>{t('animDelay')}</span>
                <span className="tabular-nums">{fmt(block.animation.delay)} ms</span>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                step={25}
                value={block.animation.delay}
                onChange={(e) =>
                  updateBlockAnimation(block.id, { delay: Number(e.target.value) })
                }
                className="w-full accent-[#F26A1B]"
              />
            </label>

            <button
              type="button"
              onClick={triggerReplayAnim}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1E4A8A] py-2 font-semibold text-white hover:bg-[#3366B0]"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{t('replayAnim')}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
