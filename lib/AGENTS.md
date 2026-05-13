# lib/

Shared utility functions used across the application.

## Files

| File | Purpose |
|---|---|
| `utils.ts` | `cn()` — merges Tailwind class names using `clsx` + `tailwind-merge`. Used throughout all components. |
| `chart-colors.ts` | `getChartColor(index)` — generates a perceptually distinct HSL color using golden-ratio hue stepping. `buildColorMap(keys)` — returns a stable `Record<string, string>` mapping arbitrary keys to unique colors. Use these everywhere chart series need colors — never hardcode hex/oklch values for data series. |
| `chart-store.ts` | Zustand store (`useChartStore`) with `persist` middleware. Tracks `hiddenBuckets: string[]` (bucket IDs as strings). Exposes `toggleBucket(id)` and `isBucketHidden(id)`. Persisted to `localStorage` under the key `munny-chart-prefs`. Import this in any chart component that supports per-bucket visibility toggling. |

## Rules

- This directory is for pure, framework-agnostic utilities only.
- Do not import from `app/`, `next/*`, or any component here.
- `cn()` is the standard way to conditionally apply Tailwind classes — always use it instead of string concatenation.
- `chart-store.ts` is marked `"use client"` — only import it inside Client Components.
