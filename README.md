# PANORAMA

Aplikasi manajemen antrean rumah sakit dengan Next.js, Prisma, dan PostgreSQL.

## Deployment

Project ini siap deploy ke Vercel dengan konfigurasi otomatis.

Last updated: December 18, 2025
Pelacakan Antrian Obat Real-time Mandiri

## Setup Database

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup PostgreSQL database and update `.env` with `DATABASE_URL`.

3. Run Prisma migrations:
   ```bash
   npx prisma db push
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run the app:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

- Set `DATABASE_URL` in Vercel environment variables.
- (Optional) also configure the following for tighter security:
  - `NEXT_PUBLIC_APP_URL` – your production URL (used for origin checks)
  - `JWT_SECRET` – if you enable JWT internals in the future
  - `SESSION_MAX_AGE_SECONDS` – session timeout (default 43200 = 12 h)
  - `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` for API throttling
- Deploy as usual; Prisma will handle the rest.

A simple health check is exposed at `/api/health` returning `{ status: "ok" }`.

### Running tests

This repo includes a minimal Jest configuration. To execute the unit
suite:

```bash
npm run test
```

Tests live under the `__tests__` directory and currently cover a handful of
utilities; more may be added as features grow.
