# Milestone 05 — Analytics, XP, and Gamification

## 1. Milestone Identity
**Project:** Daily Development Tracker  
**Milestone:** 05  
**Name:** Analytics, XP, and Gamification  
**Status:** APPROVED FOR PRE-IMPLEMENTATION  
**Implementation Scope:** PRODUCTIVITY ANALYTICS, DAILY STATISTICS AGGREGATION, XP GAMIFICATION, STREAK TRACKING, ACHIEVEMENTS EVALUATION, AND THE FINAL DASHBOARD INTEGRATION ONLY.  

## 2. Milestone Objective
Establish the analytical engine and gamified layer of the Daily Development Tracker. This milestone enables authenticated users to track their productivity statistics (completion vs. not-done ratios), earn XP rewards via a transaction-based system, build streaks, unlock achievements, and view their self-development summaries on the final dashboard.

## 3. Authority and Source-of-Truth Hierarchy
1. `docs/07_Project_Constitution.md` (Highest)
2. `docs/03_Database_Design.md` & `docs/04_ERD.md` (Database/Worker Authority)
3. `docs/05_API_Specification.md` (API Authority)
4. `docs/06_UI_UX_Design_System.md` (UI/UX Authority)
5. `contracts/milestone-05-analytics-gamification.md` (Implementation Specifics)

## 4. Current Frozen Baseline
Milestone 01, Milestone 02, Milestone 03, and Milestone 04 are completed, verified, and frozen. The workspace compile checks (`npm run typecheck`, `npm run lint`, `npm run build`, `npm run db:validate`) are fully passing. The application code must not be modified or deployed until this contract is approved.

## PROJECT OWNER SEMANTICS RESOLUTION — MILESTONE 05

### DECISION 1 — ZERO-TASK / REST DAYS
- A user-local calendar day with zero active planned tasks is a neutral rest day.
- A rest day does NOT increase the streak and does NOT reset the streak; it pauses and maintains streak continuity.
- Active planned tasks for streak evaluation exclude soft-deleted and `CANCELLED` tasks.
- A day containing only `SKIPPED` active tasks is NOT a rest day. `SKIPPED` tasks remain planned work and count as not completed.
- Streak evaluation must use the user's local calendar day boundaries resolved in `UserSettings.timezone`. Do not use UTC calendar boundaries.

### DECISION 2 — XP LEVEL EQUATION
- The level is derived from total XP at read time using the formula:
  `level = Math.floor(totalXP / 100) + 1`
- Level progress values are derived as:
  `xpIntoCurrentLevel = totalXP % 100`
  `xpRequiredForNextLevel = 100`
  `levelProgressPercentage = Math.round((xpIntoCurrentLevel / 100) * 100)`
- No persisted level column may be added to the Prisma schema.

### DECISION 3 — RETROACTIVE HISTORICAL RECALCULATION
- Past planner/task state changes (create, update, delete, complete, skip, planner delete/restore) must trigger a recalculation of `DailyStatistics` for the affected planner date.
- `DailyStatistics` is a persisted derived cache projection.
- After updating the affected day's statistics, the system must rebuild the user's streak projection from the affected user-local calendar date forward through the latest relevant planner date.
- Calculations must use `UserSettings.timezone` to resolve dates. Recalculation is isolated per user.

### DECISION 4 — XP IDEMPOTENCY DURING RECALCULATION
- `XPTransaction` remains append-only.
- Idempotency checks must prevent duplicate XP awards during retroactive recalculations.
- Deterministic idempotency keys:
  - Task completion: `task-completed:<taskId>` (Value: +10 XP)
  - Streak milestone: `streak-milestone:<userId>:<streakCount>` (Value: +50 XP for 7-day, +150 XP for 30-day)
  - Achievement unlock: `achievement:<userAchievementId>` (Value: Dynamic from seeded `Achievement.xpReward`)
- Duplicate checking must be done transactionally before insertion using select-for-update or unique constraints.

