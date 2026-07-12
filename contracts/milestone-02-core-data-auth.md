


# Milestone 02 — Core Data Model and Authentication

## 1. Milestone Identity

**Project:** Daily Development Tracker

**Milestone:** 02

**Name:** Core Data Model and Authentication

**Status:** APPROVED FOR IMPLEMENTATION

**Implementation Scope:** DATABASE BUSINESS SCHEMA, AUTHENTICATION, USER SETTINGS FOUNDATION, AND AUTHENTICATED APPLICATION ENTRY ONLY

**Repository Foundation:** Milestone 01 frozen and verified

**Change Policy:** Milestone scope changes require explicit project review.

This document is the implementation contract for Daily Development Tracker Milestone 02.

---

## 2. Milestone Objective

Establish the authoritative Version 1 relational data model and implement secure user authentication so that every future Daily Development Tracker feature can operate against a real authenticated user identity.

The milestone must create the database foundation defined by the frozen Database Design and ERD while implementing only the authentication and user-settings application behavior approved for this milestone.

The milestone must provide:

- Authoritative Prisma Version 1 business schema
- Real PostgreSQL migration
- User registration
- User login
- Secure password hashing
- JWT authentication
- Authenticated current-user retrieval
- Authentication middleware
- Protected backend route foundation
- User settings persistence foundation
- Premium Mission UI authentication experience
- Protected frontend routing
- Authenticated application entry
- Logout behavior
- Real frontend/backend authentication integration

The milestone must NOT implement planner, task, reminder, notification, journal, mood, analytics, XP, streak, or achievement business behavior.

---

## 3. Authoritative Documents

Before implementation, the implementation agent must read completely:

- `docs/01_PRD.md`
- `docs/02_Architecture.md`
- `docs/03_Database_Design.md`
- `docs/04_ERD.md`
- `docs/05_API_Specification.md`
- `docs/06_UI_UX_Design_System.md`
- `docs/07_Project_Constitution.md`
- `contracts/milestone-01-foundation.md`
- `contracts/milestone-02-core-data-auth.md`

The documents are frozen unless explicitly approved otherwise.

The Project Constitution source-of-truth hierarchy applies.

The Prisma schema must follow the frozen Database Design and ERD.

The authentication API must follow the frozen API Specification.

Mission UI remains the visual source of truth.

The implementation agent must not silently resolve genuine frozen-document conflicts.

If a genuine conflict prevents safe implementation, implementation of the conflicting area must stop and the exact conflict must be reported.

---

## 4. Milestone 01 Preservation Rule

Milestone 01 is frozen and verified.

The implementation must preserve:

- npm Workspaces
- `apps/web`
- `apps/api`
- `packages/shared`
- `apps/api/prisma/`
- Strict TypeScript
- React + Vite
- Express + TypeScript
- Prisma PostgreSQL foundation
- Docker PostgreSQL
- Standard API response infrastructure
- Centralized backend error handling
- Centralized frontend Axios infrastructure
- React Router
- TanStack Query
- Mission UI tokens
- LIGHT / DARK / SYSTEM theme foundation
- PWA foundation
- Service worker foundation
- Existing health endpoints
- Existing database readiness verification

Do not replace the Milestone 01 architecture.

Do not migrate to pnpm.

Do not introduce Turborepo.

Do not create `apps/server`.

Do not create `packages/ui`.

Do not create a root-level Prisma schema.

Do not install Zustand.

Do not break:

- `GET /api/v1/health`
- `GET /api/v1/health/ready`

---

## 5. Approved Milestone 02 Scope

Milestone 02 includes five implementation areas:

1. Version 1 Prisma business schema
2. Authentication backend
3. User settings persistence foundation
4. Authentication frontend
5. Protected application entry

Only the approved behavior in this contract may be implemented.

---

## 6. Version 1 Prisma Business Schema

Replace the empty Milestone 01 business schema with the authoritative Version 1 schema defined by:

- `docs/03_Database_Design.md`
- `docs/04_ERD.md`

The implementation agent must derive exact model names, field names, types, nullability, defaults, enums, relations, indexes, and uniqueness constraints from those frozen documents.

Do not redesign the database.

Do not rename authoritative entities for stylistic preference.

Do not remove documented relations.

Do not add speculative entities.

Do not add duplicate source-of-truth fields.

The Version 1 schema is expected to include the authoritative documented entities for concepts including:

- User
- UserSettings
- Task
- TaskCompletion
- Category
- ReminderSchedule
- NotificationQueue
- PushSubscription
- JournalEntry
- MoodEntry
- XP transaction/history
- Achievement
- UserAchievement
- Streak

