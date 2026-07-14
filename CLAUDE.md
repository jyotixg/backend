# CLAUDE.md — Project Guide for Claude

This file gives Claude context at the start of every session. It is read automatically.

## What this project is
A **learning project** where the user is studying **backend development (Node.js + Express)** from scratch. The goal is *learning*, not just shipping code.

## How to work with the user (important)
- **Teach, don't do.** Give clear, **numbered step-by-step instructions** and let the user run commands / write code themselves. Do **not** run setup commands or write their code for them.
- **Explain the *why*** behind each step (line-by-line for code), in a beginner-friendly way.
- **Verify their work** by reading files after they say "done."
- **Respect the day's declared scope strictly.** If the user says "today only X," do not jump ahead to other topics (e.g. don't bring up auth/JWT/databases until those days).
- **Pause for confirmation** before advancing to the next step.

## Auto-create revision notes
After each learning session/topic completes, **proactively create a new, separate notes file** for revision:
- Location: `notes/`
- Naming: incrementing number + topic, e.g. `01-project-initialization-and-express-setup.md`, then `02-…`
- Content: **backend learning only** (exclude git/tooling steps unless that *is* the day's topic).
- Format: steps + key-concepts table + commands cheat-sheet + a few self-check questions.

## Tech / conventions
- **ES Modules** (`"type": "module"` in package.json) — use `import`/`export`.
- Entry file: `index.js`. Run via `npm start`; auto-restart dev via `npm run dev` (`node --watch`).
- `node_modules/` is gitignored.

## Git / GitHub context
- This folder is its **own git repo** (independent of the parent Flutter project one level up).
- Pushed to GitHub repo **`jyotixg/backend`**, authenticated as the **`jyotixg`** account (a second account alongside `sumanxg` on this machine; credentials kept separate via the username in the remote URL).
- Commit identity for this repo: `jyotixg <guptajyoti5526@gmail.com>`.

## Learning roadmap (follow this order — do NOT jump ahead)
The user set this sequence. Teach **one step at a time, in order**. Do not introduce a later topic before its step is reached, even if asked — gently hold the boundary and point back to the current step.

1. Project initialization (npm, Express, folder structure) — ✅ done
2. Environment variables (dotenv) — ✅ done
3. PostgreSQL installation and basics — ✅ done
4. Prisma setup and first migration — ✅ done
5. User model — ✅ done (`Note` demo replaced with real `User` table)
6. Registration API — ✅ done (`POST /register` working end-to-end)
7. Password hashing (bcrypt) — ✅ done (uses `bcryptjs`; register hashes before saving)
8. Login API — ✅ done (`POST /login` verifies with `bcrypt.compare`)
9. JWT generation — ✅ done (`/login` issues a signed JWT with `jsonwebtoken`)
10. Authentication middleware — ✅ done (`authMiddleware.js` verifies Bearer token, sets `req.userId`)
11. Protected routes — ✅ done (`GET /me`, `PATCH /me` use `authenticate` + `req.userId`)
12. Authorization (roles) — ⬅️ next
13. Refresh tokens
14. Password reset
15. Email verification
16. Security (Helmet, CORS, rate limiting)
17. Testing with Postman
18. Deployment

## Progress log
- **Day 1:** Project initialization + Express setup (npm init, install Express, basic server + `GET /` route, npm scripts, run/test). Notes: `notes/01-project-initialization-and-express-setup.md`.
- **Day 2:** Environment variables with dotenv (install dotenv, `.env` + `.gitignore`, `import 'dotenv/config'`, `process.env.PORT`, `.env.example`). Notes: `notes/02-environment-variables-dotenv.md`.
- **Day 3:** PostgreSQL installation & basics (PostgreSQL 18 already installed; reset lost `postgres` password via pg_hba.conf `trust` method; connected with `psql`; learned `\l` `\c` `\dt` `\q`; created `auth_db`; connection-string concept). Password for local dev: `postgres`. Notes: `notes/03-postgresql-installation-and-basics.md`.
- **Day 4:** Prisma setup & first migration (installed `prisma` + `@prisma/client` **v7.8.0**; `prisma init`; `DATABASE_URL` in `.env`; created a temporary `Note` demo model; ran `prisma migrate dev --name init` → created `Note` + `_prisma_migrations` tables; `prisma generate`). Notes: `notes/04-prisma-setup-and-first-migration.md`.
- **Day 5:** User model (replaced `Note` with a real `User` model — `id`, `email @unique`, `password`, `name String?`, `createdAt`, `updatedAt @updatedAt`; migration `add_user_model` dropped `Note` and created `User` with a unique index on email). Notes: `notes/05-user-model.md`. NOTE: `password` is a plain column for now — hashing is Step 7; `role` deferred to Step 12.
- **SQL warm-up** (between Day 5 & 6): hands-on CRUD in `psql` against `User` (INSERT/SELECT/WHERE/UPDATE/DELETE, the no-WHERE danger, the double-quote identifier quirk, SQL→Prisma mapping). Notes: `notes/05a-sql-crud-basics.md`. Context: user is weak at SQL and wants to learn it — keep showing raw SQL beside Prisma queries (see memory).
- **Day 6:** Registration API (`prismaClient.js` shared client w/ Prisma 7 `@prisma/adapter-pg` driver adapter; `express.json()`; `POST /register` with validation → 400, duplicate check → 409, `prisma.user.create` → 201; response omits password). Tested via a Postman collection (`postman/auth-api.postman_collection.json`). Notes: `notes/06-registration-api.md`.
- **Day 7:** Password hashing (installed **`bcryptjs`** — pure JS, avoids native build issues on Node 24/Windows; register now does `bcrypt.hash(password, 10)` and stores the hash). Verified: new user `joy` has a `$2b$10$...` hash; old rows (alice/charlie) still plain. Login-side `bcrypt.compare` is Step 8. Notes: `notes/07-password-hashing-bcrypt.md`.
- **Day 8:** Login API (`POST /login` — find user by email, `bcrypt.compare(password, user.password)`; 200 on success, 401 for wrong password OR unknown email with the SAME message for security, 400 if missing). Added Login to the Postman collection. Old plain-text rows can't log in (not valid bcrypt hashes). No token yet — JWT is Step 9. Notes: `notes/08-login-api.md`.
- **Day 9:** JWT generation (installed `jsonwebtoken`; `JWT_SECRET` in `.env` via `crypto.randomBytes(32).hex`; `/login` now returns `jwt.sign({ userId }, secret, { expiresIn: '1h' })`). Register stays `201` + user (no token); login issues the token. Decoded a real token: header `HS256`, payload `{userId,iat,exp}` readable (base64, not encrypted), signature is the tamper-proof stamp. Verifying tokens is Step 10. Notes: `notes/09-jwt-generation.md`.
- **Day 10:** Authentication middleware (`authMiddleware.js` exports `authenticate` — reads `Authorization: Bearer <token>`, `jwt.verify`, sets `req.userId`, calls `next()`; 401 if missing/invalid/expired). Tested on a protected `GET /me` route (uses `req.userId`, Prisma `select` to exclude password). Added a `/me` request + `{{token}}` var to the Postman collection. Notes: `notes/10-authentication-middleware.md`.
- **Day 11:** Protected routes (public vs protected; security principle: use `req.userId` from the token, never a client-supplied id). Added `PATCH /me` to update the logged-in user's own profile via `prisma.user.update` (where/data/select). Covered PATCH vs PUT and `$1/$2` SQL placeholders (SQL-injection defense). Added an Update-profile request to the Postman collection. Notes: `notes/11-protected-routes.md`.

## Prisma 7 gotchas (this project uses Prisma 7.8.0 — differs from most tutorials)
- The DB connection **URL is read in `prisma.config.ts`** (`datasource.url = process.env["DATABASE_URL"]`, and it `import "dotenv/config"`), NOT via a `url = env(...)` line in `schema.prisma`. The schema's `datasource db` block only has `provider = "postgresql"`.
- ✅ RESOLVED (Step 6): the default `prisma-client` generator output **TypeScript** (`generated/prisma/*.ts`) which plain Node ESM couldn't import (`ERR_MODULE_NOT_FOUND`). Switched the generator to **`prisma-client-js`** (no `output` line) → it generates JS to `node_modules/@prisma/client`, so `import { PrismaClient } from '@prisma/client'` works. The old `generated/` folder was deleted.
- ✅ RESOLVED (Step 6): the runtime client threw `PrismaClientInitializationError` on `new PrismaClient()` because Prisma 7 dropped the `datasourceUrl`/`datasources` constructor options and now **requires a driver adapter**. Fix: `npm install @prisma/adapter-pg`, then `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`. See `prismaClient.js`. (The runtime client does NOT read `prisma.config.ts`, so it needs the URL via the adapter.)
- Migrations live in `prisma/migrations/` (these ARE committed). `.env` and `/generated/prisma` are gitignored.
