import React, { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { initializeBuiltInBlocks } from './blocks/blockDefinitions';
import { initializeBuiltInConnectors } from './plugins/connectors';
import { initializeBuiltInExporters } from './exporters/siteExporter';
import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { useEditorStore } from './store/useEditorStore';
import { getTranslator } from './i18n/translations';
import { TopBar } from './components/shell/TopBar';
import { LeftSidebar } from './components/shell/LeftSidebar';
import { EditorCanvas } from './components/canvas/EditorCanvas';
import { InspectorPanel } from './components/inspector/InspectorPanel';
import {
  CommandPaletteModal,
  ExportModal,
  OnboardingTour,
  ShortcutsModal,
  ToastStack,
} from './components/overlays/StudioModals';
import { TemplatePreviewModal } from './components/overlays/TemplatePreviewModal';
import { BlockType } from './types/editor';

// Register all built-in blocks, connectors, and exporters immediately
initializeBuiltInBlocks();
initializeBuiltInConnectors();
initializeBuiltInExporters();

function isEditableInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (target.isContentEditable) return true;
  return false;
}

export default function App() {
  const {
    project,
    activePageId,
    selectedBlockId,
    editorTheme,
    lang,
    previewMode,
    leftSidebarOpen,
    inspectorOpen,
    previewTemplateId,
    commandPaletteOpen,
    shortcutsModalOpen,
    exportModalOpen,
    undo,
    redo,
    addBlock,
    reorderBlocks,
    moveBlockByDelta,
    navigateSelection,
    duplicateBlock,
    deleteBlock,
    copyBlock,
    pasteBlock,
    selectBlock,
    saveSnapshot,
    togglePreview,
    setExportModalOpen,
    setDeviceMode,
    toggleSidebars,
    toggleLeftSidebar,
    toggleInspector,
    closeInspector,
    syncResponsiveViewport,
    setPreviewTemplateId,
    focusBlockSearch,
    setCommandPaletteOpen,
    setShortcutsModalOpen,
    showToast,
    initCloudSync,
  } = useEditorStore();

  const t = getTranslator(lang);
  const [snapTargetId, setSnapTargetId] = useState<string | null>(null);
  const [draggedPaletteType, setDraggedPaletteType] = useState<BlockType | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Sync HTML dir, lang, dark class
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.classList.toggle('dark', editorTheme === 'dark');
  }, [lang, editorTheme]);

  // Initialize Firestore real-time synchronization for authenticated user projects & pages
  useEffect(() => {
    const cleanup = initCloudSync();
    return () => cleanup();
  }, [initCloudSync]);

  // Auto-hide sidebars when resizing into mobile/tablet viewports (< 1024px)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(max-width: 1023px)');
    syncResponsiveViewport(mq.matches);
    const onChange = (e: MediaQueryListEvent) => syncResponsiveViewport(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [syncResponsiveViewport]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const inInput = isEditableInput(e.target);

      // Esc works everywhere
      if (e.key === 'Escape') {
        if (previewTemplateId) {
          setPreviewTemplateId(null);
          return;
        }
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
          return;
        }
        if (shortcutsModalOpen) {
          setShortcutsModalOpen(false);
          return;
        }
        if (exportModalOpen) {
          setExportModalOpen(false);
          return;
        }
        if (!inInput) {
          selectBlock(null);
        }
        return;
      }

      // Command palette (Ctrl/Cmd + K)
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }

      // Ignore editor-level shortcuts when typing inside inputs
      if (inInput) return;

      // ? Shortcuts modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsModalOpen(!shortcutsModalOpen);
        return;
      }

      // / focus block search
      if (e.key === '/' && !mod && !e.shiftKey) {
        e.preventDefault();
        focusBlockSearch();
        return;
      }

      // Undo / Redo
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      // Duplicate
      if (mod && e.key.toLowerCase() === 'd') {
        if (selectedBlockId) {
          e.preventDefault();
          duplicateBlock(selectedBlockId);
          showToast(t('toastBlockDuplicated'), 'success', true);
        }
        return;
      }

      // Copy / Paste
      if (mod && e.key.toLowerCase() === 'c') {
        if (selectedBlockId) {
          e.preventDefault();
          copyBlock(selectedBlockId);
          showToast(t('toastBlockCopied'), 'info');
        }
        return;
      }
      if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteBlock();
        showToast(t('toastBlockPasted'), 'success', true);
        return;
      }

      // Save Snapshot
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveSnapshot();
        showToast(t('toastSnapshotSaved'), 'success');
        return;
      }

      // Preview toggle
      if (mod && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        togglePreview();
        return;
      }

      // Export modal
      if (mod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
        return;
      }

      // Toggle sidebars (Ctrl/Cmd + \)
      if (mod && e.key === '\\') {
        e.preventDefault();
        toggleSidebars();
        return;
      }

      // Toggle Inspector panel (Ctrl/Cmd + I)
      if (mod && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        toggleInspector();
        return;
      }

      // Breakpoints Alt + 1/2/3
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setDeviceMode('desktop');
        return;
      }
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        setDeviceMode('tablet');
        return;
      }
      if (e.altKey && e.key === '3') {
        e.preventDefault();
        setDeviceMode('mobile');
        return;
      }

      // Delete selected block
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedBlockId) {
          e.preventDefault();
          deleteBlock(selectedBlockId);
          showToast(t('toastBlockDeleted'), 'info', true);
        }
        return;
      }

      // [ and ] move block up/down
      if (e.key === '[' && selectedBlockId) {
        e.preventDefault();
        moveBlockByDelta(selectedBlockId, -1);
        return;
      }
      if (e.key === ']' && selectedBlockId) {
        e.preventDefault();
        moveBlockByDelta(selectedBlockId, 1);
        return;
      }

      // Arrow keys navigate blocks
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateSelection(-1);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateSelection(1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    selectedBlockId,
    previewTemplateId,
    commandPaletteOpen,
    shortcutsModalOpen,
    exportModalOpen,
    undo,
    redo,
    duplicateBlock,
    deleteBlock,
    copyBlock,
    pasteBlock,
    selectBlock,
    saveSnapshot,
    togglePreview,
    setExportModalOpen,
    setDeviceMode,
    toggleSidebars,
    toggleInspector,
    setPreviewTemplateId,
    focusBlockSearch,
    moveBlockByDelta,
    navigateSelection,
    setCommandPaletteOpen,
    setShortcutsModalOpen,
    showToast,
    t,
  ]);

  const page = project.pages.find((p) => p.id === activePageId) ?? project.pages[0];
  const hasSelectedBlock = Boolean(page?.blocks.some((b) => b.id === selectedBlockId));

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.fromPalette && data.blockType) {
      setDraggedPaletteType(data.blockType as BlockType);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id ? String(event.over.id) : null;
    if (overId && page?.blocks.some((b) => b.id === overId)) {
      setSnapTargetId(overId);
    } else {
      setSnapTargetId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setSnapTargetId(null);
    setDraggedPaletteType(null);
    if (!over || !page) return;

    const activeData = active.data.current;
    const overId = String(over.id);

    // Case 1: Dragging new block from left Blocks Library onto Canvas
    if (activeData?.fromPalette && activeData.blockType) {
      const targetIndex = page.blocks.findIndex((b) => b.id === overId);
      addBlock(activeData.blockType as BlockType, targetIndex >= 0 ? targetIndex : undefined);
      showToast(t('toastBlockAdded'), 'success', true);
      return;
    }

    // Case 2: Reordering existing blocks on Canvas
    if (active.id !== over.id) {
      const oldIdx = page.blocks.findIndex((b) => b.id === String(active.id));
      const newIdx = page.blocks.findIndex((b) => b.id === overId);
      if (oldIdx !== -1 && newIdx !== -1) {
        reorderBlocks(oldIdx, newIdx);
      }
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 text-slate-900 dark:bg-[#0B1F3D] dark:text-slate-100">
      <TopBar />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {!previewMode && (leftSidebarOpen || (inspectorOpen && hasSelectedBlock)) && (
            <div
              onClick={() => {
                if (leftSidebarOpen) toggleLeftSidebar();
                if (inspectorOpen && hasSelectedBlock) closeInspector();
              }}
              className="fixed inset-x-0 bottom-0 top-14 z-30 bg-black/45 backdrop-blur-[1px] lg:hidden"
              aria-hidden="true"
            />
          )}
          {!previewMode && leftSidebarOpen && <LeftSidebar />}
          {!previewMode && !leftSidebarOpen && (
            <button
              type="button"
              onClick={toggleLeftSidebar}
              title={t('showToolsMenu')}
              className="absolute start-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-[#0B1F3D]/95 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-800 dark:text-white shadow-lg backdrop-blur-md hover:border-[#F26A1B] hover:text-[#F26A1B] transition-colors"
            >
              {lang === 'fa' ? (
                <PanelRightOpen className="h-4 w-4 text-[#F26A1B]" />
              ) : (
                <PanelLeftOpen className="h-4 w-4 text-[#F26A1B]" />
              )}
              <span className="hidden sm:inline">{t('showToolsMenu')}</span>
            </button>
          )}
          <EditorCanvas snapTargetId={snapTargetId} />
          {!previewMode && hasSelectedBlock && !inspectorOpen && (
            <button
              type="button"
              onClick={toggleInspector}
              title={t('showInspectorMenu')}
              className="absolute end-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-[#0B1F3D]/95 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-800 dark:text-white shadow-lg backdrop-blur-md hover:border-[#F26A1B] hover:text-[#F26A1B] transition-colors"
            >
              {lang === 'fa' ? (
                <PanelLeftOpen className="h-4 w-4 text-[#F26A1B]" />
              ) : (
                <PanelRightOpen className="h-4 w-4 text-[#F26A1B]" />
              )}
              <span className="hidden sm:inline">{t('showInspectorMenu')}</span>
            </button>
          )}
          {!previewMode && inspectorOpen && hasSelectedBlock && <InspectorPanel />}
        </div>

        <DragOverlay>
          {draggedPaletteType ? (
            <div className="rounded-xl border border-[#F26A1B] bg-[#0B1F3D]/95 px-4 py-2.5 text-xs font-bold text-white shadow-2xl">
              + {draggedPaletteType}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TemplatePreviewModal />
      <CommandPaletteModal />
      <ShortcutsModal />
      <ExportModal />
      <OnboardingTour />
      <ToastStack />
    </div>
  );
}
