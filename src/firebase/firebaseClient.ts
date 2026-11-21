import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  AssetItem,
  ConnectorConfig,
  GlobalThemeTokens,
  NavMenuItem,
  PageData,
  ProjectData,
  UploadedFont,
  VersionSnapshot,
} from '../types/editor';

export const SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
  'https://www.googleapis.com/auth/gmail.addons.current.message.action',
  'https://www.googleapis.com/auth/gmail.addons.current.message.metadata',
  'https://www.googleapis.com/auth/gmail.addons.current.message.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing',
] as const;

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory OAuth access token cache only (never stored in localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Startup Firestore connection health check
async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
): Unsubscribe => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess?.(user, cachedAccessToken);
      } else if (!isSigningIn) {
        onAuthSuccess?.(user, null);
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure?.();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get OAuth access token from Google Sign-In');
    }
    cachedAccessToken = credential.accessToken;
    await syncUserProfile(result.user);
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => cachedAccessToken;

export const logout = async (): Promise<void> => {
  await auth.signOut();
  cachedAccessToken = null;
};

export function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128) || 'default-id';
}

function sanitizeHex(hex: string, fallback: string): string {
  return /^#[0-9a-fA-F]{3,8}$/.test(hex) ? hex.slice(0, 24) : fallback;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return value;
}

function compactOversizedDataUrls<T>(value: T, maxBytes = 850000): T {
  const cleaned = stripUndefinedDeep(value);
  try {
    const serialized = JSON.stringify(cleaned);
    if (new TextEncoder().encode(serialized).length <= maxBytes) {
      return cleaned;
    }
  } catch {
    return cleaned;
  }

  const shrink = (node: unknown): unknown => {
    if (typeof node === 'string') {
      if (node.startsWith('data:') && node.length > 65000) {
        return '';
      }
      return node;
    }
    if (Array.isArray(node)) {
      return node.map(shrink);
    }
    if (isPlainObject(node)) {
      const next: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node)) {
        next[k] = shrink(v);
      }
      return next;
    }
    return node;
  };

  return shrink(cleaned) as T;
}

function toEpochMs(ts: unknown): number {
  if (ts instanceof Timestamp) return ts.toMillis();
  if (typeof ts === 'object' && ts !== null && 'toMillis' in ts && typeof (ts as Timestamp).toMillis === 'function') {
    return (ts as Timestamp).toMillis();
  }
  if (typeof ts === 'number') return ts;
  return Date.now();
}

