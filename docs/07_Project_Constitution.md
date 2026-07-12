



# 1. Constitution Objective

This document defines the mandatory engineering rules for Daily Development Tracker Version 1.

The purpose of this constitution is to prevent:

- Uncontrolled scope growth
- Random architecture changes
- Duplicate implementations
- Broken integrations
- Fake functionality
- Premature feature development
- Unnecessary rewrites
- Database drift
- API inconsistency
- UI inconsistency
- AI-generated technical chaos

Claude, Antigravity, coding agents, and human developers must follow this constitution.

This document governs implementation behavior.

The frozen product and technical documents define what must be built.

This constitution defines how it must be built.

---

# 2. Source of Truth Hierarchy

The project uses the following source-of-truth hierarchy:

```text
1. Project Constitution
        │
        ▼
2. Product Requirements Document
        │
        ▼
3. Architecture Document
        │
        ▼
4. Database Design
        │
        ▼
5. ERD
        │
        ▼
6. API Specification
        │
        ▼
7. Mission UI Design System
        │
        ▼
8. Approved Milestone Contract
        │
        ▼
9. Existing Verified Code
````

If implementation instructions conflict with a frozen document, the conflict must be identified before implementation.

AI tools must not silently choose one interpretation.

The smallest clarification or documented technical adjustment must be proposed.

---

# 3. Frozen Documents

The following documents are frozen for Daily Development Tracker Version 1:

```text
docs/01_PRD.md
docs/02_Architecture.md
docs/03_Database_Design.md
docs/04_ERD.md
docs/05_API_Specification.md
docs/06_UI_UX_Design_System.md
docs/07_Project_Constitution.md
```

Frozen means:

* Do not casually rewrite.
* Do not rename core concepts.
* Do not replace approved technologies.
* Do not remove approved requirements.
* Do not add major scope without review.

A frozen document may change only when a genuine blocker or approved product decision requires it.

---

# 4. Mandatory Pre-Implementation Reading

Before starting a milestone, the AI development tool must read:

```text
docs/01_PRD.md
docs/02_Architecture.md
docs/03_Database_Design.md
docs/04_ERD.md
docs/05_API_Specification.md
docs/06_UI_UX_Design_System.md
docs/07_Project_Constitution.md
```

The AI must also read:

```text
The current approved milestone contract
```

Before modifying an existing project, the AI must inspect the current repository.

It must not assume the repository state.

---

# 5. Milestone-Driven Development

Daily Development Tracker must be developed milestone by milestone.

The development flow is:

```text
Freeze Product
      │
      ▼
Freeze Architecture
      │
      ▼
Freeze Technical Contracts
      │
      ▼
Define Milestone
      │
      ▼
Implement Milestone
      │
      ▼
Verify Milestone
      │
      ▼
Commit Milestone
      │
      ▼
Start Next Milestone
```

Do not attempt to build the entire product in one AI prompt.

Each milestone must have:

* Objective
* Scope
* Allowed work
* Forbidden work
* Deliverables
* Verification commands
* Completion criteria

A milestone is complete only when its completion criteria pass.

---

# 6. Scope Discipline

The AI must implement only the active milestone.

If the active milestone is:

```text
Foundation
```

the AI must not implement:

```text
Authentication
Planner Business Logic
Journal
Mood
Analytics
Achievements
Full Notification System
```

unless explicitly included in the milestone contract.

The existence of a requirement in the PRD does not mean it should be implemented immediately.

Requirements are implemented according to milestone order.

---

# 7. No Premature Feature Development

AI tools often attempt to "help" by implementing future features early.

This is prohibited.

Examples of prohibited behavior:

```text
Adding authentication during foundation
Creating all Prisma models during initial setup
Building the dashboard before the application shell is verified
Adding Redis because notifications exist in the PRD
Creating AI recommendations without approval
Building social features because they may be useful later
```

Future compatibility is allowed.

Future implementation is not.

The architecture may prepare clean extension points without implementing future business logic.

---

# 8. No Unapproved Scope Expansion

The AI must not independently add major features.

Examples:

```text
Social Feed
Friends
Leaderboards
AI Coach
Chatbot
Team Workspace
Marketplace
Calendar Integration
Google Login
Apple Login
Voice Assistant
Blockchain
Premium Subscription
```

These may be future ideas.

They are not Version 1 requirements unless explicitly approved.

If the AI identifies a potentially useful feature, it may document the suggestion separately.

It must not implement it.

---

# 9. Technology Stack Is Frozen

The approved Version 1 stack is defined by the Architecture Document.

The AI must not independently replace approved technologies.

Examples of prohibited replacements:

```text
React → Next.js
Express → NestJS
PostgreSQL → MongoDB
Prisma → Drizzle
REST → GraphQL
Vite → Next.js
Tailwind CSS → another styling framework
```

The AI must not add a major framework because it personally considers it "better."

Technology changes require architecture review.

---

# 10. Repository Structure Discipline

The approved repository structure must be preserved.

The project uses a monorepo structure defined in the Architecture Document.

The AI must not create random top-level folders.

Before creating a folder, the AI must determine:

1. What responsibility does the folder own?
2. Does an approved folder already own this responsibility?
3. Is the folder required by the current milestone?

Avoid structures such as:

```text
helpers2
utils-new
components-old
backend-final
frontend-new
temp
misc
random
test123
```

Folder names must communicate responsibility.

---

# 11. No Duplicate Implementations

Before creating a file, function, service, component, schema, route, or utility, the AI must search the repository for an existing implementation.

The AI must not create:

```text
authService.ts
auth-service.ts
authenticationService.ts
```

for the same responsibility.

The AI must not create:

```text
Button.tsx
CustomButton.tsx
PremiumButton.tsx
AnimatedButton.tsx
```

when one reusable component can support approved variants.

Duplicate implementations create technical debt and conflicting behavior.

Search before create.

---

# 12. Existing Working Code Protection

Existing verified code must be treated as an asset.

The AI must not rewrite a working feature simply because it prefers another coding style.

Before modifying working code, the AI must identify:

```text
What is broken?
What requirement is missing?
What milestone requires this change?
```

If no clear answer exists, the code should remain unchanged.

Refactoring must have a defined reason.

---

# 13. Smallest Safe Change Principle

When fixing a problem, prefer the smallest safe change.

Correct approach:

```text
Identify Failure
      │
      ▼
