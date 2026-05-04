# db/

This directory contains all database layer code.

## Files

| File | Purpose |
|---|---|
| `schema.ts` | Drizzle ORM table definitions — the source of truth for the DB schema |
| `index.ts` | Initializes the `better-sqlite3` connection and exports the `db` Drizzle client |
| `seed.ts` | Seeds system-level reference data on first run (idempotent) |

## Schema Overview

### `bucket_types`
An extensible enum table representing the type of financial account a bucket can be.

- System types (`is_system = true`): `checking`, `savings`, `credit`, `cash`, `investment`, `crypto`, `brokerage` — **never delete these**.
- Users may add their own custom types (`is_system = false`).

### `buckets`
The core account/wallet entity. A bucket is any container that holds money (e.g. a checking account, a savings account, a cash envelope, a crypto wallet).

- `type_id` — FK → `bucket_types.id`
- `currency` — ISO 4217 currency code, default `"USD"`
- `status` — one of `"active"`, `"archived"`, `"deactivated"`, `"deleted"`
  - `active` — in normal use
  - `archived` — hidden from main views but retained for history
  - `deactivated` — temporarily disabled
  - `deleted` — soft-deleted; treat as gone for all practical purposes

## Rules

- **After any change to `schema.ts`**, run `npm run db:generate` from the project root to produce a new migration file in `drizzle/`.
- **Do not** manually edit generated migration files in `drizzle/`.
- The `db` client exported from `index.ts` is a synchronous `better-sqlite3`-backed Drizzle instance — do not use async/await on raw DB calls.

