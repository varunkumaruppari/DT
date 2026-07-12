# Architecture Document

## Daily Development Tracker

**Version:** 1.0  
**Status:** FROZEN  
**Document Type:** Software Architecture Specification  
**Architecture Style:** Modular Monolith / Feature-First Monorepo

---

# 1. Architecture Objective

The architecture of Daily Development Tracker must provide a clean, scalable, maintainable, and production-ready foundation for Version 1.

The architecture must support:

- Rapid MVP development
- Clear feature ownership
- Type safety
- Reliable reminders
- Web push notifications
- Daily planning
- Analytics
- Gamification
- Future product growth
- Local Docker development
- Cloud deployment

The system must avoid unnecessary microservice complexity during Version 1.

The official Version 1 architecture is a modular monolith implemented inside a TypeScript monorepo.

---

# 2. Architecture Principles

The application must follow these principles:

1. Feature-first organization
2. Type safety first
3. Clear separation of concerns
4. Single source of truth
5. Composition over inheritance
6. Explicit service boundaries
7. Dependency direction must remain clear
8. Infrastructure must not control business rules
9. API contracts must remain consistent
10. Security by default
11. Accessibility by default
12. Mobile-first frontend development
13. Performance-conscious implementation
14. Future compatibility without premature implementation
15. Simplicity over unnecessary complexity

---

# 3. High-Level Architecture

The system consists of four primary layers:

```text
Client Layer
     │
     ▼
React Progressive Web Application
     │
     ▼
REST API
     │
     ▼
Express Application
     │
     ▼
Prisma ORM
     │
     ▼
PostgreSQL
```

Supporting infrastructure includes:

```text
Background Job Processing
Notification Scheduling
Web Push Delivery
Activity Logging
Analytics Calculation
Docker Development Environment
```

The frontend must communicate with the backend through the documented REST API.

The frontend must not directly access PostgreSQL.

---

# 4. Technology Stack

## Frontend

```text
React
TypeScript
Vite
Tailwind CSS
shadcn/ui foundations
Mission UI design system
React Router
TanStack Query
React Hook Form
Zod
Framer Motion
Axios
Lucide Icons
```

## Backend

```text
Node.js
Express
TypeScript
Prisma ORM
Zod
JWT authentication foundation
Helmet
CORS
Morgan (structured HTTP logging)
```

## Database

```text
Local Database:      PostgreSQL through Docker
Production Database: Neon PostgreSQL
```

## Monorepo

```text
npm Workspaces
```

## Development Infrastructure

```text
Docker
Docker Compose
ESLint
Prettier
EditorConfig
```

## Deployment

```text
Frontend: Vercel
Backend:  Railway or Render
Database: Neon
```

---

# 5. Monorepo Architecture

The project must use the following high-level repository structure:

