

# 1. Database Objective

The database must provide a reliable, relational, and maintainable source of truth for Daily Development Tracker Version 1.

The database supports:

- Users
- User settings
- Daily planners
- Tasks
- Recurring tasks
- Categories
- Task completion history
- Reminder schedules
- Notification processing
- Notification history
- Journaling
- Mood tracking
- Daily statistics
- Activity history
- XP
- Streaks
- Achievements

PostgreSQL is the authoritative database.

Prisma is the approved ORM.

---

# 2. Database Principles

The database must follow these principles:

1. Relational integrity
2. Explicit ownership
3. Single source of truth
4. Transactional consistency
5. Idempotency
6. Timezone-aware scheduling
7. Traceable gamification events
8. Historical data preservation
9. Practical indexing
10. Future compatibility without premature complexity

The schema must not duplicate authoritative business state unnecessarily.

---

# 3. Identifier Strategy

All primary business entities use UUID identifiers.

Conceptually:

```text
id UUID PRIMARY KEY
````

Prisma implementations should use UUID-compatible string identifiers.

Example:

```text
id String @id @default(uuid()) @db.Uuid
```

UUID identifiers provide:

* Globally unique records
* Safer distributed creation
* Reduced dependence on sequential identifiers
* Future service compatibility

---

# 4. Common Audit Fields

Major entities should use audit timestamps where appropriate.

Standard fields:

```text
createdAt
updatedAt
```

Conceptually:

```text
createdAt TIMESTAMP
updatedAt TIMESTAMP
```

Prisma should use appropriate defaults and automatic update behavior.

Example:

```text
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

---

# 5. Soft Delete Strategy

Major user-owned entities that may require historical preservation should support soft deletion where defined.

Standard field:

```text
deletedAt
```

A null `deletedAt` means the record is active.

A non-null `deletedAt` means the record is logically deleted.

Soft deletion is appropriate for entities such as:

* Planner
* Task
* RecurringTask
* Category
* JournalEntry

Feature implementation must ensure normal application queries exclude deleted records where required.

Do not automatically add soft deletion to immutable event records.

Examples of event/history records that should generally remain append-only include:

* TaskCompletion
* XPTransaction
* ActivityLog

---

# 6. Date and Time Strategy

All backend timestamps must be stored in a timezone-safe form.

PostgreSQL and Prisma timestamps should represent absolute instants where appropriate.

User-facing schedule interpretation must use the user's configured timezone.

Important distinction:

```text
Absolute Event Time
```

Examples:

* Task completed at
* Notification sent at
* Achievement unlocked at

These should be stored as absolute timestamps.

```text
User Local Schedule Time
```

Examples:

* Brush teeth at 7:30 AM
* Workout at 6:00 PM

Recurring schedule definitions may store a local wall-clock time and interpret it using the user's timezone.

The server must not assume the server timezone is the user's timezone.

---

# 7. Percentage Storage Strategy

Completion percentage and not-done percentage are derived values.

Authoritative values are:

* Total applicable tasks
* Completed tasks

Conceptually:

```text
completionPercentage =
completedTasks / totalTasks * 100
```

```text
notDonePercentage =
unfinishedTasks / totalTasks * 100
```

Derived percentages may be stored in `DailyStatistics` for performance.

Source task and completion data remain authoritative.

---

# 8. Entity Overview

Version 1 uses the following primary entities:

1. User
2. UserSettings
3. Planner
4. RecurringTask
5. Task
6. TaskCompletion
7. Category
8. ReminderSchedule
9. NotificationQueue
10. Notification
11. JournalEntry
12. MoodEntry
13. ActivityLog
14. DailyStatistics
15. Achievement
16. UserAchievement
17. XPTransaction
18. Streak

Supporting infrastructure entities may be introduced only when required by an approved Version 1 feature.

---

# 9. User

## Purpose

Represents an authenticated application user.

## Fields

```text
id
email
passwordHash
displayName
createdAt
updatedAt
deletedAt
```

## Field Rules

### id

UUID primary key.

### email

Required.

Must be normalized before persistence.

Must be unique among active supported accounts according to authentication implementation policy.