### DECISION 5 — ACHIEVEMENT REVOCATION
- Achievements are permanent once unlocked.
- `UserAchievement` rows are never revoked because of later task deletion, completion reversal, historical recalculation, or streak reduction.
- Achievement unlock transitions only from locked to unlocked. Unlocks must be idempotent.

## 5. Problem Statement
Users need visual feedback and rewards to stay motivated. Currently, daily completion metrics are derived at read-time, streaks are not calculated or tracked, XP and levels do not exist, and achievements cannot be unlocked. Additionally, the dashboard is a skeleton layout and lacks the final productivity analytics preview, streaks summary, and achievement highlights.

## 6. Exact Scope
- **Daily Statistics Aggregation**: Upserts a derived summary row `DailyStatistics` in the database whenever tasks/completions are created, updated, or soft-deleted, caching total tasks, completed tasks, unfinished tasks, completion percentage, and earned XP.
- **Analytics Endpoints**: Delivers daily, weekly, monthly, and yearly analytics based on real activity logs and `DailyStatistics` tables.
- **XP Gamification**: Implements a transactional, idempotent XP ledger (`XPTransaction` table) that increases user levels (every level requires a deterministic amount of XP, e.g., 100 XP per level, or progressive levels).
- **Streak Tracking**: Tracks consecutive calendar dates of task completion in `Streak` table, automatically updating streak numbers when a task is completed/snoozed/deleted in the user's timezone.
- **Achievements Evaluation**: Processes transactional achievement checks for default master codes (`FIRST_TASK`, `FIRST_PERFECT_DAY`, `STREAK_7`, `STREAK_30`, `TASKS_100`) and unlocks matching rewards.
- **Activity Logging**: Automatically writes to `ActivityLog` upon task completion, skipped tasks, achievements, and streak modifications.
- **Frontend Dashboard**: Replaces placeholder modules with the visual Daily Progress Ring, Daily Momentum Hero, Streak milestones, XP progress bar, and unlocked achievements highlights.
- **Analytics Workspace UI**: A premium screen showing productivity graphs, mood trend maps (utilizing out-of-scope mood entries when present), completion histories, and category breakdowns.

## 7. Explicit Out-of-Scope List
- Daily reflection journal and mood logging CRUD or edit forms (Milestone 06).
- Calorie tracking, sleep tracking, or generic spreadsheet integrations (Out of scope for V1).
- Direct client-facing endpoints to manually adjust XP totals or force achievements unlock (Forbidden).

## 8. Existing Implementation Assumptions
- Authenticated state resolves `req.auth.userId` securely.
- Timezone rules parse `Date` using only native `Intl` API.
- All soft-deletes preserve database records by updating `deletedAt`.

## 9. Prisma Models Involved
- `DailyStatistics`
- `Achievement`
- `UserAchievement`
- `XPTransaction`
- `Streak`
- `ActivityLog`
- `Task` (reused)
- `TaskCompletion` (reused)
- `Planner` (reused)
- `User` (reused)
- `UserSettings` (reused)

## 10. Prisma Enums Involved
- `CompletionMethod` (`APP`, `NOTIFICATION`, `SYSTEM`)
- `Theme` (`LIGHT`, `DARK`, `SYSTEM`)

## 11. Database Behavior & Concurrency Locking
- **Parent Row Lock**: To serialize task mutations and prevent concurrency races, every transaction modifying a task or completion must lock the parent `Planner` row using:
  `SELECT id FROM "Planner" WHERE id = $1 FOR UPDATE`
- **DailyStatistics Upsert**: Recalculates statistics and upserts into the `DailyStatistics` table inside the same transaction after securing the parent row lock.
- **XP Ledger uniqueness**: Insertion of `XPTransaction` checks for existing `idempotencyKey` and aborts if already present.

