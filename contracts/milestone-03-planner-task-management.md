# Milestone 03 — Planner and Task Management

## 1. Milestone Identity
**Project:** Daily Development Tracker  
**Milestone:** 03  
**Name:** Planner and Task Management  
**Status:** APPROVED FOR IMPLEMENTATION  
**Implementation Scope:** PLANNER, CATEGORY, AND TASK MANAGEMENT, UI/UX DASHBOARD INTEGRATION, AND API ENDPOINTS ONLY.  

## 2. Milestone Objective
Establish the core productivity loop of the Daily Development Tracker. This milestone enables authenticated users to create daily planners, manage categories, and perform daily tasks. The milestone must provide full-stack integration for planners and tasks using existing database tables without disrupting the frozen foundation.

## 3. Authority and Source-of-Truth Hierarchy
1. `docs/07_Project_Constitution.md` (Highest)
2. `docs/03_Database_Design.md` & `docs/04_ERD.md` (Database Authority)
3. `docs/05_API_Specification.md` (API Authority)
4. `docs/06_UI_UX_Design_System.md` (UI/UX Authority)
5. `contracts/milestone-03-planner-task-management.md` (Implementation Specifics)

## PROJECT OWNER SEMANTICS RESOLUTION — MILESTONE 03

1. **Duplicate Completion**: `POST /api/v1/tasks/:id/complete` is idempotent. First completion returns 200 OK and creates one `TaskCompletion`. Duplicate requests return 200 OK with the existing completion data; do not create duplicate rows, do not return `DUPLICATE_COMPLETION` error.
2. **Completion Method**: The DTO must be exactly `{ "completionMethod": "APP" }`. The server validates and strictly requires `APP`. `NOTIFICATION` and `SYSTEM` are rejected.
3. **Completed At**: `completedAt` is NOT client-supplied. The server omits it on creation, relying on Prisma `@default(now())`. The database-generated value is authoritative.
4. **Task Lifecycle**: Task status values are `PLANNED`, `SKIPPED`, `CANCELLED`. Completion is represented solely by `TaskCompletion`. Skipping a task updates status to `SKIPPED` without creating a `TaskCompletion`, and is idempotent. Invalid transitions (e.g. Completed to Skipped, Cancelled to Skipped, Skipped to Completed, Cancelled to Completed) return `409 Conflict` (`INVALID_TASK_TRANSITION`).
5. **Daily Progress**: Progress is derived at read time, not persisted. Formula: `completionPercentage = Math.round((completedCount / totalTasks) * 100)`. Denominator includes `PLANNED` and `SKIPPED` active tasks (completed or not). `CANCELLED` and deleted tasks are excluded. `SKIPPED` tasks count as not done. Zero eligible tasks = 0%. No `DailyStatistics` updates.
6. **Task Reorder**: `PATCH /api/v1/tasks/reorder` requires the complete ordered list of active tasks for the planner. Positions are zero-based, contiguous integers (`0` through `N-1`). Missing tasks, extra tasks, duplicates, negative, or non-integer positions return `400 VALIDATION_ERROR`. Execution requires one Prisma transaction. No partial reorder. Optimistic UI required; rollback on failure.
7. **Planner Date**: API format `YYYY-MM-DD`. Stored as `DateTime` representing UTC midnight for that calendar date, independent of user's timezone. `GET /api/v1/planners/today` resolves today based on user's IANA timezone. Invalid dates/timezones return `400 VALIDATION_ERROR`.
8. **Planner Soft Delete**: `DELETE /api/v1/planners/:id` sets `deletedAt`. Tasks and completions remain. `POST /api/v1/planners` for a soft-deleted date restores it (`deletedAt = null`) and reuses the row instead of creating a duplicate.
9. **Scheduled Time**: API field `scheduledTime` (format `HH:mm`). Backend converts `plannerDate` + `scheduledTime` in user's timezone to UTC `scheduledAt`. DST nonexistent or ambiguous times return `400 VALIDATION_ERROR` (`INVALID_LOCAL_TIME` / `AMBIGUOUS_LOCAL_TIME`).
10. **Category Semantics**: Name must be trimmed, 1-50 chars. Must be unique per user (case-insensitive) excluding soft-deleted ones. Duplicate returns `409 Conflict` (`CATEGORY_ALREADY_EXISTS`). Color must be a valid Mission UI token. Icon is optional, mapped to Lucide icons. Deletion is soft delete.
11. **Frontend Routes**: Authenticated entry route is `/`. No dedicated browser routes for planner dates, categories, or task editing. Quick Add is embedded in the planner workspace at `/`. Category management and task editing may use embedded UI, drawers, or modals.
12. **XP UI**: XP logic is OUT OF SCOPE. XP feedback UI, static XP, and simulated XP are FORBIDDEN in Milestone 03.
13. **Quick Add**: Quick Add is explicitly required in the planner workspace. Required inline fields are activity title and time. Reminder override is OUT OF SCOPE.
14. **Optimistic Updates**: Task reorder is EXPLICITLY REQUIRED OPTIMISTIC. Task complete is PERMITTED IMPLEMENTATION DETAIL. Task create, update, delete, skip, and category operations are NOT REQUIRED to be optimistic.
15. **Migration**: No schema changes. MILESTONE 03 MUST NOT CREATE A PRISMA MIGRATION.

