import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, GripVertical, Home, Plus, Trash2 } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { getTranslator } from '../../i18n/translations';
import { NavMenuItem } from '../../types/editor';
import { LinkTargetPicker } from '../inspector/LinkTargetPicker';
import { ImageFieldControl } from '../inspector/ImageFieldControl';
import { resolveNavItemLink } from '../../utils/linkResolver';

interface SortableNavRowProps {
  item: NavMenuItem;
  onUpdate: (patch: Partial<NavMenuItem>) => void;
  onDelete: () => void;
}

const SortableNavRow: React.FC<SortableNavRowProps> = ({
  item,
  onUpdate,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="space-y-1.5 rounded-lg border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-[#0B1F3D]/80 p-2"
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 text-slate-400 hover:text-slate-200"
          aria-label="Reorder menu item"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <input
          type="text"
          value={item.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="min-w-0 flex-1 rounded bg-white dark:bg-[#12284A] border border-slate-200 dark:border-slate-700/60 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-[#F26A1B]"
        />
        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-slate-400 hover:text-red-400"
          aria-label="Remove nav link"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <LinkTargetPicker
        value={resolveNavItemLink(item)}
        compact
        onChange={(nextLink) => {
          onUpdate({
            link: nextLink,
            pageId: nextLink?.kind === 'page' ? nextLink.pageId || '' : nextLink?.pageId || '',
            externalUrl: nextLink?.kind === 'external' ? nextLink.url : undefined,
          });
        }}
      />
    </div>
  );
};

export const PagesPanel: React.FC = () => {
  const {
    project,
    activePageId,
    lang,
    setActivePage,
    addPage,
    updatePage,
    duplicatePage,
    deletePage,
    setHomePage,
    addNavItem,
    updateNavItem,
    deleteNavItem,
    reorderNavMenu,
  } = useEditorStore();
  const t = getTranslator(lang);

  const [newPageTitle, setNewPageTitle] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const activePage = project.pages.find((p) => p.id === activePageId) ?? project.pages[0];

  const handleNavDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = project.navMenu.findIndex((i) => i.id === active.id);
    const newIdx = project.navMenu.findIndex((i) => i.id === over.id);
    if (oldIdx !== -1 && newIdx !== -1) reorderNavMenu(oldIdx, newIdx);
  };

  return (
    <div className="space-y-5 p-3">
      {/* Add Page */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newPageTitle.trim()) return;
          addPage(newPageTitle.trim());
          setNewPageTitle('');
        }}
        className="flex gap-1.5"
      >
        <input
          type="text"
          value={newPageTitle}
          onChange={(e) => setNewPageTitle(e.target.value)}
          placeholder={t('pageTitle')}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#F26A1B]"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg bg-[#F26A1B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#FF8A3D] whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{t('addPage')}</span>
        </button>
      </form>

      {/* Pages list */}
      <div className="space-y-1.5">
        {project.pages.map((page) => {
          const isActive = page.id === activePageId;
          return (
            <div
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={`group flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-xs transition-colors ${
                isActive
                  ? 'border-[#F26A1B] bg-[#F26A1B]/10 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-[#12315F]/60'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-semibold truncate">
                  {page.isHome && <Home className="h-3 w-3 text-[#F26A1B] shrink-0" />}
                  <span className="truncate">{page.title}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate" dir="ltr">
                  {page.slug}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!page.isHome && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHomePage(page.id);
                    }}
                    title={t('setAsHome')}
                    className="rounded p-1 text-slate-400 hover:text-[#F26A1B]"
                  >
                    <Home className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicatePage(page.id);
                  }}
                  title={t('duplicatePage')}
                  className="rounded p-1 text-slate-400 hover:text-slate-200"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {project.pages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(page.id);
                    }}
                    title={t('deletePage')}
                    className="rounded p-1 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Page Settings & SEO */}
      {activePage && (
        <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-700/70 pt-4">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('seoSettings')}</h3>
          <label className="block space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('pageTitle')}</span>
            <input
              type="text"
              value={activePage.title}
              onChange={(e) => updatePage(activePage.id, { title: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#F26A1B]"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('pageSlug')}</span>
            <input
              type="text"
              dir="ltr"
              value={activePage.slug}
              onChange={(e) => updatePage(activePage.id, { slug: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#F26A1B]"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('seoTitle')}</span>
            <input
              type="text"
              value={activePage.seo.title}
              onChange={(e) =>
                updatePage(activePage.id, { seo: { ...activePage.seo, title: e.target.value } })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#F26A1B]"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('seoDescription')}</span>
            <textarea
              rows={2}
              value={activePage.seo.description}
              onChange={(e) =>
                updatePage(activePage.id, { seo: { ...activePage.seo, description: e.target.value } })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1F3D] px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#F26A1B]"
            />
          </label>
          <ImageFieldControl
            compact
            label={t('seoOgImage')}
            value={activePage.seo.ogImage}
            onChange={(nextUrl) =>
              updatePage(activePage.id, { seo: { ...activePage.seo, ogImage: nextUrl } })
            }
          />
        </div>
      )}

      {/* Navigation Menu Editor with Drag Reordering */}
      <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-700/70 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('navMenuEditor')}</h3>
          <button
            type="button"
            onClick={() => {
              const first = project.pages[0];
              if (first) addNavItem(first.title, first.id);
            }}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-[#F26A1B] hover:bg-[#F26A1B]/10"
          >
            <Plus className="h-3 w-3" />
            <span>{t('addNavItem')}</span>
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleNavDragEnd}>
          <SortableContext
            items={project.navMenu.map((n) => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5">
              {project.navMenu.map((item) => (
                <SortableNavRow
                  key={item.id}
                  item={item}
                  onUpdate={(patch) => updateNavItem(item.id, patch)}
                  onDelete={() => deleteNavItem(item.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
