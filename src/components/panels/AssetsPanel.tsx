import React, { useState } from 'react';
import { ImagePlus, Link2, Search, Trash2, Upload } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { getTranslator } from '../../i18n/translations';

export const AssetsPanel: React.FC = () => {
  const {
    project,
    activePageId,
    selectedBlockId,
    lang,
    addAsset,
    deleteAsset,
    updateBlockContent,
    updateBlockStyle,
    showToast,
  } = useEditorStore();
  const t = getTranslator(lang);

  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [urlInput, setUrlInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const page = project.pages.find((p) => p.id === activePageId);
  const selectedBlock = page?.blocks.find((b) => b.id === selectedBlockId);

  const allTags = Array.from(new Set(project.assets.flatMap((a) => a.tags)));

  const filteredAssets = project.assets.filter((asset) => {
    const matchesTag = activeTag === 'all' || asset.tags.includes(activeTag);
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      asset.name.toLowerCase().includes(q) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchesTag && matchesQuery;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const tags = tagsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          addAsset({
            name: file.name,
            url: reader.result,
            tags: tags.length ? tags : ['آپلود'],
            kind: 'uploaded',
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const applyAssetToBlock = (url: string) => {
    if (!selectedBlock) return;
    if ('imageUrl' in selectedBlock.content) {
      updateBlockContent(selectedBlock.id, { imageUrl: url });
      showToast(t('applyToSelected'), 'success', true);
    } else if ('logoUrl' in selectedBlock.content) {
      updateBlockContent(selectedBlock.id, { logoUrl: url });
      showToast(t('applyToSelected'), 'success', true);
    } else {
      updateBlockStyle(selectedBlock.id, { backgroundType: 'image', backgroundImage: url });
      showToast(t('applyToSelected'), 'success', true);
    }
  };

  return (
    <div className="space-y-4 p-3">
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute start-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchAssets')}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] ps-8 pe-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#F26A1B]"
        />
      </div>

      {/* Add URL or Upload */}
      <div className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-[#0B1F3D]/70 p-2.5">
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder={t('assetTags')}
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] px-2.5 py-1 text-[11px] outline-none"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!urlInput.trim()) return;
            const tags = tagsInput
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            addAsset({
              name: urlInput.split('/').pop() || 'تصویر لینک‌شده',
              url: urlInput.trim(),
              tags: tags.length ? tags : ['لینک'],
              kind: 'url',
            });
            setUrlInput('');
          }}
          className="flex gap-1.5"
        >
          <input
            type="url"
            dir="ltr"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={t('addAssetUrl')}
            className="min-w-0 flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#12284A] px-2 py-1 text-[11px] outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-[#1E4A8A] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#3366B0]"
            aria-label="Add URL"
          >
            <Link2 className="h-3.5 w-3.5" />
          </button>
        </form>

        <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#F26A1B]/60 bg-[#F26A1B]/10 px-3 py-2 text-xs font-semibold text-[#F26A1B] hover:bg-[#F26A1B]/20">
          <Upload className="h-3.5 w-3.5" />
          <span>{t('uploadAssetFile')}</span>
          <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveTag('all')}
          className={`rounded-md px-2 py-0.5 text-[11px] ${
            activeTag === 'all'
              ? 'bg-[#F26A1B] text-white'
              : 'bg-slate-200 dark:bg-[#0B1F3D] text-slate-600 dark:text-slate-300'
          }`}
        >
          {t('allTags')}
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={`rounded-md px-2 py-0.5 text-[11px] ${
              activeTag === tag
                ? 'bg-[#F26A1B] text-white'
                : 'bg-slate-200 dark:bg-[#0B1F3D] text-slate-600 dark:text-slate-300'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-[#0B1F3D]"
          >
            <img
              src={asset.url}
              alt={asset.name}
              referrerPolicy="no-referrer"
              className="h-24 w-full object-cover"
            />
            <div className="p-1.5">
              <div className="truncate text-[11px] font-medium">{asset.name}</div>
              <div className="truncate text-[10px] text-slate-400">
                {asset.tags.join(' · ')}
              </div>
            </div>
            <div className="absolute inset-x-1 top-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
              {selectedBlock && (
                <button
                  type="button"
                  onClick={() => applyAssetToBlock(asset.url)}
                  title={t('applyToSelected')}
                  className="rounded bg-[#F26A1B] px-1.5 py-1 text-[10px] font-semibold text-white shadow"
                >
                  <ImagePlus className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteAsset(asset.id)}
                className="rounded bg-black/70 p-1 text-white hover:bg-red-600"
                aria-label="Delete asset"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