```text
daily-development-tracker/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   └── shared/
│
├── docs/
├── contracts/
├── prompts/
│
├── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

The structure must not be redesigned without architectural review.

---

# 6. Workspace Responsibilities

## apps/web

Owns the browser application.

Responsibilities:

```text
React application
Routing
Application layouts
Feature interfaces
Server-state consumption
Client-side interaction state
PWA integration
Service worker integration
Web push client integration
Mission UI implementation
```

The web application must not contain backend business logic.

## apps/api

Owns the REST API and backend application.

Responsibilities:

```text
HTTP API
Authentication
Authorization
Request validation
Business use cases
Persistence coordination
Notification scheduling
Push delivery coordination
Activity logging
XP logic
Streak logic
Analytics coordination
Background processing
```

The backend application must not contain React or browser UI code.

## packages/shared

Owns code that is safe and useful across multiple workspaces.

Examples:

```text
Shared TypeScript types
API contracts
Shared enums
Shared constants
Safe validation primitives where appropriate
```

The shared package must not expose:

```text
Server secrets
Database clients
Node-only infrastructure
Browser-only UI components
```

## apps/api/prisma

Owns database schema and migration infrastructure.

Responsibilities:

```text
Prisma schema   (apps/api/prisma/schema.prisma)
Migrations      (apps/api/prisma/migrations/)
Seed scripts    (apps/api/prisma/seed.ts when required)
```

Prisma is the official ORM.

Direct SQL in application code is prohibited unless explicitly justified and reviewed.

---

# 7. Frontend Architecture

The frontend must use feature-first organization.

Recommended high-level structure:

```text
apps/web/src/
│
├── app/
├── features/
├── components/
│   └── ui/
├── layouts/
├── lib/
├── hooks/
├── styles/
└── types/
```

Reusable Mission UI primitives live in `apps/web/src/components/ui/` during Version 1 foundation.

---

# 8. Frontend App Layer

The app layer owns application composition.

Examples:

```text
Router configuration
Query client configuration
Theme provider
Global error boundaries
Application providers
```

The app layer must not become a dumping ground for feature logic.

---

# 9. Frontend Feature Architecture

Each major feature should own its implementation.

Example:

```text
features/
├── auth/
├── dashboard/
├── planner/
├── notifications/
├── journal/
├── mood/
├── analytics/
├── gamification/
└── settings/
```

A feature may contain:

```text
feature-name/
├── api/
├── components/
├── hooks/
├── schemas/
├── types/
└── utils/
```

Only create subfolders that are actually required.

Avoid empty architecture for architecture's sake.

---

# 10. Frontend Component Philosophy

Components must follow composition-first design.

Prefer:

```text
PlannerCard
ProgressRing
TaskRow
StreakWidget
XPProgress
```

Avoid large components that own unrelated concerns.

Where practical, components should remain focused and easy to test.

Reusable primitives belong in `apps/web/src/components/ui/`.

Feature-specific components belong inside their feature.

---

# 11. Frontend State Management

The frontend uses two state categories.

## Server State

Use TanStack Query.

Examples:

```text
Current user
Daily planner
Tasks
Journal entries
Mood entries
Analytics
Achievements
```

TanStack Query is responsible for:

```text
Fetching
Caching
Refetching
Mutation coordination
Server synchronization
```

Do not duplicate server state in a client store without a justified requirement.

## Client State

React Context and React local state are sufficient for Milestone 01.

Zustand may be introduced in a later milestone only when meaningful client-side state shared across distant components justifies it.

Simple local component state should remain in React.

Do not create a global store for every feature.

---

# 12. Forms and Validation

Use React Hook Form for meaningful forms.

Use Zod for validation schemas.

Client validation improves user experience.

Server validation remains mandatory.

The server must never trust client validation.

Where appropriate, safe validation contracts may be shared.

---

# 13. API Client Architecture

The frontend must use a centralized API client.

Axios is the approved HTTP client.

The API client should support:

```text
Base URL configuration
Authentication token handling
Consistent response handling
Standard error normalization
```

Feature API modules should consume the centralized client.

Do not scatter raw API configuration across components.

React components should not directly build arbitrary API URLs.

---

# 14. Backend Architecture

The backend must use feature-first modular architecture.

Recommended structure:

```text
apps/api/src/
│
├── config/
├── features/
├── middleware/
├── lib/
└── types/
```

---

# 15. Backend Application Layer

The application bootstrap owns:

```text
Express application creation
Global middleware
Route registration
Error middleware
Server startup
```

Application bootstrap must remain small.

Business logic must not be implemented in the main server file.

---

# 16. Backend Feature Architecture

Each backend feature should own its API and business logic.

Example:

```text
features/
├── auth/
├── dashboard/
├── planner/
├── tasks/
├── recurring-tasks/
├── categories/
├── journal/
├── mood/
├── notifications/
├── analytics/
├── achievements/
├── xp/
├── streak/
├── activity/
└── settings/
```

A backend feature may contain:

```text
feature-name/
├── controller.ts
├── service.ts
├── repository.ts
├── routes.ts
├── schema.ts
└── types.ts
```

Only create files that have a real responsibility.

Do not create meaningless layers.

---

# 17. Controller Rules

Controllers own HTTP concerns.

Controllers may:

```text
Read validated request input
Call application services
Select HTTP status codes
Return standard API responses
```

Controllers must not contain complex business logic.

Controllers must not directly implement Prisma queries unless explicitly justified for an extremely simple infrastructure endpoint.

---

# 18. Service Rules

Services own application use cases and business coordination.

Examples:

```text
Complete a task
Create today's planner
Generate recurring tasks
Snooze a reminder
Unlock an achievement
Update a streak
```

Services may coordinate:

```text
Repositories
Transactions
Activity logging
XP logic
Notification scheduling
```

Business rules should be explicit and testable.

---

# 19. Repository Rules

Repositories own persistence access where a feature requires meaningful persistence abstraction.

Repositories may:

```text
Query Prisma
Create records
Update records
Execute feature-specific persistence operations
```

Do not create repository classes that only rename one Prisma method without adding architectural value.

The architecture follows practical abstraction rather than ceremonial abstraction.

---

# 20. Database Architecture

PostgreSQL is the authoritative database.

Prisma is the approved ORM.

The database design must follow the frozen Database Design and ERD documents.

Database rules include:

```text
UUID primary keys
Explicit relationships
Foreign key integrity
Controlled enums
Audit timestamps
Soft deletes for defined major entities
Appropriate unique constraints
Appropriate indexes
Transactional consistency for multi-record business operations
```

---

# 21. Single Source of Truth

Each business concept must have one authoritative source.

Examples:

```text
Task completion:      TaskCompletion
XP:                   XPTransaction history
Achievement ownership: UserAchievement
```

The application must avoid maintaining conflicting representations of the same business state.

Cached or summarized data must be derived from authoritative source data.

---

# 22. API Architecture

The backend exposes a REST API.

Base path:

```text
/api/v1
```

The frozen API Specification defines endpoint contracts.

Future breaking API changes must use a new version namespace.

Example:

```text
/api/v2
```

Do not silently introduce breaking changes to Version 1 endpoints.

---

# 23. API Response Standards

Successful responses use a consistent structure:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Failed responses use a consistent structure:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": []
}
```

