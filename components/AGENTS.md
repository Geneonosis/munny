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
| `add-transaction-dialog.tsx` | Client (`"use client"`) | Dialog form for adding a ledger entry to a specific bucket. Accepts `bucketId` as a prop. Amount entered in dollars and converted to cents on submit. Calls `router.refresh()` on success. |
| `balance-pie-chart.tsx` | Client (`"use client"`) | Recharts `PieChart` showing each bucket's share of total balance. Receives `{ id, name, currentBalance, currency }[]`. Zero-balance buckets are excluded. Colors assigned from `--chart-N` CSS vars by index. |
| `balance-history-chart.tsx` | Client (`"use client"`) | Recharts `LineChart` showing running balance per bucket over time. Receives `buckets` and `series` (pre-computed time-series from the server). Includes a `@base-ui/react` range `Slider` that snaps to transaction dates to control the visible window. |

## Rules

- **Do not** edit anything inside `components/ui/` — use the shadcn CLI to add or update primitives.
- Feature components that require state or event handlers must be marked `"use client"` at the top.
- Feature components should receive server-fetched data as props — do not fetch data inside client components.
- shadcn/ui is built on `@base-ui/react` (not Radix). Key API notes:
  - Use `render={<Component />}` instead of `asChild` on trigger/slot components.
  - `Select.onValueChange` provides `string | null` — guard against null.
- Recharts type gotchas:
  - `Tooltip` formatter receives `value: ValueType | undefined` — cast with `Number(value)`.
  - `PieLabelRenderProps` only contains built-in Recharts fields — use `percent` (0–1) not custom data keys like `pct`.
  - Custom data keys on pie slices are not passed to the label render function.

