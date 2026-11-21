import React, { useCallback, useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'motion/react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Layers,
  Lock,
  Plus,
  SlidersHorizontal,
  Trash2,
  Unlock,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { BlockInstance, LinkTarget } from '../../types/editor';
import { BlockRenderer } from '../../blocks/BlockRenderer';
import { getTranslator } from '../../i18n/translations';

interface SortableCanvasBlockProps {
  block: BlockInstance;
  index: number;
  total: number;
  selected: boolean;
  previewMode: boolean;
  onSelect: () => void;
  onNavigateLink: (link: LinkTarget) => void;
  showSnapBefore: boolean;
}

const SortableCanvasBlock: React.FC<SortableCanvasBlockProps> = ({
  block,
  index,
  total,
  selected,
  previewMode,
  onSelect,
  onNavigateLink,
  showSnapBefore,
}) => {
  const {
    project,
    deviceMode,
    numerals,
    replayAnimCounter,
    updateBlockContent,
    updateBlockStyle,
    setActivePage,
    moveBlockByDelta,
    duplicateBlock,
    toggleBlockLock,
    toggleBlockHidden,
    deleteBlock,
    openInspectorForBlock,
    activateBlockSection,
    addAsset,
    inspectorOpen,
    showToast,
    lang,
  } = useEditorStore();
  const t = getTranslator(lang);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled: previewMode || block.locked,
  });

  if (previewMode && block.hidden) return null;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  const handleQuickUploadImage = (fieldKey: string, file: File, itemIndex?: number) => {
    if (block.locked) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const dataUrl = reader.result;
      addAsset({
        name: file.name,
        url: dataUrl,
        tags: [lang === 'fa' ? 'آپلود' : 'upload'],
        kind: 'uploaded',
      });
      if (fieldKey === 'backgroundImage') {
        updateBlockStyle(block.id, { backgroundType: 'image', backgroundImage: dataUrl }, deviceMode);
        activateBlockSection(block.id, {
          tab: 'style',
          fieldKey: 'backgroundImage',
          forceOpen: inspectorOpen,
        });
      } else if (itemIndex !== undefined && Array.isArray(block.content.items)) {
        const nextItems = [...block.content.items];
        nextItems[itemIndex] = { ...nextItems[itemIndex], [fieldKey]: dataUrl };
        updateBlockContent(block.id, { items: nextItems });
        activateBlockSection(block.id, {
          tab: 'content',
          fieldKey,
          itemIndex,
          forceOpen: inspectorOpen,
        });
      } else {
        updateBlockContent(block.id, { [fieldKey]: dataUrl });
        activateBlockSection(block.id, {
          tab: 'content',
          fieldKey,
          forceOpen: inspectorOpen,
        });
      }
      showToast(t('toastImageUploaded'), 'success');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      ref={setNodeRef}
      data-block-id={block.id}
      style={style}
      onClick={(e) => {
        if (!previewMode) {
          e.stopPropagation();
          if (selected) {
            activateBlockSection(block.id, { forceOpen: true });
          } else {
            onSelect();
          }
        }
      }}
      className={`group relative transition-shadow ${
        !previewMode && selected
          ? 'ring-2 ring-[#F26A1B] ring-inset z-10'
          : !previewMode
          ? 'hover:ring-1 hover:ring-[#F26A1B]/55 hover:ring-inset'
          : ''
      }`}
    >
      {/* Snap Drop Guide Line */}
      {showSnapBefore && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-center">
          <div className="h-1 w-full bg-[#F26A1B] shadow-[0_0_12px_#F26A1B]" />
          <span className="absolute -top-3 rounded bg-[#F26A1B] px-2 py-0.5 text-[10px] font-bold text-white shadow">
            {t('dropHereGuide')}
          </span>
        </div>
      )}

      {/* Floating Action Bar for Selected Block */}
      {!previewMode && selected && (
        <div
          data-block-toolbar="true"
          onClick={(e) => e.stopPropagation()}
          className="absolute start-2 sm:start-3 top-2 z-20 flex max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-0.5 sm:gap-1 rounded-lg border border-slate-700/80 bg-[#071429]/95 px-1.5 sm:px-2 py-1 text-[11px] text-white shadow-lg backdrop-blur-md"
        >
          {!block.locked && (
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="cursor-grab p-1 text-slate-300 hover:text-[#F26A1B]"
              title="Drag to reorder"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="max-w-[84px] sm:max-w-[130px] truncate font-semibold text-[#FF8A3D] px-1">
            {block.label}
          </span>
          <div className="h-3.5 w-px bg-slate-700" />
          <button
            type="button"
            onClick={() => openInspectorForBlock(block.id)}
            title={t('openInspectorBtn')}
            aria-label={t('openInspectorBtn')}
            className={`rounded p-1 transition-colors ${
              inspectorOpen
                ? 'bg-[#F26A1B] text-white'
                : 'text-[#FF8A3D] hover:bg-[#12315F]'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => moveBlockByDelta(block.id, -1)}
            title={`${t('moveUp')} ([)`}
            className="rounded p-1 hover:bg-[#12315F] disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => moveBlockByDelta(block.id, 1)}
            title={`${t('moveDown')} (])`}
            className="rounded p-1 hover:bg-[#12315F] disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              duplicateBlock(block.id);
              showToast(t('toastBlockDuplicated'), 'success', true);
            }}
            title={`${t('duplicate')} (Ctrl+D)`}
            className="rounded p-1 hover:bg-[#12315F]"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => toggleBlockHidden(block.id)}
            title={block.hidden ? t('showLayer') : t('hideLayer')}
            className="rounded p-1 hover:bg-[#12315F]"
          >
            {block.hidden ? <EyeOff className="h-3.5 w-3.5 text-amber-400" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => toggleBlockLock(block.id)}
            title={block.locked ? t('unlockLayer') : t('lockLayer')}
            className="rounded p-1 hover:bg-[#12315F]"
          >
            {block.locked ? <Lock className="h-3.5 w-3.5 text-[#F26A1B]" /> : <Unlock className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            disabled={block.locked}
            onClick={() => {
              deleteBlock(block.id);
              showToast(t('toastBlockDeleted'), 'info', true);
            }}
            title={`${t('delete')} (Del)`}
            className="rounded p-1 hover:bg-red-600/80 disabled:opacity-30"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <BlockRenderer
        block={block}
        theme={project.theme}
        deviceMode={deviceMode}
        navMenu={project.navMenu}
        numerals={numerals}
        lang={lang}
        editable={!previewMode && !block.locked}
        isSelected={selected}
        uploadHintLabel={t('uploadImageBtn')}
        replayKey={replayAnimCounter}
        onUpdateContent={(patch) => updateBlockContent(block.id, patch)}
        onNavigatePage={(pageId) => setActivePage(pageId)}
        onNavigateLink={onNavigateLink}
        onActivateElement={(target) =>
          activateBlockSection(block.id, {
            ...target,
            forceOpen: selected || Boolean(target.forceOpen),
          })
        }
        onQuickUploadImage={handleQuickUploadImage}
      />
    </div>
  );
};

interface EditorCanvasProps {
  snapTargetId: string | null;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ snapTargetId }) => {
  const {
    project,
    activePageId,
    selectedBlockId,
    deviceMode,
    previewMode,
    lang,
    selectBlock,
    setActivePage,
    addBlock,
    setLeftTab,
    showToast,
  } = useEditorStore();
  const t = getTranslator(lang);
  const mainScrollRef = useRef<HTMLElement>(null);
  const canvasFrameRef = useRef<HTMLDivElement>(null);

  const page = project.pages.find((p) => p.id === activePageId) ?? project.pages[0];
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-dropzone' });

  const setCanvasFrameNodeRef = useCallback(
    (node: HTMLDivElement | null) => {
      canvasFrameRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

  // Detect clicks on any block's interactive content (capture-phase so stopPropagation in
  // child buttons/inputs/links/labels cannot hide the click), auto-selecting the block and
  // opening InspectorPanel when currently hidden.
  useEffect(() => {
    const frameEl = canvasFrameRef.current;
    if (!frameEl) return;

    const INTERACTIVE_CONTENT_SELECTOR =
      'a, button, input, textarea, select, label, [role="button"], [tabindex], [data-interactive-content], [contenteditable="true"], summary, details';

    const handleInteractiveContentClick = (event: MouseEvent) => {
      if (previewMode) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      // Ignore clicks inside the floating block action toolbar
      if (target.closest('[data-block-toolbar="true"]')) return;

      const blockContainer = target.closest<HTMLElement>('[data-block-id]');
      const blockId = blockContainer?.dataset.blockId;
      if (!blockId) return;

      const interactiveTarget = target.closest(INTERACTIVE_CONTENT_SELECTOR);
      if (!interactiveTarget || !blockContainer.contains(interactiveTarget)) return;

      const store = useEditorStore.getState();
      if (store.selectedBlockId !== blockId || !store.inspectorOpen || !store.inspectorEnabled) {
        store.openInspectorForBlock(blockId);
      }
    };

    frameEl.addEventListener('click', handleInteractiveContentClick, true);
    return () => {
      frameEl.removeEventListener('click', handleInteractiveContentClick, true);
    };
  }, [previewMode]);

  const frameWidth =
    deviceMode === 'desktop' ? '100%' : deviceMode === 'tablet' ? '768px' : '390px';

  const handleNavigateLink = (link: LinkTarget) => {
    if (link.kind === 'page' && link.pageId) {
      setActivePage(link.pageId);
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (link.kind === 'section' && link.blockId) {
      const targetId = `section-${link.blockId}`;
      if (link.pageId && link.pageId !== activePageId) {
        setActivePage(link.pageId);
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 90);
      } else {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    if (link.kind === 'external' && link.url === '#top') {
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main
      ref={mainScrollRef}
      onClick={() => {
        if (!previewMode) selectBlock(null);
      }}
      className={`relative flex-1 overflow-auto bg-slate-200/75 dark:bg-[#071429] ${
        deviceMode === 'mobile' ? 'p-2 sm:p-4' : 'p-2 sm:p-4 md:p-6'
      }`}
    >
      {/* Subtle architectural grid backdrop */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <motion.div
        ref={setCanvasFrameNodeRef}
        layout
        animate={{ maxWidth: frameWidth }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className={`relative mx-auto min-h-[calc(100vh-5.5rem)] sm:min-h-[calc(100vh-7.5rem)] w-full overflow-hidden rounded-xl sm:rounded-2xl border shadow-2xl transition-colors ${
          isOver
            ? 'border-[#F26A1B] ring-2 ring-[#F26A1B]/40'
            : 'border-slate-300 dark:border-slate-800'
        }`}
        style={{
          backgroundColor: project.theme.bg,
          color: project.theme.text,
        }}
      >
        {!page || page.blocks.length === 0 ? (
          <div className="flex min-h-[520px] flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#12315F]/40 text-[#F26A1B]">
              <Layers className="h-8 w-8" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-lg font-bold">{t('emptyCanvasTitle')}</h2>
              <p className="text-xs leading-relaxed opacity-75">{t('emptyCanvasDesc')}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addBlock('hero');
                  showToast(t('toastBlockAdded'), 'success', true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F26A1B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#FF8A3D]"
              >
                <Plus className="h-4 w-4" />
                <span>{t('addHeroQuick')}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLeftTab('blocks');
                }}
                className="rounded-xl border border-slate-500/40 px-4 py-2 text-xs font-semibold hover:bg-white/5"
              >
                {t('browseBlocksQuick')}
              </button>
            </div>
          </div>
        ) : (
          <SortableContext
            items={page.blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {page.blocks.map((blk, idx) => (
              <SortableCanvasBlock
                key={blk.id}
                block={blk}
                index={idx}
                total={page.blocks.length}
                selected={blk.id === selectedBlockId}
                previewMode={previewMode}
                onSelect={() => selectBlock(blk.id)}
                onNavigateLink={handleNavigateLink}
                showSnapBefore={snapTargetId === blk.id}
              />
            ))}
          </SortableContext>
        )}
      </motion.div>
    </main>
  );
};
