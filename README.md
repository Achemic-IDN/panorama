# PANORAMA

Aplikasi manajemen antrean rumah sakit dengan Next.js, Prisma, dan PostgreSQL.

## Deployment

Project ini siap deploy ke Vercel dengan konfigurasi otomatis.
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
- Deploy as usual; Prisma will handle the rest.
