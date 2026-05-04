# scripts/

Standalone Node.js/TypeScript scripts run outside the Next.js runtime.

## Files

| File | npm script | Purpose |
|---|---|---|
| `migrate.ts` | `npm run migrate` | Applies pending Drizzle migrations and runs `seed()` (system data only). Used by the **production** Docker container at startup. Safe to run multiple times. |
| `migrate-dev.ts` | `npm run migrate:dev` | Applies pending Drizzle migrations and runs `seedDev()` (system + mock dev data). Used by `docker-compose.dev.yml` and local dev. Safe to run multiple times. |

## Production vs Development

- **Locally / dev container:** scripts are executed directly via `tsx` (a dev dependency).
- **Production container:** `migrate.ts` is compiled to `migrate.js` during the Docker build stage using `esbuild` (available as a Next.js dev dependency). The runner stage then executes `node scripts/migrate.js` — `tsx` is not installed in production. **Do not add `tsx` as a production dependency to work around this.**

The esbuild compile command (run in the `builder` Docker stage):
```sh
node_modules/.bin/esbuild scripts/migrate.ts \
  --bundle --platform=node --target=node20 \
  --external:better-sqlite3 \
  --outfile=scripts/migrate.js
```

## Rules

- Scripts here are **not** part of the Next.js app bundle — do not import from `app/`.
- Scripts may import from `db/`.
- Use plain `async/await` wrapped in a `main()` function — do not use top-level await.
- Always call `process.exit(1)` on error so Docker and CI catch failures correctly.
