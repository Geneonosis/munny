<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# munny — Project Overview

**munny** is an open source, local-first personal finance management system built with Next.js (App Router), SQLite, and Drizzle ORM. The goal is a self-hosted, eventually decentralized money management tool that users run via Docker.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (built on `@base-ui/react`) |
| Database | SQLite via `better-sqlite3` |
| ORM | Drizzle ORM |
| Migrations | Drizzle Kit (migration files in `drizzle/`) |
| Runtime | Node.js 20 |
| Container | Docker + Docker Compose |

## Project Structure

```
app/              # Next.js App Router pages, layouts, and API routes
  api/            # REST API route handlers
  api/_lib/       # Shared API utilities (response helpers)
  api/charts/     # Chart data computation endpoints
components/       # React components
  ui/             # shadcn/ui primitives (do not edit manually)
db/               # Drizzle schema, DB connection, and seed logic
drizzle/          # Generated SQL migration files (committed to git)
http/             # WebStorm .http files for manual API testing
lib/              # Shared utilities (cn(), etc.)
scripts/          # Standalone Node scripts (migrate, migrate-dev)
public/           # Static assets
data/             # SQLite database file(s) — gitignored, created at runtime
```

## Key Conventions

- **Never** commit anything under `data/` — it is gitignored and created at runtime.
- **Always** run `npm run db:generate` after changing `db/schema.ts` to produce a new migration file.
- **Always** run `npm run migrate:dev` locally (not `migrate`) to keep mock dev data in sync.
- The DB connection is configured via `DATABASE_URL` in `.env.local` for local dev, and as an environment variable in `docker-compose.yml` / `docker-compose.dev.yml` for Docker.
- `better-sqlite3` is a native module — it is listed in `serverExternalPackages` in `next.config.ts` and must stay there.
- **`.dockerignore` excludes `node_modules`** — this is critical. `better-sqlite3` is a native module compiled for a specific OS/arch. Without this exclusion, the macOS-compiled binary gets copied into the Linux container and fails with `Exec format error`.
- The `db` export in `db/index.ts` is a **lazy Proxy** — the SQLite connection is not opened until the first query. This allows Next.js to import the module at build time without a live database.
- **Every file that imports from `@/db` must export `export const dynamic = "force-dynamic"`** — both pages and API routes. Without it, Next.js tries to statically pre-render at build time and fails because the DB doesn't exist in the build container.
- shadcn/ui components live in `components/ui/` and are built on `@base-ui/react` — **not** Radix UI. The APIs differ from Radix (e.g. use `render={<Component />}` instead of `asChild`, `onValueChange` receives `string | null`).
- Pages are **Server Components** by default — query the DB directly. Only create `"use client"` components for interactivity (forms, dialogs, state).
- **All monetary amounts are stored as integers in cents** (e.g. $12.50 = `1250`). Never use floats for money. Format for display using `Intl.NumberFormat`.
- Chart colors are defined as `--chart-1` through `--chart-5` CSS variables in `app/globals.css`. The shadcn default values are grayscale — they have been overridden with colorful `oklch` values. Do not reset them to grayscale.
- Recharts is used for all charts (installed via `npx shadcn@latest add chart`). The `Tooltip` formatter receives `value: ValueType | undefined` — always cast with `Number(value)` before formatting.

## Running Locally

```bash
npm run migrate:dev   # apply migrations + seed with mock dev data (use this, not migrate)
npm run dev           # start Next.js dev server
```

## Running via Docker

```bash
docker compose up                                        # production container
docker compose -f docker-compose.dev.yml up --build     # dev container (--build required after any code change)
docker compose -f docker-compose.dev.yml down -v        # tear down and wipe the dev DB volume
```