Use the exact authoritative model naming defined by the frozen Database Design and ERD.

If the documents define a model as `XPTransaction`, use `XPTransaction`.

If the documents define a different exact authoritative name, follow the frozen documents.

Do not infer model names from this contract when the frozen database documents are more specific.

---

## 7. Database Source-of-Truth Rules

The following source-of-truth decisions are mandatory.

### Task Completion

Task completion must be represented by the authoritative `TaskCompletion` event/history model defined by the frozen database documents.

Do not add:

```text
Task.completed
Task.isCompleted
Task.done
````

or an equivalent completion boolean as the source of truth.

### XP

XP must use the authoritative XP transaction/history model.

Current XP must not be stored as an independently mutable duplicate source of truth if the frozen database design defines XP as transaction-derived.

Do not add a speculative `User.xp` field.

### Daily Statistics

Daily completion statistics remain derived from authoritative task and completion data unless the frozen Database Design explicitly defines persisted data for a specific responsibility.

Do not create a duplicate daily-statistics source of truth.

### Achievements

User achievement ownership must follow the authoritative `UserAchievement` relationship and uniqueness rules.

### Streak

Streak persistence must follow the exact frozen database design.

Do not calculate or implement streak business behavior during Milestone 02.

### User Settings

User settings must follow the exact frozen `UserSettings` schema and user relationship.

Do not use browser-only storage as the authoritative source of truth for persisted user settings after the settings API is implemented.

Theme behavior may retain the Milestone 01 local fallback only where required for unauthenticated application startup.

---

## 8. Prisma Schema Quality

The Prisma schema must:

* Use PostgreSQL
* Remain in `apps/api/prisma/schema.prisma`
* Use the existing environment-based database configuration
* Define documented relations correctly
* Define documented foreign keys correctly
* Define documented cascade/restrict behavior correctly
* Define documented unique constraints
* Define documented indexes
* Define documented enums
* Use timestamps consistently with the frozen database design
* Preserve required append-only/history concepts
* Avoid duplicate sources of truth

Do not create fields merely because they are convenient for frontend rendering.

Do not add denormalized counters without frozen-document authority.

Do not add fake seed records.

---

## 9. Prisma Migration

Create a real Prisma migration for the Version 1 business schema.

Use the approved development migration workflow.

The migration must be generated through Prisma.

Do not manually create PostgreSQL tables as a substitute for Prisma migration.

Do not modify Prisma migration SQL after generation unless a verified Prisma limitation requires a deliberate correction.

If migration SQL is manually adjusted, the exact reason must be reported.

The migration must execute successfully against the Milestone 01 Docker PostgreSQL database.

After migration, verify the database schema through Prisma and PostgreSQL-compatible inspection where practical.

---

## 10. Prisma Generation and Validation

The implementation must execute and verify:

* Prisma validation
* Prisma generation
* Prisma migration

The Prisma Client must be regenerated after schema changes.

The existing controlled Prisma Client infrastructure must be preserved.

Do not create Prisma Client instances inside controllers or route handlers.

---

## 11. Authentication Strategy

Implement Version 1 email/password authentication using the strategy explicitly approved by the frozen Architecture and API Specification.

The implementation must use:

* Email identity
* Secure password hashing
* JWT authentication
* Backend authentication middleware
* Protected backend request identity
* Protected frontend routing

The exact token transport and persistence strategy must follow the frozen Architecture and API Specification.

Do not silently switch between:

* localStorage
* sessionStorage
* HTTP-only cookies
* in-memory-only token storage

If the frozen documents define the strategy, follow it exactly.

If the frozen documents contain a genuine unresolved contradiction about JWT transport or persistence, stop authentication implementation and report the conflict.

Do not invent refresh-token architecture unless explicitly defined by the frozen documents.

---

## 12. Password Security

Use a maintained password-hashing library compatible with the approved Node.js runtime.

Follow the frozen Architecture/API requirements for bcrypt or the documented password hashing strategy.

Passwords must never be stored in plaintext.

Passwords must never be returned from APIs.

Password hashes must never be returned from APIs.

Password values must not be logged.

Password hashes must not be logged.

Registration must hash the password before persistence.

Login must compare the submitted password against the stored hash using the approved password library.

Do not implement reversible password encryption.

---

## 13. JWT Security

JWT configuration must use environment variables.

Milestone 02 runtime may require the JWT secret defined by the frozen architecture.

The JWT secret must not be hardcoded.

The JWT secret must not be placed in:

* frontend source
* `packages/shared`
* `.env.example` as a real secret
* committed local environment files

`.env.example` may contain a safe placeholder.

JWT payload contents must follow the frozen architecture/API specification.

Do not put sensitive user data in the JWT.

Do not place password data or password hashes in the JWT.

JWT expiration must follow the frozen architecture/API specification.

If an expiration value is configurable according to the architecture, validate it appropriately.

---

## 14. Authentication API Scope

Implement only the authentication endpoints defined by the frozen API Specification and required for Version 1 authentication.

Expected authentication responsibilities include:

* Register
* Login
* Current authenticated user

Use the exact routes, HTTP methods, request DTOs, response DTOs, and status codes defined by `docs/05_API_Specification.md`.

Do not invent alternate route names.

Do not implement:

* Google OAuth
* GitHub OAuth
* Apple login
* Magic links
* OTP login
* Password reset
* Email verification
* Multi-factor authentication
* Refresh-token rotation

unless explicitly required by the frozen Version 1 API Specification.

Do not create placeholder endpoints for future authentication features.

---

## 15. Registration Behavior

Registration must:

* Validate the request using Zod
* Normalize email where required by the frozen specification
* Enforce unique email identity
* Reject duplicate email registration
* Hash the password securely
* Create the User
* Create required default UserSettings if defined by the frozen database/application design
* Use a Prisma transaction when multiple dependent writes must succeed atomically
* Return the frozen standard API response contract
* Return only safe user data
* Follow the exact documented status code

Do not return `passwordHash`.

Do not create fake profile data.

Do not create planner tasks.

Do not award XP.

Do not create achievements.

Do not create a streak unless the frozen database design explicitly requires an initial persisted record at registration.

If the frozen documents do not require such initialization, do not invent it.

---

## 16. Login Behavior

Login must:

* Validate the request using Zod
* Locate the user by authoritative identity
* Safely handle unknown users
* Compare the submitted password against the stored password hash
* Reject invalid credentials using the frozen error contract
* Sign the approved JWT
* Return authentication data using the frozen API contract
* Return only safe user information

The implementation must not reveal whether a password was correct through inconsistent internal error details.

Do not log the submitted password.

Do not log the JWT.

---

## 17. Current User Behavior

Implement the frozen current-user authentication endpoint.

The endpoint must:

* Require authentication
* Use authenticated request identity established by middleware
* Retrieve authoritative current user data
* Return only safe user fields
* Include settings only if required by the frozen API Specification
* Use the standard success response contract

Do not trust a frontend-supplied user ID.

Do not accept `userId` from query parameters or request body as the current-user identity.

The authenticated JWT/request context is authoritative.

---

## 18. Authentication Middleware

Create centralized authentication middleware.

The middleware must:

* Read the token from the approved transport mechanism
* Validate the token
* Reject missing authentication
* Reject malformed authentication
* Reject invalid tokens
* Reject expired tokens
* Establish typed authenticated request identity
* Use centralized error infrastructure

Do not duplicate token parsing in routes.

Do not duplicate JWT verification in controllers.

Do not use `any` to attach user identity to Express requests.

Use an architecture-compatible typed request strategy.

---

## 19. Authentication Error Contracts

Authentication errors must use the frozen standard API error response.

Use exact documented error codes where defined by the API Specification.

Authentication failures must not return raw library errors.

Do not expose:

* JWT verification internals
* Prisma internals
* Password library errors
* Stack traces
* Secret values

Known authentication failures must flow through centralized application error handling.

---

## 20. Authentication Backend Architecture

Preserve modular monolith boundaries.

Authentication implementation should follow the architecture-defined module structure.

Responsibilities must remain separated.

Conceptually:

```text
Route
  ↓
