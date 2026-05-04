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
| `create-bucket-dialog.tsx` | Client (`"use client"`) | Dialog form for creating a new bucket. Accepts `bucketTypes` as a prop from the server, POSTs to `/api/buckets`, and calls `router.refresh()` on success. |

## Rules

- **Do not** edit anything inside `components/ui/` — use the shadcn CLI to add or update primitives.
- Feature components that require state or event handlers must be marked `"use client"` at the top.
- Feature components should receive server-fetched data as props — do not fetch data inside client components.
- shadcn/ui is built on `@base-ui/react` (not Radix). Key API notes:
  - Use `render={<Component />}` instead of `asChild` on trigger/slot components.
  - `Select.onValueChange` provides `string | null` — guard against null.