Error codes must be stable enough for frontend handling.

Raw internal stack traces must never be returned to production clients.

---

# 24. Request Validation

Every external request containing user-controlled input must be validated.

Zod is the approved validation framework.

Validation should occur before business services process the request.

Validation failures return a consistent API error response.

---

# 25. Authentication Architecture

Version 1 uses JWT-based authentication.

Authentication responsibilities include:

```text
Secure password hashing
Credential verification
Access token creation
Authenticated user resolution
Protected route middleware
```

Authentication implementation belongs to the auth feature milestone.

Authorization decisions must be enforced on the backend.

The frontend must never be trusted to enforce data ownership.

---

# 26. Authorization and Ownership

Every user-owned resource operation must verify ownership.

Examples:

```text
A user must not:
  Read another user's planner
  Edit another user's task
  Read another user's journal
  Modify another user's mood entry
  Access another user's settings
```

Ownership validation must occur on the server.

Client-provided userId values must not be trusted for authorization.

---

# 27. Notification Architecture

Notifications are a critical product feature.

The architecture must separate:

```text
Task Scheduling
      │
      ▼
Reminder Schedule
      │
      ▼
Notification Queue
      │
      ▼
Background Processor
      │
      ▼
Push Delivery Provider
      │
      ▼
User Device
```

The server must not rely on an open browser tab to determine when reminders should be sent.

---

# 28. Notification Service Abstraction

Push delivery must use a provider abstraction.

Conceptually:

```text
PushNotificationProvider
```

Responsibilities:

```text
Send push notification
Normalize provider responses
Surface delivery failures
```

Business services must not depend directly on provider-specific implementation details.

This allows future provider replacement without rewriting reminder business logic.

---

# 29. Notification Queue

Notification delivery must use a queue-oriented data model defined by the frozen database design.

The queue supports:

```text
Pending delivery
Processing
Sent state
Failure state
Retry-aware handling
Snooze-generated scheduling
```

