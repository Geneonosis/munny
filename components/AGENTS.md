# components/

React components used across the application.

## Structure

| Path | Contents |
|---|---|
| `components/ui/` | shadcn/ui primitives — **do not edit manually**, managed by the shadcn CLI |
| `components/` (root) | Feature and page-level components authored for this project |

## Current Components

| File | Type | Purpose |
|---|---|---|
| `add-transaction-dialog.tsx` | Client | Dialog form for adding a new ledger entry to a specific bucket. Accepts `bucketId` and `availableCategories` as props. Amount entered in dollars, converted to cents on submit. Calls `router.refresh()` on success. |
| `edit-transaction-dialog.tsx` | Client | Dialog form for editing an existing ledger entry. Pre-fills all fields from the current row. Accepts `row` and `availableCategories`. Calls `PATCH /api/ledger/[id]` and `router.refresh()` on success. Re-syncs state to current row values on re-open. |
| `create-bucket-dialog.tsx` | Client | Dialog form for creating a new bucket. Accepts `bucketTypes` as props. |
| `edit-bucket-dialog.tsx` | Client | Dialog form for editing an existing bucket. Pre-fills name, type, currency, and status. Accepts `bucket` and `bucketTypes`. Calls `PATCH /api/buckets/[id]` and `router.refresh()` on success. Re-syncs state to current values on re-open. |
| `balance-pie-chart.tsx` | Client | Recharts `PieChart` showing each bucket's share of total balance. Receives `{ id, name, currentBalance, currency }[]`. Zero-balance buckets are excluded. Colors assigned from `--chart-N` CSS vars by index. |
| `balance-history-chart.tsx` | Client | Recharts `LineChart` showing running balance per bucket over time. Receives `buckets` and `series` (pre-computed time-series from the server). Includes a range `Slider` to control the visible window snapped to transaction dates. |
| `bucket-balance-history-chart.tsx` | Client | Recharts `LineChart` showing a single bucket's running balance over time. Receives `series: { date, balance }[]`. Includes a range `Slider`. Used on the per-bucket ledger page. |
| `ledger-sankey-chart.tsx` | Client | `@nivo/sankey` Sankey flow diagram showing how income flows into spending categories for a selected month. Includes a month dropdown derived from ledger rows. Handles surplus (→ "Retained" sink) and deficit (← "Deficit" source, distributed proportionally). Falls back to a message when no data exists for the period. |

## Rules

- **Do not** edit anything inside `components/ui/` — use the shadcn CLI to add or update primitives.
- Feature components that require state or event handlers must be marked `"use client"` at the top.
- Feature components should receive server-fetched data as props — do not fetch data inside client components.
- shadcn/ui is built on `@base-ui/react` (not Radix). Key API notes:
  - Use `render={<Component />}` instead of `asChild` on trigger/slot components.
  - `Select.onValueChange` provides `string | null` — guard against null (`(v) => v && setState(v)`).
- Recharts type gotchas:
  - `Tooltip` formatter receives `value: ValueType | undefined` — cast with `Number(value)`.
  - `PieLabelRenderProps` only contains built-in Recharts fields — use `percent` (0–1) not custom data keys.
- `@nivo/sankey` gotchas:
  - Nivo components must be `"use client"` — they use browser APIs.
  - Pass colors via the `colors` callback prop, not the `theme` prop.
  - Node `id` values must be unique strings and match exactly between `nodes` and `links`.
  - Nivo Sankey requires all `link.value` to be `> 0` — filter out zero-value links before passing data.
