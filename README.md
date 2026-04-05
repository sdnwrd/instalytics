# Instalytics v2

Instagram follower analytics — public multi-user web app.

## Stack

- **Frontend:** Next.js 16, NextAuth v5, Prisma, Tailwind CSS v4 — deployed on Vercel
- **Backend:** FastAPI, instagrapi, SQLAlchemy async, AES-256-GCM — deployed on Railway
- **Database:** PostgreSQL on Supabase

## Environment Variables

### API (Railway)
Copy `api/.env.example` → `api/.env` and fill in:
- `DATABASE_URL` — Supabase PostgreSQL connection string (asyncpg driver)
- `INTERNAL_SECRET` — shared secret between Next.js BFF and FastAPI
- `SESSION_ENCRYPTION_KEY` — base64-encoded 32 bytes (generate with: `python -c "import os,base64; print(base64.b64encode(os.urandom(32)).decode())"`)

### Web (Vercel)
Copy `web/.env.local.example` → `web/.env.local` and fill in:
- `DATABASE_URL` — same Supabase DB (standard postgres driver, no asyncpg)
- `NEXTAUTH_SECRET` — random string (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — your domain (e.g. `https://instalytics.app`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `FASTAPI_URL` — your Railway API URL
- `INTERNAL_SECRET` — same as API

## Database Setup

```bash
cd web
cp .env.local.example .env.local  # fill in DATABASE_URL
npx prisma migrate dev --name init
```

## Local Development

```bash
# Terminal 1: FastAPI
cd api
pip install -r requirements.txt
cp .env.example .env  # fill in values
uvicorn app.main:app --reload

# Terminal 2: Next.js
cd web
npm install
cp .env.local.example .env.local  # fill in values
npm run dev
```
