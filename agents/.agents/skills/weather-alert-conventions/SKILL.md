# Weather Alert System — Conventions & Patterns

## Architecture

This is a full-stack weather monitoring platform with:

- **Frontend**: React 18 + TypeScript + Tailwind CSS (CRA-based)
- **Backend**: Express 4 + TypeScript + Prisma ORM + PostgreSQL
- **Real-time**: Socket.io for WebSocket communication
- **Auth**: JWT + bcrypt with optional auth on most routes

## Code Conventions

### Backend

- **Validation**: Use Zod schemas (in `src/utils/schemas.ts`) at the controller boundary. Never trust raw `req.body`.
- **Error handling**: Throw `AppError(statusCode, message)` from controllers. The global `errorHandler` middleware catches them.
- **Controllers**: Always use `try/catch` with `next(error)`. Return consistent shape: `{ data, pagination? }` for lists, `{ data }` for single items.
- **Auth**: Use `authMiddleware` for protected routes, `optionalAuth` when auth is optional. Access `(req as AuthRequest).userId`.
- **Prisma**: Access via singleton from `src/db.ts`. Include `evaluations` on alert queries with `orderBy: { evaluatedAt: 'desc' }, take: 1` for latest status.
- **WebSocket**: Use `SocketService.getInstance()` singleton. Emit events: `alert:triggered`, `alert:created`, `alert:deleted`, `notification`.
- **Routes**: Add Swagger JSDoc annotations on every route handler.

### Frontend

- **Component patterns**:
  - **Compound components** for layout containers (e.g., `Card` with `Card.Header`, `Card.Body`, `Card.Footer`)
  - **Explicit variant props** for styling (e.g., `<Button variant="primary">`, `<Badge variant="danger">`)
  - No boolean props for variants — use string union types instead
- **State management**: React Context (`AuthContext`, `SocketContext`) + local `useState` per page. No Redux.
- **API calls**: Use `services/api.ts` centralized Axios instance. Auth token auto-injected via interceptor.
- **Styling**: Tailwind utility classes. Design tokens defined in `tailwind.config.js` (primary/secondary/success/danger color scales). Reusable classes in `App.css` component layer (`@apply` directives).
- **Loading states**: Use `Skeleton` components, never just "Loading..." text.
- **Empty states**: Use `EmptyState` component with variant-based icons.
- **Forms**: Multi-step wizards preferred for complex forms. Client-side validation before submit. Show errors inline.
- **Toasts**: Use `react-hot-toast` for success/error feedback. Never `alert()` or `window.confirm()`. Use `ConfirmModal` for destructive actions.

### Shared

- **TypeScript**: Strict mode. Shared types in `types/index.ts` on both sides.
- **Naming**: PascalCase for components/types, camelCase for functions/variables, UPPER_SNAKE for constants.
- **File structure**: Feature-based organization. `ui/` for reusable primitives, `pages/` for route-level components.

## Key Files

| File                                       | Purpose                               |
| ------------------------------------------ | ------------------------------------- |
| `backend/src/utils/schemas.ts`             | All Zod validation schemas            |
| `backend/src/middleware/errorHandler.ts`   | AppError class + global error handler |
| `backend/src/middleware/authMiddleware.ts` | JWT auth + optional auth              |
| `backend/src/services/socketService.ts`    | WebSocket singleton                   |
| `frontend/src/components/ui/`              | Design system primitives              |
| `frontend/src/context/AuthContext.tsx`     | Auth state + login/register/logout    |
| `frontend/src/context/SocketContext.tsx`   | WebSocket connection                  |
| `frontend/src/services/api.ts`             | Axios client with all API methods     |

## Adding New Features

1. **New API endpoint**: Add Zod schema → controller → route (with Swagger) → optional socket event
2. **New page**: Create in `pages/`, use UI components, add route in `App.tsx`
3. **New UI component**: Add to `components/ui/`, use variant pattern, export from the file
4. **Database change**: Modify `prisma/schema.prisma` → `npx prisma migrate dev`
