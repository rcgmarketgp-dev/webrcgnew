import React from 'react';
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
import { Copy, Eye, EyeOff, GripVertical, Lock, Trash2, Unlock } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { getTranslator } from '../../i18n/translations';
import { BlockInstance } from '../../types/editor';

interface SortableLayerRowProps {
  block: BlockInstance;
  selected: boolean;
  onSelect: () => void;
  onLock: () => void;
  onHide: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  t: (k: any) => string;
}

const SortableLayerRow: React.FC<SortableLayerRowProps> = ({
  block,
  selected,
  onSelect,
  onLock,
  onHide,
  onDuplicate,
  onDelete,
  t,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `layer-${block.id}`,
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
      onClick={onSelect}
      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-2 text-xs transition-colors ${
        selected
          ? 'border-[#F26A1B] bg-[#F26A1B]/12 text-slate-900 dark:text-white'
          : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#0B1F3D]/70 hover:bg-slate-100 dark:hover:bg-[#12315F]/60'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="cursor-grab p-0.5 text-slate-400 hover:text-slate-200"
        aria-label="Drag layer"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{block.label}</div>
        <div className="text-[10px] text-slate-400">{block.type}</div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onHide();
          }}
          title={block.hidden ? t('showLayer') : t('hideLayer')}
          className="rounded p-1 text-slate-400 hover:text-slate-200"
        >
          {block.hidden ? <EyeOff className="h-3.5 w-3.5 text-amber-400" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLock();
          }}
          title={block.locked ? t('unlockLayer') : t('lockLayer')}
          className="rounded p-1 text-slate-400 hover:text-slate-200"
        >
          {block.locked ? <Lock className="h-3.5 w-3.5 text-[#F26A1B]" /> : <Unlock className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          title={t('duplicate')}
          className="rounded p-1 text-slate-400 hover:text-slate-200"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={block.locked}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title={t('delete')}
          className="rounded p-1 text-slate-400 hover:text-red-400 disabled:opacity-30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export const LayersPanel: React.FC = () => {
  const {
    project,
    activePageId,
    selectedBlockId,
    lang,
    selectBlock,
    reorderBlocks,
    toggleBlockLock,
    toggleBlockHidden,
    duplicateBlock,
    deleteBlock,
    showToast,
  } = useEditorStore();
  const t = getTranslator(lang);

  const page = project.pages.find((p) => p.id === activePageId) ?? project.pages[0];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  if (!page || page.blocks.length === 0) {
    return <div className="p-4 text-xs text-slate-400">{t('layersEmpty')}</div>;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id).replace('layer-', '');
    const overId = String(over.id).replace('layer-', '');
    const oldIdx = page.blocks.findIndex((b) => b.id === activeId);
    const newIdx = page.blocks.findIndex((b) => b.id === overId);
    if (oldIdx !== -1 && newIdx !== -1) reorderBlocks(oldIdx, newIdx);
  };

  return (
    <div className="p-3 space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={page.blocks.map((b) => `layer-${b.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {page.blocks.map((blk) => (
            <SortableLayerRow
              key={blk.id}
              block={blk}
              selected={blk.id === selectedBlockId}
              onSelect={() => selectBlock(blk.id)}
              onLock={() => toggleBlockLock(blk.id)}
              onHide={() => toggleBlockHidden(blk.id)}
              onDuplicate={() => {
                duplicateBlock(blk.id);
                showToast(t('toastBlockDuplicated'), 'success', true);
              }}
              onDelete={() => {
                deleteBlock(blk.id);
                showToast(t('toastBlockDeleted'), 'info', true);
              }}
              t={t}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
