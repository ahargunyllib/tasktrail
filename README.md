# TaskTrail

Simple task tracking app with an audit log for every action. Built with Express + Drizzle on the backend and React + TanStack Router/Query on the frontend.

## Running the app

Requires Node.js 20+ and pnpm.

```bash
pnpm i
```

Run the database migration before starting the server for the first time:

```bash
cd apps/server && pnpm db:migrate
```

Then run both apps:

```bash
pnpm dev
```

Or run them separately:

```bash
# terminal 1
cd apps/server && pnpm dev   # http://localhost:3000

# terminal 2
cd apps/web && pnpm dev      # http://localhost:3001
```

The server defaults to port 3000, web to 3001. No `.env` needed for local dev, but you can override:

```
# apps/server
CORS_ORIGIN=http://localhost:3001
DB_FILE_NAME=file:local.db

# apps/web
VITE_SERVER_URL=http://localhost:3000
```

## Architecture

```
apps/
  server/   Express API + Drizzle ORM + libSQL (SQLite)
  web/      React + Vite + TanStack Router + TanStack Query
```

**Server** is a plain Express app. Routes are thin controllers that validate request bodies with Zod DTOs then call query functions. All mutations go through Drizzle transactions so the audit log entry and the task update are always atomic.

**Web** uses TanStack Router for file-based routing and TanStack Query for server state. The router's `loader` pre-fetches data via `ensureQueryData` before the route renders, so there's no loading spinner on navigation. Mutations invalidate the query cache on settle. The `QueryClient` lives in the router's `Wrap` option so it's available to devtools inside the router tree.

Component structure:
- `src/routes/` act like controllers -- route definition, loader, and the page container component
- `src/components/` holds reusable presentational and self-contained components (TaskCard with its own AdvanceButton/DeleteButton mutations, AuditLogList, etc.)
- `src/hooks/` for form logic (useCreateTaskForm)
- `src/lib/` for api client, domain types, query options, and formatters

## Assumptions

- One user per "session" selected from a dropdown. There's no real auth -- actor name is just a string.
- Tasks can only move forward through statuses: `to_do -> pending -> in_progress -> done`. No going back.
- Soft delete -- deleted tasks are hidden from the list but stay in the DB so their audit logs are preserved.
- Audit logs are immutable by convention (no update/delete endpoint exists for them), not enforced at DB level.
- SQLite is fine for a demo/single-instance deployment. Wouldn't use it for anything with real concurrent writes.

## Trade-offs

**SQLite over Postgres** -- Zero setup for a take-home project but it serializes all writes. Fine for one user, becomes a bottleneck fast under concurrent load.

**No auth** -- The actor dropdown is a shortcut to demo multi-user audit logging without building a login flow. In a real system this is the first thing to add.

**Fetch all tasks in one request** -- `GET /tasks` returns every task with every audit log. Simple to implement and fine for small data, but won't scale. A real system needs pagination, filtering, and probably separate endpoints for tasks vs. audit logs.

**No optimistic updates** -- Removed to keep the mutation code simple. The UI reflects the actual server state after each mutation which is safer but slightly slower feeling.

## If I had more time

1. **Authentication** -- Real user identity instead of a string dropdown. JWT or session-based, with ownership checks so you can only mutate your own tasks.

2. **Pagination** -- The current "fetch everything" approach needs to be replaced with cursor-based pagination before the task list grows at all.

3. **Postgres** -- Drop-in replacement for libSQL with Drizzle, but unlocks proper concurrent writes, connection pooling, and row-level security for multi-tenant isolation.

4. **Audit log integrity** -- Add a hash chain (each log entry stores a hash of the previous one) so you can detect if someone tampers with the records directly in the DB.

5. **Error toasts** -- Right now mutations fail silently from the user's perspective if the server returns an error. Should surface these with a toast notification.

6. **Tests** -- At minimum: integration tests for the status transition logic and a couple of e2e tests for the happy path (create, advance, delete).
