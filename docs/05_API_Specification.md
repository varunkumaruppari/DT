Good. Now fill **`05_API_Specification.md`**.

Open:

```text
docs/05_API_Specification.md
```

Delete anything inside and paste this **complete frozen version**:

````markdown
# API Specification

## Daily Development Tracker

**Version:** 1.0  
**Status:** FROZEN  
**Document Type:** REST API Specification  
**API Version:** v1  
**Base Path:** `/api/v1`

---

# 1. API Objective

The Daily Development Tracker API provides the official communication contract between the React Progressive Web Application and the Express backend.

The API supports:

- Authentication
- User profile access
- Dashboard
- Daily planning
- Tasks
- Recurring tasks
- Categories
- Reminder scheduling
- Push subscriptions
- Notification actions
- Journal entries
- Mood tracking
- Analytics
- Achievements
- XP
- Streaks
- Activity history
- User settings
- Health checks

The API must remain consistent, secure, versioned, validated, and predictable.

---

# 2. API Architecture

The application uses a REST API.

Base path:

```text
/api/v1
````

Example:

```text
GET /api/v1/planners/today
```

All Version 1 business endpoints must use the Version 1 namespace.

Future breaking API changes require a new version.

Example:

```text
/api/v2
```

Breaking changes must not be silently introduced into Version 1 endpoints.

---

# 3. Content Type

JSON is the primary API data format.

Requests containing JSON must use:

```text
Content-Type: application/json
```

Responses use:

```text
application/json
```

File upload endpoints, if introduced by an approved Version 1 requirement, may use multipart form data.

---

# 4. Authentication Strategy

Protected endpoints require authenticated access.

Version 1 uses JWT-based authentication.

Conceptual header:

```text
Authorization: Bearer <access-token>
```

The backend must:

* Validate the token
* Resolve the authenticated user
* Reject invalid authentication
* Enforce resource ownership

The backend must not trust a client-provided `userId` for authorization.

---

# 5. Standard Success Response

Successful API responses use:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Example:

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {}
  }
}
```

The exact `data` object depends on the endpoint.

---

# 6. Standard Error Response

Failed API responses use:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": []
}
```

Example:

```json
{
  "success": false,
  "message": "Task title is required",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "title",
      "message": "Task title is required"
    }
  ]
}
```

Production API responses must not expose stack traces.

---

# 7. Standard Error Codes

Version 1 uses stable application error codes.

Common error codes include:

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

Feature-specific error codes may include:

```text
USER_NOT_FOUND
INVALID_CREDENTIALS
EMAIL_ALREADY_EXISTS

PLANNER_NOT_FOUND
PLANNER_ALREADY_EXISTS

TASK_NOT_FOUND
TASK_ALREADY_COMPLETED
DUPLICATE_COMPLETION

RECURRING_TASK_NOT_FOUND

CATEGORY_NOT_FOUND

JOURNAL_NOT_FOUND
JOURNAL_ALREADY_EXISTS

MOOD_NOT_FOUND

REMINDER_NOT_FOUND
NOTIFICATION_ACTION_INVALID

ACHIEVEMENT_NOT_FOUND