## 4. Repository Baseline
The implementation starts on top of the `main` branch with Milestone 01 and Milestone 02 frozen and verified. The working tree must be clean (except for this contract).

## 5. Frozen Milestone 01 and Milestone 02 Preservation
The implementation must preserve:
- Prisma schema integrity (no destruction of User, UserSettings, or existing auth tables).
- The existing authentication system (JWT, AuthContext, middleware).
- Global API response and error handling infrastructure.
- `GET /api/v1/health` and `GET /api/v1/health/ready`.
- Mission UI styles, tokens, and existing layouts.

## 6. Milestone 03 Scope
1. Shared package DTOs and Zod validation schemas for Category, Planner, Task, and TaskCompletion.
2. Backend API routes, controllers, and services for Categories, Planners, and Tasks.
3. Frontend TanStack Query integration.
4. Frontend Planner dashboard UI at `/`, Category management UI, and Quick-add activity functionality.

## 7. Explicit Out-of-Scope Work
- Recurring task generation.
- Reminder scheduling.
- Push notification delivery.
- Notification queue processing.
- Journaling.
- Mood tracking.
- Analytics engine.
- XP earning, streak calculation, or achievement evaluation.

## 8. Existing Database Schema Authority
The Prisma schema is already migrated and frozen. No Prisma redesign is permitted. The schema already includes `Planner`, `Category`, `Task`, and `TaskCompletion`.

## 9. Planner Model Contract
Fields include `id`, `userId`, `plannerDate`, `createdAt`, `updatedAt`, `deletedAt`.
Unique constraint on `userId + plannerDate`. Planner date is represented by `DateTime`.

## 10. Category Model Contract
Fields include `id`, `userId`, `name`, `color`, `icon`, `createdAt`, `updatedAt`, `deletedAt`. Users own Categories.

## 11. Task Model Contract
Fields include `id`, `plannerId`, `userId`, `categoryId`, `title`, `scheduledAt`, `priority`, `position`, `status`, `deletedAt`. Task owner must match planner owner.

## 12. TaskCompletion Source-of-Truth Contract
`TaskCompletion` is the authoritative completion source of truth. Do NOT permit implementation to add `Task.completed`, `Task.isCompleted`, or `Task.done`. `Task.status` is NOT used to indicate "completed" (enums are `PLANNED`, `SKIPPED`, `CANCELLED`).

## 13. Relevant Enum Contract
- `TaskStatus`: `PLANNED`, `SKIPPED`, `CANCELLED`
- `CompletionMethod`: `APP`, `NOTIFICATION`, `SYSTEM`
- `Priority`: `LOW`, `MEDIUM`, `HIGH`

## 14. Ownership and User Isolation
Every read and mutation MUST explicitly filter by `userId` (derived from the validated JWT token: `req.auth.userId`). Do NOT trust client-supplied `userId`. Cross-user isolation must be strictly verified.

