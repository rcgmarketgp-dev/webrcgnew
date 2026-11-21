# Phase 0: Security Specification — Arsi Studio (Firestore Rules TDD)

## 1. Data Invariants
1. **Default-Deny Catch-All**: Any unmatched Firestore path must deny all reads and writes.
2. **Verified Identity**: All mutations require `request.auth != null && request.auth.token.email_verified == true`.
3. **Owner Isolation & PII Protection**: `/users/{userId}` and `/inquiries/{inquiryId}` contain email PII and may only be read or written by the owning UID (`userId == request.auth.uid` or `resource.data.ownerId == request.auth.uid`).
4. **Master Gate on Subcollections**: `/projects/{projectId}/pages/{pageId}` and `/projects/{projectId}/snapshots/{snapshotId}` cannot be created, read, updated, or deleted unless the parent `/projects/{projectId}` exists and `ownerId == request.auth.uid`.
5. **Strict Key Allowlists & Immutable Ownership**: `ownerId`, `uid`, `projectId`, `id`, and `createdAt` are immutable on updates; shadow fields are rejected via `keys().hasAll(...)` + `keys().hasOnly(...)` and `affectedKeys().hasOnly(...)`.
6. **Terminal State Locking**: Once an inquiry reaches `status == 'archived'`, non-admin users cannot modify it.
7. **Server Timestamps**: `createdAt == request.time` on create and `updatedAt == request.time` on update.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated read/write** on `/projects/proj_1` or `/projects/proj_1/pages/page-home`.
2. **Unverified email write** (`email_verified: false`) even when `email == 'mas.seidgar@gmail.com'`.
3. **ID Poisoning**: Document ID > 128 chars or containing invalid characters (`../badId`) on `/projects/{id}` or `/projects/proj_1/pages/{pageId}`.
4. **Identity Spoofing**: Creating `/projects/proj_2` or `/projects/proj_1/pages/p1` with `ownerId: 'victim-uid'` instead of `request.auth.uid`.
5. **Shadow / Ghost Field Injection**: Creating `/projects/proj_3` or `/projects/proj_1/pages/p1` with extra field `isAdmin: true`.
6. **PII Blanket Read**: Listing or reading `/users/other-uid` or `/inquiries` without `ownerId == request.auth.uid`.
7. **Orphaned Subcollection Write**: Creating `/projects/nonexistent/pages/page-1` or `/projects/nonexistent/snapshots/snap_1`.
8. **Project ID / Page ID Mismatch**: Creating `/projects/proj_1/pages/page-home` with `projectId: 'proj_other'` or `id: 'other-page'`.
9. **Array Overflow**: Creating a page with `blocks` having > 120 items or snapshot `pageTitles` > 30 items or wrong first element type (`[123]`).
10. **Immutable Field Tampering**: Updating `/projects/proj_1` or `/projects/proj_1/pages/page-home` to change `ownerId`, `projectId`, `id`, or `createdAt`.
11. **Client Timestamp Forgery**: Creating `/projects/proj_1/pages/page-home` or `/inquiries/inq_1` with a past client timestamp instead of `request.time`.
12. **Terminal State Bypass**: Updating an inquiry whose `existing().status == 'archived'` back to `'new'` as a non-admin user.
