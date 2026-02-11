# Stock-WHOOP

A bright, playful stock-style dashboard for WHOOP metrics built with Next.js 14, App Router, TypeScript, Tailwind, shadcn/ui-style components, Recharts, and Prisma.

## Features
- Portfolio-style metric cards with sparklines and deltas
- Watchlist table for quick scanning
- Timeframe toggles (1D/1W/1M/3M/1Y/All)
- Confetti celebration for personal records
- Ingestion API + cron-friendly script

## Setup

1) Install dependencies
```bash
npm install
```

2) Create env file
```bash
cp .env.example .env
```

3) Initialize the database
```bash
npm run prisma:generate
npm run prisma:migrate
```

4) Run the app
```bash
npm run dev
```

## Ingest WHOOP data

Make sure the app is running, then run:
```bash
npm run ingest:whoop
```

By default, the script reads:
`/Users/peterrowland/clawd/whoop-data/whoop.json`

Override if needed:
```bash
WHOOP_JSON_PATH="/path/to/whoop.json" API_URL="http://localhost:3000/api/ingest" npm run ingest:whoop
```

## API

- `POST /api/ingest` — ingest WHOOP JSON payload
- `GET /api/metrics?timeframe=1M` — returns daily metrics for timeframe

Supported timeframes: `1D`, `1W`, `1M`, `3M`, `1Y`, `All`

## Deploy

1) Set `DATABASE_URL` (SQLite for local dev; use a managed DB for production).
2) Run migrations in your deploy pipeline (`prisma migrate deploy`).
3) Build and start:
```bash
npm run build
npm run start
```

## Notes
- Metrics are parsed from sleep, recovery, and cycle records.
- Metrics not present in the payload remain empty and won’t chart until data appears.
