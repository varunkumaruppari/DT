# Milestone 04 — Recurring Tasks, Reminders, and Notifications

## 1. Milestone Identity
**Project:** Daily Development Tracker  
**Milestone:** 04  
**Name:** Recurring Tasks, Reminders, and Notifications  
**Status:** PROPOSED FOR REVIEW  
**Implementation Scope:** RECURRING TASKS CRUD, REMINDER SCHEDULES, PUSH SUBSCRIPTIONS, NOTIFICATION QUEUE AND WEB PUSH DELIVERY, SERVICE WORKER INTEGRATION, AND EMBEDDED MANAGEMENT UI ONLY.  

## 2. Milestone Objective
Establish automated routine generation and high-reliability user alerts. This milestone allows authenticated users to configure recurring routines (templates) that automatically populate daily planners. It registers browser push subscriptions, schedules task reminders, queues notifications, pushes notifications through a secure background job worker, and processes snoozes or direct task completions from browser notifications.

## 3. Authority and Source-of-Truth Hierarchy
1. `docs/07_Project_Constitution.md` (Highest)
2. `docs/03_Database_Design.md` & `docs/04_ERD.md` (Database/Worker Authority)
3. `docs/05_API_Specification.md` (API Authority)
4. `docs/06_UI_UX_Design_System.md` (UI/UX Authority)
5. `contracts/milestone-04-recurring-tasks-reminders-notifications.md` (Implementation Specifics)

## 4. Current Frozen Baseline
Milestone 01, Milestone 02, and Milestone 03 are completed, verified, and frozen. The workspace compile checks (`npm run typecheck`, `npm run lint`, `npm run build`, `npm run db:validate`) are fully passing. The application code must not be modified or deployed until this contract is approved.

## 5. Problem Statement
Users struggle to maintain routines when they must manually add repetitive daily activities every day. Furthermore, users miss scheduled activities due to a lack of automated alerts, as Version 1 currently has no background job runner, VAPID push registration, or browser notifications to alert users before their tasks begin.

## 6. Exact Scope
- **Recurring Tasks CRUD**: Full API endpoints and services to manage recurring schedules. Validates weekly weekdays, start dates, and time format.
- **Reminder Generation**: Evaluates recurring task templates to generate task instances on target planner dates, and schedules reminders (e.g. 3 minutes before scheduled time).
- **Push Subscriptions**: Registers browser VAPID push subscription credentials and links them to authenticated users.
- **Notification Queue**: Background database queue processing to claim pending alerts, deliver Web Push payloads, handle failure retries, and write logs.
- **Notification Actions**: Handles complete and snooze operations from notification hooks.
- **Frontend PWA Integration**: Requests notification permission, registers VAPID keys, updates service worker message listeners, and integrates settings drawer and category manager templates.

## 7. Explicit Out-of-Scope List
- Analytics reports and daily statistics aggregation (Milestone 05).
- XP gamification, achievements, and streak updates (Milestone 05).
- Daily reflection journal and mood logging (Milestone 06).
- Google calendar synchronization or smartwatch integrations (Out of scope for V1).

## 8. Existing Implementation Assumptions
- Authenticated state resolves `req.auth.userId` securely.
- Timezone rules parse `Date` using only native `Intl` API.
- All soft-deletes preserve database records by updating `deletedAt`.

## 9. Prisma Models Involved
- `RecurringTask`
- `ReminderSchedule`
- `NotificationQueue`
- `Notification`
- `PushSubscription`
- `Task` (reused)
- `Category` (reused)
- `User` (reused)

## 10. Prisma Enums Involved
- `RecurrenceType` (`DAILY`, `WEEKLY`, `CUSTOM`)
- `ReminderStatus` (`SCHEDULED`, `QUEUED`, `CANCELLED`, `COMPLETED`)
- `QueueStatus` (`PENDING`, `PROCESSING`, `SENT`, `FAILED`, `CANCELLED`)
- `NotificationType` (`TASK_REMINDER`, `DAILY_SUMMARY`, `ACHIEVEMENT`, `STREAK`, `SYSTEM`)
- `DeliveryStatus` (`PENDING`, `SENT`, `DELIVERED`, `FAILED`)

## 11. Database Behavior
- **Soft Deactivation**: Deactivating a recurring task updates `isActive = false` or `deletedAt`. Already generated tasks remain unchanged.
- **Transactional Queue Claiming**: Claims notifications for processing using atomic select-and-lock queries (`SELECT ... FOR UPDATE SKIP LOCKED` or transaction-backed updates) to prevent concurrent deliveries.
- **Bounded Queue Retries**: Failed push operations update queue status to `PENDING`, increments `attemptCount`, and moves `availableAt` forward using backoff logic (e.g., 2 minutes, 5 minutes, 10 minutes) until `maxAttempts = 3`.

