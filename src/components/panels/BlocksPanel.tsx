import React, { useEffect, useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  BarChart3,
  Boxes,
  FileText,
  GripVertical,
  HelpCircle,
  Images,
  LayoutGrid,
  Mail,
  MapPin,
  Megaphone,
  MessageSquareQuote,
  PanelBottom,
  PanelTop,
  Plus,
  Search,
  Sparkles,
  Tags,
} from 'lucide-react';
import { pluginRegistry, RegisteredBlockDefinition } from '../../plugins/registry';
import { useEditorStore } from '../../store/useEditorStore';
import { getTranslator } from '../../i18n/translations';
import { BlockCategory } from '../../types/editor';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  PanelTop,
  Sparkles,
  LayoutGrid,
  Boxes,
  Images,
  MessageSquareQuote,
  Tags,
  BarChart3,
  HelpCircle,
  Mail,
  MapPin,
  Megaphone,
  FileText,
  PanelBottom,
};

interface DraggableBlockCardProps {
  def: RegisteredBlockDefinition;
  lang: 'fa' | 'en';
  onAdd: () => void;
}

const DraggableBlockCard: React.FC<DraggableBlockCardProps> = ({ def, lang, onAdd }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${def.type}`,
    data: { fromPalette: true, blockType: def.type },
  });

  const Icon = ICON_MAP[def.iconName] ?? LayoutGrid;
  const title = lang === 'fa' ? def.nameFa : def.nameEn;
  const desc = lang === 'fa' ? def.descriptionFa : def.descriptionEn;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onAdd}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAdd();
        }
      }}
      className={`group flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-[#0B1F3D]/80 p-2.5 transition-all hover:border-[#F26A1B] hover:bg-slate-50 dark:hover:bg-[#12315F]/70 ${
        isDragging ? 'opacity-50 ring-2 ring-[#F26A1B]' : ''
      }`}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#12315F]/20 dark:bg-[#1E4A8A]/40 text-[#F26A1B]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-bold truncate">{title}</span>
          <span className="flex items-center gap-0.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="h-3.5 w-3.5 text-[#F26A1B]" />
            <GripVertical className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">
          {desc}
        </p>
      </div>
    </div>
  );
};

export const BlocksPanel: React.FC = () => {
  const { lang, addBlock, showToast, blockSearchFocusTick } = useEditorStore();
  const t = getTranslator(lang);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | BlockCategory>('all');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (blockSearchFocusTick > 0) {
      searchRef.current?.focus();
    }
  }, [blockSearchFocusTick]);

  const blocks = pluginRegistry.getBlocks().filter((b) => {
    const matchCat = category === 'all' || b.category === category;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      b.nameFa.toLowerCase().includes(q) ||
      b.nameEn.toLowerCase().includes(q) ||
      b.descriptionFa.toLowerCase().includes(q) ||
      b.descriptionEn.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const categories: { id: 'all' | BlockCategory; label: string }[] = [
    { id: 'all', label: t('catAll') },
    { id: 'navigation', label: t('catNavigation') },
    { id: 'hero', label: t('catHero') },
    { id: 'content', label: t('catContent') },
    { id: 'showcase', label: t('catShowcase') },
    { id: 'conversion', label: t('catConversion') },
  ];

  return (
    <div className="space-y-3 p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute start-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchBlocks')}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] ps-8 pe-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#F26A1B]"
        />
      </div>

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

      <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('clickOrDragToAdd')}</p>

      <div className="space-y-2">
        {blocks.map((def) => (
          <DraggableBlockCard
            key={def.type}
            def={def}
            lang={lang}
            onAdd={() => {
              addBlock(def.type);
              showToast(t('toastBlockAdded'), 'success', true);
            }}
          />
        ))}
      </div>
    </div>
  );
};
