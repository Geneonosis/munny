# app/

Next.js App Router directory. All pages, layouts, and UI components live here.

## Conventions

- This project uses the **App Router** (not Pages Router). Do not create anything under a `pages/` directory.
- `layout.tsx` — root layout; wraps all pages. Update metadata (`title`, `description`) here, not in individual pages.
- `globals.css` — global styles. Only `@import "tailwindcss"` and bare `body` resets live here. Component-level styles belong with their component.
- Tailwind CSS v4 is in use — utility classes are available everywhere.

## Styling Rules

- **Do not** add spacing, color, or layout CSS without explicit instruction from the user.
- Font-related CSS is acceptable to add.
- The user handles all color and spacing decisions.

## Database Access

- Import the `db` client from `../db/index.ts` in Server Components or Route Handlers only.
- **Never** import `db` into Client Components (`"use client"`).
- `better-sqlite3` is synchronous — no `await` needed on Drizzle queries when using this driver.

