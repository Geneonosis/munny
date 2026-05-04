# lib/

Shared utility functions used across the application.

## Files

| File | Purpose |
|---|---|
| `utils.ts` | `cn()` — merges Tailwind class names using `clsx` + `tailwind-merge`. Used throughout all components. |

## Rules

- This directory is for pure, framework-agnostic utilities only.
- Do not import from `@/db`, `next/*`, or any component here.
- `cn()` is the standard way to conditionally apply Tailwind classes — always use it instead of string concatenation.