Validation
  ↓
Controller
  ↓
Auth Service
  ↓
Prisma / Password / JWT Infrastructure
```

Use the exact architecture conventions already established in the repository and frozen documents.

Routes must remain thin.

Controllers must remain thin.

Password hashing logic must not be scattered across controllers.

JWT signing and verification must not be scattered across routes.

Do not create a giant `auth.ts` containing the complete feature.

---

## 21. User Settings Foundation

Implement only the user-settings behavior required by the frozen API Specification for this milestone.

The authoritative `UserSettings` model must exist as defined by the database documents.

Implement settings API behavior only when the endpoint is defined in the frozen Version 1 API Specification.

Use the exact documented routes and methods.

Settings operations must be authenticated.

A user may access only their own settings.

Do not accept arbitrary ownership from frontend request data.

Do not implement admin settings.

Do not implement social settings.

Do not implement notification-delivery business logic.

Settings persistence may establish future reminder, timezone, or theme preferences only as defined by the frozen schema/API.

Do not invent additional preference fields.

---

## 22. Shared Authentication Contracts

Use `packages/shared` only for contracts that are safe in both browser and backend environments.

Shared responsibilities may include authoritative safe DTO/types/schemas for:

* Registration request
* Login request
* Safe authenticated user response
* Authentication response
* User settings response

Only share Zod schemas when they contain no backend-only secret configuration.

Do not place:

* JWT secret validation
* Password hashing
* Prisma Client
* Express middleware
* Node-only JWT infrastructure

inside `packages/shared`.

Do not duplicate request contracts in frontend and backend when a safe shared contract is appropriate and consistent with the architecture.

---

## 23. Frontend Authentication Scope

Create the real Version 1 authentication frontend required by the frozen PRD, API Specification, and Mission UI design system.

The frontend must include the approved authentication experience for:

* Registration
* Login
* Authenticated application entry
* Logout

Use React Router.

Use TanStack Query for server-state responsibilities.

Use the centralized Axios infrastructure.

Use React Hook Form.

Use Zod validation.

Use Mission UI tokens and approved UI primitives.

Do not use mock authentication.

Do not hardcode a logged-in user.

Do not use fake API responses.

---

## 24. Authentication Routes

Create only the frontend authentication routes required by the frozen product flow.

Expected responsibilities include:

```text
/register
/login
```

Use exact frozen route naming when explicitly documented.

Create a protected authenticated application entry route only as required for this milestone.

Do not build the final dashboard.

Do not create all future product routes.

Do not create fake:

```text
/planner
/journal
/mood
/analytics
/achievements
```

pages.

The authenticated entry surface must truthfully communicate that authentication is complete and future product modules are not yet implemented.

---

## 25. Registration UI

The registration experience must:

* Follow Mission UI
* Be premium and intentional
* Be responsive
* Use semantic form markup
* Use accessible labels
* Use React Hook Form
* Use Zod
* Show field-level validation
* Show loading state
* Prevent accidental duplicate submission
* Show safe server errors
* Navigate according to the approved authentication flow after success

Do not create fake testimonials.

Do not create fake user counts.

Do not create fake productivity metrics.

Do not use manipulative marketing copy.

---

## 26. Login UI

The login experience must:

* Follow Mission UI
* Be premium and calm
* Be responsive
* Use semantic form markup
* Use accessible labels
* Use React Hook Form
* Use Zod
* Show field-level validation
* Show loading state
* Prevent duplicate submission
* Handle invalid credentials truthfully
* Navigate to the protected authenticated entry after successful login

Do not display raw backend errors.

Do not reveal password validation internals.

---

## 27. Password Input UX

Password inputs must:

* Use correct password input semantics
* Support accessible labeling
* Support keyboard use
* Avoid logging values
* Avoid persisting raw password values outside form responsibility

A show/hide password control may be implemented when consistent with Mission UI.

If implemented, it must be keyboard accessible and have an accessible name.

Do not implement password strength scoring unless required by the frozen PRD/API specification.

---

## 28. Frontend Authentication State

Authentication state must follow the approved frozen architecture.

Do not install Zustand.

Use the architecture-approved approach for:

* Token persistence
* Current-user retrieval
* Authenticated state
* Logout cleanup

Do not create multiple competing auth state systems.

The frontend must derive authenticated identity from the real authentication flow.

Do not trust locally invented user profile data.

---

## 29. Axios Authentication Integration

Extend the centralized Axios infrastructure according to the approved token transport strategy.

If the frozen architecture uses bearer JWT authentication:

* Attach the token centrally
* Do not manually attach authorization headers in every component

If the frozen architecture uses cookies:

* Configure Axios credentials centrally as required

Follow the frozen architecture.

Do not implement both strategies simultaneously unless explicitly documented.

Authentication failure behavior must be predictable.

Do not create redirect loops.

Do not silently swallow `401` responses.

---

## 30. Protected Frontend Routing

Implement a protected-route foundation.

Unauthenticated users must not access the authenticated application entry.

Authenticated users must be able to access the authenticated application entry.

Protection must use real authentication state.

Do not protect routes using:

```text
const isLoggedIn = true
```

or another mock value.

Loading current authentication state must have a truthful loading state.

Do not briefly render protected content before authentication is resolved when avoidable.

---

## 31. Logout

Implement logout behavior according to the approved token strategy.

Logout must:

* Remove or invalidate client authentication state as appropriate to Version 1 architecture
* Clear persisted client token data when bearer-token persistence is used
* Clear authenticated user query/cache state
* Navigate to the approved unauthenticated route

Do not claim server-side token revocation unless it is actually implemented and defined by the frozen architecture.

---

## 32. Authenticated Application Entry

After successful authentication, provide a premium authenticated entry surface.

This is NOT the final dashboard.

The authenticated entry may truthfully display:

* Product identity
* Authenticated user name
* Authenticated user email where appropriate
* Authentication status
* Foundation/API status where useful
* Logout control
* A concise statement that the daily planning workspace is the next product milestone

Do not display fake:

* Tasks
* Completion percentage
* XP
* Streak
* Analytics
* Mood
* Achievements

Do not create mock dashboard cards.

The purpose is to verify authenticated application entry and protected routing.

---

## 33. Mission UI Authentication Quality

Read and follow:

`docs/06_UI_UX_Design_System.md`

Authentication UI must preserve:

* Mission Violet / Indigo direction
* Centralized design tokens
* LIGHT theme
* DARK theme
* SYSTEM theme
* Layered surfaces
* Strong hierarchy
* Modern typography
* Controlled radius
* Controlled shadows
* Accessible focus states
* Responsive behavior
* Subtle purposeful motion
* Reduced-motion support

Do not scatter arbitrary hex colors.

Do not use permanent animated backgrounds.

Do not animate every field.

Do not create a generic Bootstrap-style authentication page.

Do not ship untouched default shadcn styling as the final visual result.

---

## 34. Theme Behavior During Authentication

The Milestone 01 theme system must remain functional on:

* Registration
* Login
* Authenticated application entry

LIGHT, DARK, and SYSTEM must continue to work.

Do not break local theme startup behavior.

If authenticated user settings contain authoritative theme preference according to the frozen design, integrate it only according to the documented behavior.

Do not create conflicting theme persistence systems.

---

## 35. Security Boundaries

Milestone 02 must preserve the following boundaries:

### Backend Authority

The backend is authoritative for authentication and user identity.

### Database Authority

PostgreSQL through Prisma is authoritative for persisted users and settings.

### Frontend

The frontend may store authentication material only according to the frozen token strategy.

The frontend must never receive:

* Password hash
* JWT secret
* Database credentials
* Backend environment secrets

### Shared Package

The shared package must remain browser safe.

---

## 36. Forbidden Milestone 02 Scope

Do NOT implement:

* Daily Planner business logic
* Task CRUD
* Task completion
* Recurring task generation
* Category management UI
* Reminder scheduling
* Push subscription business logic
* Web Push sending
* VAPID notification runtime
* Notification queue processing
* Background notification workers
* Journal
* Mood tracking
* Analytics
* XP earning
* XP calculation
* Streak calculation
* Achievement evaluation
* End-of-day summary
* AI coach
* Social features
* Leaderboards
* Payments
* Subscriptions
* OAuth
* Password reset
* Email verification
* MFA

The database schema may include authoritative Version 1 models for later milestones.

Their business logic must not be implemented during Milestone 02.

---

## 37. No Fake Functionality

Do not create fake users in frontend code.

Do not hardcode authentication success.

Do not return fake JWTs.

Do not mock current-user responses.

Do not create fake tasks to make the authenticated screen look complete.

Do not create fake XP.

Do not create fake streaks.

Do not create fake analytics.

Do not claim a settings update is persisted unless PostgreSQL actually stores it.

---

## 38. Environment Configuration

Update environment validation only as required for the approved authentication architecture.

Milestone 02 may require authentication variables defined by the frozen architecture, including the approved JWT configuration.

Use Zod for backend environment validation.

Update `.env.example` using safe placeholders.

Do not commit real local `.env` files.

Do not expose real secret values in reports.

Do not weaken Milestone 01 database environment validation.

---

## 39. Existing Database Port Decision

Preserve the verified local Docker PostgreSQL configuration established after Milestone 01.

The current local Docker PostgreSQL host mapping uses:

```text
localhost:5433
```

mapped to PostgreSQL container port:

```text
5432
```

This host mapping exists because native PostgreSQL occupies host port `5432`.

Do not change the verified host mapping back to `5432` without a genuine infrastructure reason and explicit review.

Do not confuse host PostgreSQL port `5433` with the container's internal PostgreSQL port `5432`.

---

## 40. API Response Contract

All Milestone 02 APIs must use the existing standard API response infrastructure.

Success contract:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error contract:

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "errors": []
}
```