SETTINGS_NOT_FOUND
```

Error codes should remain stable enough for frontend behavior.

---

# 8. HTTP Status Code Strategy

Recommended status codes:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

Endpoint implementation must select status codes consistently.

---

# 9. Request Validation

All user-controlled request input must be validated.

Validation includes:

* Request body
* Route parameters
* Query parameters

Zod is the approved validation framework.

Validation must occur before business logic processes invalid input.

Frontend validation does not replace backend validation.

---

# 10. API Documentation

The backend must support OpenAPI documentation.

Swagger-compatible documentation should be generated or maintained for Version 1 endpoints.

Recommended documentation route:

```text
/api/docs
```

OpenAPI documentation should include:

* Endpoint
* Method
* Authentication requirement
* Request schema
* Query parameters
* Response schema
* Error responses

The API specification document remains the product-level API source of truth.

---

# 11. Pagination Strategy

Growing collections must support pagination.

Cursor pagination is preferred for:

* Activity history
* Notification history
* XP transaction history

Conceptual request:

```text
GET /api/v1/activity?cursor=<cursor>&limit=20
```

Conceptual response:

```json
{
  "success": true,
  "message": "Activity history retrieved",
  "data": {
    "items": [],
    "nextCursor": null,
    "hasMore": false
  }
}
```

The default and maximum page limits must be controlled by the backend.

---

# 12. Date Strategy

Date-only API values use:

```text
YYYY-MM-DD
```

Example:

```text
2026-07-08
```

Absolute timestamps use ISO 8601.

Example:

```text
2026-07-08T04:00:00.000Z
```

User-facing local dates must be interpreted according to the authenticated user's timezone where required.

---

# 13. Idempotency Strategy

Important retryable state-changing actions must be idempotent.

Priority actions include:

* Task completion
* Notification action processing
* Reminder snooze
* Achievement unlocking
* XP award processing

The backend may use:

* Database unique constraints
* Stable event identifiers
* Idempotency keys
* Transactional checks

The API must not create duplicate business effects because a request is retried.

---

# 14. Authentication Endpoints

Base path:

```text
/api/v1/auth
```

---

## POST /auth/register

Creates a user account.

### Authentication

Public.

### Request

```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "displayName": "Varun"
}
```

### Success

```text
201 Created
```

### Response Data

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "Varun"
  },
  "accessToken": "jwt-token"
}
```

### Errors

```text
VALIDATION_ERROR
EMAIL_ALREADY_EXISTS
```

Registration should initialize required user-owned one-to-one records according to the approved authentication implementation strategy.

---

## POST /auth/login

Authenticates a user.

### Authentication

Public.

### Request

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

### Success

```text
200 OK
```

### Response Data

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "Varun"
  },
  "accessToken": "jwt-token"
}
```

### Errors

```text
VALIDATION_ERROR
INVALID_CREDENTIALS
```

Authentication failures must not reveal unnecessary account information.

---

## POST /auth/logout

Ends the current authenticated application session according to the approved JWT client strategy.

### Authentication

Required.

### Success

```text
200 OK
```

The exact server behavior depends on the finalized token lifecycle strategy.

Version 1 must document whether logout is client token removal only or includes server-side token invalidation infrastructure.

---

## GET /auth/me

Returns the authenticated user profile.

### Authentication

Required.

### Success

```text
200 OK
```

### Response Data

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "Varun"
  }
}
```

Sensitive fields such as `passwordHash` must never be returned.

---

# 15. Dashboard Endpoints

Base path:

```text
/api/v1/dashboard
```

---

## GET /dashboard/today

Returns the authenticated user's primary daily dashboard data.

### Authentication

Required.

### Query Parameters

Optional:

```text
date=YYYY-MM-DD
```

If date is absent, resolve today's date using the user's timezone.

### Success

```text
200 OK
```

### Response Data

Conceptually:

```json
{
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
```

The dashboard endpoint is an aggregation endpoint.

It must use authoritative data or safe derived statistics.

---

# 16. Planner Endpoints

Base path:

```text
/api/v1/planners
```

---

## GET /planners/today

Returns today's planner.

### Authentication

Required.

### Success

```text
200 OK
```

The user's timezone determines today's planner date.

The implementation may safely create today's planner if the approved planner contract defines get-or-create behavior.

That behavior must remain deterministic.

---

## GET /planners/:date

Returns a planner for a specific date.

### Authentication

Required.

### Route Parameter

```text
date = YYYY-MM-DD
```

### Success

```text
200 OK
```

### Errors

```text
PLANNER_NOT_FOUND
VALIDATION_ERROR
```

---

## POST /planners

Creates a planner.

### Authentication

Required.

### Request

```json
{
  "plannerDate": "2026-07-08"
}
```

### Success