export async function syncUserProfile(user: User): Promise<void> {
  const uid = sanitizeId(user.uid);
  const path = `users/${uid}`;
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDocFromServer(ref).catch(() => null);
    const displayName = (user.displayName || 'Arsi Staff').slice(0, 120);
    const email = (user.email || 'user@example.com').slice(0, 200);
    if (snap && snap.exists()) {
      await updateDoc(ref, {
        displayName,
        email,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        uid,
        displayName,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface CloudProjectRecord {
  id: string;
  ownerId: string;
  projectName: string;
  siteMode: 'dark' | 'light';
  primaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  pageCount: number;
  blockCount: number;
  pageOrder?: string[];
  navMenu?: NavMenuItem[];
  theme?: GlobalThemeTokens;
  assets?: AssetItem[];
  uploadedFonts?: UploadedFont[];
  connectors?: Record<string, ConnectorConfig>;
  createdAt?: unknown;
  updatedAt?: unknown;
}

function buildMutableProjectPayload(project: ProjectData) {
  const totalBlocks = project.pages.reduce((acc, p) => acc + p.blocks.length, 0);
  const safePageOrder = project.pages.slice(0, 100).map((p) => sanitizeId(p.id));
  const mutable = {
    projectName: (project.projectName?.trim() || 'گروه صنعتی آرسی').slice(0, 140),
    siteMode: project.theme.siteMode === 'light' ? 'light' : 'dark',
    primaryColor: sanitizeHex(project.theme.primary, '#12315F'),
    accentColor: sanitizeHex(project.theme.accent, '#F26A1B'),
    headingFont: (project.theme.headingFont?.trim() || 'IRANYekan').slice(0, 80),
    bodyFont: (project.theme.bodyFont?.trim() || 'IRANYekan').slice(0, 80),
    pageCount: Math.max(1, Math.min(100, project.pages.length)),
    blockCount: Math.max(0, Math.min(500, totalBlocks)),
    pageOrder: safePageOrder,
    navMenu: stripUndefinedDeep(project.navMenu.slice(0, 50)),
    theme: stripUndefinedDeep(project.theme),
    assets: stripUndefinedDeep(project.assets.slice(0, 100)),
    uploadedFonts: stripUndefinedDeep((project.uploadedFonts || []).slice(0, 20)),
    connectors: stripUndefinedDeep(project.connectors || {}),
  };

  return compactOversizedDataUrls(mutable, 850000);
}

function buildMutablePagePayload(page: PageData, order: number) {
  const safeTitle = (page.title?.trim() || 'صفحه').slice(0, 140);
  const safeSlug = (page.slug?.trim() || '/').slice(0, 200);
  const mutable = {
    slug: safeSlug,
    title: safeTitle,
    isHome: Boolean(page.isHome),
    order: Math.max(0, Math.min(100, Math.trunc(order))),
    seo: {
      title: (page.seo?.title ?? safeTitle).slice(0, 200),
      description: (page.seo?.description ?? '').slice(0, 600),
      ogImage: (page.seo?.ogImage ?? '').slice(0, 400000),
    },
    blocks: stripUndefinedDeep((page.blocks || []).slice(0, 120)),
  };

  return compactOversizedDataUrls(mutable, 850000);
}

export async function saveFullProjectToFirestore(
  project: ProjectData,
  user: User,
  targetProjectId?: string
): Promise<string> {
  const ownerId = sanitizeId(user.uid);
  const projectId = sanitizeId(targetProjectId || `arsi_${ownerId}`);
  const projectPath = `projects/${projectId}`;
  const mutableProject = buildMutableProjectPayload(project);

  try {
    const projectRef = doc(db, 'projects', projectId);
    const existingSnap = await getDocFromServer(projectRef).catch(() => null);
    let hasCreatedAt = Boolean(existingSnap?.exists() && existingSnap.data()?.createdAt);

    if (!existingSnap) {
      const ownedProjectsSnap = await getDocs(
        query(collection(db, 'projects'), where('ownerId', '==', ownerId))
      ).catch(() => null);
      const matchedDoc = ownedProjectsSnap?.docs.find((d) => d.id === projectId);
      if (matchedDoc?.exists()) {
        hasCreatedAt = Boolean(matchedDoc.data()?.createdAt);
      }
    }

    if (existingSnap?.exists() || hasCreatedAt) {
      await updateDoc(projectRef, {
        ...mutableProject,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(projectRef, {
        ownerId,
        ...mutableProject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, projectPath);
  }

  // Sync /projects/{projectId}/pages/{pageId} subcollection after Master Gate document exists
  const pagesPath = `projects/${projectId}/pages`;
  try {
    const existingPagesSnap = await getDocs(
      query(collection(db, 'projects', projectId, 'pages'), where('ownerId', '==', ownerId))
    );
    const existingPageIds = new Set(existingPagesSnap.docs.map((d) => d.id));
    const currentPages = project.pages.slice(0, 100);
    const currentPageIdSet = new Set(currentPages.map((p) => sanitizeId(p.id)));

    const batch = writeBatch(db);

    currentPages.forEach((page, index) => {
      const safePageId = sanitizeId(page.id);
      const pageRef = doc(db, 'projects', projectId, 'pages', safePageId);
      const mutablePage = buildMutablePagePayload(page, index);

      if (existingPageIds.has(safePageId)) {
        batch.update(pageRef, {
          ...mutablePage,
          updatedAt: serverTimestamp(),
        });
      } else {
        batch.set(pageRef, {
          ownerId,
          projectId,
          id: safePageId,
          ...mutablePage,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });

    existingPagesSnap.docs.forEach((existingDoc) => {
      if (!currentPageIdSet.has(existingDoc.id)) {
        batch.delete(existingDoc.ref);
      }
    });

    await batch.commit();
    return projectId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pagesPath);
  }
}

export async function createNewProjectInFirestore(
  project: ProjectData,
  user: User
): Promise<string> {
  const newProjectId = sanitizeId(
    `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  );
  return saveFullProjectToFirestore(project, user, newProjectId);
}

export async function deleteProjectFromFirestore(
  projectId: string,
  user: User
): Promise<void> {
  const ownerId = sanitizeId(user.uid);
  const safeProjectId = sanitizeId(projectId);
  const projectPath = `projects/${safeProjectId}`;

  try {
    const pagesSnap = await getDocs(
      query(collection(db, 'projects', safeProjectId, 'pages'), where('ownerId', '==', ownerId))
    );
    const snapsSnap = await getDocs(
      query(collection(db, 'projects', safeProjectId, 'snapshots'), where('ownerId', '==', ownerId))
    );

    const batch = writeBatch(db);
    pagesSnap.docs.forEach((d) => batch.delete(d.ref));
    snapsSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    await deleteDoc(doc(db, 'projects', safeProjectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, projectPath);
  }
}

export async function saveSnapshotToCloud(
  project: ProjectData,
  user: User,
  targetProjectId: string,
  label: string
): Promise<string> {
  const ownerId = sanitizeId(user.uid);
  const projectId = sanitizeId(targetProjectId || `arsi_${ownerId}`);
  const snapId = sanitizeId(`snap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`);
  const snapPath = `projects/${projectId}/snapshots/${snapId}`;

  const rawState = compactOversizedDataUrls(
    {
      projectName: project.projectName,
      pages: project.pages,
      navMenu: project.navMenu,
      theme: project.theme,
      assets: project.assets,
      uploadedFonts: project.uploadedFonts || [],
      connectors: project.connectors || {},
    },
    750000
  );

  const payload: Record<string, unknown> = {
    ownerId,
    projectId,
    label: (label || 'نسخه پشتیبان').slice(0, 140),
    pageTitles: project.pages.slice(0, 30).map((p) => (p.title || 'صفحه').slice(0, 80)),
    createdAt: serverTimestamp(),
  };

  try {
    if (new TextEncoder().encode(JSON.stringify(rawState)).length <= 820000) {
      payload.snapshotState = rawState;
    }
  } catch {
    // omit oversized snapshotState if unserializable
  }

  try {
    await setDoc(doc(db, 'projects', projectId, 'snapshots', snapId), payload);
    return snapId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, snapPath);
  }
}

export async function saveProjectToCloud(
  project: ProjectData,
  user: User,
  targetProjectId?: string
): Promise<string> {
  const projectId = await saveFullProjectToFirestore(project, user, targetProjectId);
  await saveSnapshotToCloud(
    project,
    user,
    projectId,
    `همگام‌سازی ابری (${new Date().toLocaleTimeString('fa-IR')})`
  );
  return projectId;
}

export function subscribeCloudProjects(
  uid: string,
  onData: (items: CloudProjectRecord[], hasPendingWrites: boolean) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = 'projects';
  const q = query(collection(db, 'projects'), where('ownerId', '==', sanitizeId(uid)));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: CloudProjectRecord[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CloudProjectRecord, 'id'>),
        }))
        .sort((a, b) => toEpochMs(b.updatedAt) - toEpochMs(a.updatedAt));
      onData(list, snapshot.metadata.hasPendingWrites);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeProjectPages(
  uid: string,
  projectId: string,
  onPages: (pages: PageData[], hasPendingWrites: boolean) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const safeProjectId = sanitizeId(projectId);
  const path = `projects/${safeProjectId}/pages`;
  const q = query(
    collection(db, 'projects', safeProjectId, 'pages'),
    where('ownerId', '==', sanitizeId(uid))
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const mapped = snapshot.docs
        .map((d) => {
          const data = d.data() as Record<string, unknown>;
          const order = typeof data.order === 'number' ? data.order : 0;
          const page: PageData = {
            id: typeof data.id === 'string' ? data.id : d.id,
            slug: typeof data.slug === 'string' ? data.slug : '/',
            title: typeof data.title === 'string' ? data.title : 'صفحه',
            isHome: Boolean(data.isHome),
            seo: isPlainObject(data.seo)
              ? {
                  title: String(data.seo.title ?? ''),
                  description: String(data.seo.description ?? ''),
                  ogImage: String(data.seo.ogImage ?? ''),
                }
              : { title: '', description: '', ogImage: '' },
            blocks: Array.isArray(data.blocks) ? (data.blocks as PageData['blocks']) : [],
          };
          return { order, page };
        })
        .sort((a, b) => a.order - b.order)
        .map((entry) => entry.page);

      onPages(mapped, snapshot.metadata.hasPendingWrites);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeProjectSnapshots(
  uid: string,
  projectId: string,
  onSnapshots: (snapshots: VersionSnapshot[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const safeProjectId = sanitizeId(projectId);
  const path = `projects/${safeProjectId}/snapshots`;
  const q = query(
    collection(db, 'projects', safeProjectId, 'snapshots'),
    where('ownerId', '==', sanitizeId(uid)),
    limit(30)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const list: VersionSnapshot[] = snapshot.docs
        .map((d) => {
          const data = d.data() as Record<string, unknown>;
          return {
            id: d.id,
            timestamp: toEpochMs(data.createdAt),
            label: typeof data.label === 'string' ? data.label : 'نسخه ذخیره ابری',
            projectData: isPlainObject(data.snapshotState)
              ? (data.snapshotState as unknown as ProjectData)
              : undefined,
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 30);
      onSnapshots(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export interface CloudInquiryRecord {
  id: string;
  ownerId: string;
  gmailMessageId: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  status: 'new' | 'replied' | 'archived';
}

export async function saveInquiryToCloud(
  user: User,
  inquiry: Omit<CloudInquiryRecord, 'id' | 'ownerId' | 'status'>
): Promise<void> {
  const ownerId = sanitizeId(user.uid);
  const msgId = sanitizeId(inquiry.gmailMessageId);
  const inquiryId = `inq_${msgId}`.slice(0, 128);
  const path = `inquiries/${inquiryId}`;

  try {
    const ref = doc(db, 'inquiries', inquiryId);
    const snap = await getDocFromServer(ref).catch(() => null);
    if (snap && snap.exists()) {
      await updateDoc(ref, {
        snippet: (inquiry.snippet || '').slice(0, 500),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        ownerId,
        gmailMessageId: msgId,
        senderName: (inquiry.senderName || 'مخاطب').slice(0, 160),
        senderEmail: (inquiry.senderEmail || 'unknown@example.com').slice(0, 200),
        subject: (inquiry.subject || 'بدون عنوان').slice(0, 240),
        snippet: (inquiry.snippet || '').slice(0, 500),
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: 'new' | 'replied' | 'archived'
): Promise<void> {
  const safeId = sanitizeId(inquiryId);
  const path = `inquiries/${safeId}`;
  try {
    await updateDoc(doc(db, 'inquiries', safeId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeInquiries(
  uid: string,
  onData: (items: CloudInquiryRecord[]) => void
): Unsubscribe {
  const path = 'inquiries';
  const q = query(
    collection(db, 'inquiries'),
    where('ownerId', '==', sanitizeId(uid)),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const list: CloudInquiryRecord[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CloudInquiryRecord, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
