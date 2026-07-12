# Daily Development Tracker

> Your personal momentum and daily consistency platform.

[![Milestone](https://img.shields.io/badge/Milestone-01%20Foundation-6d28d9?style=flat-square)](contracts/milestone-01-foundation.md)
[![Status](https://img.shields.io/badge/Status-Foundation-amber?style=flat-square)]()

---

## Project Overview

Daily Development Tracker is a personal productivity and habit tracking platform designed to help developers build consistent daily routines, track progress, and maintain momentum through gamification and mindful analytics.

**Current State:** Milestone 01 — Application Foundation  
The application foundation infrastructure is established. Business features (planner, tasks, authentication, etc.) are planned for subsequent milestones.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS 3, Mission UI Design System |
| Frontend State | TanStack Query, React Context |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Motion | Framer Motion |
| Icons | Lucide React |
| Backend | Node.js, Express 4, TypeScript |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 (Docker local, Neon production) |
| Monorepo | npm Workspaces |
| Validation | Zod |
| Containerization | Docker Compose (database only) |

---

## Repository Structure

```
daily-development-tracker/
│
├── apps/
│   ├── web/                    # React PWA (Vite)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/ui/  # Mission UI primitives
│   │   │   ├── contexts/       # Theme context
│   │   │   ├── features/       # Feature modules (future milestones)
│   │   │   ├── hooks/
│   │   │   ├── lib/            # API client, QueryClient
│   │   │   └── styles/         # Mission UI global CSS tokens
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                    # Express REST API
│       ├── prisma/
│       │   └── schema.prisma   # Foundation schema (empty business models)
│       ├── src/
│       │   ├── config/env.ts   # Zod environment validation
│       │   ├── lib/            # Prisma singleton, response helpers
│       │   ├── middleware/     # Error handling
│       │   ├── routes/         # /api/v1 router
│       │   ├── app.ts          # Express application
│       │   └── server.ts       # HTTP server startup
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared TypeScript types and constants
│       └── src/
│           ├── contracts/      # ApiSuccessResponse, ApiErrorResponse
│           └── constants/      # API_VERSION, PRODUCT_NAME, error codes
│
├── docs/                       # Frozen architecture documents
├── contracts/                  # Engineering milestone contracts
│
├── docker-compose.yml          # PostgreSQL local development
├── .env.example                # Environment variable documentation
├── package.json                # Root npm workspace
├── tsconfig.base.json          # Strict TypeScript base config
└── README.md
```

---

## Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x (included with Node.js 20)
- **Docker Desktop** (for local PostgreSQL)

---

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd daily-development-tracker
```

### 2. Configure environment

Copy and edit environment files:

```bash
# Backend environment
cp .env.example apps/api/.env
# Edit apps/api/.env — set DATABASE_URL, CORS_ORIGIN

# Frontend environment
echo "VITE_API_BASE_URL=http://localhost:3001" > apps/web/.env
```

Default `apps/api/.env` values for local development:
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://ddt_user:ddt_password@localhost:5432/ddt_db
CORS_ORIGIN=http://localhost:5173
```

### 3. Install dependencies

```bash
npm install
```

---

## Docker PostgreSQL Setup

Start the local PostgreSQL database:

```bash
docker compose up -d
```

Verify it is running:

```bash
docker compose ps
```

PostgreSQL will be available at `localhost:5432` with:
- Database: `ddt_db`
- User: `ddt_user`
- Password: `ddt_password`

Data is persisted in a Docker named volume: `ddt_postgres_data`

---

## Prisma Commands

```bash
# Validate schema
npm run db:validate

# Generate Prisma client
npm run db:generate

# Run migrations (future — when business schema is added)
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

---

## Development Commands

```bash
# Start all services concurrently
npm run dev

# Start backend only
npm run dev:api

# Start frontend only
npm run dev:web
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health endpoint: http://localhost:3001/api/v1/health
- Readiness endpoint: http://localhost:3001/api/v1/health/ready

---

## Build Commands

```bash
# Build all workspaces
npm run build

# Type check all workspaces
npm run typecheck

# Lint all workspaces
npm run lint

# Format code
npm run format
```

---

## Verification Commands

```bash
# Full type check
npm run typecheck

# Lint
npm run lint

# Build (production)
npm run build

# Prisma validation
npm run db:validate

# Prisma client generation
npm run db:generate

# Docker PostgreSQL
docker compose config
docker compose up -d
docker compose ps

# Health endpoint (requires backend running)
curl http://localhost:3001/api/v1/health
curl http://localhost:3001/api/v1/health/ready
```

---

## API Endpoints (Milestone 01)

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health` | Application health check |
| GET | `/api/v1/health/ready` | PostgreSQL readiness check |

---

## Planned Features (Future Milestones)

The following features are planned but not yet implemented:

- User authentication (JWT)
- Daily planner
- Task management
- Recurring tasks
- Reminder scheduling
- Web push notifications
- Journal entries
- Mood tracking
- Analytics dashboard
- XP and streak gamification
- Achievements

---

## Architecture Documents

| Document | Description |
|---|---|
| [01_PRD.md](docs/01_PRD.md) | Product Requirements |
| [02_Architecture.md](docs/02_Architecture.md) | Software Architecture |
| [03_Database_Design.md](docs/03_Database_Design.md) | Database Design |
| [04_ERD.md](docs/04_ERD.md) | Entity Relationship Diagram |
| [05_API_Specification.md](docs/05_API_Specification.md) | REST API Specification |
| [06_UI_UX_Design_System.md](docs/06_UI_UX_Design_System.md) | Mission UI Design System |
| [07_Project_Constitution.md](docs/07_Project_Constitution.md) | Project Engineering Rules |

---

*This project is in active development. Milestone 01 (Foundation) is complete. Business features are planned for subsequent milestones.*