```text
201 Created
```

### Errors

```text
PLANNER_ALREADY_EXISTS
VALIDATION_ERROR
```

A user must not have multiple active planners for the same date.

---

## DELETE /planners/:id

Soft-deletes a planner according to the approved planner lifecycle policy.

### Authentication

Required.

### Success

```text
204 No Content
```

The implementation must consider associated Task history before allowing planner deletion.

The exact feature contract must define safe deletion behavior.

---

# 17. Task Endpoints

Base path:

```text
/api/v1/tasks
```

---

## POST /tasks

Creates a daily task.

### Authentication

Required.

### Request

```json
{
  "plannerId": "uuid",
  "title": "Brush Teeth",
  "description": null,
  "scheduledTime": "07:30",
  "categoryId": null,
  "priority": "MEDIUM",
  "reminderEnabled": true,
  "reminderMinutes": 3
}
```

### Success

```text
201 Created
```

### Errors

```text
VALIDATION_ERROR
PLANNER_NOT_FOUND
CATEGORY_NOT_FOUND
FORBIDDEN
```

The backend must calculate scheduling using the planner date and user's timezone.

---

## GET /tasks/:id

Returns a task.

### Authentication

Required.

### Success

```text
200 OK
```

### Errors

```text
TASK_NOT_FOUND
FORBIDDEN
```

---

## PATCH /tasks/:id

Updates a task.

### Authentication

Required.

### Request

Partial update.

Example:

```json
{
  "title": "Morning Workout",
  "scheduledTime": "08:00",
  "priority": "HIGH"
}
```

### Success

```text
200 OK
```

Task scheduling changes must safely update future reminder scheduling.

---

## DELETE /tasks/:id

Soft-deletes or cancels a task according to the task lifecycle policy.

### Authentication

Required.

### Success

```text
204 No Content
```

Historical completion records must not be silently destroyed.

---

## PATCH /tasks/reorder

Updates task order inside a planner.

### Authentication

Required.

### Request

```json
{
  "plannerId": "uuid",
  "tasks": [
    {
      "taskId": "uuid-1",
      "position": 1
    },
    {
      "taskId": "uuid-2",
      "position": 2
    }
  ]
}
```

### Success

```text
200 OK
```

The backend must validate ownership of every task in the reorder request.

---

## POST /tasks/:id/complete

Completes a task.

### Authentication

Required.

### Request

```json
{
  "completionMethod": "APP"
}
```

### Success

```text
200 OK
```

### Response Data

Conceptually:

```json
{
  "taskCompletion": {},
  "progress": {
    "completionPercentage": 80,
    "notDonePercentage": 20
  },
  "xpEarned": 10,
  "achievementUnlocks": []
}
```

### Errors

```text
TASK_NOT_FOUND
DUPLICATE_COMPLETION
FORBIDDEN
```

This endpoint is business-critical.

The operation must be idempotent.

A retry must not:

* Create duplicate TaskCompletion records
* Award XP twice
* Unlock the same achievement twice

---

## POST /tasks/:id/skip

Marks a task as skipped.

### Authentication

Required.

### Success

```text
200 OK
```

Task skip must be recorded in activity history where defined by the feature contract.

Future reminders for the skipped task must be handled safely.

---

# 18. Recurring Task Endpoints

Base path:

```text
/api/v1/recurring-tasks
```

---

## GET /recurring-tasks

Returns active recurring task definitions.

### Authentication

Required.

### Success

```text
200 OK
```

---

## POST /recurring-tasks

Creates a recurring task definition.

### Authentication

Required.

### Request

```json
{
  "title": "Workout",
  "description": null,
  "scheduledLocalTime": "18:00",
  "categoryId": "uuid",
  "priority": "HIGH",
  "recurrenceType": "WEEKLY",
  "recurrenceConfig": {
    "weekdays": [
      "MONDAY",
      "WEDNESDAY",
      "FRIDAY"
    ]
  },
  "reminderEnabled": true,
  "reminderMinutes": 3,
  "startsOn": "2026-07-08",
  "endsOn": null
}
```

