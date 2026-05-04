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
| Database | SQLite via `better-sqlite3` |
| ORM | Drizzle ORM |
| Migrations | Drizzle Kit (migration files in `drizzle/`) |
| Runtime | Node.js 20 |
| Container | Docker + Docker Compose |

## Project Structure

```
app/          # Next.js App Router pages and layouts
db/           # Drizzle schema, DB connection, and seed logic
drizzle/      # Generated SQL migration files (committed to git)
scripts/      # Standalone Node scripts (migrate, etc.)
public/       # Static assets
data/         # SQLite database file — gitignored, created at runtime
```

## Key Conventions

- **Never** commit anything under `data/` — it is gitignored and created at runtime.
- **Always** run `npm run db:generate` after changing `db/schema.ts` to produce a new migration file.
- **Always** run `npm run migrate` locally (or let Docker do it on startup) to apply migrations and seed data.
- The DB connection is configured via `DATABASE_URL` in `.env.local` for local dev, and as an environment variable in `docker-compose.yml` for Docker.
- `better-sqlite3` is a native module — it is listed in `serverExternalPackages` in `next.config.ts` and must stay there.

## Running Locally

```bash
npm run migrate   # apply migrations + seed
npm run dev       # start Next.js dev server
```

## Running via Docker

```bash
docker compose up   # builds image, applies migrations, starts app on :3000
```