## 15. Date and Time Contract
- Planner date is represented by `YYYY-MM-DD` on the API boundary, persisted as UTC midnight `DateTime` in PostgreSQL.
- Task local times (e.g. `07:30`) must be parsed with the user's `timezone` and planner date to calculate the absolute `scheduledAt` `DateTime`. Strict validation is required for nonexistent/ambiguous times.
- Server timezone must NEVER be assumed as the user's timezone.

## 16. Planner API Contract
- `GET /api/v1/planners/today`: Resolves today based on user timezone.
- `GET /api/v1/planners/:date`: Path param `date` is `YYYY-MM-DD`.
- `POST /api/v1/planners`: Creates planner. Restores soft-deleted planner if date already exists.
- `DELETE /api/v1/planners/:id`: Soft-deletes planner, preserving associated tasks and completions.

## 17. Category API Contract
- `GET /api/v1/categories`: Returns user active categories (excluding soft-deleted).
- `POST /api/v1/categories`: Creates category, requiring unique case-insensitive name.
- `PATCH /api/v1/categories/:id`: Updates category.
- `DELETE /api/v1/categories/:id`: Soft-deletes category.

## 18. Task API Contract
- `POST /api/v1/tasks`: Creates a task.
- `GET /api/v1/tasks/:id`: Gets a task.
- `PATCH /api/v1/tasks/:id`: Updates a task.
- `DELETE /api/v1/tasks/:id`: Soft-deletes a task.
- `POST /api/v1/tasks/:id/skip`: Marks a task as `SKIPPED`.

## 19. Task Completion API Contract
- `POST /api/v1/tasks/:id/complete`: Marks a task complete by creating a `TaskCompletion` record. Idempotent: returns existing completion on retry. Requires `completionMethod: APP`.

## 20. Task Ordering/Reordering Contract
- `PATCH /api/v1/tasks/reorder`: Updates task ordering via a full replacement list with zero-based contiguous positions.
- Requires ownership checks for all tasks in the list and execution in a single Prisma transaction.

## 21. Daily Progress Contract
- Daily completion progress (`completionPercentage`, `notDonePercentage`) must be returned in the dashboard or planner response, calculated dynamically from active Tasks and TaskCompletions at read time.

## 22. Shared DTO and Validation Contract
The `packages/shared` workspace must define request/response schemas using Zod. Node-only infrastructure (Prisma, Express) must not be shared.

## 23. Backend Module Architecture
- Group by feature area in `apps/api/src/routes` and `apps/api/src/services` (e.g., planners, tasks, categories).
- Controllers handle HTTP req/res, Services handle business logic.

## 24. Backend Validation Requirements
All API input (body, params, query) must be parsed and validated using Zod middleware before reaching business logic.

## 25. Backend Error Contract
Uses the standard error response format defined in M01 (`success`, `message`, `code`, `errors`). Common codes: `VALIDATION_ERROR`, `PLANNER_NOT_FOUND`, `TASK_NOT_FOUND`, `CATEGORY_ALREADY_EXISTS`, `INVALID_TASK_TRANSITION`.

## 26. Transaction and Data Integrity Requirements
Idempotent endpoints (completion) or bulk endpoints (reorder) must use Prisma transactions where partial failure would leave corrupted state.

## 27. Frontend Route Contract
- Authenticated entry route is `/`.
- Dashboard planner workspace is hosted at `/`.
- No new browser routes required for category management or date navigation (embedded).

## 28. Planner Workspace Contract
The Daily Planner is the primary product workflow on desktop and mobile, representing `Activity | Time | Completion`.

## 29. Date Navigation Contract
The planner must provide embedded UI to switch between dates (e.g., today, tomorrow, yesterday).

## 30. Empty State Contract
When a planner has no tasks, it should display a motivational empty state and heavily emphasize the Quick Add input.

## 31. Task Creation UX
Implement "Quick Add Activity" in the workspace: `[ What do you want to do? ] [ Time ] [ + Add ]`. Do not force a large modal for simple entry.

## 32. Task Editing UX
Edit functionality can use progressive disclosure (a modal or inline expansion) to modify title, scheduled time, priority, and category.