## 12. API Endpoints
- `GET /api/v1/recurring-tasks` (Returns active recurring task definitions)
- `POST /api/v1/recurring-tasks` (Creates a recurring task definition)
- `GET /api/v1/recurring-tasks/:id` (Returns a specific recurring task definition)
- `PATCH /api/v1/recurring-tasks/:id` (Updates a recurring task definition)
- `DELETE /api/v1/recurring-tasks/:id` (Soft-deletes or deactivates a recurring task)
- `GET /api/v1/reminders` (Returns active reminder schedules)
- `POST /api/v1/reminders/:id/snooze` (Snoozes a reminder)
- `POST /api/v1/reminders/:id/cancel` (Cancels a scheduled reminder)
- `GET /api/v1/push-subscriptions` (Returns subscription metadata)
- `POST /api/v1/push-subscriptions` (Registers browser push subscription)
- `DELETE /api/v1/push-subscriptions/:id` (Deactivates by setting isActive = false, or removes a push subscription)
- `GET /api/v1/notifications` (Returns notification history with cursor pagination)
- `POST /api/v1/notifications/actions/complete` (Completes task from notification action click)
- `POST /api/v1/notifications/actions/snooze` (Snoozes task from notification action click)
- `POST /api/v1/notifications/actions/dismiss` (Dismisses or skips task from notification action click)

## 13. Request DTOs
Shared contracts in `packages/shared/src/contracts/` must validate DTOs:
- `RecurringTaskCreateRequest` checks title, local time (HH:mm), recurrence weekdays, start dates, and optional category/priority/reminders.
- `RecurringTaskUpdateRequest` allows partial updates of recurring task definitions.
- `PushSubscriptionCreateRequest` requires browser endpoint, keys `p256dh`, and `auth`.
- `ReminderSnoozeRequest` validates integer minutes (1 to 60).
- `NotificationCompleteActionRequest` validates taskId and actionToken.
- `NotificationSnoozeActionRequest` validates reminderId, minutes, and actionToken.

## 14. Response Behavior
All routes must return standardized success/error JSON response payloads as defined in Milestone 01.

## 15. Ownership and Isolation Rules
All services must filter queries and restrict mutations strictly using `userId` extracted from the auth JWT token. Direct cross-user access to reminders, push subscriptions, or categories must return `403 Forbidden`.

## 16. Lifecycle/State-Transition Rules
- **ReminderSchedule**: Transitions from `SCHEDULED` to `QUEUED` when claimed by queue runner, and `COMPLETED` or `CANCELLED`.
- **NotificationQueue**: Transitions from `PENDING` -> `PROCESSING` -> `SENT` (or `FAILED` if retry budget exhausted).

## 17. Timezone and Scheduling Rules
- Recurring task generation and reminder scheduling must translate local `scheduledLocalTime` (e.g. `07:30`) to UTC absolute timestamp using user settings `timezone` and planner date midnight, reusing the timezone helper `resolveWallClockToUtc` built in Milestone 03.
- Background worker tasks (processing push queues) evaluate user local time boundaries cleanly without assuming server local time authority.

## 18. Frontend Behavior
- **Recurring Task Workspace**: Integrates UI management (modal or settings panel) to list, create, edit, and toggle recurring task schedules.
- **Notification Prompting**: Displays custom banners or alerts requesting notification permission and coordinates VAPID push token updates.

## 19. PWA/Browser Behavior
- Custom service worker file (e.g. `apps/web/src/service-worker.ts`) is required. VitePWA config must be changed from `generateSW` to `injectManifest` strategy to support custom background handlers.
- Service worker registers VAPID key, intercepts `push` events to display custom native notifications, and intercepts `notificationclick` events to capture action button taps ("Complete", "Snooze", and "Dismiss"), executing API calls to their respective backend action endpoints.

## 20. Error Behavior
Web Push exceptions (e.g. `410 Gone` or invalid subscriptions) must transition push registrations to `isActive = false` in the database to prevent duplicate failures, logging detail in `NotificationQueue.lastError`.

## 21. Shared Contract Requirements
Zod schemas exported from `@ddt/shared` package for all recurring task request DTOs and subscription payloads.

## 22. Dependency Requirements
- Requires adding `web-push` library to backend `apps/api/package.json` for signing and encrypting push notifications with VAPID keys.
- Requires VAPID key generation scripts/variables.

## 23. Migration Expectations
No Prisma migrations are expected, as all tables `RecurringTask`, `ReminderSchedule`, `NotificationQueue`, `Notification`, and `PushSubscription` are already defined and validated in the frozen schema.

