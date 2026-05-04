# app/api/

Next.js App Router Route Handlers — the server-side API layer. All routes talk directly to the SQLite database via the Drizzle `db` client.

## Endpoints

### Bucket Types
| Method | Path | Description |
|---|---|---|
| GET | `/api/bucket-types` | List all bucket types |
| POST | `/api/bucket-types` | Create a custom bucket type `{ name }` |
| DELETE | `/api/bucket-types/[id]` | Delete a custom type (system types are protected — 403) |

### Buckets
| Method | Path | Description |
|---|---|---|
| GET | `/api/buckets` | List all non-deleted buckets (joined with type) |
| POST | `/api/buckets` | Create a bucket `{ name, typeId, currency? }` |
| GET | `/api/buckets/[id]` | Get a single bucket |
| PATCH | `/api/buckets/[id]` | Update any of: `name`, `currency`, `typeId`, `status` |
| DELETE | `/api/buckets/[id]` | Soft-delete (sets status to `"deleted"`) |

## Conventions

- All responses go through `_lib/response.ts` helpers: `json(data, status?)` and `error(message, status?)`.
- `better-sqlite3` is synchronous — Drizzle calls do **not** use `await`. Route handler functions are still declared `async` for `req.json()`.
- Input validation is done manually (no schema validation library). Keep it simple.
- `GET /api/buckets` and `GET /api/buckets/[id]` always join `bucket_types` and return the full type object inline.
- Deleted buckets are excluded from list endpoints but can still be fetched by ID.