### Success

```text
201 Created
```

The recurrence configuration must be validated.

---

## GET /recurring-tasks/:id

Returns a recurring task definition.

### Authentication

Required.

---

## PATCH /recurring-tasks/:id

Updates a recurring task definition.

### Authentication

Required.

The feature implementation must define whether changes affect:

* Future occurrences only
* Existing uncompleted occurrences
* All occurrences

Version 1 should prefer predictable future-occurrence behavior.

---

## DELETE /recurring-tasks/:id

Soft-deletes or deactivates a recurring task.

### Authentication

Required.

### Success

```text
204 No Content
```

Historical generated Tasks must remain preserved.

---

# 19. Category Endpoints

Base path:

```text
/api/v1/categories
```

---

## GET /categories

Returns active user categories.

### Authentication

Required.

---

## POST /categories

Creates a category.

### Authentication

Required.

### Request

```json
{
  "name": "Coding",
  "color": "mission-accent-token",
  "icon": "code"
}
```

### Success

```text
201 Created
```

The backend must validate category ownership and supported input.

---

## PATCH /categories/:id

Updates a category.

### Authentication

Required.

---

## DELETE /categories/:id

Soft-deletes a category.

### Authentication

Required.

### Success

```text
204 No Content
```

The feature contract must define behavior for existing Tasks referencing a deleted Category.

Historical tasks must remain valid.

---

# 20. Reminder Endpoints

Base path:

```text
/api/v1/reminders
```

---

## GET /reminders

Returns reminder schedules for the authenticated user.

### Authentication

Required.

### Query Parameters

May include:

```text
status
date
taskId
```

---

## POST /reminders/:id/snooze

Snoozes a reminder.

### Authentication

Required.

### Request

```json
{
  "minutes": 5
}
```

### Success

```text
200 OK
```

The operation must safely create or update future reminder scheduling.

Repeated equivalent action processing must not create uncontrolled duplicate reminders.

---

## POST /reminders/:id/cancel

Cancels a scheduled reminder.

### Authentication

Required.

### Success

```text
200 OK
```

---

# 21. Push Subscription Endpoints

Base path:

```text
/api/v1/push-subscriptions
```

---

## POST /push-subscriptions

Registers a browser push subscription.

### Authentication

Required.

### Request

```json
{
  "endpoint": "push-endpoint",
  "keys": {
    "p256dh": "key",
    "auth": "auth-key"
  }
}
```

### Success

```text
201 Created
```

Registering an existing active endpoint must not create uncontrolled duplicate subscriptions.

---

## GET /push-subscriptions

Returns the authenticated user's registered subscription metadata.

### Authentication

Required.

Sensitive subscription credentials must not be exposed unnecessarily.

---

## DELETE /push-subscriptions/:id

Deactivates or removes a push subscription.

### Authentication

Required.

### Success

```text
204 No Content
```

The backend must verify subscription ownership.

---

# 22. Notification Endpoints

Base path:

```text
/api/v1/notifications
```

---

## GET /notifications

Returns notification history.

### Authentication

Required.

### Pagination

Cursor pagination.

### Query Parameters

```text
cursor
limit
```

---

## POST /notifications/actions/complete

Processes a secure task-completion action initiated from a supported notification.

### Authentication

Secure action authorization required.

The exact authorization method may use:

* Authenticated application context
* Secure short-lived action token

The notification milestone must freeze the final strategy before implementation.

### Request

Conceptually:

```json
{
  "taskId": "uuid",
  "actionToken": "secure-action-token"
}
```

### Success

```text
200 OK
```

This operation must use the same task-completion business service as normal application completion.

Do not implement separate conflicting completion logic.

---

## POST /notifications/actions/snooze

Processes a secure snooze action.

### Request

Conceptually:

```json
{
  "reminderId": "uuid",
  "minutes": 5,
  "actionToken": "secure-action-token"
}
```