## 33. Task Deletion UX
Provide a clear deletion action with a confirmation prompt or immediate soft-delete.

## 34. Task Completion UX
Completion control must be easy to tap/click. Trigger checkbox motion, subtle task surface change, and progress ring update. No full-screen celebrations. No XP feedback.

## 35. Category Management UX
Simple UI to create, edit, delete categories. Colors must be selected from the approved Mission UI token palette (e.g., cyan, emerald, amber, rose, sky, violet).

## 36. Daily Progress UX
Show daily completion dynamically (e.g., a progress ring or progress bar) using Success/Momentum colors for completion, and Muted Amber for not-done.

## 37. Loading State Contract
Avoid layout shift. Use skeleton loaders mirroring the Task Row structure.

## 38. Error State Contract
Graceful error handling via toasts or inline alerts. Network errors should not crash the dashboard.

## 39. Optimistic Update Contract
Task reordering must use optimistic updates in TanStack Query. Task completion is a permitted implementation detail. Create/update/delete/skip optimistic updates are not required.

## 40. Mission UI Planner Requirements
Follow Mission UI tokens for typography, spacing, layered surfaces. Avoid raw generic bootstrap layouts.

## 41. Theme Requirements
Planner UI and Task Rows must properly adapt to LIGHT and DARK themes. Dark mode must feel deep and premium, not just inverted.

## 42. Responsive Requirements
Task rows must scale gracefully to mobile. Drag-and-drop must not break touch-scrolling.

## 43. Accessibility Requirements
Keyboard navigation must support tabbing through task completion controls and inputs. Focus rings must be visible.

## 44. Motion Requirements
Animations must respect `prefers-reduced-motion`. Motion should be fast, purposeful (checkboxes, progress rings), not decorative.

## 45. Dependency Rules
Use existing dependencies (TanStack Query, Axios, Lucide React). No new external UI libraries unless strictly necessary and only after explicit justification.

## 46. Environment Rules
No new environment variables are needed for M03 core behavior.

## 47. Prisma and Migration Rules
NO NEW MIGRATIONS. The current schema contains the exact Milestone 03 requirements. The contract explicitly forbids unnecessary schema redesign.

## 48. API Runtime Verification Matrix
- Verify `POST /api/v1/planners` isolates data per user.
- Verify `POST /api/v1/tasks/:id/complete` handles duplicate attempts gracefully.
- Verify `PATCH /api/v1/tasks/reorder` fails if users try to reorder someone else's task.

## 49. Database Verification Matrix
- Verify Task records contain correct UTC `scheduledAt`.
- Verify `TaskCompletion` records are inserted properly.

## 50. Frontend Runtime Verification Matrix
- Verify Planner dashboard correctly pulls and renders tasks.
- Verify Task completion produces correct UI feedback.
- Verify Category creation adds to the dropdown/select options.

## 51. Responsive Verification Matrix
- Verify Planner mobile view fits width.
- Verify Task row action buttons don't stack awkwardly on narrow screens.

## 52. Accessibility Verification Matrix
- Verify `aria-label` or accessible names for task completion toggles.
- Verify color contrast for category tags in Light and Dark mode.

## 53. Required Command Verification
- `npm run lint` MUST pass.
- `npm run typecheck` MUST pass.
- `npm run build` MUST pass.

## 54. Git Safety Audit
- No `.env` committed.
- No automatic commits or pushes during execution.

## 55. Forbidden Implementation Patterns
- Do not implement fake XP or fake streaks.
- Do not use `as any` or `@ts-ignore` to bypass type checks.
- Do not put business logic inside React components.

## 56. Completion Criteria
Milestone 03 is complete when the planner, category, and task loops are functional end-to-end, fully styled, and verified without breaking existing M01/M02 features.

## 57. Completion Report Format
The implementation agent must present a final Completion Report detailing exactly what was built, how it was verified (API, UI, Database), and confirming the integrity of the frozen foundation.

## 58. Freeze Rules
Upon successful verification and user approval, Milestone 03 will be frozen. No further changes to Planner, Task, or Category behavior will be permitted without a new contract.
