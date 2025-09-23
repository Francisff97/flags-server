# flags-server

API server (Next.js on Vercel) for feature flags per installation + Discord config.

## Endpoints
- `GET /api/hello`
- `POST /api/installations` (HMAC)
- `GET /api/installations` (Bearer BOT_ADMIN_TOKEN)
- `GET /api/installations/:slug/config`
- `GET /api/installations/:slug/flags`
- `POST /api/installations/:slug/flags` (HMAC)
- `GET /api/installations/:slug/discord`
- `POST /api/installations/:slug/discord` (HMAC)