Locate Root Cause
      │
      ▼
Modify Smallest Required Area
      │
      ▼
Verify
```

Incorrect approach:

```text
Error Found
      │
      ▼
Rewrite Entire Feature
```

The AI must not respond to a small error with an uncontrolled architectural rewrite.

---

# 14. No Destructive Rewrites

The AI must not delete or replace large sections of the repository without explicit justification.

Before a destructive change, the AI must explain:

* What will be removed
* Why it is incorrect
* What replaces it
* Which requirements are affected
* How the change will be verified

Mass deletion to "start clean" is prohibited unless explicitly approved.

---

# 15. Frontend and Backend Boundaries

Frontend responsibilities include:

```text
Presentation
User Interaction
Client State
Server State Consumption
Form Interaction
PWA Client Behavior
Service Worker Client Integration
```

Backend responsibilities include:

```text
Authentication Enforcement
Business Logic
Authorization
Validation
Database Access
Task Completion Rules
XP Rules
Streak Rules
Achievement Rules
Reminder Scheduling
Notification Processing
```

The frontend must not become the authoritative source of business rules.

The backend must not contain frontend presentation logic.

---

# 16. Shared Package Boundary

The shared package may contain:

```text
DTO Types
Shared Enums
API Contracts
Shared Validation Schemas
Safe Constants
```

The shared package must not contain:

```text
Prisma Client
Express Application Code
React Components
Node-only Secrets
Database Access
Browser-only APIs
```

Shared code must remain safe for its approved consumers.

---

# 17. TypeScript Rules

TypeScript strictness is mandatory.

The project must avoid uncontrolled use of:

```text
any
```

The AI must prefer:

```text
Explicit Types
Inferred Safe Types
Generics
Validated Unknown Data
```

External input begins as untrusted data.

Validate it before treating it as a domain type.

Do not silence TypeScript errors with broad casts.

Prohibited patterns include careless use of:

```text
as any
@ts-ignore
@ts-nocheck
```

If one of these is genuinely required, the reason must be documented.

---

# 18. Import Rules

Imports must remain consistent with the approved project structure.

Use approved path aliases where configured.

Example:

```text
@/components
@/features
@/lib
```

Do not create deeply fragile imports when a project alias is available.

Example to avoid:

```text
../../../../../../components/Button
```

The AI must verify imports after file moves.

Broken imports are milestone blockers.

---

# 19. Naming Rules

Naming must communicate intent.

React components:

```text
PascalCase
```

Example:

```text
ProgressRing
TaskRow
DailyMomentumHero
```

Functions and variables:

```text
camelCase
```

Example:

```text
completeTask
calculateDailyProgress
```

Constants:

```text
UPPER_SNAKE_CASE
```

when representing true constant values.

Database models:

```text
PascalCase
```

API routes:

```text
kebab-case
```

where multiple words are required.

Example:

```text
/recurring-tasks
/push-subscriptions
```

Avoid meaningless names such as:

```text
data1
tempData
finalData
thing
stuff
obj
```

except in tightly scoped generic contexts where meaning remains obvious.

---

# 20. File Responsibility Rule

A file should have a clear primary responsibility.

Avoid giant files that contain:

```text
Routes
Validation
Database Queries
Business Logic
Formatting
UI Rendering
```

all together.

The architecture should preserve responsibility boundaries.

However, do not split a ten-line function into five files merely to appear modular.

Modularity must improve clarity.

---

# 21. Backend Layer Rules

The backend should preserve the approved layered architecture.

Conceptually:

```text
Route
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
Repository / Prisma Infrastructure
  │
  ▼
