# 📘 Day 16 — Security: Helmet, CORS, Rate Limiting

> Topic scope: hardening the app with three standard middlewares.

---

## 1. The three protections
| Tool | Protects against | How |
|------|-----------------|-----|
| **Helmet** | browser-based attacks | sets secure HTTP response headers |
| **CORS** | unauthorized sites calling your API | controls which origins browsers allow |
| **Rate limiting** | brute-force / spam | caps requests per IP per time window |

## 2. Install
```bash
npm install helmet cors express-rate-limit
```

## 3. Helmet
```js
import helmet from 'helmet';
app.use(helmet());   // near the top, after const app = express()
```
Adds headers like `X-Content-Type-Options: nosniff`, `X-Frame-Options`, `Strict-Transport-Security`, etc. Sensible defaults, no config needed. "Always include this."

## 4. CORS
```js
import cors from 'cors';
app.use(cors({
  origin: 'http://localhost:5173',   // allowed frontend origin
  credentials: true,                 // allow cookies/auth headers
}));
```
- Controls which **origins** (domain+port) can call the API **from a browser**.
- `cors()` with no options = allow all (fine for dev, too open for prod).
- ⚠️ **CORS only affects browsers.** Postman ignores it, so Postman tests look identical — you'd only see CORS from a real frontend.

## 5. Rate limiting
```js
import rateLimit from 'express-rate-limit';

// global: 100 requests / 15 min / IP
const limiter = rateLimit({ windowMs: 15*60*1000, max: 100,
  message: { error: 'Too many requests, please try again later.' } });
app.use(limiter);

// strict: 5 login attempts / 15 min / IP
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 5,
  message: { error: 'Too many attempts, please try again later.' } });

app.post('/login', authLimiter, handler);   // attach to login
```
| Config | Meaning |
|--------|---------|
| `windowMs` | length of the time window |
| `max` | max requests per IP in that window |
| exceeding it | returns **`429 Too Many Requests`** |
- Counts **every** request to the route (success or fail).
- In-memory store → **restart resets** the counter. Production uses a shared store (e.g. Redis) so limits persist across restarts/servers.

## 6. Middleware order (near the top, before routes)
```
helmet → cors → express.json → global limiter → routes (with authLimiter on /login)
```

## 7. New status code
`429 Too Many Requests` — "slow down."

---

## ✅ Cheat-sheet
```js
app.use(helmet());
app.use(cors({ origin: '<frontend>', credentials: true }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));
app.post('/login', rateLimit({ windowMs: 15*60*1000, max: 5 }), handler);
```

## 🧠 Quick self-check (revision questions)
1. What does Helmet do, in one sentence?
2. What does CORS control, and why did Postman show no difference when you added it?
3. What problem does rate limiting solve, and what status code signals it?
4. Why is `/login` given a stricter limit than the rest of the API?
5. Why does restarting the server reset the rate-limit counter, and what would you use in production?