Follow exact endpoint-specific messages, codes, DTOs, and status codes from the frozen API Specification where defined.

Do not invent a second response envelope.

---

## 41. Validation

Use Zod for request validation.

Validation must occur before business service execution.

Use shared browser-safe schemas where architecture-compliant.

Do not trust frontend validation as backend security.

The backend must independently validate authentication requests.

Do not use `any` to bypass validation typing.

---

## 42. Error Handling

Use the Milestone 01 centralized error infrastructure.

Known authentication and settings errors must use deliberate application errors.

Unknown errors must remain safely handled.

Production responses must not expose stack traces.

Do not return raw Prisma errors.

Do not return raw JWT errors.

Do not return raw password-library errors.

Do not duplicate error formatting in every authentication controller.

---

## 43. Testing and Verification Scope

Milestone 02 verification must test real authentication behavior against real Docker PostgreSQL.

At minimum verify:

* Prisma schema validation
* Prisma Client generation
* Migration execution
* Database schema creation
* Backend startup
* PostgreSQL connectivity
* Health endpoint preservation
* Readiness endpoint preservation
* Registration success
* Duplicate registration rejection
* Registration validation failure
* Password stored as a hash
* Password absent from API responses
* Password hash absent from API responses
* Login success
* Invalid password rejection
* Unknown-user login rejection
* JWT creation
* Protected endpoint with valid authentication
* Protected endpoint without authentication
* Protected endpoint with malformed authentication
* Protected endpoint with invalid token
* Current-user retrieval
* User settings persistence where implemented
* Frontend registration flow
* Frontend login flow
* Protected route behavior
* Logout behavior
* Authenticated entry rendering
* Theme behavior on auth screens
* API error presentation
* Responsive authentication UI
* Basic accessibility
* Reduced-motion behavior