PostgreSQL
```

Supporting concerns include:

```text
Validation
Authentication Middleware
Error Handling
Logging
Configuration
```

Routes define HTTP routing.

Controllers adapt HTTP requests and responses.

Services own business use cases.

Database infrastructure owns persistence access patterns.

Do not place complex business logic directly inside Express route definitions.

---

# 22. Controller Rules

Controllers should:

* Read validated request context.
* Call the appropriate service.
* Return the standard API response.
* Pass errors to the approved error system.

Controllers should not:

* Contain large Prisma queries.
* Calculate XP rules.
* Calculate streak rules.
* Implement achievement logic.
* Duplicate validation.
* Trust client-provided ownership.

Keep controllers thin.

---

# 23. Service Rules

Services own application business operations.

Examples:

```text
Register User
Create Daily Task
Complete Task
Snooze Reminder
Save Journal
Update Mood
Calculate Daily Statistics
```

A business-critical operation should have one authoritative service path.

Example:

```text
Complete Task Service
```

must be reused by:

```text
Application Completion Endpoint
Notification Completion Action
```

Do not create separate completion logic.

---

# 24. Database Access Rules

Prisma is the approved ORM.

The frontend must never import Prisma.

Database queries belong to backend infrastructure.

The AI must avoid creating a new Prisma client for every request.

Use the approved controlled Prisma client instance.

Database operations must respect:

* Ownership
* Transactions
* Uniqueness
* Soft deletion
* Idempotency

Do not bypass Prisma with random raw SQL unless a documented database requirement requires it.

Reviewed migration SQL is allowed for database features such as partial indexes where necessary.

---

# 25. Prisma Schema Change Rule

The Prisma schema is a controlled technical contract.

Before changing the schema, the AI must:

1. Read Database Design.
2. Read ERD.
3. Identify the active milestone.
4. Explain the required model change.
5. Verify relationships.
6. Generate a migration.
7. Review migration output.
8. Run database verification.

The AI must not casually rename models or fields after feature code depends on them.

---

# 26. Migration Rules

All schema changes require migrations.

The AI must not tell the developer to manually edit production tables.

Migration files must be committed.

Before accepting a migration:

* Review generated SQL.
* Check destructive changes.
* Check relation actions.
* Check indexes.
* Check uniqueness.

A migration warning must not be ignored automatically.

---

# 27. Data Integrity Rules

Database integrity is more important than temporary implementation convenience.

The AI must preserve:

```text
Unique Task Completion
Unique Achievement Unlock
Unique XP Idempotency Key
One User Settings Record
One Streak Record
Daily Mood Uniqueness
Daily Statistics Uniqueness
```

Application logic must preserve cross-entity ownership.

Do not rely only on frontend behavior to protect data integrity.

---

# 28. Transaction Rules

Use database transactions when multiple authoritative writes must remain consistent.

Example:

```text
Task Completion
      │
      ├── TaskCompletion
      ├── Activity Effects
      ├── XP Effects
      └── Related Consistency Work
```

Not every derived operation must be synchronous.

However, retryable follow-up processing must be idempotent.

The AI must identify transaction boundaries intentionally.

---

# 29. Idempotency Rules

Retrying an operation must not create duplicate business effects.

Critical idempotent operations include:

```text
Task Completion
XP Award
Achievement Unlock
Recurring Task Generation
Reminder Scheduling
Notification Action
Notification Queue Processing
```

Example:

Completing the same task twice must not produce:

```text
2 TaskCompletion Records
20 XP Instead of 10 XP
Duplicate Achievement Unlock
```

Database constraints and stable idempotency keys must support application logic.

---

# 30. API Contract Rules

The API Specification defines the approved Version 1 API surface.

The AI must preserve:

```text
/api/v1
```

The AI must use the standard success response.

The AI must use the standard error response.

The AI must preserve endpoint responsibility.

Do not independently rename:

```text
/tasks
```

to:

```text
/todos
```

Do not independently replace:

```text
/recurring-tasks
```

with:

```text
/habits
```

Core product vocabulary must remain consistent.

---

# 31. API Response Rules

Successful responses follow:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Failed responses follow:

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "errors": []
}
```

The API must not return random response shapes from different controllers.

Example of prohibited inconsistency:

```text
Endpoint A → { data: ... }
Endpoint B → { result: ... }
Endpoint C → { task: ... }
Endpoint D → raw array
```

Use the approved contract.

---

# 32. Validation Rules

All user-controlled backend input must be validated.

This includes:

```text
Body
Route Parameters
Query Parameters
```

Zod is the approved validation system.

Validation schemas should be reusable where appropriate.

Do not duplicate the same validation rules in multiple controllers.

Frontend validation improves UX.

Backend validation protects the system.

Both are required.

---

# 33. Authentication Rules

Authentication must be enforced by the backend.

The backend must resolve the user from trusted authentication context.