### passwordHash

Required for password-based authentication.

Plain-text passwords must never be stored.

### displayName

Required user-facing name.

### deletedAt

Supports account lifecycle and soft deletion strategy.

## Relationships

A User may have:

* One UserSettings
* Many Planners
* Many RecurringTasks
* Many Categories
* Many JournalEntries
* Many MoodEntries
* Many ActivityLogs
* Many DailyStatistics
* Many UserAchievements
* Many XPTransactions
* One Streak
* Many notification-related records through owned resources

## Indexes

* Unique email constraint
* deletedAt where query patterns justify indexing

---

# 10. UserSettings

## Purpose

Stores user preferences and scheduling configuration.

## Fields

```text
id
userId
theme
language
notificationsEnabled
defaultReminderMinutes
soundEnabled
timezone
weekStartsOn
dateFormat
timeFormat
createdAt
updatedAt
```

## Rules

Each user has one settings record.

`userId` must be unique.

## Default Values

Recommended Version 1 defaults:

```text
theme = SYSTEM
language = en
notificationsEnabled = true
defaultReminderMinutes = 3
soundEnabled = true
weekStartsOn = MONDAY
```

Timezone must be explicitly resolved during onboarding or user settings initialization.

Do not permanently assume UTC or server timezone as the user's timezone.

## Relationships

```text
User 1 ─── 1 UserSettings
```

## Constraints

* Unique `userId`
* Foreign key to User

---

# 11. Planner

## Purpose

Represents a user's planner for a specific local calendar date.

## Fields

```text
id
userId
plannerDate
createdAt
updatedAt
deletedAt
```

## Rules

A user may have only one active planner for a specific planner date.

The planner date represents the user's local calendar date.

## Relationships

```text
User 1 ─── N Planner
Planner 1 ─── N Task
```

## Constraints

A unique strategy must prevent multiple active planners for the same:

```text
userId + plannerDate
```

Soft-delete behavior must be considered when implementing the exact database constraint.

## Indexes

* userId
* plannerDate
* userId + plannerDate

---

# 12. Category

## Purpose

Organizes user activities.

## Fields

```text
id
userId
name
color
icon
createdAt
updatedAt
deletedAt
```

## Rules

Categories are user-owned.

Examples:

* Study
* Fitness
* Coding
* Health
* Reading
* Personal
* Work

Category names should be normalized according to feature requirements.

A user should not unintentionally create duplicate active categories with the same normalized name.

## Relationships

```text
User 1 ─── N Category
Category 1 ─── N Task
Category 1 ─── N RecurringTask
```

## Indexes

* userId
* userId + name where appropriate

---

# 13. RecurringTask

## Purpose

Stores reusable recurring activity definitions.

A RecurringTask is a schedule template.

It is not itself a daily task completion record.

## Fields

```text
id
userId
categoryId
title
description
scheduledLocalTime
priority
recurrenceType
recurrenceConfig
reminderEnabled
reminderMinutes
startsOn
endsOn
isActive
createdAt
updatedAt
deletedAt
```

## Field Notes

### scheduledLocalTime

Stores the intended local wall-clock time.

Example:

```text
07:30
```

It must be interpreted using the user's timezone.

### recurrenceType

Controlled enum.

Recommended values:

```text
DAILY
WEEKLY
CUSTOM
```

### recurrenceConfig

Structured recurrence configuration.

May be represented using JSON where required.

Examples:

```text
Weekly on Monday, Wednesday, Friday
```

or:

```text
Custom weekday selection
```

The format must be validated by the application.

### reminderMinutes

Optional task-level reminder override.

If absent, use the user's default reminder lead time.

## Relationships

```text
User 1 ─── N RecurringTask
Category 1 ─── N RecurringTask
RecurringTask 1 ─── N Task
```

## Indexes

* userId
* isActive
* startsOn
* endsOn where justified

---

# 14. Task

## Purpose

Represents an activity planned for a specific daily planner.

Task is the daily actionable item.

## Fields

```text
id
plannerId
userId
categoryId
recurringTaskId
title
description
scheduledAt
priority
position
status
createdAt
updatedAt
deletedAt
```