### Success

```text
200 OK
```

The action must be idempotent or safely retryable.

---

## POST /notifications/actions/dismiss

Processes a supported dismiss or skip action.

The exact business meaning of dismiss versus skip must be frozen during notification implementation.

Do not silently treat every notification dismissal as task failure.

---

# 23. Journal Endpoints

Base path:

```text
/api/v1/journal
```

---

## GET /journal/today

Returns today's journal entry.

### Authentication

Required.

The user's timezone determines today's entry date.

---

## GET /journal

Returns journal history.

### Authentication

Required.

### Query Parameters

May include:

```text
date
from
to
```

Pagination may be introduced for growing history.

---

## POST /journal

Creates a daily journal entry.

### Authentication

Required.

### Request

```json
{
  "entryDate": "2026-07-08",
  "title": "A productive day",
  "content": "Today I completed...",
  "gratitude": "I am grateful for...",
  "lessonsLearned": "I learned...",
  "tomorrowPlan": "Tomorrow I will..."
}
```

### Success

```text
201 Created
```

### Errors

```text
JOURNAL_ALREADY_EXISTS
VALIDATION_ERROR
```

Version 1 supports one active primary journal entry per user per date.

---

## PATCH /journal/:id

Updates a journal entry.

### Authentication

Required.

The backend must verify ownership.

---

## DELETE /journal/:id

Soft-deletes a journal entry.

### Authentication

Required.

### Success

```text
204 No Content
```

---

# 24. Mood Endpoints

Base path:

```text
/api/v1/mood
```

---

## GET /mood/today

Returns today's mood.

### Authentication

Required.

---

## GET /mood

Returns mood history.

### Authentication

Required.

### Query Parameters

May include:

```text
from
to
```

---

## PUT /mood/today

Creates or updates today's primary mood.

### Authentication

Required.

### Request

```json
{
  "mood": "HAPPY",
  "note": "Feeling productive today"
}
```

### Success

```text
200 OK
```

Supported mood values:

```text
AMAZING
HAPPY
NORMAL
SAD
TIRED
```

The endpoint uses deterministic upsert behavior for the user's local date.

---

# 25. Analytics Endpoints

Base path:

```text
/api/v1/analytics
```

---

## GET /analytics/daily

Returns daily analytics.

### Authentication

Required.

### Query Parameters

```text
date=YYYY-MM-DD
```

### Response Data

May include:

```json
{
  "totalTasks": 10,
  "completedTasks": 8,
  "unfinishedTasks": 2,
  "completionPercentage": 80,
  "notDonePercentage": 20,
  "xpEarned": 80
}
```

---

## GET /analytics/weekly

Returns weekly analytics.

### Authentication

Required.

### Query Parameters

Optional:

```text
date=YYYY-MM-DD
```

The server resolves the relevant week according to user settings.

---

## GET /analytics/monthly

Returns monthly analytics.

### Authentication

Required.

### Query Parameters

Conceptually:

```text
year=2026
month=7
```

---

## GET /analytics/yearly

Returns yearly analytics.

### Authentication

Required.

### Query Parameters

```text
year=2026
```

Analytics must use real user data.

The API must not return fabricated productivity metrics as real analytics.

---

# 26. Achievement Endpoints

Base path:

```text
/api/v1/achievements
```

---

## GET /achievements

Returns achievement definitions with the authenticated user's unlock state.

### Authentication

Required.

### Response Data

Conceptually:

```json
{
  "achievements": [
    {
      "code": "FIRST_TASK",
      "name": "First Step",
      "description": "Complete your first task",
      "unlocked": true,
      "unlockedAt": "2026-07-08T04:00:00.000Z"
    }
  ]
}
```

Achievement unlock operations are internal business operations.

The client must not have a public endpoint that arbitrarily grants an achievement.

---

# 27. XP Endpoints

Base path:

```text
/api/v1/xp
```

---

## GET /xp

