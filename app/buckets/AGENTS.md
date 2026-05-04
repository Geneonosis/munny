# app/buckets/

Per-bucket detail pages.

## Routes

### `/buckets/[id]` — `app/buckets/[id]/page.tsx`

Server Component. Renders the full ledger view for a single bucket.

**Data fetched (all synchronous Drizzle queries):**
1. The bucket itself — joined with `bucket_types` to resolve `type.name`.
2. All ledger entries for the bucket — left-joined with `categories` to resolve `categoryName`. Ordered by `date`, then `id`.
3. All categories — passed to `AddTransactionDialog` and `EditTransactionDialog` for the category selector.

**Running balance** is computed immutably server-side by reducing over the ordered entries. Each row gains a `running` field (cumulative cents). The final row's `running` value is the current bucket balance displayed in the header.

**Layout (top → bottom):**
1. Back link → `/`
2. Bucket header: name, type badge, currency, status badge, current balance
3. `AddTransactionDialog` button (top-right)
4. Two-column chart grid:
   - Left: `LedgerSankeyChart` — monthly income→category flow diagram
   - Right: `BucketBalanceHistoryChart` — running balance line chart with slider
5. Ledger table: Date | Note | Category | Direction | Amount | Balance | Actions
   - Each row has an `EditTransactionDialog` trigger

**Key gotchas:**
- Must export `export const dynamic = "force-dynamic"` — imports `@/db`.
- `params` is a `Promise<{ id: string }>` in Next.js 16 — always `await params` before reading `id`.
- The `rows` array passed to `LedgerSankeyChart` uses the already-computed `running` field — do not re-derive balance inside the chart component.
- `allCategories` from the DB is passed to both dialog components so they share the same list.

