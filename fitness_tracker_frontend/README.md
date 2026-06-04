# fitness_tracker_frontend

Next.js (App Router) dashboard UI for the multi-container fitness tracker.

## Environment variables

This app uses only `NEXT_PUBLIC_*` environment variables for configuration:

- `NEXT_PUBLIC_API_BASE` (preferred) — REST API base URL (e.g. `http://localhost:3001`)
- `NEXT_PUBLIC_BACKEND_URL` (fallback) — also accepted as REST API base
- `NEXT_PUBLIC_WS_URL` — WebSocket base URL (e.g. `ws://localhost:3001/ws`)
- `NEXT_PUBLIC_FRONTEND_URL` — public base URL for this frontend (links)
- `NEXT_PUBLIC_NODE_ENV`, `NEXT_PUBLIC_NEXT_TELEMETRY_DISABLED`, `NEXT_PUBLIC_ENABLE_SOURCE_MAPS`, `NEXT_PUBLIC_PORT`

## Expected backend endpoints (MVP contract)

Auth:
- `POST /auth/register` -> `{ token }`
- `POST /auth/login` -> `{ token }`
- `GET /api/me` -> user profile

Onboarding / plans:
- `POST /onboarding`
- `GET /plans/current`
- `POST /plans/generate`

Goals:
- `GET /goals/active`
- `POST /goals`

Logging:
- `POST /logs/workouts`
- `POST /logs/nutrition`

Progress:
- `GET /progress/summary`
- `GET /progress/dashboard`

Admin:
- `GET /admin/content`
- `POST /admin/content`
- `DELETE /admin/content/{id}`

WebSocket:
- `WS /ws` emits notification events (JSON).

## Run

```bash
npm install
npm run dev
```