## Field Notes

### plannerId

Required.

Every task belongs to a daily planner.

### userId

Stored explicitly to support ownership queries and authorization.

The user must match the planner owner.

### categoryId

Optional.

### recurringTaskId

Optional.

If present, identifies the recurring template that generated the task.

### scheduledAt

Optional absolute timestamp representing the scheduled activity time.

It should be calculated from:

```text
plannerDate
+
scheduled local time
+
user timezone
```

### priority

Controlled enum.

Recommended values:

```text
LOW
MEDIUM
HIGH
```

### position

Used for user-controlled planner ordering.

### status

Controlled enum.

Recommended values:

```text
PLANNED
SKIPPED
CANCELLED
```

Completion is not represented by a `COMPLETED` status as the authoritative completion source.

`TaskCompletion` is the source of truth for completion.

## Relationships

```text
Planner 1 ─── N Task
User 1 ─── N Task
Category 1 ─── N Task
RecurringTask 1 ─── N Task
Task 1 ─── 0..1 TaskCompletion
Task 1 ─── N ReminderSchedule
```

## Constraints

* Task owner must match planner owner at the application/service layer.
* A generated recurring task must not be duplicated for the same intended recurrence occurrence.

A database uniqueness strategy should support recurring generation idempotency.

## Indexes

* plannerId
* userId
* scheduledAt
* categoryId
* recurringTaskId
* plannerId + position

---

# 15. TaskCompletion

## Purpose

Authoritative record of task completion.

## Fields

```text
id
taskId
userId
completedAt
completionMethod
createdAt
```

## Rules

A Version 1 task may have at most one completion record.

Completion requests must be idempotent.

## completionMethod

Controlled enum.

Recommended values:

```text
APP
NOTIFICATION
SYSTEM
```

`SYSTEM` must only be used for approved system workflows.

## Relationships

```text
Task 1 ─── 0..1 TaskCompletion
User 1 ─── N TaskCompletion
```

## Constraints

* Unique `taskId`
* Foreign key to Task
* Foreign key to User

The service layer must validate task ownership.

## Indexes

* userId
* completedAt

---

# 16. ReminderSchedule

## Purpose

Represents a scheduled reminder associated with a task.

## Fields

```text
id
taskId
userId
scheduledFor
status
reminderMinutes
createdAt
updatedAt
```

## status

Controlled enum.

Recommended values:

```text
SCHEDULED
QUEUED
CANCELLED
COMPLETED
```

## Rules

Reminder scheduling must be idempotent.

Task edits affecting schedule time must update or replace future reminder scheduling safely.

Completed, cancelled, or skipped tasks must not continue producing invalid reminders.

## Relationships

```text
Task 1 ─── N ReminderSchedule
ReminderSchedule 1 ─── N NotificationQueue
```

## Indexes

* scheduledFor
* status
* userId
* taskId
* status + scheduledFor

The compound index on status and scheduled time supports due-reminder processing.

---

# 17. NotificationQueue

## Purpose

Represents notification delivery work.

This is the PostgreSQL-backed queue model for Version 1.

## Fields

```text
id
reminderScheduleId
userId
status
availableAt
attemptCount
maxAttempts
lockedAt
lockedBy
lastError
processedAt
createdAt
updatedAt
```

## status

Controlled enum.

Recommended values:

```text
PENDING
PROCESSING
SENT
FAILED
CANCELLED
```

## Rules

The queue processor must safely claim due work.

Concurrent workers must not process the same queue item simultaneously.

The implementation should use an appropriate PostgreSQL transaction and locking strategy.

Retry logic must use:

```text
attemptCount
maxAttempts
availableAt
```

## Relationships

```text
ReminderSchedule 1 ─── N NotificationQueue
NotificationQueue 1 ─── N Notification
```

## Indexes

Critical queue index:

```text
status + availableAt
```

Additional indexes:

* userId
* reminderScheduleId
* lockedAt

---

# 18. Notification

## Purpose

Stores notification delivery history.

## Fields

