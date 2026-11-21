import { create } from 'zustand';
import { User } from 'firebase/auth';
import { Unsubscribe } from 'firebase/firestore';
import {
  AssetItem,
  BlockAnimationProps,
  BlockInstance,
  BlockStyleProps,
  BlockType,
  CloudSyncStatus,
  DeviceMode,
  EditorThemeMode,
  GlobalThemeTokens,
  Language,
  LeftSidebarTab,
  NavMenuItem,
  NumeralMode,
  PageData,
  PageTemplate,
  ProjectData,
  RightInspectorTab,
  ToastItem,
  UploadedFont,
  VersionSnapshot,
} from '../types/editor';
import { DEFAULT_THEME, INITIAL_SEED_PROJECT } from '../data/seedSite';
import { pluginRegistry } from '../plugins/registry';
import { getTranslator } from '../i18n/translations';
import {
  applyTranslatedEntriesToProject,
  translateBlockLocally,
  translatePendingEntriesViaAI,
  translateProjectLocally,
} from '../i18n/siteContentTranslator';
import {
  auth,
  CloudProjectRecord,
  createNewProjectInFirestore,
  deleteProjectFromFirestore,
  initAuth,
  sanitizeId,
  saveFullProjectToFirestore,
  saveSnapshotToCloud,
  subscribeCloudProjects,
  subscribeProjectPages,
  subscribeProjectSnapshots,
  syncUserProfile,
} from '../firebase/firebaseClient';

const UI_PREFS_KEY = 'arsi-studio-ui-v1';
const CUSTOM_TEMPLATES_KEY = 'arsi-studio-templates-v1';
const MAX_HISTORY = 60;
const MAX_SNAPSHOTS = 30;
const CLOUD_SYNC_DEBOUNCE_MS = 500;

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function deepClone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

function loadUiPrefs(): {
  editorTheme: EditorThemeMode;
  lang: Language;
  numerals: NumeralMode;
  tourDismissed: boolean;
} {
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        editorTheme: parsed.editorTheme === 'light' ? 'light' : 'dark',
        lang: parsed.lang === 'en' ? 'en' : 'fa',
        numerals: parsed.numerals === 'en' ? 'en' : 'fa',
        tourDismissed: Boolean(parsed.tourDismissed),
      };
    }
  } catch {
    // ignore
  }
  return { editorTheme: 'dark', lang: 'fa', numerals: 'fa', tourDismissed: false };
}



