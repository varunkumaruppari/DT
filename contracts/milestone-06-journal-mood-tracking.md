# Milestone 06 — Journal, Reflection, and Mood Tracking

## 1. Milestone Identity
**Project:** Daily Development Tracker  
**Milestone:** 06  
**Name:** Journal, Reflection, and Mood Tracking  
**Status:** APPROVED FOR PRE-IMPLEMENTATION  
**Implementation Scope:** DAILY REFLECTION JOURNAL CRUD, DAILY MOOD TRACKING UPSERT, HISTORY LISTS, COMPILATION PREVIEWS, XP/ACTIVITY INTEGRATIONS, AND COMPANION DASHBOARD MODULES ONLY.

---

## 2. Frozen Baseline
Milestone 01 (Foundation), Milestone 02 (Core Data/Auth), Milestone 03 (Planner), Milestone 04 (Notifications/Push), and Milestone 05 (Analytics/Gamification) are frozen. The workspace build (`npm run typecheck`, `npm run lint`, `npm run build`, `npm run db:validate`) is fully passing. Commit `00a8157` is the authoritative baseline.

---

## 3. Authoritative Source-of-Truth Hierarchy
1. `docs/07_Project_Constitution.md` (Highest)
2. `docs/03_Database_Design.md` & `docs/04_ERD.md` (Database Schemas)
3. `docs/05_API_Specification.md` (REST Contracts)
4. `docs/06_UI_UX_Design_System.md` (Visual Standards)
5. `contracts/milestone-06-journal-mood-tracking.md` (Implementation Specifics)

---

## 4. Problem Statement
Users need a calm, reflective surface to record daily personal reflections and track their emotional consistency. While the backend Prisma schema defines `JournalEntry` and `MoodEntry` models, no services, routes, or frontend screens exist to interact with them. Additionally, the XP engine needs to award points for journal entry submissions (+20 XP), and the achievement engine must validate `FIRST_JOURNAL` unlocks upon the user's first reflection.

---

## 5. In-Scope Features
1. **Journal Entries Service & CRUD**:
   - `POST /api/v1/journal` to create a daily journal entry.
   - `GET /api/v1/journal/today` to retrieve today's reflection based on user-local time.
   - `GET /api/v1/journal` to retrieve journal history (filters: `date`, `from`, `to`).
   - `PATCH /api/v1/journal/:id` to update a reflection.
   - `DELETE /api/v1/journal/:id` to soft-delete a reflection.
2. **Mood Log upsert & endpoints**:
   - `PUT /api/v1/mood/today` to log or update the primary daily mood.
   - `GET /api/v1/mood/today` to retrieve today's logged mood.
   - `GET /api/v1/mood` to retrieve mood history.
3. **XP Ledger Integration**:
   - Award exactly **+20 XP** upon the first creation of a journal entry for a local calendar date.
4. **Achievements Engine Integration**:
   - Evaluate and unlock the `FIRST_JOURNAL` achievement on first journal entry creation.
5. **Activity Log Integration**:
   - Log `JOURNAL_WRITTEN` and `MOOD_LOGGED` consistent feed items.
6. **Frontend Experience**:
   - Premium, distraction-free "Journal & Mood" workspace featuring a comfortable typography reflection editor and a visual daily mood check-in container.

---

## 6. Explicit Out-of-Scope Features
- Multi-journaling per day (Version 1 enforces exactly one primary journal and one primary mood record per user per local date).
- Audio, image, or formatted markdown attachment uploading (Text-only reflection inputs).
- Mood-based system settings suggestions or third-party diagnostic integration.
- Direct manual adjustment of past mood notes via admin endpoints.
- Mood trends rendering inside the existing `AnalyticsWorkspace` (out-of-scope for M06 as not required by frozen `/api/v1/analytics` API schemas).

---

## 7. Existing Implementation Dependencies
- **UserSettings Timezone**: Date queries must resolve the user's calendar date boundary via their configured settings timezone.
- **Planner serial locking**: Mutating database stats relies on row-level locking of the parent planner or transaction sequence to avoid concurrent collisions.
- **Shared Validation Layer**: DTO objects must validate properties through Zod schemas compiled in the shared package.

---

## 8. Relevant Prisma Models
- `JournalEntry` (reused, write)
- `MoodEntry` (reused, write)
- `User` (reused, read)
- `UserSettings` (reused, read)
- `XPTransaction` (reused, write)
- `ActivityLog` (reused, write)
- `UserAchievement` (reused, write)

---

## 9. Relevant Prisma Enums
- `MoodValue` (`AMAZING`, `HAPPY`, `NORMAL`, `SAD`, `TIRED`)

---

## 10. Exact API Endpoint Scope
- `GET /api/v1/journal/today` -> Returns `200 OK` with today's local journal payload or `404 NOT_FOUND`.
- `GET /api/v1/journal` -> Returns `200 OK` with list of journal entries.
- `POST /api/v1/journal` -> Returns `201 Created` with created journal entry. Fails with `400` or `409 JOURNAL_ALREADY_EXISTS`.
- `PATCH /api/v1/journal/:id` -> Returns `200 OK` with updated entry. Fails with `404` or `403`.
- `DELETE /api/v1/journal/:id` -> Returns `204 No Content`. Soft-deletes row.
- `GET /api/v1/mood/today` -> Returns `200 OK` with today's mood payload or `404 NOT_FOUND`.
- `GET /api/v1/mood` -> Returns `200 OK` with list of logged moods.
- `PUT /api/v1/mood/today` -> Returns `200 OK` with upserted mood payload.