```text
id
notificationQueueId
userId
type
title
body
deliveryStatus
providerMessageId
sentAt
deliveredAt
failedAt
failureReason
createdAt
```

## type

Controlled enum.

Recommended Version 1 values:

```text
TASK_REMINDER
DAILY_SUMMARY
ACHIEVEMENT
STREAK
SYSTEM
```

Not every notification type must be enabled in the first notification feature implementation.

## deliveryStatus

Controlled enum.

Recommended values:

```text
PENDING
SENT
DELIVERED
FAILED
```

## Rules

Notification records are delivery history.

They must not replace reminder schedules or queue records.

## Relationships

```text
NotificationQueue 1 ─── N Notification
User 1 ─── N Notification
```

## Indexes

* userId
* createdAt
* deliveryStatus
* notificationQueueId

---

# 19. Push Subscription Infrastructure

Web Push requires stored browser push subscriptions.

The exact entity is an approved supporting infrastructure entity because the product requires Web Push.

Recommended entity:

```text
PushSubscription
```

## Purpose

Stores a user's browser push subscription.

## Fields

```text
id
userId
endpoint
p256dh
auth
userAgent
isActive
lastUsedAt
createdAt
updatedAt
```

## Rules

Push subscription data is user-owned.

The same endpoint must not be stored repeatedly as duplicate active subscriptions.

Expired or invalid subscriptions should be marked inactive or removed according to the implementation strategy.

## Constraints

* Unique endpoint

## Indexes

* userId
* isActive

Sensitive subscription material must not be exposed through normal client APIs unnecessarily.

---

# 20. JournalEntry

## Purpose

Stores a user's daily reflection.

## Fields

```text
id
userId
entryDate
title
content
gratitude
lessonsLearned
tomorrowPlan
createdAt
updatedAt
deletedAt
```

## Rules

Version 1 supports one active primary journal entry per user per local calendar date.

## Relationships

```text
User 1 ─── N JournalEntry
```

## Constraints

A uniqueness strategy must enforce one active journal entry for:

```text
userId + entryDate
```

Soft deletion must be considered in the exact constraint implementation.

## Indexes

* userId
* entryDate
* userId + entryDate

---

# 21. MoodEntry

## Purpose

Stores a user's primary daily mood.

## Fields

```text
id
userId
entryDate
mood
note
createdAt
updatedAt
```

## mood

Controlled enum.

Recommended values:

```text
AMAZING
HAPPY
NORMAL
SAD
TIRED
```

## Rules

Version 1 supports one primary mood entry per user per local calendar date.

Updating the daily mood updates the existing record.

## Relationships

```text
User 1 ─── N MoodEntry
```

## Constraints

Unique:

```text
userId + entryDate
```

## Indexes

* userId
* entryDate

---

# 22. ActivityLog

## Purpose

Stores important user and domain activity history.

## Fields

```text
id
userId
type
entityType
entityId
metadata
occurredAt
createdAt
```

## type

Controlled enum or validated domain event identifier.

Examples:

```text
TASK_COMPLETED
TASK_SKIPPED
JOURNAL_CREATED
MOOD_LOGGED
XP_EARNED
ACHIEVEMENT_UNLOCKED
STREAK_UPDATED
NOTIFICATION_SNOOZED
```

## metadata

Optional structured JSON metadata.

Metadata must not become a substitute for relational modeling of core business entities.

## Rules

ActivityLog is append-oriented.

Normal application behavior should not edit historical activity events.

## Indexes

* userId
* occurredAt
* type
* userId + occurredAt

Activity history APIs should use cursor pagination as the dataset grows.

---

# 23. DailyStatistics

## Purpose

Stores derived daily summary information for efficient dashboard and analytics access.

## Fields

```text
id
userId
statisticsDate
totalTasks
completedTasks
unfinishedTasks
completionPercentage
notDonePercentage
xpEarned
focusMinutes
createdAt
updatedAt
```

## Rules

DailyStatistics is derived data.

It is not the authoritative source for task completion.

Authoritative sources include:

* Planner
* Task
* TaskCompletion
* XPTransaction

Statistics must be recalculable.

## Constraints

