# 📘 Day 10 — Authentication Middleware

> Topic scope: a middleware that verifies the JWT on incoming requests and attaches the user.
> Applying it broadly to protect routes is Step 11.

---

## 1. What is auth middleware?
Middleware = a function that runs **before** the route handler. Auth middleware is a **gatekeeper**:
- ✅ valid token → attach user info, call `next()` (continue to the route)
- ❌ missing / invalid / expired token → stop, return `401`

So route handlers only run for authenticated users.

## 2. How the token arrives
The client sends it in a header using the **Bearer** scheme:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiI...
```

## 3. The middleware (`authMiddleware.js`)
```js
import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];   // "Bearer abc" -> "abc"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // checks signature + expiry
    req.userId = decoded.userId;   // attach for the route to use
    next();                        // continue
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```
| Piece | Meaning |
|-------|---------|
| `req.headers.authorization` | reads the header |
| `.split(' ')[1]` | strips `"Bearer "` to get the raw token |
| `jwt.verify(token, secret)` | returns payload if valid; **throws** if tampered/expired |
| `req.userId = decoded.userId` | who is calling (from the token, not the body) |
| `next()` | hand control to the route. **Omitting it hangs the request.** |

## 4. Using it on a route (`index.js`)
```js
import { authenticate } from './authMiddleware.js';

app.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, createdAt: true }, // exclude password
  });
  res.json(user);
});
```
- Middleware goes **between** the path and the handler: `app.get(path, authenticate, handler)`.
- `select` → Prisma returns only chosen columns. SQL: `SELECT id, email, name, "createdAt" FROM "User" WHERE id = $1`.

## 5. Test results
| Request | Result |
|---------|--------|
| Valid Bearer token | `200` + user ✅ |
| No token | `401` "No token provided" |
| Tampered token | `401` "Invalid or expired token" (signature check fails) |
| Expired token | `401` (jwt.verify checks `exp`) |

## 6. ⚠️ Next
This built the middleware and tested it on one route. **Step 11 (Protected routes)** applies the pattern to real routes and uses `req.userId` meaningfully.

---

## ✅ Cheat-sheet
```js
// middleware
const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if bad
req.userId = decoded.userId; next();
// protect a route
app.get('/path', authenticate, handler);
// Postman: Authorization tab -> Bearer Token -> paste token
```

## 🧠 Quick self-check (revision questions)
1. What happens if you forget to call `next()` in the middleware?
2. In what header and format does the client send the token?
3. What does `jwt.verify` check, and what does it do on failure?
4. Where does `req.userId` come from — the request body or the token? Why does that matter?
5. Why use `select` when returning the user?
