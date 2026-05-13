# app/buckets/

Per-bucket detail pages.

## Routes

### `/buckets/[id]` — `app/buckets/[id]/page.tsx`

Server Component. Renders the full ledger view for a single bucket.

**Data fetched (all synchronous Drizzle queries):**
1. The bucket itself — joined with `bucket_types` to resolve `type.name` and `type.kind`.
2. All ledger entries for the bucket — left-joined with `categories` to resolve `categoryName`. Ordered by `date` ASC, then `id` ASC.
3. All categories — passed to `AddTransactionDialog` and `EditTransactionDialog` for the category selector.

**Running balance** is computed immutably server-side by reducing over the ordered entries. Each row gains a `running` field (cumulative cents). The final row's `running` value is the current bucket balance displayed in the header.

**Layout (top → bottom):**
1. Back link → `/`
2. Bucket header: name, type badge, currency, status badge, current balance
3. `AddTransactionDialog` button (top-right) — supports **transaction mode** and **balance entry mode**
4. Two-column chart grid:
   - Left: `LedgerSankeyChart` — monthly income→category flow diagram
   - Right: `BucketBalanceHistoryChart` — running balance line chart with date range slider
5. `BucketDailyFlowChart` — mirrored bar chart (income ↑ / spending ↓) with date range slider and summary panel
6. `LedgerTable` — paginated ledger (most-recent first), 10/25/50/100 rows per page, Date | Note | Category | Direction | Amount | Balance | Actions columns. Each row has an `EditTransactionDialog` trigger.

**Key gotchas:**
- Must export `export const dynamic = "force-dynamic"` — imports `@/db`.
- `params` is a `Promise<{ id: string }>` in Next.js 16 — always `await params` before reading `id`.
- The `rows` array passed to `LedgerSankeyChart` and chart components uses the already-computed `running` field — do not re-derive balance inside those components.
- `allCategories` and `currentBalance` are passed to `AddTransactionDialog` so it can compute the delta for balance entry mode.
- Ledger rows are ordered ascending (oldest first) for chart rendering, but `LedgerTable` displays them most-recent first by reversing the array before rendering.
