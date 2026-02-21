# newsletter.marlow.dev.br (MVP)

Dedicated newsletter app for `newsletter.marlow.dev.br`.

## Features

- Double opt-in subscriptions (`/api/subscribe` + `/confirm`)
- Admin magic-link auth (`/admin/login`)
- Campaign creation in Markdown
- Send now + scheduled sends
- Public archive (`/archive`, `/archive/[slug]`)
- Tracking endpoints for open/click
- Unsubscribe flow

## Stack

- Next.js 14 + TypeScript
- PostgreSQL + Prisma
- Resend email API
- Docker Compose + Caddy for VPS deploy

## Environment

Copy `.env.example` to `.env` and fill values.

Required values:

- `DATABASE_URL`
- `APP_URL`
- `ADMIN_EMAIL`
- `ADMIN_SESSION_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `WORKER_SECRET`

Optional:

- `RESEND_WEBHOOK_SECRET` (enables Svix signature verification for `/api/webhooks/resend`)

## Local run

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## VPS deploy (Hostinger)

```bash
docker compose up -d --build
```

## Cron/worker

The worker container polls every 15s and sends due campaigns (`status=scheduled`).

You can also trigger manually:

```bash
curl -X POST "https://newsletter.marlow.dev.br/api/admin/worker/run" \
  -H "x-worker-secret: $WORKER_SECRET"
```

## Healthcheck

`GET /api/health`

## Webhook

- Endpoint: `POST /api/webhooks/resend`
- Event mapping: `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`