Do not verify authentication using mock API responses.

---

## 44. Password Persistence Verification

Verify directly through a safe database inspection that the persisted password representation is hashed.

Do not print the complete hash in the completion report.

The report may state:

```text
Password persistence: HASH VERIFIED
```

Do not expose the stored hash.

Do not expose the test password.

---

## 45. Authentication Runtime Verification

Use the real backend.

Use the real Docker PostgreSQL database.

Execute the real API flow:

```text
Register
   ↓
Persist User
   ↓
Hash Password
   ↓
Authenticate
   ↓
Issue JWT
   ↓
Call Protected Current-User Endpoint
   ↓
Return Authenticated User
```

The successful runtime flow must be verified.

Do not mark authentication PASS from source inspection alone.

---

## 46. Frontend Runtime Verification

Start the real frontend and backend.

Verify the actual authentication UI against the actual API.

At minimum verify:

```text
Register UI
   ↓
Real Register API
   ↓
Real Database Persistence
   ↓
Authenticated State
   ↓
Protected Application Entry
```

and:

```text
Logout
   ↓
Authentication State Cleared
   ↓
Protected Route Denied
   ↓
Login UI
   ↓
Real Login API
   ↓
Protected Application Entry
```

If browser automation or browser inspection is unavailable, mark visual/runtime areas `LIMITED`.