Version 1 does not require enterprise distributed queue infrastructure unless deployment requirements justify it.

A PostgreSQL-backed queue strategy is acceptable for Version 1.

---

# 30. Background Job Architecture

Background work includes:

```text
Due reminder processing
Notification delivery
Retry handling
Recurring task generation
Daily statistics updates where required
End-of-day processing where implemented
```

Background work must be separated from HTTP request handling.

The architecture may initially run a background worker as part of the backend deployment strategy if operationally appropriate.

The implementation must keep worker responsibilities isolated so they can be separated into another process in the future.

---

# 31. Reminder Time Strategy

Task scheduling is timezone-sensitive.

Every user must have a timezone.

Scheduled user-facing times must be interpreted using the user's configured timezone.

Reminder calculation concept:

```text
Scheduled Activity Time
-
Reminder Offset
=
Reminder Due Time
```

Default reminder offset:

```text
3 minutes
```

The server must avoid assuming every user is in the server's timezone.

---

# 32. PWA Architecture

The frontend must include a Progressive Web App foundation.

The PWA architecture includes:

```text
Web app manifest
Service worker
Installable application metadata
Application icons
Push notification integration foundation
```

PWA behavior must be implemented using a maintainable Vite-compatible strategy.

The service worker must not be treated as a place for application business logic.

---

# 33. Web Push Architecture

Web push requires:

```text
Browser Permission
       │
       ▼
Push Subscription
       │
       ▼
Backend Registration
       │
       ▼
Stored Subscription
       │
       ▼
Notification Processor
       │
       ▼
Push Provider
       │
       ▼
Service Worker
       │
       ▼
Notification
```

Push subscription data is user-owned data.

Expired or invalid subscriptions must be handled safely.

Notification action handling must be designed to support:

```text
Complete
Snooze
Dismiss or Skip
```

Platform capabilities may differ.

The application must provide graceful fallback behavior.

---

# 34. Notification Action Security

A notification action must not blindly modify data.

Actions must resolve to secure server-side operations.

Task completion from a notification must:

```text
Identify the intended task
Validate the action
Prevent duplicate completion
Enforce secure action authorization
Record the completion method
Update related business state
```

The implementation strategy may use authenticated application context or secure short-lived action tokens according to platform requirements.

The final implementation must be security-reviewed.

---

# 35. Idempotency

Important state-changing actions must be safe to retry.

Examples:

```text
Complete task
Snooze reminder
Process notification queue item
Unlock achievement
```

Repeated equivalent requests must not create duplicate business records.

Database constraints and transactional logic should be used where appropriate.

---

# 36. Activity Logging

Important domain events should create activity history records.

Examples:

```text
Task completed
Task skipped
Journal created
Mood logged
XP earned
Achievement unlocked
Streak updated
Notification snoozed
```

Activity logging should be coordinated by backend services.

Controllers must not independently invent activity events.

---

# 37. XP Architecture

XP uses a transaction-based model.

Conceptually:

```text
Business Event
     │
     ▼
XP Rule
     │
     ▼
XPTransaction
```

Current XP is derived or safely summarized from transaction history.

XP business logic must avoid duplicate rewards for the same idempotent event.

---

# 38. Achievement Architecture

Achievements use:

```text
Achievement
      │
      ▼
Achievement Evaluation
      │
      ▼
UserAchievement
```

Achievement definitions are master data.

UserAchievement records ownership and unlock time.

Unique database constraints must prevent duplicate unlocks.

Achievement evaluation belongs to backend business logic.

---

# 39. Streak Architecture

Streak calculation must be deterministic.

Streak data includes:

```text
Current streak
Longest streak
Last qualifying completion date
```

The exact qualification rule must be documented during feature implementation before streak logic is coded.

Streak updates must be safe to retry.

---

# 40. Analytics Architecture

Analytics must use authoritative user activity data.

Primary sources include:

```text
Daily planners
Tasks
Task completions
Mood entries
XP transactions
Streak data
```

Daily statistics may be used as derived summary data.

Analytics services must not present fake generated values as real user analytics.