Unique:

```text
userId + statisticsDate
```

## Indexes

* userId
* statisticsDate
* userId + statisticsDate

## Percentage Precision

Percentage storage must use a consistent numeric precision.

The implementation should avoid floating-point inconsistency for persisted percentage values.

---

# 24. Achievement

## Purpose

Stores master achievement definitions.

## Fields

```text
id
code
name
description
icon
xpReward
criteriaType
criteriaConfig
isActive
createdAt
updatedAt
```

## Rules

Achievements are master data.

Examples:

```text
FIRST_TASK
FIRST_PERFECT_DAY
STREAK_7
STREAK_30
TASKS_100
FIRST_JOURNAL
```

## code

Stable unique identifier.

Achievement business logic should prefer stable codes rather than user-facing names.

## criteriaConfig

Optional validated JSON configuration for achievement evaluation.

## Constraints

* Unique `code`

---

# 25. UserAchievement

## Purpose

Records achievement ownership.

## Fields

```text
id
userId
achievementId
unlockedAt
createdAt
```

## Relationships

```text
User N ─── N Achievement
```

implemented through:

```text
UserAchievement
```

## Constraints

Unique:

```text
userId + achievementId
```

This prevents duplicate achievement unlocks.

## Indexes

* userId
* unlockedAt
* achievementId

---

# 26. XPTransaction

## Purpose

Authoritative history of XP changes.

## Fields

```text
id
userId
amount
reason
sourceType
sourceId
idempotencyKey
createdAt
```

## Rules

XP is transaction-based.

Examples:

```text
+10 TASK_COMPLETED
+20 JOURNAL_COMPLETED
+50 STREAK_MILESTONE
```

Negative XP transactions should only be introduced if an approved business rule requires them.

## idempotencyKey

Used to prevent duplicate XP awards for retryable events.

Example conceptual keys:

```text
task-completed:<taskId>
achievement:<userAchievementId>
```

## Constraints

* Unique `idempotencyKey`

## Indexes

* userId
* createdAt
* reason
* userId + createdAt

Current XP may be calculated from:

```text
SUM(XPTransaction.amount)
```

A derived cache may be introduced only if performance requires it and consistency is explicitly handled.

---

# 27. Streak

## Purpose

Stores current streak state for a user.

## Fields

```text
id
userId
currentStreak
longestStreak
lastQualifyingDate
createdAt
updatedAt
```

## Rules

Each user has one streak record.

The exact qualifying rule must be frozen during the streak feature milestone before implementation.

Streak updates must be idempotent.

## Constraints

* Unique `userId`

## Relationships

```text
User 1 ─── 1 Streak
```

---

# 28. Core Relationships

The primary relationship model is:

```text
User
│
├── UserSettings
├── Planner
│   └── Task
│       ├── TaskCompletion
│       └── ReminderSchedule
│           └── NotificationQueue
│               └── Notification
│
├── RecurringTask
├── Category
├── PushSubscription
├── JournalEntry
├── MoodEntry
├── ActivityLog
├── DailyStatistics
├── XPTransaction
├── Streak
└── UserAchievement
    └── Achievement
```

Task also optionally references:

```text
Category
RecurringTask
```

---

# 29. Referential Integrity

Foreign keys must preserve relational integrity.

Deletion behavior must be selected deliberately.

Do not use unrestricted cascade deletion across historical event records.

Examples:

Deleting or soft-deleting a Task must not silently destroy authoritative completion history without an approved policy.

Deleting a user account requires a separate account lifecycle and data-retention strategy.

Prisma relation actions must be reviewed before migration generation.

---

# 30. Unique Constraints

Important Version 1 uniqueness requirements include:

```text
User.email
UserSettings.userId
Planner(userId, plannerDate)
TaskCompletion.taskId
MoodEntry(userId, entryDate)
DailyStatistics(userId, statisticsDate)
Achievement.code
UserAchievement(userId, achievementId)
XPTransaction.idempotencyKey
Streak.userId
PushSubscription.endpoint
```

JournalEntry requires one active record per user and date.

Planner requires one active record per user and date.