Do not mark browser behavior `PASS` based only on successful build.

---

## 47. Responsive Verification

Verify authentication screens at:

* Mobile
* Tablet
* Laptop
* Desktop

The forms must remain usable.

No normal viewport should produce unintended horizontal overflow.

Authentication controls must remain accessible on mobile.

If browser-level responsive inspection is unavailable, report `LIMITED`.

---

## 48. Accessibility Verification

Verify:

* Semantic forms
* Form labels
* Error association where practical
* Keyboard navigation
* Visible focus states
* Theme control accessibility
* Password visibility control accessibility if implemented
* Heading hierarchy
* Contrast
* Reduced-motion behavior

If full accessibility tooling is unavailable, report `LIMITED`.

Do not claim a complete WCAG audit unless one was actually performed.

---

## 49. Strict TypeScript

Strict TypeScript remains mandatory.

Do not use:

* `any`
* `@ts-ignore`
* `@ts-nocheck`

to hide Milestone 02 implementation errors.

Use typed authentication request identity.

Use typed DTOs.

Use typed service results.

Use deliberate `unknown` narrowing where required at third-party boundaries.

Do not reduce global TypeScript strictness.

---

## 50. Dependency Discipline

Install only dependencies required for Milestone 02.

Expected dependency responsibilities may include:

* Password hashing
* JWT signing and verification

Use maintained packages compatible with the current Node.js and TypeScript foundation.

Before installation:

* Inspect existing dependencies
* Avoid duplicate libraries
* Avoid competing authentication packages

Do not install a full authentication framework unless the frozen architecture explicitly requires it.

Do not install Passport merely for basic JWT authentication unless required by the frozen architecture.

---

## 51. Search Before Create

Before creating authentication, settings, DTO, schema, middleware, or UI files:

1. Search the repository.
2. Inspect existing responsibility.
3. Preserve correct Milestone 01 infrastructure.
4. Extend existing modules where appropriate.
5. Avoid duplicate implementations.

Do not create a second Axios client.

Do not create a second error response system.

Do not create a second environment configuration module.

Do not create a second Prisma Client infrastructure.

Do not create multiple theme providers.

---

## 52. Verification Commands

After implementation, execute the real repository commands.

At minimum execute the repository-equivalent responsibilities for:

```text
npm install
npm run typecheck
npm run lint
npm run build
npm run db:validate
npm run db:generate
```

Execute the real Prisma migration workflow.

Verify Docker PostgreSQL health.

Verify real backend runtime.

Verify real authentication endpoints.

Verify real protected endpoint behavior.

Verify frontend runtime where execution capability permits.

Do not merely list commands.

Commands reported as executed must actually have been executed.

---

## 53. Self-Correction Loop

When verification fails:

1. Read the complete actual error.
2. Identify the root cause.
3. Classify the failure.
4. Make the smallest safe correction.
5. Re-run the failed check.
6. Re-run affected checks.
7. Continue until the criterion passes or a genuine blocker remains.

Do not disable strictness.

Do not broadly disable lint rules.

Do not delete migration history blindly.

Do not reset the database merely to hide a migration defect without reporting the reason.

Do not claim PASS after a failed command unless corrected verification was executed.

---

## 54. Git Safety

Before implementation:

* Run `git status`
* Confirm Milestone 01 is committed
* Inspect recent commit history

During implementation:

* Do not modify frozen documents
* Do not rewrite Milestone 01 history
* Do not amend Milestone 01 commits
* Do not reset Milestone 01 commits

Before completion:

* Run `git status`
* Run `git diff`
* Inspect untracked files
* Check for real secrets
* Check for tracked `.env`
* Check for unrelated work
* Check for premature features
* Check migration files
* Check schema drift

Do not commit automatically.

Do not push automatically.

The project owner will authorize the Milestone 02 freeze commit after audit.

---

## 55. Milestone Completion Criteria

Milestone 02 is complete only when all required criteria pass.

Required criteria:

* All authoritative documents read
* Milestone 01 preserved
* Authoritative Version 1 Prisma schema implemented
* Database Design followed
* ERD followed
* No duplicate source-of-truth fields introduced
* Prisma validates
* Prisma Client generates
* Real Prisma migration succeeds
* Docker PostgreSQL remains healthy
* Real database connectivity succeeds
* User model works
* UserSettings relationship works
* Password hashing works
* Password hash persistence verified
* Registration API works
* Duplicate registration is rejected
* Login API works
* Invalid credentials are rejected
* JWT signing works
* JWT verification works
* Authentication middleware works
* Current-user endpoint works
* Unauthenticated protected request is rejected
* Invalid-token request is rejected
* Safe user DTO returned
* Password absent from responses
* Password hash absent from responses
* User settings persistence works where required by frozen API scope
* Shared authentication contracts are browser safe
* Frontend registration uses real API
* Frontend login uses real API
* Protected frontend route uses real authentication state
* Logout works
* Authenticated entry uses real user identity
* Mission UI preserved
* LIGHT theme preserved
* DARK theme preserved
* SYSTEM theme preserved
* Reduced-motion support preserved
* TypeScript passes
* Lint passes
* Production build passes
* Health endpoint remains passing
* Readiness endpoint remains passing
* Responsive verification completed or truthfully marked LIMITED
* Accessibility verification completed or truthfully marked LIMITED
* No real secrets tracked
* No `.env` tracked
* No frozen documents modified
* No forbidden Milestone 02 business features implemented
* Git diff reviewed
* No automatic commit
* No automatic push

If a required criterion fails, Milestone 02 is incomplete.

Do not weaken completion criteria.

---

## 56. Required Completion Report

The implementation agent must return:

# Milestone Completion Report

## Milestone