---

## 11. Request DTO Scope
- `JournalCreateRequest`:
  - `entryDate`: YYYY-MM-DD string.
  - `title`: string (optional).
  - `content`: string (non-empty).
  - `gratitude`: string (optional).
  - `lessonsLearned`: string (optional).
  - `tomorrowPlan`: string (optional).
- `JournalUpdateRequest`:
  - Fields are optional matching `JournalCreateRequest` parameters.
- `MoodUpsertRequest`:
  - `mood`: Enum (`AMAZING`, `HAPPY`, `NORMAL`, `SAD`, `TIRED`).
  - `note`: string (optional).

---

## 12. Response DTO Scope
- Standardized `ApiSuccessResponse<T>` wrappers returning typed records:
  - `JournalResponse` including `id`, `entryDate`, `title`, `content`, `gratitude`, `lessonsLearned`, `tomorrowPlan`, `createdAt`, `updatedAt`.
  - `MoodResponse` including `id`, `entryDate`, `mood`, `note`, `createdAt`, `updatedAt`.

---

## 13. Backend Service Scope
- **Journal Service**:
  - `getJournalToday(userId)`: Resolves local date and fetches entry.
  - `getJournalHistory(userId, filters)`: Lists active journals.
  - `createJournalEntry(userId, dto)`: Saves reflection, awards +20 XP, evaluates achievements, and logs activity. If a soft-deleted journal exists for that date, restores and updates it instead of duplicate error.
  - `updateJournalEntry(userId, id, dto)`: Authorizes and patches content.
  - `deleteJournalEntry(userId, id)`: Soft deletes row (`deletedAt = now()`).
- **Mood Service**:
  - `getMoodToday(userId)`: Resolves today's mood.
  - `getMoodHistory(userId, filters)`: Lists moods.
  - `upsertMoodToday(userId, dto)`: Saves/updates primary daily mood, logs activity.

---

## 14. Route/Controller Scope
- Mount `journalRouter` at `/api/v1/journal` and `moodRouter` at `/api/v1/mood`.
- Secure all endpoints with `requireAuth`.
- Wrap controller actions with express async validation.

---

## 15. Frontend Workspace Scope
- **Journal & Mood Tab**:
  - Distraction-free editing environment matching the Mission UI (curated color tokens, comfortable line heights, relaxed padding, simple checkmarks).
  - Emojis/icon-based interactive Mood check-in picker.

---

## 16. Shared Contract Scope
- Define and export validation Zod schemas and DTO TypeScript typings in `packages/shared`.

---

## 17. Timezone/Date Semantics
- Dates are converted to ISO UTC midnight (`YYYY-MM-DDT00:00:00.000Z`) on the database storage layer.
- Local time boundaries are computed based on the `timezone` property retrieved from the user's `UserSettings` record.

---

## 18. Authentication and User Isolation Requirements
- Every journal and mood query/mutation must derive user identity from `req.auth.userId`. Client-supplied `userId` parameters are strictly forbidden. Cross-user operations must return `403 FORBIDDEN`.

---

## 19. Soft-Delete Semantics
- Deleting a journal entry updates `deletedAt` to the current timestamp. Soft-deleted rows are excluded from list indexes, GET today, and history endpoints.
- Mood records do not support soft-delete; mutations are hard upserts.

---

## 20. Idempotency and Duplicate-Prevention Rules
- The idempotency key for journal completion XP is `journal-completed:<userId>:<entryDate>`. If a journal is deleted and recreated/restored, no duplicate XP is awarded.
- Standard unique indexes `@@unique([userId, entryDate])` ensure single primary daily entries.

---

## 21. Transaction and Concurrency Requirements
- Journal creation and mood upsert operations run inside atomic database transactions (`prisma.$transaction`) to guarantee consistency across stats, ledger, and logs.

---

## 22. Analytics Integration Requirements
- **NONE**: Mood trends will not leak into the existing `AnalyticsWorkspace` of Milestone 05 to maintain boundary limits.

---

## 23. XP/Streak/Achievement Integration Requirements
- Journal creation awards exactly `+20 XP` for a specific local calendar date.
- Streak calculation is unaffected by journaling or mood tracking (pauses/progress continue depending on tasks completed/skipped boundaries).
- The `FIRST_JOURNAL` achievement unlocks permanently upon the first successful journal creation transaction.

---

## 24. Activity Logging Requirements
- Logs consistency items: `JOURNAL_WRITTEN` (with metadata showing title length or date) and `MOOD_LOGGED` (with selected mood metadata).

---

## 25. Notification/Reminder Integration Requirements
- End-of-day summary notifications (M04 scope) include mood tracking and journal reminder links when active.

---

