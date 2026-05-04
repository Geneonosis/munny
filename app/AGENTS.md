# app/

Next.js App Router directory. All pages, layouts, and API routes live here.

## Conventions

- This project uses the **App Router** (not Pages Router). Do not create anything under a `pages/` directory.
- `layout.tsx` — root layout; wraps all pages. Update metadata (`title`, `description`) here, not in individual pages.
- `globals.css` — managed jointly by the project and shadcn/ui init. Contains Tailwind v4 import and shadcn theme tokens. Do not remove shadcn CSS variables.
- Tailwind CSS v4 is in use — utility classes are available everywhere.

## Server vs Client Components

- **Pages are Server Components by default.** Query the DB directly inside them — no `fetch()` to the local API needed for initial data loads.
- Create `"use client"` components only when you need state, effects, or event handlers (e.g. forms, dialogs).
- After a client-side mutation (POST, PATCH, DELETE), call `router.refresh()` to re-run the server component and reflect changes — do not manage data in client state.

## UI Components

- shadcn/ui is installed and configured. Components live in `components/ui/` — **do not edit these files manually**.
- Add new shadcn components with: `npx shadcn@latest add <component-name>`
- shadcn here is built on **`@base-ui/react`**, NOT Radix UI. Key API differences:
  - Use `render={<Component />}` instead of `asChild`
  - `onValueChange` on Select receives `string | null` — always guard against null
- Non-primitive components (page-level, feature-level) live in `components/` directly, not `components/ui/`.

## Current Pages

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Buckets list view — server component, queries DB directly, renders table + create dialog |

> **Any page or route that imports from `@/db` must export `export const dynamic = "force-dynamic"` at the top of the file.** Without it, Next.js will attempt to statically pre-render the page at build time and fail because the database doesn't exist in the build container.

## Styling Rules

- **Do not** add spacing, color, or layout CSS without explicit instruction from the user.
- Font-related CSS is acceptable to add.
- The user handles all color and spacing decisions.

## Database Access

- Import the `db` client from `@/db` in Server Components or Route Handlers only.
- **Never** import `db` into Client Components (`"use client"`).
- `better-sqlite3` is synchronous — no `await` needed on Drizzle queries when using this driver.