Milestone 02 — Core Data Model and Authentication

## Repository Inspection

Summarize the real repository state found before implementation.

## Documents Read

List all authoritative documents actually read.

## Database Schema Implemented

List the authoritative Prisma models and enums actually implemented.

Report major source-of-truth constraints preserved.

## Migration

Report:

* Migration name
* Migration execution result
* Prisma validation result
* Prisma generation result
* Database schema verification result

## Authentication Backend

Report:

* Password hashing strategy
* JWT strategy
* Token transport/persistence strategy
* Authentication middleware
* Registration endpoint
* Login endpoint
* Current-user endpoint
* Settings endpoints implemented, if any

Do not expose secrets.

## Authentication Frontend

Report:

* Registration route
* Login route
* Protected route foundation
* Authenticated entry
* Logout
* Real API integration
* Theme behavior
* Mission UI compliance

## Files Created

List exact files created.

## Files Modified

List exact files modified.

## Dependencies Added

List exact dependencies added.

## Commands Executed

List exact commands actually executed.

## API Runtime Verification

Report actual tested authentication flow.

Include actual endpoint status codes and contract results.

Do not expose passwords, password hashes, or JWT values.

## Password Security Verification

Password Persistence:
HASH VERIFIED / FAIL

Plaintext Password Stored:
NO / YES

Password Returned by API:
NO / YES

Password Hash Returned by API:
NO / YES

## Protected Route Verification

Valid Authentication:
PASS / FAIL

Missing Authentication:
PASS / FAIL

Malformed Authentication:
PASS / FAIL

Invalid Token:
PASS / FAIL

Current User:
PASS / FAIL

## Frontend Runtime Verification

Registration Flow:
PASS / FAIL / LIMITED

Login Flow:
PASS / FAIL / LIMITED

Protected Route:
PASS / FAIL / LIMITED

Logout:
PASS / FAIL / LIMITED

Authenticated Entry:
PASS / FAIL / LIMITED

LIGHT Theme:
PASS / FAIL / LIMITED

DARK Theme:
PASS / FAIL / LIMITED

SYSTEM Theme:
PASS / FAIL / LIMITED

Responsive Verification:
PASS / FAIL / LIMITED

Accessibility Verification:
PASS / FAIL / LIMITED

## Verification Results

TypeScript:
PASS / FAIL

Lint:
PASS / FAIL

Build:
PASS / FAIL

Prisma Validation:
PASS / FAIL

Prisma Generation:
PASS / FAIL

Prisma Migration:
PASS / FAIL

Docker PostgreSQL:
PASS / FAIL

Database Connectivity:
PASS / FAIL

Health Endpoint:
PASS / FAIL

Readiness Endpoint:
PASS / FAIL

Registration API:
PASS / FAIL

Login API:
PASS / FAIL

Authentication Middleware:
PASS / FAIL

Current User API:
PASS / FAIL

## Git Safety Review

Working Tree: <actual status>

Real Secrets in Tracked Files:
NONE / FOUND

Tracked .env:
NONE / FOUND

Frozen Document Changes:
NONE / FOUND

Unrelated Work:
NONE / FOUND

Premature Business Features:
NONE / FOUND

Automatic Commit Created:
NO

Push Performed:
NO

## Known Limitations

List only genuine limitations.

Do not disguise failed completion criteria as limitations.

## Out-of-Scope Work Avoided

Confirm the forbidden Milestone 02 business features intentionally not implemented.

## Failed Required Criteria

If none failed, write:

FAILED REQUIRED CRITERIA: NONE

Otherwise list every failed required criterion.

## Final Status

Write exactly one:

COMPLETE

or

INCOMPLETE

Use COMPLETE only when every required Milestone 02 completion criterion has passed.

Do not say production ready.

Do not say 100% complete.

Do not commit.

Do not push.

---

## 57. Document Status

**Milestone:** 02

**Status:** APPROVED FOR IMPLEMENTATION

**Scope:** CORE DATA MODEL AND AUTHENTICATION

**Implementation Tool:** Repository-aware coding agent

**Change Policy:** Milestone scope changes require explicit project review.

This document is the implementation contract for Daily Development Tracker Milestone 02.


## 58. Project Owner Authentication Architecture Decision

The following authentication architecture decisions are explicitly approved by the project owner for Milestone 02.

These decisions resolve specification gaps identified during the Milestone 02 pre-implementation analysis.

### JWT Identity Payload

The authoritative JWT identity payload for Version 1 is:

```json
{
  "sub": "<user-id>"
}
