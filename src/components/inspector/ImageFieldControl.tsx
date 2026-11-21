import React, { useState } from 'react';
import { Check, ImageOff, ImagePlus, Upload, X } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { getTranslator } from '../../i18n/translations';

interface ImageFieldControlProps {
  label: string;
  value: string;
  disabled?: boolean;
  highlighted?: boolean;
  onChange: (nextUrl: string) => void;
  compact?: boolean;
}

export const ImageFieldControl: React.FC<ImageFieldControlProps> = ({
  label,
  value,
  disabled = false,
  highlighted = false,
  onChange,
  compact = false,
}) => {
  const { project, lang, addAsset, showToast } = useEditorStore();
  const t = getTranslator(lang);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        addAsset({
          name: file.name,
          url: dataUrl,
          tags: [lang === 'fa' ? 'آپلود' : 'upload'],
          kind: 'uploaded',
        });
        onChange(dataUrl);
        showToast(t('toastImageUploaded'), 'success');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      className={`space-y-2 rounded-xl border p-2 transition-all ${
        highlighted
          ? 'border-[#F26A1B] bg-[#F26A1B]/10 ring-2 ring-[#F26A1B]/50'
          : 'border-slate-200 dark:border-slate-700/70 bg-slate-50/70 dark:bg-[#0B1F3D]/60'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </span>
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-slate-400 hover:text-red-400"
            aria-label="Clear image"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`${
            compact ? 'h-10 w-12' : 'h-12 w-16'
          } shrink-0 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-[#071429] flex items-center justify-center`}
        >
          {value ? (
            <img
              src={value}
              alt={label}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageOff className="h-4 w-4 text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <input
            type="text"
            dir="ltr"
            disabled={disabled}
            value={value}
            placeholder="https://... or upload"
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2 py-1 text-[11px] font-mono outline-none focus:ring-1 focus:ring-[#F26A1B]"
          />

          <div className="flex flex-wrap items-center gap-1.5">
            <label
              className={`inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#F26A1B] px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#FF8A3D] ${
                disabled ? 'pointer-events-none opacity-40' : ''
              }`}
            >
              <Upload className="h-3 w-3" />
              <span>{t('uploadImageBtn')}</span>
              <input
                type="file"
                accept="image/*"
                disabled={disabled}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setLibraryOpen((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors ${
                libraryOpen
                  ? 'border-[#F26A1B] bg-[#F26A1B]/15 text-[#F26A1B]'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] hover:border-[#F26A1B]'
              }`}
            >
              <ImagePlus className="h-3 w-3" />
              <span>{t('chooseFromAssets')}</span>
            </button>
          </div>
        </div>
      </div>

      {libraryOpen && !disabled && (
        <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071429] p-1.5">
          {project.assets.length === 0 ? (
            <p className="py-2 text-center text-[10px] text-slate-400">{t('noAssetsYet')}</p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {project.assets.map((asset) => {
                const selected = value === asset.url;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      onChange(asset.url);
                      setLibraryOpen(false);
                    }}
                    title={asset.name}
                    className={`group relative h-12 overflow-hidden rounded border transition-all ${
                      selected
                        ? 'border-[#F26A1B] ring-2 ring-[#F26A1B]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-[#F26A1B]'
                    }`}
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                    {selected && (
                      <span className="absolute end-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F26A1B] text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
