# Engineering Notes

## How do we ensure audit logs aren't modified?

Right now the protection is at the application layer, not the database level.

There's no `PUT /audit-logs/:id` or `DELETE /audit-logs/:id` endpoint. The only way an audit log gets written is inside a Drizzle transaction together with the task mutation -- so if the task update fails, the log doesn't get written either. After insert, nothing in the codebase touches those rows again.

The weakness is that anyone with direct DB access can modify rows freely. SQLite has no row-level permissions so "immutable by convention" is really all we have right now.

To actually enforce this properly:
- Add a database trigger `BEFORE UPDATE` / `BEFORE DELETE` on the audit_logs table that always throws, so even direct DB access can't silently change records.
- Add a hash chain -- each log entry stores a hash of the previous one, so you can run a verification pass and detect if any row was tampered with.
- Move audit logs to a separate append-only store (a write-once object store, or an event stream like Kafka) that the main app can only write to, never update or delete.

---

## What's the riskiest part under real user load?

**SQLite**
Only one writer at a time. Concurrent mutations queue up and under enough load you'll start seeing timeouts or `SQLITE_BUSY` errors. This is the biggest structural bottleneck.

**`GET /tasks` fetches everything**
No pagination, no filtering -- it returns every task and every audit log in one shot. Works fine with 10 tasks, not so much with 10,000. The payload size and query time both grow linearly with data.

**No authentication**
The "actor" is just a string from a frontend dropdown. Anyone can claim to be anyone. There's nothing stopping a user from deleting tasks that aren't theirs.

**No rate limiting**
The Express server has no rate limiting so it's trivially easy to spam it.

---

## What would I refactor first if this grew into a bigger system?

**1. SQLite to Postgres**
Most urgent because it blocks everything else. Drizzle supports Postgres so the migration is mostly a config change plus running a schema migration. Unlocks concurrent writes, connection pooling, and row-level security.

**2. Authentication and authorization**
Without real user identity, multi-user features are basically fake. Need actual auth (JWT or session), then ownership checks on mutations so you can only touch your own tasks.

**3. Pagination on `getTasks`**
Once you have auth, each user's task list is scoped to them anyway -- which changes the query. Good time to add cursor-based pagination and server-side filtering at the same time rather than doing it twice.

**4. Separate audit log concerns**
If audit logs grow their own features (search, export, retention policies, verification), they should become their own module with a clear boundary -- not just a table that gets joined into the task query.

---

## AI usage

This entire project was built with Claude (Anthropic) as an AI assistant.

**What AI helped with:**
- Initial scaffolding for TanStack Router with `ensureQueryData` + `useSuspenseQuery`, wiring `QueryClientProvider` into the `Wrap` option, and the `createRootRouteWithContext` double-call pattern.
- Repetitive boilerplate: mutation options, Zod DTOs, component skeletons.
- Refactoring passes: splitting files into lib/hooks/routes, replacing nested ternaries with lookup objects, moving helpers into lib.
- TypeScript type errors that were annoying to debug (mostly around `getQueryData` return types and generic inference in mutation context).
- Creating the initial README with setup instructions, architecture overview, assumptions, trade-offs, and future improvements.

**How I validated it:**
- Every change went through `tsc --noEmit` before being considered done. Nothing was committed until typecheck passed.
- The pre-commit hook (Biome via lefthook) caught real issues in the shadcn-generated files (`==` vs `===`, unused param, array index key, missing biome-ignore placement) that slipped through AI output -- had to fix them manually before commits went through.
- Several server bugs were only caught by actually running the API: double-encoded JSON in the `mode: "json"` column (Drizzle serializes it, don't call `JSON.stringify` yourself), `.returning()` crashing inside a libSQL transaction, `inArray` with an empty array producing invalid SQL in SQLite. These weren't caught by types or linting -- needed runtime feedback.
- Architecture decisions (routes as controllers, mutation options without hooks, task card without callbacks) came from explicit feedback and direction, not AI initiative. The AI executed, the human steered.
