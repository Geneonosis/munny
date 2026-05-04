# db/

This directory contains all database layer code.

## Files

| File | Purpose |
|---|---|
| `schema.ts` | Drizzle ORM table definitions — the source of truth for the DB schema |
| `index.ts` | Initializes the `better-sqlite3` connection and exports the `db` Drizzle client via a **lazy proxy** — the database file is not opened until the first query is made, allowing Next.js to import this module at build time without a live DB present |
| `seed.ts` | Two exports: `seed()` (system data only, idempotent) and `seedDev()` (system + mock dev data, idempotent) |

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

### `categories`
An extensible enum table for transaction categorisation.

- System categories (`is_system = true`): `income`, `food & dining`, `groceries`, `housing`, `utilities`, `transportation`, `entertainment`, `healthcare`, `shopping`, `savings & investment`, `transfer`, `other` — **never delete these**.
- Users may add their own custom categories (`is_system = false`) via `POST /api/categories`.

### `ledger`
The core transaction log. Every movement of money in or out of any bucket is a row here.

- `bucket_id` — FK → `buckets.id`
- `category_id` — FK → `categories.id`, nullable — optional classification of the transaction
- `amount` — integer, stored in **cents** (e.g. $12.50 = `1250`). Always positive.
- `flow` — `'in'` (money entering the bucket) or `'out'` (money leaving the bucket)
- `note` — optional description of the transaction
- `date` — the real-world transaction date (`YYYY-MM-DD`), not the insert timestamp
- `created_at` — when the row was inserted

**Balance formula:** `SUM(CASE WHEN flow = 'in' THEN amount ELSE -amount END)` per bucket.

**Transfers between buckets** are represented as two entries: one `out` from the source bucket, one `in` to the destination bucket.

**Never use floats for amounts** — always work in cents (integers).

## Rules

- **After any change to `schema.ts`**, run `npm run db:generate` from the project root to produce a new migration file in `drizzle/`.
- **Do not** manually edit generated migration files in `drizzle/`.
- The `db` client exported from `index.ts` is a synchronous `better-sqlite3`-backed Drizzle instance — do not use async/await on raw DB calls.
