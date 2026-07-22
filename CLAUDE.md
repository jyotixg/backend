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
12. Authorization (roles) — ✅ done (`role` field; `authorize(...roles)` middleware; admin-only `GET /admin/users`)
13. Refresh tokens — ✅ done (access 15m + refresh 7d, separate secrets, `POST /refresh`)
14. Password reset — ✅ done (`resetToken`+`resetTokenExpiry`; `POST /forgot-password` + `POST /reset-password`; single-use, 1h expiry)
15. Email verification — ✅ done (Nodemailer+Ethereal; `isVerified`+`verificationToken`; register emails link; `GET /verify-email`; login blocked if unverified; forgot-password now emails the token)
16. Security (Helmet, CORS, rate limiting) — ✅ done (`helmet()`, `cors()`, global + strict `/login` `express-rate-limit`)
17. Testing with Postman — ✅ done (automated test scripts w/ `pm.test`/`pm.expect`; Login auto-saves `{{token}}`/`{{refreshToken}}`; Collection Runner)
18. Deployment — ⬅️ next

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
- **Day 12:** Authorization/roles (`role String @default("user")` + migration; login embeds `role` in JWT; `authenticate` sets `req.userRole`; new `authorize(...roles)` factory middleware → 403 if role not allowed; admin-only `GET /admin/users` via `authenticate, authorize('admin')`). Promoted Joy to admin with SQL. Debugged a stale-Prisma-client bug (role missing from query results until `prisma generate` + server restart). Added Admin request to Postman collection. Notes: `notes/12-authorization-roles.md`.
- **Day 13:** Refresh tokens (access 15m via `JWT_SECRET` + refresh 7d via new `JWT_REFRESH_SECRET`; login returns both `accessToken`+`refreshToken`; `POST /refresh` verifies refresh token, re-fetches user for current role, issues new access token). Discussed client-side reactive-on-401 trigger, stateless-vs-DB-stored (revocation) trade-off, and two-layer try/catch. Postman gotcha: body must be raw+**JSON** (Content-Type) with double quotes or `req.body` is undefined. Added Refresh request to Postman collection. Notes: `notes/13-refresh-tokens.md`.
- **Day 14:** Password reset (added `resetToken String?` + `resetTokenExpiry DateTime?` to User + migration; `POST /forgot-password` generates a `crypto.randomBytes` token w/ 1h expiry, same-message security, returns token TEMPORARILY until email in Step 15; `POST /reset-password` uses `findFirst` + `{ gt: new Date() }` to check token+expiry, `bcrypt.hash`es new password, clears token to null for one-time use). New Prisma concepts: `findFirst` vs `findUnique`, filter operators (`gt`). Added Forgot/Reset requests to Postman collection. Notes: `notes/14-password-reset.md`.
- **Day 15:** Email verification (installed **`nodemailer`**; `mailer.js` uses an **Ethereal** test inbox + `sendEmail({to,subject,html})` that logs a preview URL; added `isVerified Boolean @default(false)` + `verificationToken String?` to User + migration). Register now generates a verification token, saves it, and emails a `GET /verify-email?token=...` link (uses `req.query`); verify sets `isVerified: true` + clears token. Login now blocked with 403 if `!isVerified` (checked AFTER password). Circled back: `/forgot-password` now EMAILS the reset token instead of returning it. Hit the stale-`node`-process bug again (killed all node → fresh `npm run dev`). Notes: `notes/15-email-verification.md`.
- **Day 16:** Security hardening (installed `helmet` + `cors` + `express-rate-limit`; `app.use(helmet())` for secure headers; `app.use(cors({ origin, credentials }))` — noted CORS only affects browsers, Postman ignores it; global limiter 100/15min + strict `authLimiter` 5/15min attached to `/login` → `429` on the 6th attempt; in-memory store resets on restart, prod would use Redis). Notes: `notes/16-security-helmet-cors-rate-limiting.md`.
- **Day 17:** Testing with Postman (added automated test scripts to the collection using `pm.test`/`pm.expect`/`pm.response`; Login's test script auto-saves `accessToken`→`{{token}}` + `refreshToken`→`{{refreshToken}}` so protected requests need no manual paste; Refresh re-saves the new token; `/me` asserts no password leak; Collection Runner runs all requests with pass/fail). Debugged a **test-data drift** 401 (a verified user's password had been changed by an earlier test → used a dedicated `tester@example.com` account). Notes: `notes/17-testing-with-postman.md`.

## Prisma 7 gotchas (this project uses Prisma 7.8.0 — differs from most tutorials)
- The DB connection **URL is read in `prisma.config.ts`** (`datasource.url = process.env["DATABASE_URL"]`, and it `import "dotenv/config"`), NOT via a `url = env(...)` line in `schema.prisma`. The schema's `datasource db` block only has `provider = "postgresql"`.
- ✅ RESOLVED (Step 6): the default `prisma-client` generator output **TypeScript** (`generated/prisma/*.ts`) which plain Node ESM couldn't import (`ERR_MODULE_NOT_FOUND`). Switched the generator to **`prisma-client-js`** (no `output` line) → it generates JS to `node_modules/@prisma/client`, so `import { PrismaClient } from '@prisma/client'` works. The old `generated/` folder was deleted.
- ✅ RESOLVED (Step 6): the runtime client threw `PrismaClientInitializationError` on `new PrismaClient()` because Prisma 7 dropped the `datasourceUrl`/`datasources` constructor options and now **requires a driver adapter**. Fix: `npm install @prisma/adapter-pg`, then `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`. See `prismaClient.js`. (The runtime client does NOT read `prisma.config.ts`, so it needs the URL via the adapter.)
- Migrations live in `prisma/migrations/` (these ARE committed). `.env` and `/generated/prisma` are gitignored.
- ⚠️ WORKFLOW (bit us in Step 12): `prisma migrate dev` updates the DATABASE but does NOT auto-regenerate the client here. After ANY schema change: `migrate dev` → **`npx prisma generate`** → **restart the server** (`node --watch` doesn't restart when only the client in `node_modules` changes). Symptom of skipping it: `prisma.user.findX` returns objects missing the new field (e.g. `user.role` was `undefined`).
