# drizzle/

This directory contains **generated** SQL migration files produced by Drizzle Kit. **Do not manually edit these files.**

## How migrations work

1. Edit `db/schema.ts` with your changes.
2. Run `npm run db:generate` — Drizzle Kit diffs the schema against the existing migrations and writes a new `.sql` file here.
3. Run `npm run migrate` — applies any pending migrations to the local SQLite DB and re-runs the seed.
4. Commit the new migration file to git alongside your schema change.

## In Docker

`docker compose up` automatically runs `npm run migrate` before starting the Next.js server, so the DB is always up to date on container start.

## meta/

The `meta/` subdirectory is managed entirely by Drizzle Kit (snapshot state). Do not edit it manually.

