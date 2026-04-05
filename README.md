# Weather Alert System

A production-grade full-stack weather monitoring platform built with React 18, Express, Prisma, and WebSocket real-time updates. Create custom weather alerts, explore conditions, and receive instant notifications when thresholds are breached.

## Architecture

```mermaid
graph TB
    subgraph Frontend ["Frontend (React 18 + TypeScript)"]
        UI[UI Components] --> Pages[Pages]
        Pages --> API[API Service + Axios]
        Pages --> WS[Socket.io Client]
        Auth[Auth Context] --> API
    end

    subgraph Backend ["Backend (Express + TypeScript)"]
        Routes[Routes + Swagger] --> Controllers
        Controllers --> Services
        Services --> DB[(PostgreSQL + Prisma)]
        Services --> TomorrowAPI[Tomorrow.io API]
        SocketSvc[Socket.io Server] --> WS
        Scheduler[Alert Evaluator] --> Services
        Scheduler --> SocketSvc
    end

    API --> Routes
    WS --> SocketSvc
```

## Features

- **Dashboard** — Overview stats, weather metrics, system health
- **Weather Explorer** — Multi-location comparison with real-time data
- **Alert Wizard** — 3-step form (Location → Condition → Review) for creating monitors
- **Live Status** — WebSocket-powered real-time alert monitoring with timeline feed
- **Auth System** — JWT-based registration/login with protected routes
- **Notifications** — In-app notification bell with unread count
- **Dark Mode** — System-preference-aware theme toggle
- **API Docs** — Interactive Swagger UI at `/api/docs`
- **Responsive** — Mobile-first design with hamburger navigation

## Tech Stack

| Layer     | Technology                                                       |
| --------- | ---------------------------------------------------------------- |
| Frontend  | React 18, TypeScript, Tailwind CSS 3, Recharts, Socket.io Client |
| Backend   | Express 4, TypeScript, Prisma ORM, Zod validation                |
| Database  | PostgreSQL 16                                                    |
| Auth      | JWT + bcrypt                                                     |
| Real-time | Socket.io                                                        |
| API Docs  | Swagger / OpenAPI 3.0                                            |
| Testing   | Jest, Supertest, React Testing Library                           |
| CI/CD     | GitHub Actions                                                   |
| Infra     | Docker Compose                                                   |

## Quick Start

### Prerequisites

- Node.js ≥ 18
- PostgreSQL (or Docker)
- [Tomorrow.io API key](https://www.tomorrow.io/weather-api/)

### Option 1: Docker (recommended)

```bash
# Clone the repo
git clone <repo-url> && cd weather-alert-system

# Create backend env file
cp backend/.env.example backend/.env
# Edit backend/.env with your TOMORROW_API_KEY

# Start everything
docker compose up -d

# Run database migrations
docker compose exec backend npx prisma migrate deploy
```

Frontend: http://localhost:3000 | Backend: http://localhost:5000 | Swagger: http://localhost:5000/api/docs

### Option 2: Manual Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env    # Edit with your DB URL + API key
npx prisma generate
npx prisma migrate dev
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

### Environment Variables

**Backend** (`backend/.env`):

```
DATABASE_URL=postgresql://user:pass@localhost:5432/weather_alerts
TOMORROW_API_KEY=your_key_here
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env`):

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
```

## Project Structure

```
weather-alert-system/
├── .github/workflows/ci.yml    # GitHub Actions CI
├── docker-compose.yml           # One-command setup
├── backend/
│   ├── prisma/schema.prisma     # Database models (User, Alert, Evaluation, Notification)
│   └── src/
│       ├── controllers/         # Auth, Alert, Weather, Notification controllers
│       ├── middleware/           # Auth JWT, error handler, rate limiter
│       ├── routes/              # Express routes with Swagger annotations
│       ├── services/            # Weather, AlertEvaluation, Socket, Notification
│       ├── utils/               # Zod schemas, validators, constants
│       └── swagger.ts           # OpenAPI spec
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ui/              # Button, Card, Input, Select, Badge, Modal, Skeleton, EmptyState
│       │   ├── charts/          # AlertTrendChart (Recharts)
│       │   ├── ErrorBoundary.tsx
│       │   └── Footer.tsx
│       ├── context/             # AuthContext, SocketContext
│       ├── pages/               # Dashboard, Weather, Alerts, Status, Login, Register, 404
│       ├── services/api.ts      # Axios client with auth interceptor
│       └── types/index.ts       # Shared TypeScript interfaces
└── agents/                      # AI agent skills & conventions
```

## Testing

```bash
# Backend unit tests
cd backend && npm test

# With coverage
npm run test:coverage

# Frontend tests
cd frontend && npm test
```

## API Overview

| Method | Endpoint                      | Auth | Description             |
| ------ | ----------------------------- | ---- | ----------------------- |
| POST   | `/api/auth/register`          | —    | Create account          |
| POST   | `/api/auth/login`             | —    | Get JWT token           |
| GET    | `/api/auth/me`                | ✅   | Current user            |
| GET    | `/api/weather?location=`      | —    | Weather data            |
| GET    | `/api/alerts`                 | opt  | List alerts (paginated) |
| POST   | `/api/alerts`                 | opt  | Create alert            |
| DELETE | `/api/alerts/:id`             | opt  | Delete alert            |
| GET    | `/api/alerts/stats`           | opt  | Aggregate statistics    |
| GET    | `/api/alerts/:id/history`     | opt  | Evaluation history      |
| GET    | `/api/notifications`          | ✅   | User notifications      |
| PATCH  | `/api/notifications/:id/read` | ✅   | Mark as read            |

Full interactive docs: `/api/docs`

## Design Decisions

- **Compound Components** (Card) — Flexible, composable UI building blocks
- **Explicit Variants** (Button, Badge) — Type-safe styling via variant props, no boolean soup
- **Zod Validation** — Shared schema validation on both frontend and backend boundaries
- **Optional Auth** — Alerts work for anonymous users; auth adds ownership + notifications
- **WebSocket + Fallback** — Socket.io for real-time with periodic polling fallback
- **Error Boundaries** — Graceful error recovery in React component tree

## License

MIT
