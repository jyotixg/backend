# 📘 Day 1 — Project Initialization & Express Setup

> Topic scope: Node project setup + first Express server.
> (Git/GitHub steps intentionally not included — these are backend-only revision notes.)

---

## 1. Initialize a Node project
```bash
npm init
```
- Walks you through questions and creates a **`package.json`** (the project's "ID card" — name, version, scripts, dependencies).
- Press **Enter** to accept defaults; the final `Is this OK?` → Enter to confirm.
- Shortcut to skip all questions: `npm init -y`.

## 2. Enable ES Modules
In `package.json` add:
```json
"type": "module"
```
- Lets you use modern **`import`/`export`** syntax instead of the older `require()`.

## 3. Install Express
```bash
npm install express      # or: npm i express
```
What it creates:
- **`node_modules/`** → the actual library code (auto-generated, never edit, not pushed to git).
- **`package-lock.json`** → locks exact versions so installs are identical everywhere.
- Adds a **`"dependencies"`** section in `package.json`.

## 4. Write a basic server (`index.js`)
```js
import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello World! My server is running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

### Key concepts
| Term | Meaning |
|------|---------|
| `express()` | Creates the app (your server instance) |
| **Route** | `app.get('/', ...)` → what to do when a URL is visited |
| `req` (request) | Data coming **from** the client |
| `res` (response) | What you send **back** to the client |
| `res.send(...)` | Sends the response to the browser |
| `app.listen(PORT, cb)` | Starts the server; callback runs once it's up |
| **PORT** | The "door number" the server listens on (e.g. 3000) |

## 5. Run the server
```bash
node index.js
```
- Visit **http://localhost:3000** in the browser to see the response.
- The terminal "hangs" on purpose — the server is alive and waiting.
- Stop it with **Ctrl + C**.

## 6. npm scripts (shortcuts)
In `package.json`:
```json
"scripts": {
  "start": "node index.js",
  "dev": "node --watch index.js"
}
```
- `npm start` → runs the server (standard convention).
- `npm run dev` → **auto-restarts** the server on every file save (`--watch` is built into Node 18+, no extra tools needed).

## 7. Concept: server restart ≠ browser refresh
- `--watch` restarts the **server** when files change.
- The **browser does NOT auto-refresh** — you press **F5** yourself.
- They are two separate programs. Auto-refreshing the browser is a *frontend* concern (needs extra tooling like live-reload) and isn't used for pure backend work.
- For backend/APIs you usually test with **Postman / Thunder Client / curl**, not the browser.

---

## ✅ Commands cheat-sheet
```bash
npm init               # create package.json
npm i express          # install Express
node index.js          # run server
npm start              # run via script
npm run dev            # run with auto-restart
# Stop server: Ctrl + C
```

## 🧠 Quick self-check (revision questions)
1. What does `"type": "module"` enable?
2. What's the difference between `req` and `res`?
3. Why does the terminal "freeze" after `node index.js`?
4. What does `--watch` restart — and what does it *not* restart?
5. Which command runs the server with auto-restart?