Do not trust:

```text
req.body.userId
```

for authorization.

A client-provided user identifier must never grant access to another user's data.

Passwords must be hashed.

Plain-text passwords must never be stored.

Sensitive authentication values must not be logged.

---

# 34. Authorization Rules

Every user-owned resource must enforce ownership.

Examples:

```text
Task
Planner
RecurringTask
Category
JournalEntry
MoodEntry
PushSubscription
ReminderSchedule
```

Changing an identifier in an API request must not expose another user's data.

Ownership checks belong on the server.

Frontend route protection is not authorization.

---

# 35. Secret Management Rules

Secrets must use environment variables.

Examples:

```text
DATABASE_URL
JWT_SECRET
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
```

Secrets must not be committed to Git.

The project must include:

```text
.env.example
```

The example file contains variable names and safe placeholders only.

The AI must never copy real secrets into:

```text
README
Documentation
Frontend Code
Git History
Test Fixtures
```

---

# 36. Environment Rules

The application must clearly separate:

```text
Development
Test
Production
```

Local development may use Docker PostgreSQL.

Production uses Neon PostgreSQL.

The frontend uses environment configuration for the API base URL where required.

Do not hardcode:

```text
localhost
```

throughout application feature code.

Centralize environment configuration.

---

# 37. Docker Rules

Docker is approved for local development infrastructure.

Version 1 Docker usage should prioritize:

```text
PostgreSQL
```

The AI must not force the entire development application into containers unless the architecture or milestone requires it.

Docker configuration must be understandable.

Use persistent volumes for local PostgreSQL.

Do not store database data inside the Git repository.

---

# 38. Frontend Architecture Rules

Frontend code must use feature-oriented organization.

Conceptually:

```text
app
components
features
hooks
lib
routes
styles
```

Feature-specific code should remain inside the relevant feature.

Examples:

```text
features/planner
features/journal
features/mood
features/analytics
```

Generic reusable primitives belong in shared component areas.

Do not place every component in one giant `components` folder.

---

# 39. UI Source of Truth

Mission UI is the frontend design source of truth.

The AI must follow:

```text
docs/06_UI_UX_Design_System.md
```

The frontend must feel:

```text
Premium
Motivating
Colorful
Calm
Modern
Intentional
```

The AI must not replace Mission UI with:

```text
Generic Admin Dashboard
Default shadcn/ui Dashboard
Plain Black-and-White SaaS Template
Random Gradient UI
```

Visual decisions must remain consistent with Mission UI.

---

# 40. Design Token Rules

Colors, spacing, radius, and visual system values must use centralized tokens.

Do not spread arbitrary values throughout feature components.

Avoid patterns such as:

```text
#7C3AED
#7C3AED
#7C3AED
```

repeated manually across many files.

Use the approved token system.

Category color options must use the controlled category palette.

---

# 41. shadcn/ui Rules

shadcn/ui is a component foundation.

It is not the product identity.

The AI may:

* Install required primitives.
* Customize styling.
* Apply Mission UI tokens.
* Extend approved behavior.

The AI must not:

* Ship default shadcn styling as the final product.
* Generate a generic shadcn dashboard.
* Create inconsistent component variants.

Mission UI overrides default visual direction.

---

# 42. Animation Rules

Framer Motion is approved for meaningful stateful animation.

Use animation for:

```text
Progress
Task Completion
Page Transitions
Achievement Moments
Controlled Layout Changes
```

Use CSS transitions for simple:

```text
Hover
Focus
Button State
```

Do not animate every element.

Do not create permanent background animation that distracts from planning.

Do not sacrifice performance for visual effects.

---

# 43. Reduced Motion Rules

The application must respect:

```text
prefers-reduced-motion
```

Important state changes must remain understandable without animation.

Decorative motion should be disabled or reduced.

Celebration effects must not be required to understand an achievement.

---

# 44. Responsive Rules

Frontend development is mobile-first.

Every major feature must be checked at:

```text
Mobile
Tablet
Laptop
Desktop
```

The AI must not build only for a 1920-pixel desktop screen.

Planner completion controls must remain easy to tap.

Journal text areas must remain usable.

Analytics must not create horizontal overflow.

---

# 45. Accessibility Rules

Accessibility is mandatory.

The AI must implement:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Accessible labels
* Logical headings
* Color contrast
* Reduced motion support

Color must not be the only state indicator.

Interactive icon buttons require accessible names.

Do not remove focus outlines without an accessible replacement.

---

# 46. Loading State Rules

Every major server-data screen must have an intentional loading state.

Prefer skeletons for:

```text
Dashboard
Planner
Analytics
Achievements
```

Do not show a full-screen spinner for every request.

Button-level actions may use compact loading indicators.

Loading UI should approximate the final layout where practical.

---

# 47. Empty State Rules

Every primary feature must define an empty state.

Required empty states include:

```text
Planner
Journal
Analytics
Achievements
```

An empty state should explain:

