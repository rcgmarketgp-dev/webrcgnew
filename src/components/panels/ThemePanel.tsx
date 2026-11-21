import React, { useState } from 'react';
import { RotateCcw, Trash2, Upload } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { getTranslator, formatNumerals } from '../../i18n/translations';
import { NAVY_SCALE } from '../../data/seedSite';

export const ThemePanel: React.FC = () => {
  const {
    project,
    lang,
    numerals,
    updateTheme,
    resetTheme,
    addUploadedFont,
    deleteUploadedFont,
    showToast,
  } = useEditorStore();
  const t = getTranslator(lang);
  const fmt = (v: string | number) => formatNumerals(v, numerals);

  const [fontFamilyInput, setFontFamilyInput] = useState('IRANYekan');
  const [fontWeightInput, setFontWeightInput] = useState('400');

  const theme = project.theme;

  const builtInFonts = ['IRANYekan', 'Vazirmatn', 'Tahoma'];
  const uploadedFamilies = Array.from(new Set((project.uploadedFonts || []).map((f) => f.family)));
  const fontOptions = Array.from(new Set([...builtInFonts, ...uploadedFamilies]));

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          // Infer weight from filename if present (e.g. IRANYekan-700.woff2)
          const match = file.name.match(/(300|400|500|600|700|800)/);
          const inferredWeight = match ? match[1] : fontWeightInput;
          const inferredFamily = fontFamilyInput.trim() || 'IRANYekan';
          await addUploadedFont({
            family: inferredFamily,
            weight: inferredWeight,
            dataUrl: reader.result,
            fileName: file.name,
          });
          showToast(t('toastFontLoaded'), 'success');
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  return (
    <div className="space-y-5 p-3 text-xs">
      {/* Site Dark / Light Preset */}
      <div className="space-y-2">
        <span className="font-bold text-slate-700 dark:text-slate-200">{t('siteThemePreset')}</span>
        <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-slate-200/80 dark:bg-[#071429] p-1">
          <button
            type="button"
            onClick={() =>
              updateTheme({
                siteMode: 'dark',
                bg: '#0B1F3D',
                surface: '#12284A',
                text: '#F1F5F9',
                muted: '#94A3B8',
                border: 'rgba(148, 163, 184, 0.22)',
              })
            }
            className={`rounded-md py-1.5 font-semibold transition-colors ${
              theme.siteMode === 'dark'
                ? 'bg-[#12315F] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t('darkMode')}
          </button>
          <button
            type="button"
            onClick={() =>
              updateTheme({
                siteMode: 'light',
                bg: '#F4F7FB',
                surface: '#FFFFFF',
                text: '#0B1F3D',
                muted: '#475569',
                border: 'rgba(18, 49, 95, 0.14)',
              })
            }
            className={`rounded-md py-1.5 font-semibold transition-colors ${
              theme.siteMode === 'light'
                ? 'bg-white text-[#0B1F3D] shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t('lightMode')}
          </button>
        </div>
      </div>

      {/* 10-step Navy Scale */}
      <div className="space-y-2">
        <div className="font-bold text-slate-700 dark:text-slate-200">{t('navyScale')}</div>
        <div className="grid grid-cols-5 gap-1.5">
          {NAVY_SCALE.map((swatch) => (
            <button
              key={swatch.step}
              type="button"
              onClick={() => updateTheme({ primary: swatch.hex })}
              title={`${swatch.step}: ${swatch.hex}`}
              className="group flex flex-col items-center gap-1 rounded-md border border-slate-300 dark:border-slate-700 p-1 hover:border-[#F26A1B]"
            >
              <span
                className="h-5 w-full rounded"
                style={{ backgroundColor: swatch.hex }}
              />
              <span className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                {fmt(swatch.step)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Color Pickers */}
      <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-700/70 pt-3">
        <div className="font-bold text-slate-700 dark:text-slate-200">{t('brandPalette')}</div>
        {(
          [
            ['primary', t('primaryColor')],
            ['accent', t('accentColor')],
            ['bg', t('siteBackground')],
            ['surface', t('siteSurface')],
            ['text', t('siteText')],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-slate-600 dark:text-slate-300">{label}</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={theme[key]}
                onChange={(e) => updateTheme({ [key]: e.target.value })}
                className="h-6 w-8 cursor-pointer rounded border border-slate-400/40 bg-transparent"
              />
              <input
                type="text"
                dir="ltr"
                value={theme[key]}
                onChange={(e) => updateTheme({ [key]: e.target.value })}
                className="w-20 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-1.5 py-0.5 text-[11px] font-mono outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Typography & IRANYekan Font Uploader */}
      <div className="space-y-3 border-t border-slate-200 dark:border-slate-700/70 pt-3">
        <div className="font-bold text-slate-700 dark:text-slate-200">{t('typographySection')}</div>

        <label className="block space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('headingFont')}</span>
          <select
            value={theme.headingFont}
            onChange={(e) => updateTheme({ headingFont: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none"
          >
            {fontOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('bodyFont')}</span>
          <select
            value={theme.bodyFont}
            onChange={(e) => updateTheme({ bodyFont: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none"
          >
            {fontOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        {/* Font Upload Control */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-[#0B1F3D]/80 p-2.5 space-y-2">
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {t('fontUploadHint')}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              dir="ltr"
              value={fontFamilyInput}
              onChange={(e) => setFontFamilyInput(e.target.value)}
              placeholder="IRANYekan"
              className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] px-2 py-1 text-[11px] outline-none"
            />
            <select
              value={fontWeightInput}
              onChange={(e) => setFontWeightInput(e.target.value)}
              className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] px-2 py-1 text-[11px] outline-none"
            >
              <option value="300">300 (Light)</option>
              <option value="400">400 (Regular)</option>
              <option value="500">500 (Medium)</option>
              <option value="700">700 (Bold)</option>
              <option value="800">800 (ExtraBold)</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#F26A1B]/70 bg-[#F26A1B]/10 px-3 py-2 text-xs font-semibold text-[#F26A1B] hover:bg-[#F26A1B]/20">
            <Upload className="h-3.5 w-3.5" />
            <span>{t('uploadFontFiles')}</span>
            <input
              type="file"
              accept=".woff2,.ttf,.woff,.otf"
              multiple
              onChange={handleFontUpload}
              className="hidden"
            />
          </label>

          {(project.uploadedFonts || []).length > 0 && (
            <div className="space-y-1 pt-1">
              {project.uploadedFonts.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded bg-slate-200/70 dark:bg-[#12315F]/60 px-2 py-1 text-[11px]"
                >
                  <span className="truncate">
                    {f.family} ({f.weight}) — {f.fileName}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteUploadedFont(f.id)}
                    className="text-slate-400 hover:text-red-400"
                    aria-label="Remove uploaded font"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Radius & Spacing Scale */}
      <div className="space-y-3 border-t border-slate-200 dark:border-slate-700/70 pt-3">
        <div className="font-bold text-slate-700 dark:text-slate-200">{t('geometrySection')}</div>
        <label className="block space-y-1">
          <div className="flex justify-between">
            <span>{t('baseRadius')}</span>
            <span className="tabular-nums font-semibold">{fmt(theme.baseRadius)}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={24}
            step={2}
            value={theme.baseRadius}
            onChange={(e) => updateTheme({ baseRadius: Number(e.target.value) })}
            className="w-full accent-[#F26A1B]"
          />
        </label>
        <label className="block space-y-1">
          <div className="flex justify-between">
            <span>{t('spacingScale')}</span>
            <span className="tabular-nums font-semibold">{fmt(theme.spacingScale)}x</span>
          </div>
          <input
            type="range"
            min={0.75}
            max={1.5}
            step={0.05}
            value={theme.spacingScale}
            onChange={(e) => updateTheme({ spacingScale: Number(e.target.value) })}
            className="w-full accent-[#F26A1B]"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={resetTheme}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 py-2 text-xs font-semibold hover:bg-slate-200/60 dark:hover:bg-[#12315F]"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>{t('resetTheme')}</span>
      </button>
    </div>
  );
};
