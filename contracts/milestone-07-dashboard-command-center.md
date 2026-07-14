# Milestone 07 — Dashboard Command Center Contract

## 1. Milestone Identity
- **Scope**: Home Dashboard (Command Center) Aggregation View.
- **Slug**: `dashboard-command-center`

## 2. Frozen Baseline
- **Baseline Commit**: `7a474af`
- **Status**: FROZEN (Milestones 01 to 06 are locked).

## 3. Authoritative Sources
- `docs/01_PRD.md`: Section 9 "Dashboard" (p. 215-236).
- `docs/05_API_Specification.md`: Section 15 "Dashboard Endpoints" (p. 543-610).
- `docs/06_UI_UX_Design_System.md`: Section 32 "Dashboard Experience" & Section 33 "Daily Momentum Hero" (p. 951-1010).

## 4. Problem Statement
Currently, when a user logs in, they are directed directly to the Planner workspace. The application lacks a central home landing view (Home Dashboard / Command Center) which is designated in the PRD as the main daily hub. This requires a dedicated backend aggregation endpoint and a beautiful, high-impact frontend workspace view that aggregates daily momentum, planners preview, XP levels, streaks, logged mood, upcoming tasks, and recent achievements.

## 5. Goals
- Implement backend `GET /api/v1/dashboard/today` endpoint.
- Support optional `date` query parameter (defaulting to today in user timezone settings).
- Implement a premium, visual **Dashboard** tab on the frontend.
- Render momentum indicators, task completion stats, streak/XP meters, mood updates, upcoming schedules, and unlocked badges in a highly readable grid.

## 6. Non-Goals
- Do not modify existing Planner, Categories, Tasks, XP, Achievements, Mood, or Journal base write services.
- Do not add AI summary generation, AI mood trends, or conversational chat features.
- Do not create custom offline mutation sync queues.
- Do not add PWA manual install prompts, installation banners, or standalone app detection.
- Do not cache dashboard API responses offline.

## 7. Exact In-Scope Features

### Backend Aggregation Endpoint
- Mounts at `GET /api/v1/dashboard/today`.
- **Query Parameters**:
  - `date`: `YYYY-MM-DD` (Optional, validated via `plannerDateSchema`).
- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Dashboard data retrieved successfully",
    "data": {
      "date": "2026-07-08",
      "greeting": "Good morning",
      "progress": {
        "totalTasks": 10,
        "completedTasks": 8,
        "unfinishedTasks": 2,
        "completionPercentage": 80,
        "notDonePercentage": 20
      },
      "streak": {
        "current": 7,
        "longest": 12
      },
      "xp": {
        "current": 540
      },
      "mood": {
        "mood": "HAPPY"
      },
      "upcomingTasks": [],
      "recentAchievements": []
    }
  }
  ```
- **Business Logic details**:
  - Resolve the selected date (defaulting to current date in `UserSettings.timezone`).
  - Calculate `greeting` based on user timezone's current local hour:
    - `Good morning` (05:00 - 11:59 local)
    - `Good afternoon` (12:00 - 16:59 local)
    - `Good evening` (17:00 - 04:59 local)
    - Backend logic must not depend on greeting text.
  - Retrieve active tasks from the `Planner` matching the resolved date to count `progress` metrics.
  - Return the user's `Streak` current and longest values.
  - Return the user's total accrued XP from their settings.
  - Return the resolved date's `MoodEntry` (if logged) containing only the `mood` enum value (HAPPY, AMAZING, etc.). If no mood is logged, return `"mood": null` or `"mood": { "mood": null }`.
  - Return upcoming tasks:
    - Includes active, uncompleted tasks scheduled for today or in the past (overdue).
    - Excludes completed, skipped, cancelled, soft-deleted, and unscheduled tasks.
    - Ordered by `scheduledTime` ASC, then `position` ASC.
    - Returns up to 5 tasks maximum.
  - Return recent achievements:
    - Returns unlocked achievements only.
    - Ordered by `unlockedAt` DESC.
    - Returns up to 3 achievements maximum.

### Frontend Dashboard Workspace Tab
- Add a new "Dashboard" tab in [FoundationShell.tsx](file:///c:/Users/uvaru/Downloads/DT/apps/web/src/FoundationShell.tsx) navigation toggle, positioned before "Planner".
- Render a grid layout matching the visual guidelines:
  - **Hero Header**: Display greeting, formatted local date, and contextual motivator.
  - **Today's Progress**: Render a high-impact progress ring or momentum bar.
  - **Upcoming Tasks**: List of next scheduled tasks with quick checkboxes.
  - **Streak & XP Level**: Gauge indicators for streak day-counts and current level progress.
  - **Mood Check-in Preview**: Small button/badge showcasing current daily mood or prompting check-in if absent.
  - **Recent Achievements**: Grid of circular icons representing newly unlocked badges.

## 8. Explicit Out-of-Scope Features
- Any mood aggregation trends charts (placed in Analytics tab only).
- Manual XP additions/modifications.
- Interactive category creation inside dashboard.
- Journal content or journal completion states in backend API response.

## 9. Existing Architecture Reused
- Auth middleware (`requireAuth`).
- Timezone helpers (`getCurrentCalendarDate`, `getCalendarDateInTimezone`, `toUtcMidnight`).
- Achievements seeds and evaluation service.
- Standard response envelopes (`sendSuccess`, `AppError`).

## 10. Relevant Prisma Models
- `User` (Read)
- `UserSettings` (Read)
- `Planner` (Read)
- `Task` (Read)
- `Streak` (Read)
- `MoodEntry` (Read)
- `UserAchievement` (Read)
- `XPTransaction` (Read)

## 11. Relevant Prisma Enums
- `MoodValue` (Read)

## 12. Exact API Endpoints
- `GET /api/v1/dashboard/today`

## 13. Shared Contract Requirements
- Add `dashboardQuerySchema` to packages/shared validation contracts:
  ```typescript
  export const dashboardQuerySchema = z.object({
    date: plannerDateSchema.optional(),
  }).strict();
  ```

## 14. Backend Service Requirements
- Validate `date` parameter using `dashboardQuerySchema`.
- Isolate responses based on the authenticated `req.auth.userId`.
- Handle database null records safely (e.g. return zero-valued metrics if no planner, streak, or mood has been created yet).

## 15. Frontend Requirements
- Request data from `/api/v1/dashboard/today` using a TanStack `useQuery` hook.
- Handle loading, empty, and error fallback states cleanly.
- Keep dashboard tab visually aligned with the rest of the application.

## 16. PWA Requirements
- Caching of static shell elements remains active.

## 17. Offline Requirements
- Warn users if mutations are disabled offline. Display read-only cached data if available.

## 18. Timezone Rules
- Resolve "today" using `UserSettings.timezone`.

## 19. Authentication and User Isolation Rules
- Must require `requireAuth` middleware.
- Block access if token is invalid or missing.

## 20. Idempotency Rules
- Read-only GET endpoint; no write idempotency checks required.

## 21. Concurrency Rules
- Aggregation is read-only.
- **Strict Concurrency Rule**: Do NOT use `FOR UPDATE`, `SKIP LOCKED`, write locks, or transaction retry blocks in this read-only endpoint.

## 22. Soft-Delete Rules
- Soft-deleted items must be excluded from progress and task metrics.

## 23. Error Semantics
- Throw standard `AppError` on invalid parameters or failed resolutions.

## 24. Standard API Response Requirements
- Maintain `{ success: true, message: "...", data: { ... } }` wrapper.

## 25. Loading States
- Display shimmer bars or spinners while dashboard queries are fetching.

## 26. Empty States
- If no planner or tasks are added, render: "Add tasks in the Planner to build today's momentum!"

## 27. Error States
- Display clean red banners if endpoint fetch fails.

## 28. Accessibility Requirements
- Use semantic markup, correct hierarchy (`h1`, `h2`), and proper ARIA labels.

## 29. Responsive Requirements
- Grid cols adjust from single-column on mobile to three-columns on desktop.

## 30. Theme Requirements
- Fully responsive styling for Light and Dark modes.

## 31. Data Integrity Invariants
- Dashboard metrics must match the source planner, streak, and mood rows exactly.

## 32. Security Boundaries
- Never leak private user details or foreign data keys.

## 33. Dependency Policy
- No new packages.

## 34. Environment Variable Policy
- No new environment variables.

## 35. Prisma Schema Policy
- No database model changes.

## 36. Migration Policy
- No migrations.

## 37. Worker/Scheduled Job Policy
- No workers.

## 38. Service Worker Policy
- No new service worker rules.

## 39. Frozen Milestone Preservation Rules
- All existing planner actions, mood select upserts, and gamification streaks must remain operational.

## 40. Cross-Document Conflict Audit
- **Issue**: Greeting message logic timezone resolution.
- **Source-of-Truth Resolution**: Greeting is derived using the resolved date hours in user Settings timezone.

## 41. Owner Decision Resolution
1. **GREETING RANGES**: Timezone is `UserSettings.timezone`. Hours mapping: 05:00 - 11:59 => "Good morning", 12:00 - 16:59 => "Good afternoon", 17:00 - 04:59 => "Good evening". Generated by API. Business correctness must not depend on greeting text.
2. **UPCOMING TASK ELIGIBILITY**: Include active, uncompleted tasks. Exclude completed, skipped, cancelled, soft-deleted, and tasks without scheduledTime. Overdue unfinished tasks remain eligible.
3. **UPCOMING TASK ORDER**: Ordered by `scheduledTime` ASC, then `position` ASC. Max counts = 5.
4. **RECENT ACHIEVEMENTS**: Unlocked achievements only, sorted by `unlockedAt` DESC. Max counts = 3.
5. **DASHBOARD NAVIGATION**: Default embedded workspace is `"dashboard"`. Root remains `/`.
6. **READ-ONLY REQUIREMENT**: GET endpoint is strictly read-only. No insertions, updates, or deletes. No `FOR UPDATE`, `SKIP LOCKED`, write locks, or retries.
7. **OFFLINE SCOPE**: No manual/custom dashboard API or IndexedDB cache. Service worker static cache remains untouched.
8. **PWA INSTALLATION**: No installation prompts or banners.

## 42. Runtime Verification Matrix
1. Dashboard endpoint is registered under `/api/v1/dashboard/today`.
2. Optional `date` query parameter is supported and validated.
3. Reject invalid date parameters with validation error.
4. Correctly resolve default today date using `UserSettings.timezone`.
5. Return appropriate greeting based on local hour.
6. Calculate correct progress counts (total, completed, unfinished, percentages).
7. Soft-deleted tasks are ignored in dashboard progress calculations.
8. Current and longest streak counts match `Streak` DB record.
9. Accrued XP value matches settings total.
10. Return daily `MoodEntry` if logged today.
11. Return `null` mood data if no mood logged for today.
12. Return up to next 5 chronological uncompleted schedules.
13. Return up to 3 most recently unlocked user achievements.
14. Achievements array is sorted by `unlockedAt` descending.
15. Dashboard requires valid authentication.
16. Unauthorized requests return clean HTTP 401.
17. Standard response envelope wrapper is preserved.
18. Frontend workspace toggle mounts "Dashboard" tab.
19. Visual progress hero ring renders correctly.
20. Themes (Light / Dark) are fully synchronized.

## 43. Build Verification Requirements
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `node --env-file=apps/api/.env node_modules/prisma/build/index.js validate --schema apps/api/prisma/schema.prisma`

## 44. Git Boundary Requirements
- Ensure no staged files, modifications limited strictly to Milestone 07 contract, and compile remains uncommitted.

## 45. Freeze Criteria
- The verification matrix tests must pass and the build must compile cleanly before freezing.

## 46. Prohibited Implementation Behavior
- Do not create Prisma models or migrate data.

## 47. Final Readiness Decision
**Status**: READY FOR MILESTONE 07 IMPLEMENTATION
