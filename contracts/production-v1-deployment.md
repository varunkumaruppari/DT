# Production V1 Deployment Contract

This document serves as the authoritative production deployment contract for the Daily Development Tracker Version 1. It defines the deployment strategy, connection settings, build/execution commands, and smoke-testing matrix required to transition the verified baseline to live production environments.

---

## 1. Production Architecture
The Version 1 target architecture consists of the following production services:

- **Database**: Neon PostgreSQL (Serverless PostgreSQL instance)
- **Backend API & Workers**: Railway (Persistent container instance)
- **Frontend PWA Client**: Vercel (Static CDN with SPA routing)
- **Repository Source**: GitHub (Main branch tracking)

---

## 2. Selected Backend Platform
**Selected Platform**: `RAILWAY`

### Technical Rationale
- **Persistent Workers**: The application runs a 15-second background polling process (`NotificationQueueWorker`) to deliver task reminders. Render's free tier spins down instances after 15 minutes of inactivity, which would halt notification execution. Railway maintains continuously running services.
- **Graceful Shutdown**: The Express API process registers handlers for `SIGTERM` and `SIGINT` to safely drain connection pools and notify the workers. Railway respects graceful SIGTERM signals, ensuring zero lost notifications.
- **Unified Build Config**: Railway dynamically detects multi-workspace configurations and handles shared workspace building cleanly.

---

## 3. Repository Roots & Working Directories
- **Repository Checkout Root**: `/` (Root directory of the workspace)
- **Railway Service Root Directory**: `/` (Must be configured as repository root to resolve shared workspace packages)
- **Railway Install Working Directory**: `/`
- **Railway Build Working Directory**: `/`
- **Railway Start Working Directory**: `/`

> [!IMPORTANT]
> Do NOT set Railway Service Root to `apps/api`. Doing so isolates npm installs from the shared packages directory `/packages/shared`, preventing the local `@ddt/shared` workspace dependency from compiling.

---

## 4. Exact Build/Start Commands

### Backend API (Railway)
- **Workspace Build Command**:
  ```bash
  npm run build --workspace=packages/shared && npm run build --workspace=apps/api
  ```
- **Execution / Start Command**:
  ```bash
  node apps/api/dist/server.js
  ```

### Frontend PWA (Vercel)
- **Vercel Install Command**:
  ```bash
  npm install
  ```
- **Vercel Build Command**:
  ```bash
  npm run build --workspace=packages/shared && npm run build --workspace=apps/web
  ```
- **Frontend Output Directory**: `apps/web/dist`

---

## 5. Neon Database Deployment Sequence & Prisma Strategy
The production database migration strategy is strictly:
```text
PRISMA MIGRATE DEPLOY
```
*Note: `prisma db push` is prohibited in production as it bypasses transaction-safe migrations.*

### Detailed Execution Sequence
1. Create a serverless PostgreSQL project in **Neon**.
2. Retrieve the direct connection URL.
3. Configure the direct connection URL as the `DATABASE_URL` environment variable for building.
4. Run the production migration command from the repository checkout root:
   ```bash
   npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
   ```
5. Run the database seed script to populate the `Achievement` catalog:
   ```bash
   npx tsx apps/api/prisma/seed.ts
   ```

---

## 6. Achievement Seeding Resolution
- **Startup Auto-Seeding**: `NO`. The Express API server startup does not automatically seed the database achievement catalog.
- **Manual Production Seed Required**: `MANUAL PRODUCTION SEED REQUIRED`. Seeding must be triggered manually once after database migrations using:
  ```bash
  npx tsx apps/api/prisma/seed.ts
  ```
- **Prisma Seed Configuration**: Exists under the `"prisma": { "seed": "tsx prisma/seed.ts" }` options in `apps/api/package.json`.

---

## 7. Neon Connection Strategy
- **Runtime DATABASE_URL**: `NEON DIRECT URL`
- **Migration DATABASE_URL**: `NEON DIRECT URL`
- **Prisma directUrl Configured**: `NO`
- **Second Migration URL Supported**: `NO`
- **Separate URLs Without Code Changes**: `NO`

### Technical Decision
Since the database schema does not define `directUrl` and `config/env.ts` only validates a single `DATABASE_URL`, using separate pooled and direct URLs is unsupported without application changes. To ensure that `prisma migrate deploy` does not fail due to pgBouncer transaction limitations, the **Neon Direct URL** must be utilized as the single, primary `DATABASE_URL` for both runtime operations and migrations.

---

## 8. Service Worker Production API Routing
- **Service Worker API Base Source**: Dynamically received from the React host via `postMessage` on startup and controller changes.
- **Uses VITE_API_BASE_URL**: `YES` (The host reads `import.meta.env.VITE_API_BASE_URL` and sends it to the worker).
- **Uses Relative API URL**: `NO` (The service worker intercepts relative URLs and prefixes them with the persisted base configuration).
- **Persistence Mechanism**: Cache Storage API (cached under URL key `https://ddt-config.local/api-base-url` in storage pool `ddt-config`). This ensures configuration survives service worker termination and background lifecycle restarts.
- **Safe Fallback**: If the API base URL configuration is missing, the service worker aborts the action fetch, logging a sanitized error and closing the notification safely. It never makes fallback relative requests to the frontend Vercel host.