```text
What is empty?
Why does it matter?
What should the user do next?
```

Empty states should include a clear action where appropriate.

---

# 48. Error State Rules

User-facing errors must be understandable.

Do not display internal infrastructure errors.

Prohibited user-facing messages include:

```text
PrismaClientKnownRequestError
ECONNREFUSED
ZodError
TypeError: Cannot read properties of undefined
```

Translate technical failures into product-safe messages.

Provide retry actions where appropriate.

---

# 49. No Fake Functionality

A visible interactive feature must either:

```text
Work
```

or:

```text
Be clearly marked as unavailable
```

The AI must not create buttons that visually work but do nothing.

Examples of prohibited fake functionality:

```text
Save button with console.log only
Notification toggle with no persistence
Analytics chart with random numbers
XP counter with hardcoded value presented as real
Task completion that only changes frontend state
```

Prototype placeholders must be clearly identified during development.

They must not be presented as completed product functionality.

---

# 50. No Fake Analytics

Analytics must use actual application data.

The AI must not generate random data and present it as user history.

Development seed data may be used in development environments.

Demo data must remain explicitly identifiable as development or demo data.

Production analytics must reflect authoritative user data.

---

# 51. No Fake AI

Daily Development Tracker Version 1 does not require an AI coach unless separately approved.

The AI development tool must not add a fake AI feature.

Do not create:

```text
AI Insights
AI Recommendations
AI Productivity Score
```

using hardcoded sentences and present them as artificial intelligence.

If an AI feature is approved later, it requires:

* Product requirement
* Architecture decision
* Provider strategy
* Cost strategy
* Failure strategy

---

# 52. Notification Rules

Notifications are a core product requirement.

The AI must treat reminder reliability as business logic, not visual decoration.

The approved architecture uses:

```text
ReminderSchedule
      │
      ▼
NotificationQueue
      │
      ▼
Background Processor
      │
      ▼
Web Push
```

The AI must not implement reminders using only:

```text
setTimeout
```

inside the browser.

Browser timers are not a reliable reminder architecture.

---

# 53. Notification Completion Rules

Notification task completion must use the same authoritative task completion service as application completion.

Correct:

```text
Notification Action
       │
       ▼
Complete Task Service
```

Incorrect:

```text
Notification Action
       │
       ▼
Directly Update Random Task Field
```

Task completion business effects must remain consistent.

---

# 54. Service Worker Rules

The service worker supports:

```text
PWA Installation
Web Push
Notification Display
Notification Actions
Approved Caching
```

The service worker must not contain core business logic.

The service worker must not calculate:

```text
XP
Streaks
Achievements
Daily Statistics
```

Business operations belong to the backend.

---

# 55. Timezone Rules

Timezone handling is business-critical.

The server must not assume its own timezone is the user's timezone.

User local schedule time must be interpreted using:

```text
User Timezone
```

Example:

```text
Planner Date: 2026-07-08
Task Time: 07:30
Timezone: Asia/Kolkata
```

The backend resolves the correct absolute scheduled timestamp.

Timezone behavior must be tested.

---

# 56. Date Rules

Date-only values use:

```text
YYYY-MM-DD
```

Absolute timestamps use ISO 8601.

Do not use arbitrary locale date strings as API contracts.

Display formatting belongs to the user interface.

Backend domain logic must use predictable date representations.

---

# 57. Task Completion Source of Truth

`TaskCompletion` is the authoritative source of task completion.

The AI must not introduce another competing authoritative field such as:

```text
Task.completed = true
```

unless the frozen database design is explicitly changed.

Derived UI values may calculate completion from TaskCompletion.

One business concept should have one source of truth.

---

# 58. XP Source of Truth

`XPTransaction` is the authoritative XP history.

The AI must not use only:

```text
User.xp
```

as the sole authoritative XP model.

Current XP may be calculated from transaction history.

A cache may be introduced only with an explicit consistency strategy.

XP awards must use idempotency.

---

# 59. Achievement Source of Truth

Achievement definitions belong to:

```text
Achievement
```

User unlock ownership belongs to:

```text
UserAchievement
```

Do not store unlocked achievements as an arbitrary JSON array on User.

Achievement unlocks must prevent duplicates.

The client must not arbitrarily grant achievements.

---

# 60. Streak Rules

Streak calculations belong to backend business logic.

The exact qualifying rule must be frozen before streak implementation.

The AI must not invent different streak rules in:

```text
Dashboard
Analytics
Frontend
Notification Worker
```

One authoritative streak rule must be used.

---

# 61. Derived Statistics Rules

`DailyStatistics` is derived data.

Authoritative sources remain:

```text
Planner
Task
TaskCompletion
XPTransaction
```

DailyStatistics must be recalculable.

If statistics become inconsistent, the system should be able to rebuild them from authoritative data.

Do not make derived statistics the only record of user completion history.

---

# 62. Background Processing Rules

Background processing must use controlled worker responsibilities.

Workers may process:

```text
Due Notification Queue Items
Approved Derived Data Work
Approved Scheduled Work
```

Workers must support safe retry behavior.

Concurrent workers must not process the same work item incorrectly.

Worker failures must be observable.

Do not hide worker errors.

---

# 63. Logging Rules

Logs should help diagnose system behavior.

Logs may include:

```text
Request Method
Route
Status
Duration
Worker Job Identifier
Safe Error Context
```

Logs must not include:

```text
Passwords
Full JWT Tokens
JWT Secrets
Private Keys
Sensitive Push Credentials
```

Production logs must remain useful without exposing secrets.

---

# 64. Error Handling Rules

The backend must use centralized error handling.

Expected domain errors should use stable application error codes.

Unexpected errors should be logged safely.

Production clients receive a safe error response.

Do not duplicate try/catch response formatting in every controller when centralized infrastructure exists.

---

# 65. Testing Philosophy

Tests protect critical behavior.

The project does not chase a meaningless 100% coverage number.

Priority tests include:

```text
Authentication
Authorization
Task Ownership
Task Completion Idempotency
XP Duplicate Prevention
Achievement Duplicate Prevention
Recurring Task Generation
Reminder Scheduling
Notification Action Processing
Timezone Handling
Journal Daily Uniqueness
Mood Daily Upsert
Analytics Correctness
```

A critical business rule without verification is a risk.

---

# 66. Test Isolation Rules

Tests must not depend on random production data.

Tests should use controlled data.

Tests must not call production infrastructure.

Test environment configuration must remain separate.

When a test modifies database state, the test strategy must provide reliable isolation or cleanup.

---

# 67. Lint Rules

Lint errors must be reviewed before milestone completion.

The AI must not disable lint rules globally simply to make errors disappear.

If a lint rule conflicts with the approved architecture, the configuration may be reviewed.

Do not add blanket ignore patterns without justification.

---

# 68. Formatting Rules

The project should use consistent automated formatting.

Formatting disagreements should be handled by tooling rather than repeated manual changes.

The AI must not reformat the entire repository unnecessarily during a small feature change.

Large unrelated formatting diffs make reviews difficult.

---

# 69. Build Rules

A milestone cannot be marked complete if the production build fails.

Required build verification depends on the milestone.

Typical commands include:

```text
npm run build
npm run typecheck
npm run lint
```

or the approved workspace equivalents.

The AI must report the exact commands executed.

Do not claim:

```text
Build passes
```

without running the build when execution access is available.

---

# 70. Verification Evidence Rule

At milestone completion, the AI must provide evidence.

Required report format:

```text
Files Created
Files Modified
Commands Executed
Verification Results
Known Limitations
Milestone Completion Status
```

Example:

```text
Commands Executed

npm install
npm run typecheck
npm run lint
npm run build

Results

TypeScript: PASS
Lint: PASS
Build: PASS
```

Do not report guessed verification.

---

# 71. No False Completion Claims

The AI must not say:

```text
100% Complete
Production Ready
Fully Working
```

unless the relevant verification supports the claim.

Completion language must be precise.

Preferred:

```text
Milestone 01 completion criteria passed.
```

or:

```text
The frontend build passes, but database connectivity remains unverified.
```

Truthful status reporting is mandatory.

---

# 72. Milestone Completion Gate

A milestone is complete only when:

1. Required deliverables exist.
2. Scope requirements are implemented.
3. Forbidden scope was not added.
4. Type checks pass where applicable.
5. Lint passes where applicable.
6. Required tests pass.
7. Required builds pass.
8. Required runtime verification passes.
9. Documentation is updated if required.
10. Git diff is reviewed.

If one required criterion fails, the milestone remains incomplete.

---

# 73. Git Discipline

Git is the project history.

Development should follow:

```text
Inspect
Implement
Verify
Review Diff
Commit
Push
```

Do not create one giant commit for the entire Version 1 application.

Milestone-level commits are preferred.

Commit messages should communicate completed work.

Example:

```text
feat: establish application foundation
```

or:

```text
feat: implement daily planner task flow
```

Avoid commit messages such as:

```text
update
changes
final
final2
working
done
```

---

# 74. Git Diff Review

Before committing, review:

```text
git status
git diff
```

The AI should check for:

* Unexpected files
* Secrets
* Generated junk
* Unrelated changes
* Deleted files
* Accidental configuration changes

Do not commit blindly.

---

# 75. .gitignore Rules

The project must ignore environment-specific and generated files.

Examples:

```text
node_modules
.env
.env.local
dist
coverage
database volumes
temporary logs
```

Exact patterns depend on project structure.

`.env.example` must remain tracked.

Do not ignore migration files.

Prisma migrations belong in Git.

---

# 76. Dependency Rules

Before adding a dependency, the AI must determine:

1. Is the dependency required?
2. Does the project already have a solution?
3. Is the dependency maintained?
4. Is it compatible with the stack?
5. Does it significantly increase complexity?