Soft deletion complicates simple compound uniqueness.

The exact PostgreSQL and Prisma implementation must be reviewed during schema implementation.

Do not ignore this issue.

---

# 31. Soft Delete and Unique Constraint Risk

PostgreSQL partial unique indexes can enforce uniqueness only for active rows.

Example concept:

```text
UNIQUE userId + plannerDate
WHERE deletedAt IS NULL
```

Prisma schema support for every partial-index requirement may require migration-level SQL.

During database implementation:

1. Prefer a clean Prisma-compatible model where possible.
2. If partial unique indexes are required, document them.
3. Add reviewed migration SQL.
4. Keep Prisma schema and migration intent aligned.

Do not silently allow duplicate active planners or duplicate active daily journals.

---

# 32. Transaction Strategy

Database transactions are required when a business operation changes multiple authoritative records that must remain consistent.

Examples:

Task completion may coordinate:

```text
TaskCompletion
ActivityLog
XPTransaction
Streak
Achievement Evaluation
DailyStatistics
```

Not every operation must write every record synchronously.

However, consistency boundaries must be explicit.

The implementation may use:

* Prisma transactions
* Idempotent follow-up processing
* Queue-based derived updates

The selected strategy must prevent duplicate rewards and conflicting completion state.

---

# 33. Task Completion Transaction Boundary

The task completion use case is business-critical.

At minimum, the completion record must be created idempotently.

Conceptually:

```text
Validate Task Ownership
        │
        ▼
Check Existing Completion
        │
        ▼
Create TaskCompletion
        │
        ▼
Record Domain Effects Safely
```

If XP or other domain effects are processed separately, they must use stable idempotency keys.

A retry must not award XP twice.

---

# 34. Recurring Task Generation

RecurringTask is a template.

Task is a daily occurrence.

Conceptually:

```text
RecurringTask
      │
      ▼
Recurrence Evaluation
      │
      ▼
Daily Task Occurrence
```

Generation must be idempotent.

The database must support preventing duplicate generated tasks for the same recurring task occurrence.

The exact uniqueness implementation should be defined during recurring-task implementation.

A recommended approach is to include an occurrence date or stable generation key if required.

Do not rely only on checking task titles.

---

# 35. Notification Queue Processing

The PostgreSQL-backed queue must support safe concurrent processing.

Conceptually:

```text
Find Due PENDING Items
        │
        ▼
Claim Items Transactionally
        │
        ▼
Mark PROCESSING
        │
        ▼
Send Notification
        │
        ├── Success → SENT
        │
        └── Failure → Retry or FAILED
```

The implementation should evaluate PostgreSQL row locking strategies such as safe work claiming.

The exact query strategy must be reviewed before implementation.

---

# 36. Notification Retry Strategy

NotificationQueue must support bounded retries.

Recommended conceptual strategy:

```text
Attempt 1
↓
Failure
↓
Increase attemptCount
↓
Move availableAt into future
↓
Retry
```

When:

```text
attemptCount >= maxAttempts
```

the item transitions to:

```text
FAILED
```

Retry timing may use a simple backoff strategy.

The implementation must avoid infinite retry loops.

---

# 37. Seed Strategy

Seed infrastructure must support:

* Development bootstrap
* Achievement master data
* Safe repeat execution where practical

Seed scripts must not create fake production user analytics.

Achievement definitions are appropriate seed data.

Demo users or demo data must remain explicitly development-only.

Milestone 01 creates seed infrastructure only.

Business seed data belongs to the appropriate feature milestone.

---

# 38. Migration Strategy

All database schema changes must use Prisma migrations.

Development workflow:

```text
Update Prisma Schema
        │
        ▼
Review Change
        │
        ▼
Generate Migration
        │
        ▼
Review Migration SQL
        │
        ▼
Apply Migration
        │
        ▼
Run Verification
```

Do not manually alter production tables without a migration strategy.

Migration files must be committed to Git.

---

# 39. Index Strategy

Indexes must support actual access patterns.

Priority indexes include:

