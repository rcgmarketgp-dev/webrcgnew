import React, { useMemo, useState } from 'react';
import {
  FilePlus2,
  LayoutTemplate,
  Monitor,
  Palette,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';
import { BlockRenderer } from '../../blocks/BlockRenderer';
import { EXTERNAL_TEMPLATES } from '../../data/externalTemplates';
import { formatNumerals, getTranslator } from '../../i18n/translations';
import { translateBlockLocally } from '../../i18n/siteContentTranslator';
import { useEditorStore } from '../../store/useEditorStore';
import { DeviceMode } from '../../types/editor';

export const TemplatePreviewModal: React.FC = () => {
  const {
    project,
    customTemplates,
    previewTemplateId,
    lang,
    numerals,
    setPreviewTemplateId,
    applyTemplateToCurrentPage,
    createPageFromTemplate,
    showToast,
  } = useEditorStore();
  const t = getTranslator(lang);
  const fmt = (v: string | number) => formatNumerals(v, numerals);

  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [applyTheme, setApplyTheme] = useState(true);

  const template = useMemo(
    () =>
      [...customTemplates, ...EXTERNAL_TEMPLATES].find(
        (item) => item.id === previewTemplateId
      ) ?? null,
    [customTemplates, previewTemplateId]
  );

  if (!template) return null;

  const previewTheme = {
    ...project.theme,
    ...(applyTheme && template.themePatch ? template.themePatch : {}),
  };

  const frameWidth =
    device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '390px';

  return (
    <div
      onClick={() => setPreviewTemplateId(null)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#071429] text-slate-100 shadow-2xl"
      >
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#0B1F3D] px-4 py-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F26A1B]/15 text-[#F26A1B]">
              <LayoutTemplate className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">
                {lang === 'fa' ? template.nameFa : template.nameEn}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {lang === 'fa' ? template.sourceFa : template.sourceEn} ·{' '}
                {fmt(template.blocks.length)} {t('tplBlocksUnit')}
              </p>
            </div>
          </div>

          {/* Device Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-700 bg-[#071429] p-0.5">
              {(
                [
                  ['desktop', Monitor, t('desktop')],
                  ['tablet', Tablet, t('tablet')],
                  ['mobile', Smartphone, t('mobile')],
                ] as const
              ).map(([mode, Icon, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDevice(mode)}
                  title={label}
                  className={`rounded-md p-1.5 transition-colors ${
                    device === mode
                      ? 'bg-[#F26A1B] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            {template.themePatch && (
              <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#071429] px-2.5 py-1.5 text-[11px] cursor-pointer">
                <Palette className="h-3.5 w-3.5 text-[#F26A1B]" />
                <span>{t('tplIncludeTheme')}</span>
                <input
                  type="checkbox"
                  checked={applyTheme}
                  onChange={(e) => setApplyTheme(e.target.checked)}
                  className="accent-[#F26A1B]"
                />
              </label>
            )}

            <button
              type="button"
              onClick={() => {
                applyTemplateToCurrentPage(template, applyTheme);
                showToast(t('tplAppliedToast'), 'success', true);
              }}
              className="rounded-lg bg-[#1E4A8A] px-3 py-1.5 font-semibold text-white hover:bg-[#3366B0] whitespace-nowrap"
            >
              {t('tplApplyCurrent')}
            </button>

            <button
              type="button"
              onClick={() => {
                createPageFromTemplate(template, applyTheme);
                showToast(t('tplAppliedToast'), 'success', true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26A1B] px-3 py-1.5 font-semibold text-white hover:bg-[#FF8A3D] whitespace-nowrap"
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              <span>{t('tplCreatePage')}</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewTemplateId(null)}
              aria-label={t('close')}
              className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Full Interactive Live Template Viewport */}
        <div className="flex-1 overflow-auto bg-[#050E1E] p-4 md:p-6">
          <div
            className="mx-auto w-full overflow-hidden rounded-2xl border border-slate-700/80 shadow-2xl transition-all duration-200"
            style={{
              maxWidth: frameWidth,
              backgroundColor: previewTheme.bg,
              color: previewTheme.text,
            }}
          >
            {template.blocks.map((blk, idx) => (
              <BlockRenderer
                key={`${template.id}-full-${idx}`}
                block={translateBlockLocally({ ...blk, id: `${template.id}-full-${idx}` }, lang)}
                theme={previewTheme}
                deviceMode={device}
                navMenu={project.navMenu}
                numerals={numerals}
                lang={lang}
                editable={false}
                replayKey={0}
                onUpdateContent={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