Returns the authenticated user's XP summary.

### Authentication

Required.

### Response Data

Conceptually:

```json
{
  "totalXP": 540
}
```

---

## GET /xp/history

Returns XP transaction history.

### Authentication

Required.

### Pagination

Cursor pagination.

### Query Parameters

```text
cursor
limit
```

The client must not have a public endpoint that arbitrarily awards XP.

XP awards are created by approved backend business rules.

---

# 28. Streak Endpoints

Base path:

```text
/api/v1/streak
```

---

## GET /streak

Returns the authenticated user's streak state.

### Authentication

Required.

### Response Data

```json
{
  "currentStreak": 7,
  "longestStreak": 12,
  "lastQualifyingDate": "2026-07-08"
}
```

The client must not directly modify streak values.

Streak updates are controlled by backend business rules.

---

# 29. Activity History Endpoints

Base path:

```text
/api/v1/activity
```

---

## GET /activity

Returns user activity history.

### Authentication

Required.

### Pagination

Cursor pagination.

### Query Parameters

```text
cursor
limit
type
```

### Response Data

Conceptually:

```json
{
  "items": [
    {
      "id": "uuid",
      "type": "TASK_COMPLETED",
      "entityType": "TASK",
      "entityId": "uuid",
      "occurredAt": "2026-07-08T04:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

Activity history is read-only through the public client API.

The client must not arbitrarily create domain activity events.

---

# 30. Settings Endpoints

Base path:

```text
/api/v1/settings
```

---

## GET /settings

Returns the authenticated user's settings.

### Authentication

Required.

---

## PATCH /settings

Updates supported user settings.

### Authentication

Required.

### Request

Partial update.

Example:

```json
{
  "theme": "SYSTEM",
  "notificationsEnabled": true,
  "defaultReminderMinutes": 3,
  "timezone": "Asia/Kolkata",
  "weekStartsOn": "MONDAY",
  "timeFormat": "12_HOUR"
}
```

### Success

```text
200 OK
```

Timezone changes must be handled carefully.

The feature implementation must define how existing future scheduled reminders are recalculated when a timezone changes.

---

# 31. Health Check Endpoint

Foundation health endpoint:

```text
GET /api/v1/health
```

### Authentication

Public.

### Success

```text
200 OK
```

### Response Data

Conceptually:

```json
{
  "status": "ok",
  "service": "daily-development-tracker-api"
}
```

A database-aware health check may additionally expose a safe database connectivity status.

The health endpoint must not expose secrets or sensitive infrastructure configuration.

---

# 32. Database Health Endpoint Strategy

If a deeper readiness endpoint is required, it may use:

```text
GET /api/v1/health/ready
```

Conceptual response:

```json
{
  "status": "ready",
  "database": "connected"
}
```

Operational endpoint design must avoid exposing unnecessary database details.

Foundation Milestone 01 may implement the basic health endpoint and safe database connectivity verification.

---

# 33. Notification Action Reuse Rule

Notification completion must reuse the same task completion service as application completion.

Correct architecture:

```text
Application Complete Endpoint
             │
             ▼
      Complete Task Service
             ▲
             │
Notification Complete Action
```

Incorrect architecture:

```text
Application Completion Logic

