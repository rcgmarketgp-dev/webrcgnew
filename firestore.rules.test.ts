// Phase 0 Adversarial Rules Specification Tests ("Dirty Dozen" Verification Matrix)
// Designed for @firebase/rules-unit-testing when running against Firestore emulator.

export interface SecurityTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expected: 'PERMISSION_DENIED';
  payload?: Record<string, unknown>;
}

export const DIRTY_DOZEN_CASES: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated read on /projects/proj-1/pages/page-home',
    collectionPath: '/projects/proj-1/pages/page-home',
    operation: 'get',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified email spoofing admin email',
    collectionPath: '/projects/proj-1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { ownerId: 'user-1', projectName: 'Spoof' },
  },
  {
    id: 3,
    name: 'ID poisoning (>128 chars or illegal characters)',
    collectionPath: '/projects/proj-1/pages/' + 'a'.repeat(140),
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Identity spoofing ownerId != request.auth.uid on page create',
    collectionPath: '/projects/proj-1/pages/page-2',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { ownerId: 'victim-uid', projectId: 'proj-1', id: 'page-2', title: 'Hijacked' },
  },
  {
    id: 5,
    name: 'Shadow field injection (isAdmin: true) on page',
    collectionPath: '/projects/proj-1/pages/page-3',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { ownerId: 'user-1', projectId: 'proj-1', id: 'page-3', isAdmin: true },
  },
  {
    id: 6,
    name: 'PII blanket read on another user profile',
    collectionPath: '/users/other-uid',
    operation: 'get',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Orphaned page under non-existent project',
    collectionPath: '/projects/missing-proj/pages/page-1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Page projectId or document id mismatch',
    collectionPath: '/projects/proj-1/pages/page-home',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { ownerId: 'user-1', projectId: 'other-proj', id: 'wrong-id', title: 'Bad' },
  },
  {
    id: 9,
    name: 'Snapshot pageTitles array overflow (>30) or wrong element type',
    collectionPath: '/projects/proj-1/snapshots/snap-3',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { ownerId: 'user-1', projectId: 'proj-1', label: 'Overflow', pageTitles: [42] },
  },
  {
    id: 10,
    name: 'Immutable ownerId / projectId / createdAt mutation on page update',
    collectionPath: '/projects/proj-1/pages/page-home',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    payload: { ownerId: 'attacker-uid' },
  },
  {
    id: 11,
    name: 'Client-forged createdAt timestamp instead of request.time',
    collectionPath: '/inquiries/inq-1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { createdAt: '2020-01-01T00:00:00Z' },
  },
  {
    id: 12,
    name: 'Terminal status bypass on archived inquiry',
    collectionPath: '/inquiries/inq-archived',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    payload: { status: 'new' },
  },
];