function persistUiPrefs(prefs: {
  editorTheme: EditorThemeMode;
  lang: Language;
  numerals: NumeralMode;
  tourDismissed: boolean;
}): void {
  try {
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function loadCustomTemplates(): PageTemplate[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function persistCustomTemplates(templates: PageTemplate[]): void {
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
  } catch {
    // ignore
  }
}

export async function registerUploadedFontInBrowser(font: UploadedFont): Promise<void> {
  try {
    const face = new FontFace(font.family, `url(${font.dataUrl})`, {
      weight: font.weight || '400',
      style: 'normal',
      display: 'swap',
    });
    const loaded = await face.load();
    document.fonts.add(loaded);
  } catch (err) {
    console.warn('Could not register font via FontFace API:', err);
  }
}

export interface EditorState {
  project: ProjectData;
  past: ProjectData[];
  future: ProjectData[];
  snapshots: VersionSnapshot[];

  activePageId: string;
  selectedBlockId: string | null;
  copiedBlock: BlockInstance | null;
  deviceMode: DeviceMode;
  previewMode: boolean;
  editorTheme: EditorThemeMode;
  lang: Language;
  numerals: NumeralMode;
  leftTab: LeftSidebarTab;
  rightTab: RightInspectorTab;
  leftSidebarOpen: boolean;
  inspectorOpen: boolean;
  inspectorEnabled: boolean;
  isMobileViewport: boolean;
  desktopLeftSidebarPref: boolean;
  sidebarsCollapsed: boolean;

  customTemplates: PageTemplate[];
  previewTemplateId: string | null;

  commandPaletteOpen: boolean;
  shortcutsModalOpen: boolean;
  exportModalOpen: boolean;
  tourStep: number | null; // 0, 1, 2 or null when dismissed
  replayAnimCounter: number;
  translatingLanguage: boolean;
  toasts: ToastItem[];
  blockSearchFocusTick: number;
  focusedInspectorTarget: {
    blockId: string;
    fieldKey?: string;
    itemIndex?: number;
    tick: number;
  } | null;

  // Actions
  setProjectName: (name: string) => void;
  undo: () => void;
  redo: () => void;
  setActivePage: (pageId: string) => void;
  selectBlock: (blockId: string | null) => void;
  activateBlockSection: (
    blockId: string,
    options?: {
      tab?: RightInspectorTab;
      fieldKey?: string;
      itemIndex?: number;
      forceOpen?: boolean;
    }
  ) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  togglePreview: () => void;
  setEditorTheme: (theme: EditorThemeMode) => void;
  setLanguage: (lang: Language) => void;
  setNumerals: (numerals: NumeralMode) => void;
  setLeftTab: (tab: LeftSidebarTab) => void;
  setRightTab: (tab: RightInspectorTab) => void;
  toggleLeftSidebar: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  toggleInspector: () => void;
  closeInspector: () => void;
  setInspectorEnabled: (enabled: boolean) => void;
  openInspectorForBlock: (blockId: string) => void;
  syncResponsiveViewport: (mobile: boolean) => void;
  toggleSidebars: () => void;
  setPreviewTemplateId: (id: string | null) => void;
  addCustomTemplate: (tpl: PageTemplate) => void;
  deleteCustomTemplate: (id: string) => void;
  applyTemplateToCurrentPage: (tpl: PageTemplate, includeTheme?: boolean) => void;
  createPageFromTemplate: (tpl: PageTemplate, includeTheme?: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setTourStep: (step: number | null) => void;
  triggerReplayAnim: () => void;
  focusBlockSearch: () => void;
  showToast: (message: string, type?: ToastItem['type'], canUndo?: boolean) => void;
  dismissToast: (id: string) => void;

  // Block operations
  addBlock: (type: BlockType, index?: number) => BlockInstance | null;
  insertCustomBlock: (block: Omit<BlockInstance, 'id'>, index?: number) => BlockInstance;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  moveBlockByDelta: (blockId: string, delta: -1 | 1) => void;
  navigateSelection: (delta: -1 | 1) => void;
  duplicateBlock: (blockId: string) => void;
  deleteBlock: (blockId: string) => void;
  copyBlock: (blockId: string) => void;
  pasteBlock: () => void;
  toggleBlockLock: (blockId: string) => void;
  toggleBlockHidden: (blockId: string) => void;
  setBlockVariant: (blockId: string, variant: 'a' | 'b') => void;
  updateBlockLabel: (blockId: string, label: string) => void;
  updateBlockContent: (blockId: string, patch: Record<string, any>) => void;
  updateBlockStyle: (blockId: string, patch: Partial<BlockStyleProps>, breakpoint?: DeviceMode) => void;
  resetBreakpointOverride: (blockId: string, breakpoint: 'tablet' | 'mobile') => void;
  updateBlockAnimation: (blockId: string, patch: Partial<BlockAnimationProps>) => void;

  // Pages & Nav Menu
  addPage: (title: string) => void;
  updatePage: (pageId: string, patch: Partial<PageData>) => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  setHomePage: (pageId: string) => void;
  addNavItem: (label: string, pageId: string) => void;
  updateNavItem: (id: string, patch: Partial<NavMenuItem>) => void;
  deleteNavItem: (id: string) => void;
  reorderNavMenu: (fromIndex: number, toIndex: number) => void;

  // Assets & Fonts & Theme
  addAsset: (asset: Omit<AssetItem, 'id' | 'createdAt'>) => void;
  deleteAsset: (id: string) => void;
  updateTheme: (patch: Partial<GlobalThemeTokens>) => void;
  resetTheme: () => void;
  addUploadedFont: (font: Omit<UploadedFont, 'id'>) => Promise<void>;
  deleteUploadedFont: (id: string) => void;

  // Connectors
  updateConnector: (connectorId: string, enabled: boolean, values: Record<string, string>) => void;

  // Cloud Firestore Sync
  authUser: User | null;
  activeProjectId: string | null;
  cloudProjects: CloudProjectRecord[];
  cloudSyncStatus: CloudSyncStatus;
  cloudLastSyncedAt: number | null;
  cloudError: string | null;

  initCloudSync: () => () => void;
  selectCloudProject: (projectId: string) => void;
  createCloudProject: (name?: string) => Promise<void>;
  deleteCloudProject: (projectId: string) => Promise<void>;
  syncNowToCloud: () => Promise<void>;

  // Snapshots & Import
  saveSnapshot: (label?: string) => void;
  restoreSnapshot: (snapshotId: string) => void;
  importProjectJson: (rawJson: string) => boolean;
}

const initialUi = loadUiPrefs();
const initialProject =
  initialUi.lang === 'en'
    ? translateProjectLocally(deepClone(INITIAL_SEED_PROJECT), 'en').project
    : deepClone(INITIAL_SEED_PROJECT);
const detectMobileViewport = (): boolean =>
  typeof window !== 'undefined' ? window.innerWidth < 1024 : false;

// Module-level Firestore subscription & debounce coordinator
let syncInitialized = false;
let currentSubscribedUid: string | null = null;
let subscribedProjectId: string | null = null;
let authUnsub: Unsubscribe | null = null;
let projectsUnsub: Unsubscribe | null = null;
let pagesUnsub: Unsubscribe | null = null;
let snapshotsUnsub: Unsubscribe | null = null;
let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let mutationSeq = 0;
let translationSeq = 0;
let dirtyLocalChanges = false;
let isFlushingToCloud = false;
let seedingInitialProject = false;
const legacyBackfillIds = new Set<string>();

function mergeCloudProjectMeta(record: CloudProjectRecord, currentProject: ProjectData): ProjectData {
  const baseTheme = deepClone(DEFAULT_THEME);
  const nextTheme: GlobalThemeTokens = {
    ...baseTheme,
    ...(record.theme || {}),
    siteMode: record.siteMode === 'light' ? 'light' : record.theme?.siteMode ?? baseTheme.siteMode,
    primary: record.primaryColor || record.theme?.primary || baseTheme.primary,
    accent: record.accentColor || record.theme?.accent || baseTheme.accent,
    headingFont: record.headingFont || record.theme?.headingFont || baseTheme.headingFont,
    bodyFont: record.bodyFont || record.theme?.bodyFont || baseTheme.bodyFont,
  };

  return {
    projectName: record.projectName || currentProject.projectName || INITIAL_SEED_PROJECT.projectName,
    pages: currentProject.pages,
    navMenu: Array.isArray(record.navMenu) ? record.navMenu : deepClone(INITIAL_SEED_PROJECT.navMenu),
    theme: nextTheme,
    assets: Array.isArray(record.assets) ? record.assets : deepClone(INITIAL_SEED_PROJECT.assets),
    uploadedFonts: Array.isArray(record.uploadedFonts) ? record.uploadedFonts : [],
    connectors: record.connectors && typeof record.connectors === 'object'
      ? record.connectors
      : deepClone(INITIAL_SEED_PROJECT.connectors),
  };
}

export const useEditorStore = create<EditorState>((set, get) => {
  const flushProjectToCloud = async (explicitProjectId?: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.emailVerified) return;

    const seqAtStart = mutationSeq;
    const state = get();
    const targetId = explicitProjectId ?? state.activeProjectId ?? `arsi_${sanitizeId(user.uid)}`;
    isFlushingToCloud = true;
    set({ cloudSyncStatus: 'saving', cloudError: null });

    try {
      const savedId = await saveFullProjectToFirestore(state.project, user, targetId);
      if (mutationSeq === seqAtStart) {
        dirtyLocalChanges = false;
        set({
          activeProjectId: savedId,
          cloudSyncStatus: 'synced',
          cloudLastSyncedAt: Date.now(),
          cloudError: null,
        });
      } else {
        // Newer local edits occurred while flushing; persist again
        if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
        syncDebounceTimer = setTimeout(() => {
          void flushProjectToCloud(savedId);
        }, 250);
      }
    } catch (err) {
      set({
        cloudSyncStatus: 'error',
        cloudError: err instanceof Error ? err.message : 'Firestore sync failed',
      });
    } finally {
      isFlushingToCloud = false;
    }
  };

  const scheduleCloudSync = () => {
    mutationSeq += 1;
    const user = auth.currentUser;
    if (!user || !user.emailVerified) return;

    dirtyLocalChanges = true;
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(() => {
      syncDebounceTimer = null;
      void flushProjectToCloud();
    }, CLOUD_SYNC_DEBOUNCE_MS);
  };

  const attachProjectSubcollections = (user: User, projectId: string) => {
    if (subscribedProjectId === projectId && pagesUnsub && snapshotsUnsub) return;

    if (pagesUnsub) {
      pagesUnsub();
      pagesUnsub = null;
    }
    if (snapshotsUnsub) {
      snapshotsUnsub();
      snapshotsUnsub = null;
    }
    subscribedProjectId = projectId;

    pagesUnsub = subscribeProjectPages(
      user.uid,
      projectId,
      (cloudPages, hasPendingWrites) => {
        if (hasPendingWrites || dirtyLocalChanges || isFlushingToCloud) return;

        if (cloudPages.length === 0) {
          // Legacy project doc created without pages subcollection -> backfill seed/current pages once
          if (!legacyBackfillIds.has(projectId)) {
            legacyBackfillIds.add(projectId);
            void flushProjectToCloud(projectId);
          }
          return;
        }

        const state = get();
        const activeRecord = state.cloudProjects.find((p) => p.id === projectId);
        const orderIds = Array.isArray(activeRecord?.pageOrder) ? activeRecord.pageOrder : [];
        let orderedPages = cloudPages;

        if (orderIds.length > 0) {
          const byId = new Map(cloudPages.map((p) => [sanitizeId(p.id), p]));
          const arranged: PageData[] = [];
          orderIds.forEach((pid) => {
            const found = byId.get(sanitizeId(pid));
            if (found) {
              arranged.push(found);
              byId.delete(sanitizeId(pid));
            }
          });
          byId.forEach((remaining) => arranged.push(remaining));
          if (arranged.length > 0) orderedPages = arranged;
        }

        const activeStillValid = orderedPages.some((p) => p.id === state.activePageId);
        const fallbackPage = orderedPages.find((p) => p.isHome) ?? orderedPages[0];

        set((s) => ({
          project: {
            ...s.project,
            pages: orderedPages,
          },
          activePageId: activeStillValid ? s.activePageId : fallbackPage?.id ?? '',
          cloudSyncStatus: 'synced',
          cloudLastSyncedAt: Date.now(),
        }));
      },
      (err) => {
        set({
          cloudSyncStatus: 'error',
          cloudError: err instanceof Error ? err.message : 'Failed to load pages from Firestore',
        });
      }
    );

    snapshotsUnsub = subscribeProjectSnapshots(
      user.uid,
      projectId,
      (cloudSnapshots) => {
        set({ snapshots: cloudSnapshots });
      },
      (err) => {
        console.warn('Snapshots listener warning:', err);
      }
    );
  };

  const commitProject = (
    updater: (draft: ProjectData) => void,
    options?: { autoSnapshotLabel?: string }
  ) => {
    const state = get();
    const prev = state.project;
    const next = deepClone(prev);
    updater(next);
    const past = [...state.past.slice(-(MAX_HISTORY - 1)), prev];

    let snapshots = state.snapshots;
    const user = auth.currentUser;
    if (options?.autoSnapshotLabel) {
      if (user && user.emailVerified && state.activeProjectId) {
        void saveSnapshotToCloud(next, user, state.activeProjectId, options.autoSnapshotLabel).catch(
          () => undefined
        );
      } else {
        const snap: VersionSnapshot = {
          id: uid('snap'),
          timestamp: Date.now(),
          label: options.autoSnapshotLabel,
          projectData: deepClone(next),
        };
        snapshots = [snap, ...snapshots].slice(0, MAX_SNAPSHOTS);
      }
    }

    set({ project: next, past, future: [], snapshots });
    scheduleCloudSync();
  };

  const getActivePage = (project: ProjectData, pageId: string): PageData => {
    return project.pages.find((p) => p.id === pageId) ?? project.pages[0];
  };

  return {
    project: initialProject,
    past: [],
    future: [],
    snapshots: [],

    activePageId: initialProject.pages[0]?.id ?? 'page-home',
    selectedBlockId: null,
    copiedBlock: null,
    deviceMode: 'desktop',
    previewMode: false,
    editorTheme: initialUi.editorTheme,
    lang: initialUi.lang,
    numerals: initialUi.numerals,
    leftTab: 'blocks',
    rightTab: 'content',
    leftSidebarOpen: !detectMobileViewport(),
    inspectorOpen: false,
    inspectorEnabled: true,
    isMobileViewport: detectMobileViewport(),
    desktopLeftSidebarPref: true,
    sidebarsCollapsed: detectMobileViewport(),

    customTemplates: loadCustomTemplates(),
    previewTemplateId: null,

    commandPaletteOpen: false,
    shortcutsModalOpen: false,
    exportModalOpen: false,
    tourStep: initialUi.tourDismissed ? null : 0,
    replayAnimCounter: 0,
    translatingLanguage: false,
    toasts: [],
    blockSearchFocusTick: 0,
    focusedInspectorTarget: null,

    authUser: null,
    activeProjectId: null,
    cloudProjects: [],
    cloudSyncStatus: 'guest',
    cloudLastSyncedAt: null,
    cloudError: null,

    setProjectName: (name) =>
      commitProject((draft) => {
        draft.projectName = name;
      }),

    undo: () => {
      const { past, project, future, activePageId } = get();
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, -1);
      const pageExists = previous.pages.some((p) => p.id === activePageId);
      set({
        project: previous,
        past: newPast,
        future: [project, ...future].slice(0, MAX_HISTORY),
        activePageId: pageExists ? activePageId : previous.pages[0]?.id ?? '',
      });
      scheduleCloudSync();
    },

    redo: () => {
      const { past, project, future, activePageId } = get();
      if (future.length === 0) return;
      const next = future[0];
      const newFuture = future.slice(1);
      const pageExists = next.pages.some((p) => p.id === activePageId);
      set({
        project: next,
        past: [...past, project].slice(-MAX_HISTORY),
        future: newFuture,
        activePageId: pageExists ? activePageId : next.pages[0]?.id ?? '',
      });
      scheduleCloudSync();
    },

    setActivePage: (pageId) =>
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        return {
          activePageId: pageId,
          selectedBlockId: null,
          inspectorOpen: false,
          focusedInspectorTarget: null,
          leftSidebarOpen: mobile ? false : s.leftSidebarOpen,
        };
      }),

    selectBlock: (blockId) =>
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        const nextInspectorOpen =
          blockId === null
            ? false
            : mobile
            ? false
            : s.inspectorEnabled;
        return {
          selectedBlockId: blockId,
          inspectorOpen: nextInspectorOpen,
          focusedInspectorTarget: blockId === null ? null : s.focusedInspectorTarget,
          sidebarsCollapsed: !s.leftSidebarOpen && !nextInspectorOpen,
        };
      }),

    activateBlockSection: (blockId, options) =>
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        const alreadySelected = s.selectedBlockId === blockId;
        const shouldOpen = Boolean(options?.forceOpen || alreadySelected || (!mobile && s.inspectorEnabled));
        const nextTick = (s.focusedInspectorTarget?.tick ?? 0) + 1;
        return {
          selectedBlockId: blockId,
          rightTab: options?.tab ?? s.rightTab,
          inspectorEnabled: shouldOpen ? true : s.inspectorEnabled,
          inspectorOpen: shouldOpen,
          leftSidebarOpen: shouldOpen && mobile ? false : s.leftSidebarOpen,
          sidebarsCollapsed: !shouldOpen && !s.leftSidebarOpen,
          focusedInspectorTarget: options?.fieldKey
            ? {
                blockId,
                fieldKey: options.fieldKey,
                itemIndex: options.itemIndex,
                tick: nextTick,
              }
            : s.focusedInspectorTarget,
        };
      }),
    setDeviceMode: (deviceMode) => set({ deviceMode }),
    togglePreview: () => set((s) => ({ previewMode: !s.previewMode })),

    setEditorTheme: (editorTheme) => {
      const s = get();
      persistUiPrefs({
        editorTheme,
        lang: s.lang,
        numerals: s.numerals,
        tourDismissed: s.tourStep === null,
      });
      set({ editorTheme });
    },

    setLanguage: (lang) => {
      const s = get();
      const mySeq = ++translationSeq;
      const nextNumerals: NumeralMode = lang;
      const t = getTranslator(lang);

      persistUiPrefs({
        editorTheme: s.editorTheme,
        lang,
        numerals: nextNumerals,
        tourDismissed: s.tourStep === null,
      });

      const { project: localTranslated, changedCount, pendingEntries } = translateProjectLocally(
        s.project,
        lang
      );

      if (changedCount > 0) {
        const nextPast = [...s.past.slice(-(MAX_HISTORY - 1)), s.project];
        set({
          lang,
          numerals: nextNumerals,
          project: localTranslated,
          past: nextPast,
          future: [],
          translatingLanguage: pendingEntries.length > 0,
        });
        scheduleCloudSync();
      } else {
        set({
          lang,
          numerals: nextNumerals,
          translatingLanguage: pendingEntries.length > 0,
        });
      }

      if (pendingEntries.length === 0) {
        get().showToast(
          lang === 'en' ? t('toastSiteTranslatedEn') : t('toastSiteTranslatedFa'),
          'success'
        );
        return;
      }

      void translatePendingEntriesViaAI(pendingEntries, lang).then((aiRes) => {
        if (translationSeq !== mySeq) return;

        if (aiRes.ok && aiRes.translations.size > 0) {
          const latestState = get();
          const { project: fullTranslated, appliedCount } = applyTranslatedEntriesToProject(
            latestState.project,
            aiRes.translations,
            lang
          );
          if (appliedCount > 0) {
            set({
              project: fullTranslated,
              translatingLanguage: false,
            });
            scheduleCloudSync();
          } else {
            set({ translatingLanguage: false });
          }
          get().showToast(
            lang === 'en' ? t('toastSiteTranslatedEn') : t('toastSiteTranslatedFa'),
            'success'
          );
        } else {
          set({ translatingLanguage: false });
          get().showToast(
            aiRes.unavailable
              ? t('toastSitePartialTranslation')
              : lang === 'en'
              ? t('toastSiteTranslatedEn')
              : t('toastSiteTranslatedFa'),
            aiRes.unavailable ? 'info' : 'success'
          );
        }
      });
    },

    setNumerals: (numerals) => {
      const s = get();
      persistUiPrefs({
        editorTheme: s.editorTheme,
        lang: s.lang,
        numerals,
        tourDismissed: s.tourStep === null,
      });
      set({ numerals });
    },

    setLeftTab: (leftTab) =>
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        return {
          leftTab,
          leftSidebarOpen: true,
          desktopLeftSidebarPref: mobile ? s.desktopLeftSidebarPref : true,
          inspectorOpen: mobile ? false : s.inspectorOpen,
          sidebarsCollapsed: false,
        };
      }),
    setRightTab: (rightTab) =>
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        return {
          rightTab,
          inspectorEnabled: true,
          inspectorOpen: s.selectedBlockId !== null,
          leftSidebarOpen: mobile ? false : s.leftSidebarOpen,
          sidebarsCollapsed: false,
        };
      }),
    toggleLeftSidebar: () =>
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        const nextOpen = !s.leftSidebarOpen;
        const nextInspectorOpen = mobile && nextOpen ? false : s.inspectorOpen;
        return {
          leftSidebarOpen: nextOpen,
          desktopLeftSidebarPref: mobile ? s.desktopLeftSidebarPref : nextOpen,
          inspectorOpen: nextInspectorOpen,
          sidebarsCollapsed: !nextOpen && !nextInspectorOpen,
        };
      }),
    setLeftSidebarOpen: (open) =>
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        const nextInspectorOpen = mobile && open ? false : s.inspectorOpen;
        return {
          leftSidebarOpen: open,
          desktopLeftSidebarPref: mobile ? s.desktopLeftSidebarPref : open,
          inspectorOpen: nextInspectorOpen,
          sidebarsCollapsed: !open && !nextInspectorOpen,
        };
      }),
    toggleInspector: () =>
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        if (s.selectedBlockId) {
          if (s.inspectorOpen && s.inspectorEnabled) {
            return {
              inspectorOpen: false,
              inspectorEnabled: false,
              sidebarsCollapsed: !s.leftSidebarOpen,
            };
          }
          return {
            inspectorEnabled: true,
            inspectorOpen: true,
            leftSidebarOpen: mobile ? false : s.leftSidebarOpen,
            sidebarsCollapsed: false,
          };
        }
        const nextEnabled = !s.inspectorEnabled;
        return {
          inspectorEnabled: nextEnabled,
          inspectorOpen: false,
          sidebarsCollapsed: !s.leftSidebarOpen,
        };
      }),
    closeInspector: () =>
      set((s) => ({
        inspectorOpen: false,
        sidebarsCollapsed: !s.leftSidebarOpen,
      })),
    setInspectorEnabled: (enabled) =>
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        const nextOpen = enabled && s.selectedBlockId !== null && !mobile;
        return {
          inspectorEnabled: enabled,
          inspectorOpen: nextOpen,
          sidebarsCollapsed: !s.leftSidebarOpen && !nextOpen,
        };
      }),
    openInspectorForBlock: (blockId) =>
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        return {
          selectedBlockId: blockId,
          inspectorEnabled: true,
          inspectorOpen: true,
          leftSidebarOpen: mobile ? false : s.leftSidebarOpen,
          sidebarsCollapsed: false,
        };
      }),
    syncResponsiveViewport: (mobile) =>
      set((s) => {
        if (s.isMobileViewport === mobile) return {};
        if (mobile) {
          return {
            isMobileViewport: true,
            leftSidebarOpen: false,
            inspectorOpen: false,
            sidebarsCollapsed: true,
          };
        }
        const restoreLeft = s.desktopLeftSidebarPref;
        const restoreInspector = Boolean(s.selectedBlockId && s.inspectorEnabled);
        return {
          isMobileViewport: false,
          leftSidebarOpen: restoreLeft,
          inspectorOpen: restoreInspector,
          sidebarsCollapsed: !restoreLeft && !restoreInspector,
        };
      }),
    toggleSidebars: () =>
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        const anyOpen = s.leftSidebarOpen || s.inspectorOpen;
        const nextOpen = !anyOpen;
        if (mobile) {
          return {
            leftSidebarOpen: nextOpen,
            inspectorOpen: false,
            sidebarsCollapsed: !nextOpen,
          };
        }
        const nextInspector = nextOpen && s.selectedBlockId !== null && s.inspectorEnabled;
        return {
          leftSidebarOpen: nextOpen,
          desktopLeftSidebarPref: nextOpen,
          inspectorOpen: nextInspector,
          sidebarsCollapsed: !nextOpen && !nextInspector,
        };
      }),
    setPreviewTemplateId: (previewTemplateId) => set({ previewTemplateId }),
    addCustomTemplate: (tpl) =>
      set((s) => {
        const next = [tpl, ...s.customTemplates];
        persistCustomTemplates(next);
        return { customTemplates: next };
      }),
    deleteCustomTemplate: (id) =>
      set((s) => {
        const next = s.customTemplates.filter((t) => t.id !== id);
        persistCustomTemplates(next);
        return {
          customTemplates: next,
          previewTemplateId: s.previewTemplateId === id ? null : s.previewTemplateId,
        };
      }),
    applyTemplateToCurrentPage: (tpl, includeTheme = false) => {
      const state = get();
      const clonedBlocks: BlockInstance[] = deepClone(tpl.blocks).map((b) =>
        translateBlockLocally(
          {
            ...b,
            id: uid('blk'),
          },
          state.lang
        )
      );
      commitProject(
        (draft) => {
          const page = getActivePage(draft, state.activePageId);
          page.blocks = clonedBlocks;
          if (includeTheme && tpl.themePatch) {
            draft.theme = { ...draft.theme, ...tpl.themePatch };
          }
        },
        {
          autoSnapshotLabel:
            state.lang === 'en'
              ? `Applied template: ${tpl.nameEn}`
              : `اعمال تمپلیت: ${tpl.nameFa}`,
        }
      );
      const mobile = state.isMobileViewport || detectMobileViewport();
      set({
        selectedBlockId: null,
        inspectorOpen: false,
        leftSidebarOpen: mobile ? false : state.leftSidebarOpen,
        previewTemplateId: null,
      });
    },
    createPageFromTemplate: (tpl, includeTheme = false) => {
      const state = get();
      const newPageId = uid('page');
      const clonedBlocks: BlockInstance[] = deepClone(tpl.blocks).map((b) =>
        translateBlockLocally(
          {
            ...b,
            id: uid('blk'),
          },
          state.lang
        )
      );
      const title =
        state.lang === 'fa' ? tpl.nameFa.split('(')[0].trim() : tpl.nameEn.split('(')[0].trim();
      const slug = `tpl-${Date.now().toString(36).slice(-4)}`;
      commitProject(
        (draft) => {
          draft.pages.push({
            id: newPageId,
            slug,
            title: title || (state.lang === 'en' ? 'New Page' : 'صفحه جدید'),
            isHome: false,
            seo: {
              title:
                state.lang === 'en'
                  ? `${title} | Arsi Industrial Group`
                  : `${title} | گروه صنعتی آرسی`,
              description: state.lang === 'en' ? tpl.descriptionEn : tpl.descriptionFa,
              ogImage: '',
            },
            blocks: clonedBlocks,
          });
          if (includeTheme && tpl.themePatch) {
            draft.theme = { ...draft.theme, ...tpl.themePatch };
          }
        },
        {
          autoSnapshotLabel:
            state.lang === 'en'
              ? `Created page from template: ${tpl.nameEn}`
              : `ایجاد صفحه از تمپلیت: ${tpl.nameFa}`,
        }
      );
      const mobile = state.isMobileViewport || detectMobileViewport();
      set({
        activePageId: newPageId,
        selectedBlockId: null,
        inspectorOpen: false,
        leftSidebarOpen: mobile ? false : state.leftSidebarOpen,
        previewTemplateId: null,
      });
    },
    setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
    setShortcutsModalOpen: (shortcutsModalOpen) => set({ shortcutsModalOpen }),
    setExportModalOpen: (exportModalOpen) => set({ exportModalOpen }),

    setTourStep: (tourStep) => {
      const s = get();
      persistUiPrefs({
        editorTheme: s.editorTheme,
        lang: s.lang,
        numerals: s.numerals,
        tourDismissed: tourStep === null,
      });
      set({ tourStep });
    },

    triggerReplayAnim: () => set((s) => ({ replayAnimCounter: s.replayAnimCounter + 1 })),
    focusBlockSearch: () =>
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        return {
          leftTab: 'blocks',
          leftSidebarOpen: true,
          desktopLeftSidebarPref: mobile ? s.desktopLeftSidebarPref : true,
          inspectorOpen: mobile ? false : s.inspectorOpen,
          sidebarsCollapsed: false,
          blockSearchFocusTick: s.blockSearchFocusTick + 1,
        };
      }),

    showToast: (message, type = 'info', canUndo = false) => {
      const id = uid('toast');
      set((s) => ({ toasts: [...s.toasts.slice(-3), { id, message, type, canUndo }] }));
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, 4200);
    },

    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

    addBlock: (type, index) => {
      const def = pluginRegistry.getBlock(type);
      if (!def) return null;
      const currentLang = get().lang;
      const newBlock: BlockInstance = translateBlockLocally(
        {
          ...deepClone(def.createDefault()),
          id: uid('blk'),
        },
        currentLang
      );
      const activePageId = get().activePageId;
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        if (typeof index === 'number' && index >= 0 && index <= page.blocks.length) {
          page.blocks.splice(index, 0, newBlock);
        } else {
          page.blocks.push(newBlock);
        }
      });
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        return {
          selectedBlockId: newBlock.id,
          inspectorOpen: !mobile && s.inspectorEnabled,
          leftSidebarOpen: mobile ? false : s.leftSidebarOpen,
        };
      });
      return newBlock;
    },

    insertCustomBlock: (block, index) => {
      const newBlock: BlockInstance = {
        ...deepClone(block),
        id: uid('blk'),
      };
      const activePageId = get().activePageId;
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        if (typeof index === 'number' && index >= 0 && index <= page.blocks.length) {
          page.blocks.splice(index, 0, newBlock);
        } else {
          page.blocks.push(newBlock);
        }
      });
      set((s) => {
        const mobile = s.isMobileViewport || detectMobileViewport();
        return {
          selectedBlockId: newBlock.id,
          inspectorOpen: !mobile && s.inspectorEnabled,
          leftSidebarOpen: mobile ? false : s.leftSidebarOpen,
        };
      });
      return newBlock;
    },

    reorderBlocks: (fromIndex, toIndex) => {
      if (fromIndex === toIndex) return;
      const activePageId = get().activePageId;
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= page.blocks.length ||
          toIndex >= page.blocks.length
        ) {
          return;
        }
        const [moved] = page.blocks.splice(fromIndex, 1);
        page.blocks.splice(toIndex, 0, moved);
      });
    },

    moveBlockByDelta: (blockId, delta) => {
      const activePageId = get().activePageId;
      const page = getActivePage(get().project, activePageId);
      const idx = page.blocks.findIndex((b) => b.id === blockId);
      if (idx === -1) return;
      const target = idx + delta;
      if (target < 0 || target >= page.blocks.length) return;
      get().reorderBlocks(idx, target);
    },

    navigateSelection: (delta) => {
      const { project, activePageId, selectedBlockId } = get();
      const page = getActivePage(project, activePageId);
      if (!page.blocks.length) return;
      if (!selectedBlockId) {
        set({ selectedBlockId: page.blocks[0].id });
        return;
      }
      const idx = page.blocks.findIndex((b) => b.id === selectedBlockId);
      if (idx === -1) {
        set({ selectedBlockId: page.blocks[0].id });
        return;
      }
      const nextIdx = Math.max(0, Math.min(page.blocks.length - 1, idx + delta));
      set({ selectedBlockId: page.blocks[nextIdx].id });
    },

    duplicateBlock: (blockId) => {
      const { activePageId, lang } = get();
      let duplicatedId: string | null = null;
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        const idx = page.blocks.findIndex((b) => b.id === blockId);
        if (idx === -1) return;
        const clone = deepClone(page.blocks[idx]);
        clone.id = uid('blk');
        clone.label = `${clone.label} ${lang === 'en' ? '(Copy)' : '(کپی)'}`;
        clone.locked = false;
        duplicatedId = clone.id;
        page.blocks.splice(idx + 1, 0, clone);
      });
      if (duplicatedId) set({ selectedBlockId: duplicatedId });
    },

    deleteBlock: (blockId) => {
      const activePageId = get().activePageId;
      const page = getActivePage(get().project, activePageId);
      const idx = page.blocks.findIndex((b) => b.id === blockId);
      if (idx === -1) return;
      if (page.blocks[idx].locked) return;

      commitProject((draft) => {
        const p = getActivePage(draft, activePageId);
        p.blocks = p.blocks.filter((b) => b.id !== blockId);
      });
      const updatedPage = getActivePage(get().project, activePageId);
      const nextSelected = updatedPage.blocks[Math.min(idx, updatedPage.blocks.length - 1)]?.id ?? null;
      set((s) => ({
        selectedBlockId: nextSelected,
        inspectorOpen: nextSelected ? s.inspectorOpen : false,
      }));
    },

    copyBlock: (blockId) => {
      const page = getActivePage(get().project, get().activePageId);
      const found = page.blocks.find((b) => b.id === blockId);
      if (!found) return;
      set({ copiedBlock: deepClone(found) });
    },

    pasteBlock: () => {
      const { copiedBlock, activePageId, selectedBlockId } = get();
      if (!copiedBlock) return;
      const clone: BlockInstance = { ...deepClone(copiedBlock), id: uid('blk'), locked: false };
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        const idx = selectedBlockId ? page.blocks.findIndex((b) => b.id === selectedBlockId) : -1;
        if (idx >= 0) {
          page.blocks.splice(idx + 1, 0, clone);
        } else {
          page.blocks.push(clone);
        }
      });
      set({ selectedBlockId: clone.id });
    },

    toggleBlockLock: (blockId) => {
      const activePageId = get().activePageId;
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        const blk = page.blocks.find((b) => b.id === blockId);
        if (blk) blk.locked = !blk.locked;
      });
    },

    toggleBlockHidden: (blockId) => {
      const activePageId = get().activePageId;
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        const blk = page.blocks.find((b) => b.id === blockId);
        if (blk) blk.hidden = !blk.hidden;
      });
    },

    setBlockVariant: (blockId, variant) => {
      const activePageId = get().activePageId;
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        const blk = page.blocks.find((b) => b.id === blockId);
        if (blk && !blk.locked) blk.variant = variant;
      });
    },

    updateBlockLabel: (blockId, label) => {
      const activePageId = get().activePageId;
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        const blk = page.blocks.find((b) => b.id === blockId);
        if (blk) blk.label = label;
      });
    },

    updateBlockContent: (blockId, patch) => {
      const activePageId = get().activePageId;
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        const blk = page.blocks.find((b) => b.id === blockId);
        if (blk && !blk.locked) {
          blk.content = { ...blk.content, ...patch };
        }
      });
    },

    updateBlockStyle: (blockId, patch, breakpoint = 'desktop') => {
      const activePageId = get().activePageId;
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        const blk = page.blocks.find((b) => b.id === blockId);
        if (!blk || blk.locked) return;
        if (breakpoint === 'desktop') {
          blk.style = { ...blk.style, ...patch };
        } else {
          blk.responsiveOverrides = blk.responsiveOverrides ?? {};
          blk.responsiveOverrides[breakpoint] = {
            ...(blk.responsiveOverrides[breakpoint] ?? {}),
            ...patch,
          };
        }
      });
    },

    resetBreakpointOverride: (blockId, breakpoint) => {
      const activePageId = get().activePageId;
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        const blk = page.blocks.find((b) => b.id === blockId);
        if (blk?.responsiveOverrides) {
          delete blk.responsiveOverrides[breakpoint];
        }
      });
    },

    updateBlockAnimation: (blockId, patch) => {
      const activePageId = get().activePageId;
      commitProject((draft) => {
        const page = getActivePage(draft, activePageId);
        const blk = page.blocks.find((b) => b.id === blockId);
        if (blk && !blk.locked) {
          blk.animation = { ...blk.animation, ...patch };
        }
      });
    },

    addPage: (title) => {
      const newPageId = uid('page');
      const currentLang = get().lang;
      const slugBase = title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\u0600-\u06FF-]/g, '') || 'page';
      commitProject(
        (draft) => {
          const heroDef = pluginRegistry.getBlock('hero');
          const navDef = pluginRegistry.getBlock('navbar');
          const footerDef = pluginRegistry.getBlock('footer');
          const blocks: BlockInstance[] = [];
          if (navDef) {
            blocks.push(
              translateBlockLocally({ ...deepClone(navDef.createDefault()), id: uid('blk') }, currentLang)
            );
          }
          if (heroDef) {
            blocks.push(
              translateBlockLocally({ ...deepClone(heroDef.createDefault()), id: uid('blk') }, currentLang)
            );
          }
          if (footerDef) {
            blocks.push(
              translateBlockLocally(
                { ...deepClone(footerDef.createDefault()), id: uid('blk') },
                currentLang
              )
            );
          }

          draft.pages.push({
            id: newPageId,
            slug: `/${slugBase}-${draft.pages.length + 1}`,
            title,
            isHome: false,
            seo: { title, description: `${title} — ${draft.projectName}`, ogImage: '' },
            blocks,
          });
        },
        {
          autoSnapshotLabel:
            currentLang === 'en' ? `Added page: ${title}` : `افزودن صفحه: ${title}`,
        }
      );
      set((s) => ({
        activePageId: newPageId,
        selectedBlockId: null,
        inspectorOpen: false,
        leftSidebarOpen: s.isMobileViewport ? false : s.leftSidebarOpen,
      }));
    },

    updatePage: (pageId, patch) =>
      commitProject((draft) => {
        const page = draft.pages.find((p) => p.id === pageId);
        if (page) Object.assign(page, patch);
      }),

    duplicatePage: (pageId) => {
      const newId = uid('page');
      const currentLang = get().lang;
      commitProject((draft) => {
        const page = draft.pages.find((p) => p.id === pageId);
        if (!page) return;
        const copy = deepClone(page);
        copy.id = newId;
        copy.isHome = false;
        copy.title = `${page.title} ${currentLang === 'en' ? '(Copy)' : '(کپی)'}`;
        copy.slug = `${page.slug === '/' ? '/home' : page.slug}-copy`;
        copy.blocks = copy.blocks.map((b) => ({ ...b, id: uid('blk') }));
        draft.pages.push(copy);
      });
      set((s) => ({
        activePageId: newId,
        selectedBlockId: null,
        inspectorOpen: false,
        leftSidebarOpen: s.isMobileViewport ? false : s.leftSidebarOpen,
      }));
    },

    deletePage: (pageId) => {
      const state = get();
      if (state.project.pages.length <= 1) return;
      commitProject((draft) => {
        draft.pages = draft.pages.filter((p) => p.id !== pageId);
        draft.navMenu = draft.navMenu.filter((n) => n.pageId !== pageId);
        if (!draft.pages.some((p) => p.isHome) && draft.pages[0]) {
          draft.pages[0].isHome = true;
        }
      });
      if (state.activePageId === pageId) {
        const first = get().project.pages[0];
        set({ activePageId: first.id, selectedBlockId: null, inspectorOpen: false });
      }
    },

    setHomePage: (pageId) =>
      commitProject((draft) => {
        draft.pages.forEach((p) => {
          p.isHome = p.id === pageId;
        });
      }),

    addNavItem: (label, pageId) =>
      commitProject((draft) => {
        draft.navMenu.push({ id: uid('nav'), label, pageId });
      }),

    updateNavItem: (id, patch) =>
      commitProject((draft) => {
        const item = draft.navMenu.find((n) => n.id === id);
        if (item) Object.assign(item, patch);
      }),

    deleteNavItem: (id) =>
      commitProject((draft) => {
        draft.navMenu = draft.navMenu.filter((n) => n.id !== id);
      }),

    reorderNavMenu: (fromIndex, toIndex) => {
      if (fromIndex === toIndex) return;
      commitProject((draft) => {
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= draft.navMenu.length ||
          toIndex >= draft.navMenu.length
        ) {
          return;
        }
        const [moved] = draft.navMenu.splice(fromIndex, 1);
        draft.navMenu.splice(toIndex, 0, moved);
      });
    },

    addAsset: (asset) =>
      commitProject((draft) => {
        draft.assets.unshift({
          ...asset,
          id: uid('asset'),
          createdAt: Date.now(),
        });
      }),

    deleteAsset: (id) =>
      commitProject((draft) => {
        draft.assets = draft.assets.filter((a) => a.id !== id);
      }),

    updateTheme: (patch) =>
      commitProject((draft) => {
        draft.theme = { ...draft.theme, ...patch };
      }),

    resetTheme: () =>
      commitProject(
        (draft) => {
          draft.theme = deepClone(DEFAULT_THEME);
        },
        { autoSnapshotLabel: 'بازنشانی تم سراسری' }
      ),

    addUploadedFont: async (font) => {
      const fullFont: UploadedFont = { ...font, id: uid('font') };
      await registerUploadedFontInBrowser(fullFont);
      commitProject((draft) => {
        draft.uploadedFonts = [...(draft.uploadedFonts ?? []), fullFont];
        draft.theme.headingFont = fullFont.family;
        draft.theme.bodyFont = fullFont.family;
      });
    },

    deleteUploadedFont: (id) =>
      commitProject((draft) => {
        draft.uploadedFonts = (draft.uploadedFonts ?? []).filter((f) => f.id !== id);
      }),

    updateConnector: (connectorId, enabled, values) =>
      commitProject((draft) => {
        draft.connectors = {
          ...draft.connectors,
          [connectorId]: { enabled, values },
        };
      }),

    initCloudSync: () => {
      if (syncInitialized) {
        return () => {};
      }
      syncInitialized = true;

      authUnsub = initAuth(
        (user) => {
          if (!user.emailVerified) {
            set({ authUser: user, cloudSyncStatus: 'guest' });
            return;
          }

          if (currentSubscribedUid === user.uid && projectsUnsub) {
            set({ authUser: user });
            return;
          }

          currentSubscribedUid = user.uid;
          if (projectsUnsub) {
            projectsUnsub();
            projectsUnsub = null;
          }
          if (pagesUnsub) {
            pagesUnsub();
            pagesUnsub = null;
          }
          if (snapshotsUnsub) {
            snapshotsUnsub();
            snapshotsUnsub = null;
          }
          subscribedProjectId = null;
          dirtyLocalChanges = false;
          isFlushingToCloud = false;
          seedingInitialProject = false;

          set({
            authUser: user,
            cloudSyncStatus: 'loading',
            cloudError: null,
          });

          void syncUserProfile(user).catch((err) => {
            console.warn('User profile sync warning:', err);
          });

          const defaultProjectId = `arsi_${sanitizeId(user.uid)}`;

          projectsUnsub = subscribeCloudProjects(
            user.uid,
            (records, hasPendingWrites) => {
              set({ cloudProjects: records });

              if (records.length === 0) {
                if (!seedingInitialProject) {
                  seedingInitialProject = true;
                  const currentProj = get().project;
                  void saveFullProjectToFirestore(currentProj, user, defaultProjectId)
                    .then((seededId) => {
                      set({
                        activeProjectId: seededId,
                        cloudSyncStatus: 'synced',
                        cloudLastSyncedAt: Date.now(),
                        cloudError: null,
                      });
                    })
                    .catch((err) => {
                      set({
                        cloudSyncStatus: 'error',
                        cloudError: err instanceof Error ? err.message : 'Failed to initialize project in Firestore',
                      });
                    })
                    .finally(() => {
                      seedingInitialProject = false;
                    });
                }
                return;
              }

              const state = get();
              const targetId =
                (state.activeProjectId && records.some((r) => r.id === state.activeProjectId)
                  ? state.activeProjectId
                  : records.find((r) => r.id === defaultProjectId)?.id ?? records[0].id);

              const activeRecord = records.find((r) => r.id === targetId);
              if (state.activeProjectId !== targetId) {
                set({ activeProjectId: targetId });
              }

              attachProjectSubcollections(user, targetId);

              if (activeRecord && !hasPendingWrites && !dirtyLocalChanges && !isFlushingToCloud) {
                const isLegacyDocWithoutFullFields = !activeRecord.theme || !activeRecord.navMenu;
                const hydrated = mergeCloudProjectMeta(activeRecord, get().project);

                if (hydrated.uploadedFonts?.length) {
                  hydrated.uploadedFonts.forEach((f) => {
                    void registerUploadedFontInBrowser(f);
                  });
                }

                set({ project: hydrated });

                if (isLegacyDocWithoutFullFields && !legacyBackfillIds.has(targetId)) {
                  legacyBackfillIds.add(targetId);
                  void flushProjectToCloud(targetId);
                }
              }
            },
            (err) => {
              set({
                cloudSyncStatus: 'error',
                cloudError: err instanceof Error ? err.message : 'Firestore subscription failed',
              });
            }
          );
        },
        () => {
          currentSubscribedUid = null;
          subscribedProjectId = null;
          dirtyLocalChanges = false;
          isFlushingToCloud = false;
          seedingInitialProject = false;
          if (syncDebounceTimer) {
            clearTimeout(syncDebounceTimer);
            syncDebounceTimer = null;
          }
          if (projectsUnsub) {
            projectsUnsub();
            projectsUnsub = null;
          }
          if (pagesUnsub) {
            pagesUnsub();
            pagesUnsub = null;
          }
          if (snapshotsUnsub) {
            snapshotsUnsub();
            snapshotsUnsub = null;
          }
          set({
            authUser: null,
            activeProjectId: null,
            cloudProjects: [],
            cloudSyncStatus: 'guest',
            cloudLastSyncedAt: null,
            cloudError: null,
            snapshots: [],
          });
        }
      );

      return () => {
        if (authUnsub) {
          authUnsub();
          authUnsub = null;
        }
        if (projectsUnsub) {
          projectsUnsub();
          projectsUnsub = null;
        }
        if (pagesUnsub) {
          pagesUnsub();
          pagesUnsub = null;
        }
        if (snapshotsUnsub) {
          snapshotsUnsub();
          snapshotsUnsub = null;
        }
        if (syncDebounceTimer) {
          clearTimeout(syncDebounceTimer);
          syncDebounceTimer = null;
        }
        syncInitialized = false;
        currentSubscribedUid = null;
        subscribedProjectId = null;
      };
    },

    selectCloudProject: (projectId) => {
      const state = get();
      const user = auth.currentUser;
      if (!user || !user.emailVerified) return;
      if (state.activeProjectId === projectId) return;

      if (syncDebounceTimer) {
        clearTimeout(syncDebounceTimer);
        syncDebounceTimer = null;
      }
      dirtyLocalChanges = false;

      const targetRecord = state.cloudProjects.find((p) => p.id === projectId);
      const nextProject = targetRecord
        ? mergeCloudProjectMeta(targetRecord, state.project)
        : state.project;

      if (nextProject.uploadedFonts?.length) {
        nextProject.uploadedFonts.forEach((f) => void registerUploadedFontInBrowser(f));
      }

      set({
        activeProjectId: projectId,
        project: nextProject,
        past: [],
        future: [],
        selectedBlockId: null,
        inspectorOpen: false,
        cloudSyncStatus: 'loading',
        cloudError: null,
      });

      attachProjectSubcollections(user, projectId);
    },

    createCloudProject: async (name) => {
      const user = auth.currentUser;
      if (!user || !user.emailVerified) return;

      if (syncDebounceTimer) {
        clearTimeout(syncDebounceTimer);
        syncDebounceTimer = null;
      }
      dirtyLocalChanges = false;

      const state = get();
      const freshProject = deepClone(INITIAL_SEED_PROJECT);
      freshProject.projectName =
        name?.trim() ||
        (state.lang === 'fa'
          ? `پروژه جدید (${state.cloudProjects.length + 1})`
          : `New Project (${state.cloudProjects.length + 1})`);

      set({ cloudSyncStatus: 'saving', cloudError: null });
      try {
        const newId = await createNewProjectInFirestore(freshProject, user);
        set({
          activeProjectId: newId,
          project: freshProject,
          past: [],
          future: [],
          activePageId: freshProject.pages[0]?.id ?? 'page-home',
          selectedBlockId: null,
          inspectorOpen: false,
          cloudSyncStatus: 'synced',
          cloudLastSyncedAt: Date.now(),
          cloudError: null,
        });
        attachProjectSubcollections(user, newId);
      } catch (err) {
        set({
          cloudSyncStatus: 'error',
          cloudError: err instanceof Error ? err.message : 'Could not create project',
        });
      }
    },

    deleteCloudProject: async (projectId) => {
      const user = auth.currentUser;
      if (!user || !user.emailVerified) return;
      const state = get();
      if (state.cloudProjects.length <= 1) return;

      const remaining = state.cloudProjects.filter((p) => p.id !== projectId);
      if (state.activeProjectId === projectId && remaining[0]) {
        get().selectCloudProject(remaining[0].id);
      }
      await deleteProjectFromFirestore(projectId, user);
    },

    syncNowToCloud: async () => {
      if (syncDebounceTimer) {
        clearTimeout(syncDebounceTimer);
        syncDebounceTimer = null;
      }
      await flushProjectToCloud();
    },

    saveSnapshot: (label) => {
      const state = get();
      const timeStr = new Date().toLocaleTimeString(state.lang === 'fa' ? 'fa-IR' : 'en-US');
      const finalLabel =
        label ||
        (state.lang === 'en' ? `Manual Snapshot (${timeStr})` : `نسخه ذخیره دستی (${timeStr})`);
      const user = auth.currentUser;

      if (user && user.emailVerified && state.activeProjectId) {
        void saveSnapshotToCloud(state.project, user, state.activeProjectId, finalLabel).catch(
          (err) => {
            set({
              cloudSyncStatus: 'error',
              cloudError: err instanceof Error ? err.message : 'Snapshot upload failed',
            });
          }
        );
        return;
      }

      const snap: VersionSnapshot = {
        id: uid('snap'),
        timestamp: Date.now(),
        label: finalLabel,
        projectData: deepClone(state.project),
      };
      const snapshots = [snap, ...state.snapshots].slice(0, MAX_SNAPSHOTS);
      set({ snapshots });
    },

    restoreSnapshot: (snapshotId) => {
      const state = get();
      const snap = state.snapshots.find((s) => s.id === snapshotId);
      if (!snap) return;
      try {
        const parsed: ProjectData | null = snap.projectData
          ? deepClone(snap.projectData)
          : snap.projectJson
          ? (JSON.parse(snap.projectJson) as ProjectData)
          : null;
        if (!parsed || !Array.isArray(parsed.pages) || parsed.pages.length === 0) return;

        commitProject((draft) => {
          Object.assign(draft, parsed);
        });
        if (parsed.uploadedFonts?.length) {
          parsed.uploadedFonts.forEach((f) => void registerUploadedFontInBrowser(f));
        }
        const firstPage = parsed.pages[0];
        set({
          activePageId: firstPage?.id ?? '',
          selectedBlockId: null,
          inspectorOpen: false,
        });
      } catch {
        // ignore invalid snapshot
      }
    },

    importProjectJson: (rawJson) => {
      try {
        const parsed = JSON.parse(rawJson) as ProjectData;
        if (!parsed || !Array.isArray(parsed.pages) || parsed.pages.length === 0 || !parsed.theme) {
          return false;
        }
        commitProject(
          (draft) => {
            Object.assign(draft, parsed);
          },
          { autoSnapshotLabel: 'بارگذاری پروژه JSON' }
        );
        if (parsed.uploadedFonts?.length) {
          parsed.uploadedFonts.forEach((f) => void registerUploadedFontInBrowser(f));
        }
        set({
          activePageId: parsed.pages[0].id,
          selectedBlockId: null,
          inspectorOpen: false,
        });
        return true;
      } catch {
        return false;
      }
    },
  };
});