## 24. Background-Processing Expectations
The Express API starts a simple loop (`setInterval` based task processor or cron) that executes every 60 seconds to evaluate upcoming reminders, claims queue records, and handles push delivery.

## 25. Security Constraints
The API must validate notification click action payload tokens to prevent malicious task completions or snoozing.

## 26. Real-Data/No-Fake-Data Constraints
All notifications and reminder alerts must derive from actual database records and real scheduled planner tasks. No mock alerts.

## 27. Verification Requirements
- Programmatic mock push server script to simulate browser notification delivery.
- Unit/integration tests checking weekday evaluations and recurrence evaluations.
- UI validation verifying correct rendering in light and dark themes.

## 28. Forbidden Implementation Behavior
- No third-party scheduling platforms (e.g. BullMQ, Agenda) unless approved by architecture docs. Simple PostgreSQL queues are preferred.
- No modifications to schema.prisma.

## 29. Known Conflicts and Semantic Gaps
- **Task Uniqueness Concurrency**: The `Task` table does not contain a unique occurrence identifier or database-level constraint. Simple query-before-insert is not race-safe. The implementation must block concurrent generation by using PostgreSQL transaction locks (e.g. locking the parent `Planner` row with `SELECT FOR UPDATE` or using advisory locking).
- **Timezone Boundary Evaluator**: Evaluating weekly recurrences requires knowing whether a weekday is evaluated under the user's timezone or UTC. The contract resolves: evaluate weekdays strictly in the user's settings timezone.
- **DST Wall-clock Transitions**: Persisted `scheduledLocalTime` (e.g. `02:30`) falling on nonexistent or ambiguous hours during DST transitions can throw. For recurring templates, the system must fallback gracefully (e.g., skip occurrence or shift by 1 hour) instead of crashing the generation worker.

## 30. OWNER DECISION RESOLUTION — MILESTONE 04

The project owner has approved the following authoritative decisions for Milestone 04 implementation:

### DECISION 1 — NOTIFICATION ACTION AUTHORIZATION
- The service worker **MUST NOT** read the normal JWT access token from localStorage or IndexedDB.
- The normal JWT **MUST NOT** be embedded in a push payload.
- Notification action endpoints (complete, snooze, dismiss) defined specifically for service-worker background notification actions authenticate using a server-signed, short-lived (15 minutes expiry) action token scoped to the user, action, and target task/reminder identity.
- Normal JWT auth remains unchanged for normal application routes. The NOTIFICATION_ACTION_SECRET environment variable is approved and required to sign these action tokens. They are not database-backed single-use tokens.

### DECISION 2 — RECURRING GENERATION CONCURRENCY
- The backend must use PostgreSQL parent `Planner` row locking to prevent concurrent generation races.
- The transaction resolves or creates the target `Planner`, locks it using parameterized raw SQL equivalent to `SELECT ... FOR UPDATE`, queries active `Task` rows for the template, inserts occurrences, and commits.
- No Prisma schema unique constraint, no Prisma database migrations, and no Redis or advisory locks will be added.

### DECISION 3 — RECURRING GENERATION TRIGGER
- Use a backend background recurring-generation worker.
- Evaluates templates for a rolling 7-calendar-day generation horizon (today through today + 6 calendar days) in the user's Settings timezone.
- Runs once on server startup, and then once every 60 minutes.
- Planner GET endpoints remain strictly read-oriented and do not trigger side effects.

### DECISION 4 — RECURRENCE TIMEZONE
- `UserSettings.timezone` is authoritative for weekday evaluation, date evaluation, template scheduled time conversions, and horizon calculations. UTC/server boundaries are not used.

### DECISION 5 — DST RECURRING OCCURRENCES
- **Nonexistent local time**: Skip generation for that single occurrence and log a sanitized warning with `reason = DST_NONEXISTENT_TIME`. Do not shift or disable.
- **Ambiguous local time**: Choose the earlier UTC instant and generate exactly one occurrence.
- Milestone 03 direct task creation remains unchanged and continues to reject ambiguous/nonexistent times.

### DECISION 6 — REMINDER CREATION
- ReminderSchedule creation is automatic. There is no general `POST /api/v1/reminders` endpoint.
- If notifications are disabled for the user, do not create a `ReminderSchedule`.
- Precedence for lead minutes: (1) template `reminderMinutes`, (2) user's `defaultReminderMinutes`. If past at creation, skip creation.
- Atomically creates initial `NotificationQueue` row in `PENDING` status with `availableAt` set to reminder's `scheduledFor`.

