# Newsletter MVP

This app includes:

- Campaign detail page with live preview and actions (`/admin/campaigns/[id]`)
- Resend webhook ingestion (`/api/webhooks/resend`)
- `Makefile` for setup/dev/build/deploy routines

## Quickstart

```bash
cp .env.example .env
make setup
make dev
```

## Important routes

- `GET /admin/campaigns`
- `GET /admin/campaigns/[id]`
- `POST /api/admin/campaigns/[id]/send-now`
- `POST /api/admin/campaigns/[id]/schedule`
- `POST /api/webhooks/resend`

## Webhook behavior

Resend events mapped and persisted:

- `email.delivered` -> `delivered`
- `email.opened` -> `opened`
- `email.clicked` -> `clicked`
- `email.bounced` -> `bounced`
- `email.complained` -> `complained`

If `RESEND_WEBHOOK_SECRET` is set, Svix signature is verified.