## 12. API Endpoints
- `GET /api/v1/analytics/daily` (Query: `date=YYYY-MM-DD`. Returns statistics summary)
- `GET /api/v1/analytics/weekly` (Query: `date=YYYY-MM-DD` (optional). Returns weekly summaries based on week-start setting)
- `GET /api/v1/analytics/monthly` (Query: `year=YYYY&month=MM`. Returns monthly progress details)
- `GET /api/v1/analytics/yearly` (Query: `year=YYYY`. Returns yearly details)
- `GET /api/v1/xp` (Returns current total XP and level details)
- `GET /api/v1/xp/history` (Query: `cursor`, `limit`. Returns transaction logs with cursor pagination)
- `GET /api/v1/streak` (Returns user streak values)
- `GET /api/v1/achievements` (Returns lock/unlock states of master achievements)
- `GET /api/v1/activity` (Query: `cursor`, `limit`, `type` (optional). Returns paginated read-only activity logs)

## 13. Request DTOs
Shared contracts in `packages/shared/src/contracts/` must validate DTO parameters:
- `AnalyticsQueryRequest` checks correct `YYYY-MM-DD` date structures or year/month integers.
- `XPQueryRequest` checks cursor and limit parameters for transaction logs.
- `ActivityQueryRequest` validates cursor, limit, and optional type filtering.

## 14. Response Behavior
All routes must return standardized success/error JSON response payloads as defined in Milestone 01.

## 15. Ownership and Isolation Rules
All services must filter queries and restrict mutations strictly using `userId` extracted from the auth JWT token. Direct cross-user access to analytics, streaks, or transaction details must return `403 Forbidden`.

## 16. Lifecycle/State-Transition Rules
- **Achievements**: Unlock events are write-once. Once a `UserAchievement` record exists, it cannot be deleted or re-unlocked.
- **XP Ledger**: Transaction records are append-only.
- **DailyStatistics**: Upserted on task mutations. Can be fully regenerated from task and completion histories.

## 17. Date and Time Semantics
- Calendar dates are formatted as `YYYY-MM-DD`.
- Timezone resolutions use the user's `timezone` string stored in `UserSettings` to align planner dates and completion timestamps into local calendar dates.

## 18. Error and Status Code Expectations
- Inconsistent query parameters (e.g. invalid dates, months, years) return `400 VALIDATION_ERROR`.
- Attempting to query another user's progress returns `403 FORBIDDEN`.
- Fetching missing items returns `404 NOT_FOUND`.

## 19. Background Processing Requirements
- Mutations trigger real-time updates. No background queue worker or scheduled job is required for core statistics, XP, streaks, or achievements calculation.

## 20. Service Worker Requirements
- None. Service Worker changes are out of scope for Milestone 05.

## 21. Security and Cryptographic Boundaries
- Master achievement definitions must be seeded on database setup and remain read-only.
- Clients must never submit self-earned XP or self-granted achievements. The server calculates and writes these securely.

## 22. Dependency Requirements
- None. Platform standard APIs and standard packages are sufficient. No new npm dependencies may be installed.

## 23. Environment Variables
- No new environment variables are required.

## 24. Explicit Forbidden Implementation Behavior
- Exposing POST/PATCH routes to directly edit the total XP or streak count in the database is forbidden.
- Fabricating static or placeholder charts instead of dynamic database-backed graphs is forbidden.
- Modifying the Journal or Mood Entry controllers/services is forbidden (Milestone 06).

## 25. Regression Requirements
- Auth verification must remain functional.
- Planner, task completion, and notification action routes must continue working without disruptions.

## 26. Verification Requirements
- Database-backed test suites must run typechecking, linting, build compilations, and verify analytics calculations, streak increments, and XP awards.

## 27. Cross-Document Conflict Register
- **Issue**: None remaining.
- **Status**: ALL RESOLVED via project owner decisions.

## 28. Owner Decisions Required
- None remaining. All 5 decisions are approved and integrated.

## 29. Completion Criteria
- Master achievements are seeded in the database.
- Complete implementation of analytics, XP, streaks, achievements services and routes.
- Standardized schemas exist for analytics and gamification items.
- Dynamic frontend charts show completion percentages, XP levels, streak values, and achievements.
- Clean working tree with fully passing builds.

## 30. Freeze Criteria
- The test suite validates all 30 milestone metrics.
- Regression tests pass with zero lint or compilation errors.
- Visual validation shows the Premium Mission UI dashboard and analytics workspace.