Separate Notification Completion Logic
```

There must not be two conflicting task-completion implementations.

---

# 34. Ownership Enforcement

Every user-owned resource endpoint must enforce ownership.

Examples:

```text
GET /tasks/:id
PATCH /tasks/:id
DELETE /tasks/:id
PATCH /journal/:id
DELETE /push-subscriptions/:id
```

The backend resolves the authenticated user from trusted authentication context.

The client must not gain access by changing an ID.

---

# 35. API Rate Limiting

Rate limiting should be applied according to endpoint risk.

High-priority endpoints include:

```text
POST /auth/register
POST /auth/login
POST /notifications/actions/complete
POST /notifications/actions/snooze
```

The exact rate-limit values must be defined during the relevant implementation milestone.

Production security must not rely only on frontend controls.

---

# 36. API Logging

The backend should log:

* Request method
* Route
* Status
* Duration
* Request correlation context where supported

The backend must not log:

* Passwords
* Full JWT tokens
* JWT secrets
* Private keys
* Sensitive push credentials

Error logs should include enough context for debugging without exposing user secrets.

---

# 37. API Performance

API implementation must avoid:

* N+1 database queries
* Returning unlimited history
* Recalculating expensive analytics unnecessarily
* Returning unnecessary sensitive fields
* Excessive payload sizes

Use:

* Database indexes
* Pagination
* Selected fields
* Derived statistics where justified
* Efficient Prisma queries

---

# 38. API Testing Priorities

Critical API flows requiring strong verification include:

1. Registration
2. Login
3. User ownership enforcement
4. Planner retrieval
5. Task creation
6. Task update and reminder rescheduling
7. Task completion idempotency
8. Recurring task generation
9. Push subscription registration
10. Notification completion action
11. Reminder snooze
12. Journal daily uniqueness
13. Mood upsert
14. XP duplicate prevention
15. Achievement duplicate prevention
16. Streak calculation
17. Analytics correctness

Tests should protect behavior rather than chase meaningless coverage percentages.

---

# 39. Foundation Milestone 01 API Scope

Foundation Milestone 01 must implement only infrastructure API requirements.

Approved API scope:

```text
GET /api/v1/health
```

A safe database readiness check may be implemented if required by the foundation contract.

Foundation Milestone 01 must not implement:

* Auth endpoints
* Dashboard endpoints
* Planner endpoints
* Task endpoints
* Notification business endpoints
* Journal endpoints
* Mood endpoints
* Analytics endpoints
* XP endpoints
* Achievement endpoints
* Streak endpoints

Those endpoints belong to later approved milestones.

---

# 40. API Change Policy

This API Specification is frozen for Version 1.

AI tools must not independently:

* Replace REST with GraphQL
* Remove API versioning
* Rename core endpoint groups
* Expose public XP award endpoints
* Expose public achievement grant endpoints
* Trust client-provided user IDs
* Implement duplicate task completion logic
* Return inconsistent response shapes

If implementation discovers a genuine API blocker:

1. Document the blocker.
2. Identify affected endpoints.
3. Explain compatibility impact.
4. Propose the smallest viable change.
5. Review the change.
6. Update this document if approved.
7. Implement the approved change.

---

# 41. Version 1 API Surface

The approved Version 1 API groups are:

```text
/api/v1/auth
/api/v1/dashboard
/api/v1/planners
/api/v1/tasks
/api/v1/recurring-tasks
/api/v1/categories
/api/v1/reminders
/api/v1/push-subscriptions
/api/v1/notifications
/api/v1/journal
/api/v1/mood
/api/v1/analytics
/api/v1/achievements
/api/v1/xp
/api/v1/streak
/api/v1/activity
/api/v1/settings
/api/v1/health
```

---

# 42. Final API Decision

Daily Development Tracker Version 1 uses:

```text
React PWA
    │
    ▼
REST API
    │
    ▼
/api/v1
    │
    ├── Authentication
    ├── Dashboard
    ├── Planning
    ├── Tasks
    ├── Recurring Activities
    ├── Categories
    ├── Reminders
    ├── Push Subscriptions
    ├── Notifications
    ├── Journal
    ├── Mood
    ├── Analytics
    ├── Achievements
    ├── XP
    ├── Streak
    ├── Activity History
    ├── Settings
    └── Health
```

The API prioritizes:

* Security
* Consistency
* Versioning
* Validation
* Idempotency
* Ownership
* Predictable frontend integration
* Maintainability

---

# DOCUMENT STATUS

**Version:** 1.0

**Status:** FROZEN

**Change Policy:** API contract changes require explicit architecture and API review.

This document is the source of truth for Daily Development Tracker Version 1 REST API.

````

