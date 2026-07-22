# 📘 Day 18 — Deployment

> Topic scope: taking the API live — hosted Postgres (Neon) + hosted Node app (Render).

---

## 1. Local vs production
| Piece | Local | Production |
|-------|-------|-----------|
| Database | Postgres on `localhost:5432` | **Neon** (cloud Postgres) via a public connection string |
| Node app | `npm run dev` on laptop | **Render** web service, 24/7 |
| Secrets | `.env` file | **env vars** set in the host dashboard (never committed) |
| Migrations | `prisma migrate dev` | `prisma migrate deploy` (non-interactive) |

## 2. Hosted database (Neon)
- Create a project → get the **connection string** (`postgresql://user:pass@ep-...neon.tech/neondb?sslmode=require`).
- This becomes the production `DATABASE_URL`. Same shape as local, different host. Code doesn't change.
- 🔒 Never paste connection strings in chat or commit them.

## 3. App prep (in code)
- **`start` script:** `node index.js` (hosts run `npm start`).
- **`postinstall: prisma generate`** so the client is generated on the host after `npm install`.
- Moved **`prisma` into `dependencies`** so the CLI is available for `generate` / `migrate deploy` in production.
- `PORT` already from `process.env.PORT` → host assigns its own.

## 4. Deploy on Render
- New Web Service → connect the GitHub repo → branch `main`.
- **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
- **Start Command:** `npm start`
- **Env vars** (in dashboard): `DATABASE_URL` (Neon), `JWT_SECRET`, `JWT_REFRESH_SECRET`. (Not `PORT` — Render sets it.)
- Deploy → build → migrations apply to Neon → server starts → public URL (`https://...onrender.com`).

## 5. 🐞 Real bugs we hit (the valuable part)
| Symptom | Cause | Fix |
|---------|-------|-----|
| `SyntaxError: '@prisma/client' has no export 'PrismaClient'` | client never generated on host; **local `package.json` changes weren't pushed** | commit + push; ensure `prisma generate` runs in build |
| `Cannot POST //register` | `baseUrl` had a **trailing slash** → `//register` | `baseUrl` must NOT end with `/` |
| Register hangs then `500`, but **user still saved in DB** | user is `create`d *before* the email step; `sendEmail` throws → catch → 500 | wrap `sendEmail` in its **own try/catch** (decouple side effects) |
| Email `ETIMEDOUT` on Render | cloud hosts block outbound **SMTP**; Ethereal is dev-only | add SMTP timeouts to fail fast; use a real email API (Resend/SendGrid/SES) in prod |
| Data in Neon but not local (or vice-versa) | local `auth_db` and Neon are **separate databases** | the live app only sees Neon |

## 6. Key production lessons
- **Hosts deploy what's on GitHub, not your laptop** — always `git push` your changes.
- **Decouple side effects** — a failed email must not break registration.
- **Secrets live in the host's env vars**, never in the repo.
- **Hardcoded `localhost` URLs break in prod** — use a `BASE_URL` env var for email links (enhancement).
- **Free tier spins down** — first request after idle takes ~30–60s (cold start).

---

## ✅ Cheat-sheet
```
Build:  npm install && npx prisma generate && npx prisma migrate deploy
Start:  npm start
Env:    DATABASE_URL (Neon), JWT_SECRET, JWT_REFRESH_SECRET   (in host dashboard)
Verify a cloud user:  UPDATE "User" SET "isVerified"=true WHERE email='...';  (Neon SQL editor)
```

## 🧠 Quick self-check (revision questions)
1. What are the four things that differ between local and production?
2. Why must you `git push` before a host will run your latest code?
3. Why did the user get saved even though registration returned a 500?
4. Why doesn't Ethereal email work from Render, and what would you use in production?
5. Why should `baseUrl` never end with a trailing slash?