Do not install five libraries to solve one simple problem.

Avoid duplicate libraries with overlapping responsibilities.

Example:

Do not install multiple date libraries without a defined reason.

---

# 77. Dependency Version Rules

Use stable compatible versions.

Do not blindly upgrade every dependency during feature implementation.

Major version upgrades require compatibility review.

Lockfiles must be committed.

The AI must not delete the lockfile merely to solve a dependency conflict without investigating the root cause.

---

# 78. Security Rules

Security is part of implementation quality.

The project must consider:

```text
Password Hashing
JWT Validation
Authorization
Input Validation
Rate Limiting
Secure Headers
CORS
Secret Management
Sensitive Logging
Push Action Security
```

Security controls must exist on the backend.

Frontend hiding is not a security mechanism.

---

# 79. CORS Rules

CORS configuration must use approved application origins.

Production must not automatically use unrestricted:

```text
*
```

when credentials or sensitive authenticated behavior requires stricter configuration.

Development origins may be configured separately.

CORS settings belong to centralized backend configuration.

---

# 80. Rate Limiting Rules

Rate limiting should prioritize risk-sensitive routes.

Examples:

```text
Registration
Login
Notification Action Endpoints
```

The exact limits belong to the relevant implementation milestone.

Do not add arbitrary limits that make normal product use unreliable.

---

# 81. Performance Rules

The AI must consider performance during implementation.

Avoid:

```text
N+1 Queries
Unlimited History Responses
Huge Client Bundles
Unnecessary Re-renders
Continuous Decorative Animation
Repeated Expensive Analytics Calculation
```

Use:

```text
Indexes
Pagination
Selected Fields
Route Lazy Loading
Efficient Queries
Appropriate Memoization
```

Do not prematurely optimize imaginary problems.

Measure or identify a real access pattern.

---

# 82. PWA Rules

The application is a Progressive Web Application.

Version 1 PWA requirements include:

```text
Installability
Manifest
Service Worker Foundation
Push Notification Compatibility
Responsive Mobile Experience
```

The PWA must not claim full offline support unless full offline behavior is implemented and verified.

Offline messaging must remain truthful.

---

# 83. Production Deployment Rules

Approved deployment direction:

```text
Frontend → Vercel
Backend → Railway
Database → Neon PostgreSQL
```

Production configuration must use environment variables.

The production frontend must call the production backend URL.

The production backend must use the Neon database URL.

Local Docker PostgreSQL must not accidentally become a production dependency.

---

# 84. Deployment Readiness Gate

Before deployment, verify:

```text
Frontend Build
Backend Build
TypeScript
Lint
Database Migration Status
Environment Variables
CORS
API Base URL
Health Endpoint
Database Connectivity
```

For notification milestones also verify:

```text
VAPID Configuration
Push Subscription
Worker Execution
Notification Delivery
Notification Action Security
```

Deployment is not complete because Vercel shows a green deployment.

The product workflow must be tested.

---

# 85. Production Smoke Test

After deployment, perform a production smoke test.

At minimum:

```text
Open Frontend
Verify Application Loads
Verify Backend Health
Verify Database Connectivity
Verify Authentication When Implemented
Verify Primary Active Milestone Flow
Check Browser Console
Check Backend Logs
```

Critical errors must be investigated.

Do not ignore repeated production console errors.

---

# 86. Documentation Rules

Documentation must reflect approved architecture and product behavior.

Do not maintain documentation that describes a system different from the code.

When an approved architecture change occurs:

1. Update the relevant frozen document.
2. Update the milestone contract if affected.
3. Implement the change.
4. Verify the implementation.

Documentation changes should be intentional.

---

# 87. README Rules

The project README should eventually include:

```text
Project Overview
Core Features
Technology Stack
Repository Structure
Local Setup
Environment Variables
Docker Database Setup
Development Commands
Migration Commands
Build Commands
Deployment Overview
```

The README must not expose secrets.

The README must not claim unimplemented features are complete.

---

# 88. AI Agent Repository Inspection Rule

Before implementing a milestone in an existing repository, the AI must inspect:

```text
Repository Tree
package.json Files
TypeScript Configuration
Vite Configuration
Tailwind Configuration
Prisma Configuration
Docker Configuration
Environment Example Files
Existing Source Files
Git Status
```

The AI must adapt to the real repository state.

It must not generate code based only on assumptions.

---

# 89. AI Planning Rule

Before modifying code, the AI should create a concise internal implementation plan.

The plan should map:

```text
Milestone Requirement
        │
        ▼
Files / Modules
        │
        ▼
Implementation
        │
        ▼
Verification
```

The AI must not spend the majority of the task writing planning documents instead of implementing the milestone.

Plan enough to prevent mistakes.

Then execute.

---

# 90. AI Stop Conditions

The AI must stop and report before continuing if it discovers:

```text
Frozen Document Conflict
Major Architecture Conflict
Destructive Migration Risk
Missing Required Secret
Repository State That Contradicts Milestone Assumptions
Unresolved Dependency Conflict
Security-Critical Ambiguity
```