## 26. PWA/Offline Requirements
- Offline service worker caches routes cleanly; offline edits are queued locally if connection is lost.

---

## 27. Error and HTTP Status Requirements
- Invalid payloads return `400 VALIDATION_ERROR`.
- Accessing a non-existent or deleted journal returns `404 JOURNAL_NOT_FOUND` / `404 MOOD_NOT_FOUND`.
- Creating a duplicate active record returns `409 JOURNAL_ALREADY_EXISTS`.

---

## 28. Security Requirements
- Input sanitization on text areas prevents XSS injection.

---

## 29. Performance Requirements
- Text area typing does not trigger continuous network synchronizations; network saves are debounced or manually committed via "Save Journal" controls.

---

## 30. Accessibility Requirements
- All visual mood icons map to equivalent descriptive aria labels.

---

## 31. Responsive UI Requirements
- Viewports scale gracefully from narrow mobile screens (single column editor) to wider desktop environments.

---

## 32. Design System Requirements
- Matches theme palettes, font definitions, button heights, and form boundaries established in `docs/06_UI_UX_Design_System.md`.

---

## 33. Loading/Empty/Error State Requirements
- Empty state: display visual illustration "No journal entry for this date" with an active create button.

---

## 34. Verification Requirements
- Compile verification (`npm run lint`, `npm run typecheck`, `npm run build`).
- End-to-end integration harness executing direct mock requests.

---

## 35. Required Runtime Test Matrix Outline
A database-backed verification matrix testing:
- Creation of first journal awards exactly +20 XP.
- Unlocking the `FIRST_JOURNAL` achievement on first creation.
- Soft delete hides journal from history but keeps XP intact.
- Re-creating/restoring a soft-deleted journal does not award extra XP.
- Mood upsert overrides previous value for today.
- Cross-user journal reads are restricted.

---

## 36. Build Verification Requirements
Must compile cleanly under standard CI commands:
- `npm run typecheck`
- `npm run lint`
- `npm run build`

---

## 37. Git Boundary Requirements
- Application code, Prisma schemas, and migrations are unchanged.
- Clean working directory baseline commit `00a8157`.

---

## 38. Completion Criteria
- Daily reflection journal and mood endpoints are fully operational.
- Distributor UI contains high-fidelity reflection editor and mood selector.
- Integration tests confirm all ledger and achievement logic.

---

## 39. Freeze Criteria
- No test failures.
- Zero lint errors.
- Visual validation screenshots captured.

---

## 40. Cross-Document Conflict Register

| Issue | Documents | Conflict or Missing Semantic | Source-of-Truth Resolution | Owner Decision Required | Blocking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Journal Soft-Delete Restoration** | `03_Database_Design.md` vs `05_API_Specification.md` | Unique constraint on `(userId, entryDate)` causes `POST /journal` to fail if a soft-deleted entry already exists for that date. | If a soft-deleted entry exists for the requested date, the backend must restore it (`deletedAt = null`) and update the content instead of throwing a `409` conflict. | **YES** | **YES** |
| **Date Specification in Mood Logging** | `05_API_Specification.md` | `POST /journal` takes a specific body `entryDate`, whereas `PUT /mood/today` implicitly defaults to user's local "today". | Mood upsert is strictly locked to today's date in user settings timezone. No back-dated mood logs are allowed in V1. | **YES** | **YES** |

---

## 41. Owner Decisions Resolved
1. **DECISION 1 — Journal Soft-Delete Restoration**:
   - If `POST /api/v1/journal` targets a user/calendar date that already has a soft-deleted `JournalEntry`, the backend must restore and reuse that exact existing `JournalEntry` row.
   - Restoration behavior:
     - Reuse the existing `JournalEntry` ID.
     - Set `deletedAt = null`.
     - Overwrite the journal content fields using the new create request.
     - Preserve user ownership.
     - Do not create a duplicate `JournalEntry` row or modify the unique constraint.
     - Execute transactionally.
     - XP, achievement, and activity side effects must follow standard idempotency keys (`journal-completed:<userId>:<entryDate>`) to prevent duplicate XP rewards upon recreation/restoration.
2. **DECISION 2 — Mood Logging Date Boundary**:
   - Milestone 06 V1 mood mutation is strictly today-only.
   - `PUT /api/v1/mood/today` resolves "today" using `UserSettings.timezone`.
   - The client cannot supply a date.
   - Past-date and future-date mood creation or editing is not supported.
   - GET history endpoints remain read-only for historical mood data.
   - If a `MoodEntry` already exists for today's user/date, PUT updates the same row (upsert transaction).

---

## 42. Pagination and Sorting Semantics
- **Pagination**: Version 1 does not define any pagination query parameters (such as limit, offset, page, or cursor) or pagination metadata objects in the response for `GET /api/v1/journal` or `GET /api/v1/mood`. Query parameters (`date`, `from`, `to`) serve strictly as filters. Milestone 06 must not invent pagination.
- **Sorting**: Exact sorting for history lookup endpoints is not defined in the authoritative API specification. Sorting behavior is marked as `UNDEFINED` and must not be invented beyond simple default database retrieval order.