### DECISION 7 — REMINDER SNOOZE
- Snooze updates the same `ReminderSchedule` row (`scheduledFor` set to `now + minutes`, status set to `SCHEDULED`).
- Cancels existing `PENDING` queue items and creates a new `PENDING` `NotificationQueue` row in a single transaction.
- Repeated snooze requests recalculate from the current server time. Cannot snooze `COMPLETED` or `CANCELLED` reminders (returns `409 INVALID_REMINDER_TRANSITION`).

### DECISION 8 — REMINDER CANCEL
- Cancel updates the same `ReminderSchedule` status to `CANCELLED` and cancels all `PENDING` queue rows.
- Cancel is idempotent (returns 200 with existing cancelled state). Cannot cancel `COMPLETED` reminders (returns `409 INVALID_REMINDER_TRANSITION`).

### DECISION 9 — QUEUE CLAIMING AND WORKER POLLING
- Notification queue claims pending items transactionally using PostgreSQL row locking equivalent to `FOR UPDATE SKIP LOCKED`.
- Worker configuration: poll interval = 15 seconds, batch size = 25, stale `PROCESSING` recovery threshold = 5 minutes, max attempts = 3.
- Claim ordering: `availableAt` ascending, then `createdAt` ascending. Claims committed before dispatching external push (does not hold transactions open during HTTP calls).

### DECISION 10 — RETRY POLICY
- Bounded to 3 max attempts. Backoff: 30s after attempt 1, 2m after attempt 2, terminal `FAILED` after attempt 3.
- Retryable errors: HTTP 429, 5xx, network errors. Non-retryable subscription failures (HTTP 404, 410, malformed data) deactivate `PushSubscription` (`isActive = false`).
- VAPID config failure immediately sets queue item to `FAILED` and raises a server error.

### DECISION 11 — DELIVERY SEMANTICS
- Milestone 04 accepts at-least-once delivery risk. Exactly-once push delivery is not claimed.
- Uses a stable notification tag to coalesce native client alerts where supported.

### DECISION 12 — WORKER LIFECYCLE
- Both background workers (recurring generation and notification queue) run inside the Express API backend process.
- Prevent overlapping runs, catch boundary errors, isolate failures, and handle SIGINT/SIGTERM graceful shutdowns with a bounded timeout.

### DECISION 13 — WEB PUSH AND VAPID
- Backend `web-push` dependency is approved.
- VAPID keys generated once externally and configured in `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT`.
- Frontend fetches public VAPID key through an owner-approved configuration endpoint: `GET /api/v1/push-subscriptions/config` returning `{ "vapidPublicKey": string }`.

### DECISION 14 — SERVICE WORKER STRATEGY
- Switch VitePWA configuration strategy to `injectManifest`.
- Custom TS service worker file manages background push and click handlers while preserving offline Workbox caching.

### DECISION 15 — NOTIFICATION PERMISSION UX
- Permission prompt requires an explicit user gesture (e.g., settings toggle) and is never automatic on page load.
- Verification and subscription registration must succeed before notificationsEnabled is persisted to true.

### DECISION 16 — PUSH SUBSCRIPTION DELETE AND DUPLICATES
- DELETE endpoint soft deactivates by setting `isActive = false`.
- Unique constraint on `endpoint` is preserved. Re-registration by same user updates credentials and sets `isActive = true`. Different user endpoint returns `409 PUSH_SUBSCRIPTION_CONFLICT`.

### DECISION 17 — NOTIFICATION ACTION TOKEN DETAILS
- Signature validated using `NOTIFICATION_ACTION_SECRET` (min 32 chars).
- Claims: sub, action, taskId/reminderId/notificationId, exp. Normal Bearer JWT not required on service-worker action endpoints.

### DECISION 18 — NOTIFICATION HISTORY
- Notification history API is implemented in M04. Dedicated history UI is out of scope.

### DECISION 19 — NOTIFICATION COMPLETION
- `POST /api/v1/tasks/:id/complete` remains strictly APP-only.
- `POST /api/v1/notifications/actions/complete` uses notification action token to create `TaskCompletion` with `completionMethod = NOTIFICATION`.

### DECISION 20 — CONTRACT STRICTNESS
- All request Zod object schemas reject unknown fields strictly. Includes all 6 specified DTO schemas. Authoritative dismiss endpoint body is documented as empty.

## 31. Completion Criteria
Milestone 04 is complete when users can configure recurring tasks, receive actual push notifications (verified via mock worker scripts or browser actions), execute action hooks to complete or snooze, and verify queue retry behaviors.

## 32. Freeze Criteria
Audit pass on compiler checks, zero lint warnings, identical schema.prisma, and complete end-to-end integration walkthrough report.
