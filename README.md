# Instalytics

A multi-user web app that tracks Instagram followers over time and shows who unfollowed, and when.

Instagram's official API returns current counts only — no history, no follower lists. So the app
takes its own snapshots on a schedule and diffs them.

## Status

**This was never launched publicly, on purpose.** Reading follower lists conflicts with Instagram's
Terms of Service, so the app only ever ran privately, on my own account. It is published here as a
piece of engineering work, with that limitation stated rather than hidden.

## Architecture

```
Browser  ──►  Next.js (BFF)  ──►  FastAPI  ──►  PostgreSQL
              never sees          reachable       snapshots +
              Instagram data      only with       encrypted
                                  a shared        sessions
                                  secret
```

**Backend-for-Frontend.** The browser talks to Next.js and nothing else. FastAPI only accepts
requests carrying a shared internal secret, so there is no path from the outside straight to the
Instagram layer — not even with a valid user token. The cost is an extra network hop that has to be
secured.

**Sessions are encrypted at rest with AES-256-GCM.** They are encrypted, not hashed, because they
have to stay usable. GCM rather than CBC because it authenticates: tampered data fails to decrypt
instead of quietly running wrong.

**Two runtimes.** Next.js on Vercel, FastAPI on Railway. The Instagram client needs a long-lived
Python process holding its own state, which does not fit a serverless function with a timeout. Two
deployments are more work than one, but the alternative was forcing the client into an environment
it was not built for.

**Async throughout.** SQLAlchemy with asyncpg rather than the sync driver. The work is almost
entirely I/O-bound — waiting on Instagram, waiting on Postgres — so a sync stack would have blocked
one worker per waiting user.

**Per-user isolation is enforced in the query,** not just in the UI. Every read is scoped by user id
at the database layer.

## Stack

- **Frontend:** Next.js 16, NextAuth v5, Prisma, Tailwind CSS v4 — deployed on Vercel
- **Backend:** FastAPI, instagrapi, SQLAlchemy (async), AES-256-GCM — deployed on Railway
- **Database:** PostgreSQL on Supabase

## Authentication

Sign-in is email and password, with bcrypt password hashes, via NextAuth's Credentials provider.
A Google provider is declared in `web/lib/auth.config.ts` but is not wired into the login UI —
treat `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` as unused unless you finish that path yourself.

## Environment variables

### API (`api/.env`)

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string, asyncpg driver |
| `INTERNAL_SECRET` | shared secret between the Next.js BFF and FastAPI |
| `SESSION_ENCRYPTION_KEY` | base64-encoded 32 bytes |

Generate the encryption key with:

```bash
python -c "import os,base64; print(base64.b64encode(os.urandom(32)).decode())"
```

### Web (`web/.env.local`)

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | same database, standard postgres driver (no asyncpg) |
| `NEXTAUTH_SECRET` | random string — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | your deployed URL |
| `FASTAPI_URL` | the Railway API URL |
| `INTERNAL_SECRET` | must match the API |

## Running it locally

```bash
# database
cd web
cp .env.local.example .env.local     # fill in DATABASE_URL first
npx prisma migrate dev --name init

# terminal 1 — FastAPI
cd api
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload

# terminal 2 — Next.js
cd web
npm install
npm run dev
```

## What I would do differently

Version 1 was a local Python script for exactly one account. It fell apart the moment a second
person wanted to use it: no user separation, no database, session data sitting in a file next to the
script. The rewrite was worth it only because I could name the wrong assumption — "one user".

The bigger lesson came earlier than any of the code: check whether you are allowed to ship the thing
before you build it.