---

# 41. Daily Statistics Architecture

DailyStatistics is derived data.

Authoritative source data remains:

```text
Planner
Tasks
TaskCompletion
XPTransaction
Relevant tracked events
```

Daily statistics may improve:

```text
Dashboard speed
Analytics queries
End-of-day summaries
```

Statistics updates must use explicit recalculation or transactional update strategies.

Silent divergence from source data is unacceptable.

---

# 42. Error Handling Architecture

The backend must use centralized error handling.

Conceptually:

```text
Request
   │
   ▼
Validation
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Known Application Error
   │
   ▼
Global Error Middleware
   │
   ▼
Standard API Error
```

Expected errors should use typed application errors.

Examples:

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
TASK_NOT_FOUND
PLANNER_NOT_FOUND
DUPLICATE_COMPLETION
```

Unexpected errors must be logged.

Production responses must not expose internal implementation details.

---

# 43. Logging Architecture

The backend must use structured logging.

Logs should support:

```text
Request context
Error context
Background job context
Notification processing context
```

Sensitive information must not be logged.

Do not log:

```text
Passwords
JWT secrets
Full authentication tokens
Private keys
```

Development logging may be human-readable.

Production logging should remain structured and machine-processable.

---

# 44. Environment Strategy

Environment configuration must be explicit.

Required environments:

```text
Local development
Test
Production
```

Environment variables must be documented in:

```text
.env.example
```

Secrets must never be committed.

Configuration must be validated during application startup.

The application should fail fast when required configuration is missing.

---

# 45. Local Development Architecture

Local development uses Docker Compose.

The target developer workflow is:

```text
Clone Repository
      │
      ▼
Configure Environment
      │
      ▼
npm install
      │
      ▼
docker compose up
      │
      ▼
Application Available
```

The development environment should support:

```text
Web application
API server
PostgreSQL
```

The local database must run in Docker.

---

# 46. Docker Architecture

Docker is part of the official development architecture.

Services:

```text
postgres
```

Optional database administration tools may be added only when justified.

Docker requirements:

```text
Clear docker-compose.yml
Reproducible setup
Appropriate .dockerignore where needed
PostgreSQL health check
Service dependency handling
Persistent local database volume
```

The application must not hardcode Docker-specific hostnames into general application logic.

Environment configuration controls service URLs.

---

# 47. Production Deployment Architecture

Production uses managed services.

```text
GitHub
   │
   ├──────────────► Vercel
   │                  │
   │                  ▼
   │             React PWA
   │
   └──────────────► Railway or Render
                       │
                       ▼
                   Express API
                       │
                       ▼
                  Neon PostgreSQL
