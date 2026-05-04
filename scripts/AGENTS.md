# scripts/

Standalone Node.js/TypeScript scripts run outside the Next.js runtime, executed directly via `tsx`.

## Files

| File | npm script | Purpose |
|---|---|---|
| `migrate.ts` | `npm run migrate` | Applies pending Drizzle migrations and runs `seed()` (system data only). Safe to run multiple times. |
| `migrate-dev.ts` | `npm run migrate:dev` | Applies pending Drizzle migrations and runs `seedDev()` (system + mock dev data). Used by `docker-compose.dev.yml` and local dev. Safe to run multiple times. |

## Rules

- Scripts here are **not** part of the Next.js app bundle — do not import from `app/`.
- Scripts may import from `db/`.
- Use plain `async/await` wrapped in a `main()` function — do not use top-level await (not supported in CJS/tsx default mode).
- Always call `process.exit(1)` on error so Docker and CI catch failures correctly.

