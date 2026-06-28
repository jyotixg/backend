# 📘 Day 2 — Environment Variables (dotenv)

> Topic scope: configuration & secrets management with `dotenv`.
> Backend-only revision notes.

---

## 1. Why environment variables?
- Avoid **hardcoding** config (ports, URLs) and **secrets** (API keys, passwords) in code.
- Values can **change per environment** (laptop vs. server) without editing code.
- Secrets must **never** be pushed to GitHub.
- 🔑 Golden rule: **code goes to GitHub, secrets stay in `.env` (which is gitignored).**

## 2. Install dotenv
```bash
npm install dotenv
```
A small library that reads a `.env` file and loads its values into **`process.env`**.

## 3. Create the `.env` file (project root)
```
PORT=3000
```
Format rules:
- `KEY=value`, one per line
- **No spaces** around `=`
- No quotes needed
- File is named just **`.env`** (extension only, no name before the dot)

## 4. Gitignore the `.env` file
Add to `.gitignore`:
```
.env
```
Confirms secrets are never committed. (Verify with `git check-ignore .env`.)

## 5. Load and use it in code
At the **very top** of `index.js`:
```js
import 'dotenv/config';     // MUST be first — loads .env into process.env
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
```

### Key concepts
| Code | Meaning |
|------|---------|
| `import 'dotenv/config'` | Loads `.env` into `process.env`. Must run **before** any env value is read → put it first. |
| `process.env.PORT` | Reads the `PORT` key from `.env` |
| `\|\| 3000` | **Fallback** if the value is missing, so the app still runs |

> ⚠️ All `process.env` values are **strings** (`"3000"`, not the number `3000`). Fine for a port; remember this when you need real numbers later.

## 6. Best practice: `.env.example`
Because the real `.env` is gitignored, commit a **template** with keys but no real values:
```
# .env.example  (this one IS committed)
PORT=3000
```
- `.env` → private values (ignored)
- `.env.example` → shared "shopping list" of required keys

## 7. How to test it works
1. `npm run dev`
2. Change `.env` to `PORT=4000`, save → server restarts on **4000** → proves it's reading `.env`.
3. Change it back to `3000`.

---

## ✅ Commands cheat-sheet
```bash
npm i dotenv          # install
# .env            -> real values (gitignored)
# .env.example    -> template (committed)
```

## 🧠 Quick self-check (revision questions)
1. Why must `import 'dotenv/config'` be the first line?
2. What's the difference between `.env` and `.env.example`, and which is committed?
3. What does `process.env.PORT || 3000` protect against?
4. What data type do `process.env` values always have?
5. Why should `.env` be in `.gitignore`?