* User email lookup
* Planner by user and date
* Tasks by planner
* Tasks by scheduled time
* Completion history by user and time
* Reminder schedules by status and due time
* Notification queue by status and available time
* Activity history by user and occurrence time
* Daily statistics by user and date
* XP history by user and creation time

Do not create indexes on every column without reason.

Indexes improve reads but add write and storage cost.

---

# 40. Pagination Strategy

Growing history collections must use pagination.

Cursor pagination is preferred for:

* Activity history
* Notification history
* XP history

Cursor design should use a stable ordering strategy.

Examples:

```text
occurredAt + id
createdAt + id
```

Offset pagination may be acceptable for small administrative or bounded lists.

---

# 41. Data Validation

Database constraints protect structural integrity.

Application validation protects business rules.

Both are required.

Examples:

Database:

```text
Unique task completion
Unique user achievement
Foreign keys
```

Application:

```text
Task belongs to user
Reminder time is valid
Recurrence configuration is valid
Mood value is supported
```

Do not rely only on frontend validation.

---

# 42. Data Ownership

User-owned records must be scoped to the authenticated user.

The server must enforce ownership.

A client must not be able to access data by changing an identifier in a request.

Where `userId` is stored directly for query efficiency, the service must ensure it remains consistent with parent ownership.

---

# 43. Sensitive Data

The database must never store:

* Plain-text passwords
* JWT secrets
* Private server keys as normal user records

Password hashes are stored in `User.passwordHash`.

Push subscription credentials must be treated as sensitive infrastructure data.

Logs and API responses must not unnecessarily expose sensitive fields.

---

# 44. Development Database

Local development uses PostgreSQL through Docker.

The development database must use a persistent Docker volume.

The local database may be reset intentionally during development.

Reset procedures must be documented.

---

# 45. Production Database

Production uses Neon PostgreSQL.

Production configuration uses:

```text
DATABASE_URL
```

The production application must not depend on the local Docker database.

Prisma migrations must be applied through a controlled deployment process.

---

# 46. Prisma Client Ownership

Prisma client initialization belongs to backend infrastructure.

The frontend must never import Prisma.

`packages/shared` must never import Prisma client infrastructure.

The backend should expose one controlled Prisma client instance according to the application's runtime requirements.

Avoid creating unnecessary Prisma client instances per request.

---

# 47. Milestone 01 Database Scope

Foundation Milestone 01 must not implement the complete business schema.

Milestone 01 may create:

* Prisma configuration
* Prisma schema foundation
* PostgreSQL datasource
* Prisma client infrastructure
* Migration infrastructure
* Seed infrastructure
* Database connection verification

Milestone 01 must not prematurely implement all Version 1 business models unless a later approved contract explicitly authorizes it.

The full schema should be implemented during the approved database/backend milestone.

---

# 48. Database Change Policy

This database design is frozen for Version 1.

AI tools must not independently:

* Rename core entities
* Remove authoritative event models
* Replace PostgreSQL
* Replace Prisma
* Convert the database to a document database
* Merge entities solely to reduce file count
* Add major business entities without review

If implementation identifies a blocker:

1. Document the issue.
2. Explain the affected entity.
3. Propose the smallest change.
4. Review the change.
5. Update this document if approved.
6. Implement the approved change.

---

# 49. Final Database Decision

Daily Development Tracker Version 1 uses:

```text
PostgreSQL
     │
     ▼
Prisma ORM
     │
     ├── User Identity
     ├── Daily Planning
     ├── Completion Events
     ├── Recurring Activity Templates
     ├── Reminder Scheduling
     ├── PostgreSQL Notification Queue
     ├── Notification History
     ├── Journal
     ├── Mood
     ├── Activity History
     ├── Derived Daily Statistics
     ├── XP Transactions
     ├── Streak State
     └── Achievements
```

The database prioritizes:

* Data integrity
* Historical traceability
* Idempotency
* Reliable reminders
* Clear ownership
* Analytics compatibility
* Maintainability

---

# DOCUMENT STATUS

**Version:** 1.0

**Status:** FROZEN

**Change Policy:** Database changes require explicit technical review.

This document is the source of truth for Daily Development Tracker Version 1 database design.

````

