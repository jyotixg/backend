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
5. User model — ⬅️ next (replace the temporary `Note` demo model)
6. Registration API
7. Password hashing (bcrypt)
8. Login API
9. JWT generation
10. Authentication middleware
11. Protected routes
12. Authorization (roles)
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

## Prisma 7 gotchas (this project uses Prisma 7.8.0 — differs from most tutorials)
- The DB connection **URL is read in `prisma.config.ts`** (`datasource.url = process.env["DATABASE_URL"]`, and it `import "dotenv/config"`), NOT via a `url = env(...)` line in `schema.prisma`. The schema's `datasource db` block only has `provider = "postgresql"`.
- The generator is the new **`prisma-client`** (not `prisma-client-js`); it outputs **TypeScript** client code to `./generated/prisma` (gitignored). ⚠️ Since this project is plain JS/ESM, when we first `import` the client in code (Step 6-ish), verify the TS-generated client works under Node ESM; if it doesn't, switch the generator to `prisma-client-js` (outputs JS to `node_modules/@prisma/client`) and re-run `prisma generate`.
- Migrations live in `prisma/migrations/` (these ARE committed). `.env` and `/generated/prisma` are gitignored.
