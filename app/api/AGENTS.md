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

### Ledger
| Method | Path | Description |
|---|---|---|
| GET | `/api/ledger` | List all ledger entries (optional `?bucketId=` filter), ordered by date |
| POST | `/api/ledger` | Create an entry `{ bucketId, amount (cents), flow ('in'/'out'), date (YYYY-MM-DD), note?, categoryId? }` |
| GET | `/api/ledger/[id]` | Get a single entry |
| PATCH | `/api/ledger/[id]` | Update any of: `amount`, `flow`, `note`, `date`, `categoryId` |
| DELETE | `/api/ledger/[id]` | Hard delete an entry |

### Categories
| Method | Path | Description |
|---|---|---|
| GET | `/api/categories` | List all categories (system + user-defined) |
| POST | `/api/categories` | Create a custom category `{ name }` — rejects duplicates with 409 |

### Charts
| Method | Path | Description |
|---|---|---|
| GET | `/api/charts/history` | Returns `{ buckets, series }` — active (non-zero balance) buckets and a time-series of cumulative balances snapped to transaction dates. Used by `BalanceHistoryChart` and `BalancePieChart` on the overview page. |

## Conventions

- **Every route handler file must export `export const dynamic = "force-dynamic"`** at the top. Without this, Next.js will attempt to statically generate the route at build time and fail because `better-sqlite3` requires a runtime filesystem.
- All responses go through `_lib/response.ts` helpers: `json(data, status?)` and `error(message, status?)`.
- `better-sqlite3` is synchronous — Drizzle calls do **not** use `await`. Route handler functions are still declared `async` for `req.json()`.
- Input validation is done manually (no schema validation library). Keep it simple.
- `GET /api/buckets` and `GET /api/buckets/[id]` always join `bucket_types` and return the full type object inline, including `kind` (`"asset"` | `"liability"`).
- Deleted buckets are excluded from list endpoints but can still be fetched by ID.
- System categories (`is_system = true`) cannot be deleted via the API.
- The app runs on **port 43557** — update `@baseUrl` in `.http` files accordingly.
