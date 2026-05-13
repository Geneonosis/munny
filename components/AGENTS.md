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
| `add-transaction-dialog.tsx` | Client | Dialog for adding a new ledger entry. Has two modes: **transaction** (enter amount + flow direction) and **balance** (enter the new account balance — the delta is auto-computed and the flow direction is inferred, supporting both gains and losses). Accepts `bucketId`, `availableCategories`, and `currentBalance` props. Calls `router.refresh()` on success. |
| `edit-transaction-dialog.tsx` | Client | Dialog for editing an existing ledger entry. Pre-fills all fields. Accepts `row` and `availableCategories`. Calls `PATCH /api/ledger/[id]` and `router.refresh()` on success. Re-syncs state on re-open. |
| `create-bucket-dialog.tsx` | Client | Dialog for creating a new bucket. Accepts `bucketTypes` as props. |
| `edit-bucket-dialog.tsx` | Client | Dialog for editing an existing bucket. Pre-fills name, type, currency, and status. Accepts `bucket` and `bucketTypes`. Calls `PATCH /api/buckets/[id]` and `router.refresh()` on success. Re-syncs state on re-open. |
| `balance-pie-chart.tsx` | Client | Recharts `PieChart` showing each bucket's share of total balance. Zero-balance buckets excluded. No labels on slices — legend only. Legend items are stacked vertically, left-aligned, small font, breaks into columns on overflow. Colors assigned via `buildColorMap` from `lib/chart-colors.ts`. |
| `balance-history-chart.tsx` | Client | Recharts chart showing running balance per bucket over time. Supports two display modes toggled by the user: **line chart** (individual bucket lines) and **area/stacked chart** (cumulative stacked areas). Buckets can be individually toggled on/off — visibility is persisted in Zustand (`useChartStore`). Includes a date range `Slider` (default: last 30 days, max: last 90 days). Custom tooltip shows each bucket's value and day-over-day delta (green +/red −). Colors assigned via `buildColorMap`. Y-axis anchoring varies by bucket type (see AGENTS.md root). |
| `bucket-balance-history-chart.tsx` | Client | Recharts `LineChart` for a single bucket's running balance over time. Includes a date range `Slider`. Custom tooltip shows the balance and day-over-day delta. Y-axis starts at `0` for non-brokerage accounts; starts at the series minimum for brokerage/investment. |
| `bucket-daily-flow-chart.tsx` | Client | Recharts `BarChart` (mirrored) showing daily income vs spending for a single bucket. Income bars grow upward (green), spending bars grow downward (red). Bars for the same day share the same x-position. Bottom of income bars and top of spending bars have `borderRadius: 0` (flat at the axis). Includes a date range `Slider` matching the same defaults as `balance-history-chart`. Right side shows a summary panel: total income, total spending, net, and income-to-debt ratio for the visible range. |
| `ledger-sankey-chart.tsx` | Client | `@nivo/sankey` Sankey flow diagram for a single bucket, showing how income flows into spending categories for a selected month. Handles surplus (→ "Retained") and deficit (← "Deficit", distributed proportionally). Falls back to a message when no data exists. **Dark mode:** uses `blendMode="normal"` (not `multiply`) to prevent SVG color corruption on dark backgrounds. Node label color is set via Nivo's `theme.labels.text.fill` using a JS variable that reads `--foreground` from the computed CSS. |
| `ledger-table.tsx` | Client | Paginated table of ledger entries for a single bucket. Shows most-recent entries first. Columns: Date, Note, Category, Direction, Amount, Balance, Actions. Pagination options: 10 / 25 / 50 / 100 rows. Each row has an `EditTransactionDialog` trigger. |
| `theme-toggle.tsx` | Client | Light/dark/system theme toggle button using `next-themes`. Lives in the global nav/header. |

## Rules

- **Do not** edit anything inside `components/ui/` — use the shadcn CLI to add or update primitives.
- Feature components that require state or event handlers must be marked `"use client"` at the top.
- Feature components should receive server-fetched data as props — do not fetch data inside client components.
- shadcn/ui is built on `@base-ui/react` (not Radix). Key API notes:
  - Use `render={<Component />}` instead of `asChild` on trigger/slot components.
  - `Select.onValueChange` provides `string | null` — guard against null (`(v) => v && setState(v)`).
- Recharts type gotchas:
  - `Tooltip` `content` prop type requires `readonly` payload — type your custom renderer accordingly or cast.
  - `Tooltip` formatter receives `value: ValueType | undefined` — cast with `Number(value)`.
  - `PieLabelRenderProps` only contains built-in Recharts fields — use `percent` (0–1) not custom data keys.
- `@nivo/sankey` gotchas:
  - Nivo components must be `"use client"` — they use browser APIs.
  - Use `blendMode="normal"` — `multiply` breaks dark mode (colors become invisible on dark backgrounds).
  - SVG text color must be set through `theme={{ labels: { text: { fill: color } } }}` — CSS classes do not reach inside SVG text.
  - Node `id` values must be unique strings and match exactly between `nodes` and `links`.
  - All `link.value` must be `> 0` — filter out zero-value links before passing data.
- **Global chart state:** use `useChartStore` from `lib/chart-store.ts` (Zustand) to read/write which buckets are hidden. This is persisted via `localStorage` under the key `munny-chart-prefs`.
- **Chart colors:** always use `buildColorMap` / `getChartColor` from `lib/chart-colors.ts`. Never hardcode colors or use the old `--chart-N` CSS variables for data series.
