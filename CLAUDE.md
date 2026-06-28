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

## Progress log
- **Day 1:** Project initialization + Express setup (npm init, install Express, basic server + `GET /` route, npm scripts, run/test). Notes: `notes/01-project-initialization-and-express-setup.md`.
