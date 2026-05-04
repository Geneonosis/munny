# http/

This directory contains WebStorm HTTP Client files for manually testing the API endpoints.

## Files

| File | Covers |
|---|---|
| `bucket-types.http` | `GET /api/bucket-types`, `POST /api/bucket-types`, `DELETE /api/bucket-types/:id` |
| `buckets.http` | `GET /api/buckets`, `GET /api/buckets/:id`, `POST /api/buckets`, `PATCH /api/buckets/:id`, `DELETE /api/buckets/:id` |
| `ledger.http` | `GET /api/ledger`, `GET /api/ledger?bucketId=`, `GET /api/ledger/:id`, `POST /api/ledger`, `PATCH /api/ledger/:id`, `DELETE /api/ledger/:id` |

## Usage

Open any `.http` file in WebStorm and use the green ▶ run button next to each `###` block to execute requests inline.

## Conventions

- The `@baseUrl` variable at the top of each file points to `http://localhost:3000/api` — update it if your port changes.
- Each `###` block represents one request.
- Hardcoded IDs in path params (e.g. `/buckets/1`) should be updated to a real ID from a prior `GET` or `POST` response before running.
- When adding a new API endpoint, add a corresponding request block to the relevant `.http` file (or create a new one if it covers a new resource).