```

Frontend: Vercel

Backend: Railway or Render

Database: Neon PostgreSQL

The production database must not depend on the local Docker PostgreSQL container.

---

# 48. Database Connection Strategy

Prisma uses DATABASE_URL.

```text
Local:      Docker PostgreSQL connection string
Production: Neon PostgreSQL connection string
```

Application code must not change between local and production database providers.

Environment configuration selects the connection target.

---

# 49. Security Architecture

Security requirements include:

```text
Password hashing
Input validation
Backend authorization
Secure secret handling
Helmet security headers
Controlled CORS configuration
HTTPS in production
Secure authentication design
Safe error responses
Dependency review
Rate limiting where required by feature risk
```

Security must be considered during feature implementation.

Security must not be postponed until deployment.

---

# 50. CORS Strategy

CORS must use explicit allowed origins.

Development origins may include the local frontend.

Production origins must include only approved frontend deployments.

Do not use unrestricted production CORS without explicit architectural approval.

---

# 51. Rate Limiting Strategy

Rate limiting should be applied according to endpoint risk.

High-priority candidates include:

```text
Login
Registration
Notification action endpoints
Other abuse-sensitive endpoints
```

The foundation should allow rate limiting to be introduced cleanly.

Feature milestones determine exact policies.

---

# 52. Testing Strategy

The architecture must support:

```text
Unit tests
Integration tests
API tests
Frontend component tests where valuable
End-to-end tests for critical flows
```

Testing should prioritize business-critical workflows.

Examples:

```text
Authentication
Task completion
Recurring task generation
Reminder scheduling
Notification action handling
XP idempotency
Streak calculation
```

Do not chase meaningless test coverage percentages.

Tests should protect important behavior.

---

# 53. CI Architecture

GitHub Actions is the approved CI platform.

The foundation must support a CI pipeline for:

```text
Dependency installation
Type checking
Linting
Build verification
```

Testing stages may expand as feature tests are introduced.

Production deployment automation may be configured according to the selected hosting platforms.

---

# 54. Performance Architecture

Frontend performance principles:

```text
Avoid unnecessary global state
Avoid unnecessary re-renders
Lazy-load appropriate routes or heavy features
Optimize images and assets
Maintain layout stability
Use purposeful animations
Respect reduced-motion preferences
```

Backend performance principles:

```text
Use database indexes
Avoid N+1 query patterns
Use pagination
Use cursor pagination for growing activity history
Avoid repeated expensive analytics calculations
Use derived statistics where justified
```

---

# 55. Accessibility Architecture

Accessibility is part of the frontend architecture.

Mission UI components must support:

```text
Keyboard interaction
Focus visibility
Semantic HTML
Accessible labels
Color contrast
Reduced motion where applicable
```

Accessibility fixes must not be treated as optional polish.

---

# 56. Design System Architecture

Mission UI is the official project design language.

During Version 1 foundation, reusable Mission UI primitives live in:

```text
apps/web/src/components/ui/
```

Tailwind CSS provides styling infrastructure.

shadcn/ui may provide accessible component foundations.

The application must not ship as a default shadcn/ui theme.

Mission UI owns:

```text
Design tokens
Component visual language
Motion behavior
Interaction patterns
Layout consistency
```

Feature-specific presentation remains inside frontend features.

---

# 57. Dependency Rules

Dependencies must have a clear purpose.

Before adding a dependency, consider:

```text
Is it already solved by the current stack?
Does the dependency reduce meaningful implementation risk?
Is it actively maintained?
Does it significantly increase bundle or operational complexity?
Can the requirement be solved clearly without it?
```

Do not install random dependencies because a tutorial uses them.

---

# 58. Architecture Change Policy

This architecture is frozen for Version 1.

Claude, Antigravity, or another AI tool must not independently redesign:

```text
Monorepo structure
Core technology stack
Database provider
ORM
API style
State-management strategy
Deployment architecture
```

If implementation discovers a genuine blocker:

```text
Document the blocker.
Explain the affected architecture.
Propose the smallest viable change.
Review the change.
Update the architecture document.
Only then implement the change.
```

---

# 59. AI Implementation Rules

AI tools are implementation assistants.

They are not the source of truth for architecture.

AI tools must:

```text
Read relevant frozen documents
Follow the active milestone contract
Limit changes to milestone scope
Avoid unrelated refactors
Explain architectural conflicts
Preserve existing working behavior
Validate generated work
```

AI tools must not silently invent architecture.

---

# 60. Version 1 Architecture Decision

The official Version 1 architecture is:

```text
TypeScript Monorepo (npm Workspaces)
         │
         ├── React + Vite PWA            (apps/web)
         │
         ├── Express REST API             (apps/api)
         │
         ├── Prisma ORM + PostgreSQL      (apps/api/prisma)
         │
         ├── Shared TypeScript Package    (packages/shared)
         │
         ├── Mission UI
         │
         ├── PostgreSQL-Backed Notification Queue
         │
         ├── Background Processing
         │
         └── Docker Development Environment
```

The architecture prioritizes:

```text
MVP delivery
Clean engineering
Reliable reminders
Maintainability
Type safety
Future product growth
```

---

# DOCUMENT STATUS

**Version:** 1.0

**Status:** FROZEN

**Change Policy:** Architectural changes require explicit technical review.

This document is the source of truth for Daily Development Tracker Version 1 software architecture.