---

## 9. CORS & Production Connection Policy
- **CORS_ORIGIN**: Must match the production frontend Vercel URL exactly (e.g. `https://tracker.yourdomain.com`). Wildcards are prohibited in production.
- **VITE_API_BASE_URL**: Configured as the backend Railway URL (e.g. `https://api.railway.app`).

---

## 10. Worker Deployment Model & Replica Count
- **Execution Model**: Combined process execution (workers run as background timeouts inside the main Express Node.js thread).
- **Replica Count**: **Exactly 1 replica instance** is recommended for the initial V1 deployment to avoid multi-instance row lock contentions.

---

## 11. Railway Health Check
- **Recommended Railway Health Check Path**: `/api/v1/health/ready`
- **Reason**: Unlike `/api/v1/health` (which only checks system uptime), the `/ready` route executes a `SELECT 1` database query, verifying connection pool health before admitting user traffic.

---

## 12. Vercel Deployment Configuration
- **Root Directory**: Root of project `/`.
- **Framework Preset**: `Vite`.
- **Output Directory**: `apps/web/dist`.
- **Vercel Config Path**: `/vercel.json` (At the repository checkout root).
- **cleanUrls**: `true`
- **SPA Rewrites**: Routes all SPA navigation deep links (excluding API paths `/api/v1/...`) to `/index.html`. Existing static assets (such as CSS, JS, manifests, icons, and service workers) are served natively by Vercel directly from the output directory without rewrite interception.

---

## 13. Production Risks
- **Uptime**: Low (Railway process monitoring maintains standard restarts).
- **Neon Cold Starts**: Neon database instances sleep after 5 minutes of zero traffic. Direct queries might incur a 1.5-second latency on wake. Standard connection timeout is configured to handle this safely.
- **PWA Service Worker caching**: Service worker precaches assets statically. Updates must be managed via standard Cache-Control headers.

---

## 14. Deployment Order
1. **Neon Project Creation**: Provision the PostgreSQL database.
2. **Database Migrations**: Run `prisma migrate deploy` and `seed` from a secure console.
3. **Backend Deployment**: Push backend API to Railway with all required environmental secrets. Retrieve backend live URL.
4. **Frontend Deployment**: Push frontend React project to Vercel containing `/vercel.json`. Extract live client URL.
5. **CORS Update**: Configure `CORS_ORIGIN` on Railway to point to the frontend Vercel URL. Restart backend service.

---

## 15. Expanded Post-Deployment Smoke Test Matrix
*Note: These tests must be executed after live deployment.*

1. **GET /api/v1/health** => Returns `200 OK` (Health stats response)
2. **GET /api/v1/health/ready** => Returns `200 OK` (Database connected payload)
3. **POST /api/v1/auth/register** => Returns `201 Created` (AccessToken generated)
4. **POST /api/v1/auth/login** => Returns `200 OK` (User login profile)
5. **GET /api/v1/dashboard/today** => Returns `200 OK` (Greeting & Tasks payload)
6. **POST /api/v1/planners** => Returns `201 Created` (Daily planner initialized)
7. **POST /api/v1/categories** => Returns `201 Created` (Category created)
8. **POST /api/v1/tasks** => Returns `201 Created` (Task created)
9. **POST /api/v1/tasks/:id/complete** => Returns `200 OK` (Task completed, XP awarded)
10. **GET /api/v1/analytics/daily** => Returns `200 OK` (Analytics showing completed tasks)
11. **POST /api/v1/journal** => Returns `201/200` (Journal created and restores)
12. **GET /api/v1/xp/history** => Returns `200 OK` (XP history audit records)
13. **PUT /api/v1/mood/today** => Returns `200 OK` (Mood checked-in successfully)
14. **POST /api/v1/recurring-tasks** => Returns `201 Created` (Recurring task generated)
15. **Recurring Worker check** => Run worker and check generated tasks in planner
16. **Reminder schedule check** => Verify `ReminderSchedule` created on task creation
17. **GET /api/v1/push-subscriptions/config** => Returns `200 OK` (VAPID key)
18. **POST /api/v1/push-subscriptions** => Returns `201 Created` (Browser sub registered)
19. **Push delivery check** => Check push notification delivered on device
20. **Notification complete button** => Complete task directly from device alert action
21. **Notification snooze button** => Snooze task directly from device alert action
22. **Notification dismiss button** => Dismiss alert directly from device alert action
23. **SW API routing check** => Verify relative API action calls resolve to absolute backend url
24. **PWA installation** => Test chrome PWA install prompt
25. **Page refresh routing** => Refresh `/journal` page and check no 404 is thrown
26. **Mobile layout audit** => Verify navbar fits on 360px viewport
27. **CORS validation** => Check cross-origin requests from invalid domains are blocked
28. **Cross-user isolation check** => Assert User A token cannot read User B schedules
29. **Settings updates** => Patch timezone settings and verify planner dates adjust

---

## 16. Git Boundary & Freeze Rules
- No changes to any application, schema, or configuration files are permitted during this phase.
- Only this contract (`contracts/production-v1-deployment.md`) may be modified.