The AI must explain:

1. What was discovered.
2. Why it blocks safe implementation.
3. The smallest recommended resolution.

Do not hide blockers by creating fake workarounds.

---

# 91. AI Non-Stop Conditions

The AI should not stop for trivial decisions already governed by the frozen documents.

Examples:

```text
Where should a planner feature component live?
Which approved icon should represent settings?
Should loading state use the documented skeleton strategy?
```

The AI should use the frozen contracts and continue.

Do not ask unnecessary questions for every file.

---

# 92. No Placeholder Abuse

Temporary placeholders may exist only when the active milestone requires infrastructure before business implementation.

Placeholders must be clearly identifiable.

Examples:

```text
Foundation Application Shell
Health Endpoint
Empty Feature Route Boundary
```

Do not create dozens of fake pages saying:

```text
Coming Soon
```

and claim the application is implemented.

---

# 93. No Console-Only Features

A feature is not implemented when it only:

```text
console.log()
```

the intended action.

Examples:

```text
console.log("task completed")
console.log("notification sent")
console.log("journal saved")
```

Console logging may assist debugging.

It is not business functionality.

---

# 94. No Hardcoded Business Data

Do not hardcode production-facing user metrics.

Examples to avoid:

```text
80% Completion
7 Day Streak
540 XP
```

unless those values come from real data or clearly identified demo data.

Design mock values may exist during isolated UI development.

They must be replaced before the integrated feature is marked complete.

---

# 95. Frontend-First Quality Rule

The frontend is a major priority for this project.

Frontend milestones must receive deliberate attention to:

```text
Visual Hierarchy
Color
Typography
Spacing
Animation
Hover States
Responsive Design
Accessibility
Loading States
Empty States
Error States
Dark Mode
Performance
```

"Functional but ugly" is not final completion.

At the same time, frontend polish must not fake backend functionality.

Premium UI and real functionality are both required.

---

# 96. Core Product Priority

The primary Version 1 product loop is:

```text
Plan Activity
      │
      ▼
Receive Reminder
      │
      ▼
Complete Activity
      │
      ▼
See Progress
      │
      ▼
Build Consistency
      │
      ▼
Return Tomorrow
```

Engineering decisions should protect this loop.

If a technical addition creates major complexity without improving the primary product loop, it should be questioned.

---

# 97. Product Motivation Rule

The product motivates through visible progress.

Approved motivational mechanisms include:

```text
Completion Percentage
Not-Done Percentage
Progress Ring
XP
Streaks
Achievements
Constructive Messages
End-of-Day Summary
```

The product must not use manipulative or aggressive shame.

The product must remain truthful about unfinished work.

Motivation does not mean hiding failure data.

---

# 98. Quality Over File Count

The AI must not measure progress using:

```text
Number of Files Created
Number of Components
Lines of Code
Number of Dependencies
```

Progress is measured by:

```text
Verified Milestone Requirements
Working Product Behavior
Code Quality
User Experience
```

Creating more code is not automatically progress.

---

# 99. Completion Report Format

At the end of every milestone, the AI must provide:

```text
# Milestone Completion Report

## Milestone

<Milestone Name>

## Scope Completed

- ...

## Files Created

- ...

## Files Modified

- ...

## Commands Executed

- ...

## Verification Results

TypeScript: PASS / FAIL / NOT APPLICABLE
Lint: PASS / FAIL / NOT APPLICABLE
Tests: PASS / FAIL / NOT APPLICABLE
Build: PASS / FAIL / NOT APPLICABLE
Runtime: PASS / FAIL / NOT APPLICABLE

## Known Limitations

- ...

## Out-of-Scope Work Avoided

- ...

## Final Status

COMPLETE
or
INCOMPLETE
```

The final status must reflect actual verification.

---

# 100. Final Engineering Principle

Daily Development Tracker must be built using this principle:

> Understand first. Build the smallest approved scope. Verify everything. Preserve what works. Then move forward.

The project development loop is:

```text
READ
  │
  ▼
INSPECT
  │
  ▼
PLAN
  │
  ▼
IMPLEMENT
  │
  ▼
VERIFY
  │
  ▼
REVIEW
  │
  ▼
COMMIT
  │
  ▼
NEXT MILESTONE
```

Do not skip directly from:

```text
IDEA
```

to:

```text
BUILD EVERYTHING
```

The purpose of this constitution is to keep Daily Development Tracker:

* Fast to develop
* Clean
* Predictable
* Maintainable
* Technically credible
* Visually premium
* Deployment-ready

---

# DOCUMENT STATUS

**Version:** 1.0

**Status:** FROZEN

**Authority:** Mandatory AI and engineering governance document.

**Change Policy:** Changes require explicit project-level review.

This document is the engineering constitution for Daily Development Tracker Version 1.

Claude, Antigravity, coding agents, and human developers must follow it.

````

