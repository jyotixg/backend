# 📘 Day 13 — Refresh Tokens

> Topic scope: the access-token + refresh-token pattern for staying logged in safely.

---

## 1. The problem
- **Short** access-token expiry = safer (less damage if stolen) but annoying (frequent logouts).
- **Long** expiry = convenient but dangerous if stolen.

## 2. The solution: two tokens
| Token | Lifespan | Sent | Job |
|-------|----------|------|-----|
| **Access token** | short (15m) | every request (Bearer header) | proves who you are |
| **Refresh token** | long (7d) | only to `POST /refresh` (body) | gets a new access token |

### Flow
```
login → access(15m) + refresh(7d)
use access... it expires → 401
POST /refresh { refreshToken } → new access token
retry request ✅   (only when refresh expires in 7d do you log in again)
```

## 3. Separate secret
```
JWT_SECRET=...          # access tokens
JWT_REFRESH_SECRET=...  # refresh tokens (independent)
```

## 4. Login issues both
```js
const accessToken  = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET,         { expiresIn: '15m' });
const refreshToken = jwt.sign({ userId: user.id },                   process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
res.status(200).json({ message: 'Login successful', accessToken, refreshToken, user });
```

## 5. `POST /refresh`
```js
app.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); // REFRESH secret
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'User no longer exists' });

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
```
Key points:
- Verify with the **refresh** secret (the one that signed it).
- **Two try/catch layers:** inner = bad token → `401` (expected); outer = unexpected crash → `500`.
- Fetch the user → new access token carries the **current** role (role changes apply on next refresh — fixes Step 12's re-login annoyance).

## 6. Who calls `/refresh`, and when?
The **client** (frontend/app), not the server. Typically **reactively**: a request gets `401` → client calls `/refresh` → retries with the new token (usually via an HTTP interceptor). The user notices nothing. (Writing that interceptor is frontend work — out of scope here.)

## 7. Stateless vs stored (FYI)
Ours are **stateless** (just signed). Production often **stores** refresh tokens in the DB so they can be **revoked** (logout / "log out everywhere"). Natural future enhancement.

## 8. 🐞 Postman gotcha we hit
`req.body` was `undefined` → the body was sent as **Text**, so `express.json()` (which only parses `application/json`) skipped it. Fix: Body → **raw** → type **JSON** (sets `Content-Type: application/json`), and use **double quotes** (valid JSON).

---

## ✅ Cheat-sheet
```js
// login: issue both (different secrets, different expiries)
// POST /refresh: verify refreshToken w/ JWT_REFRESH_SECRET -> issue new accessToken
```

## 🧠 Quick self-check (revision questions)
1. Why use two tokens instead of one long-lived token?
2. Which secret verifies the refresh token, and why must it be that one?
3. Who calls `/refresh`, and what usually triggers it?
4. Why does `/refresh` look up the user instead of trusting the token's contents alone?
5. What makes `req.body` come through as `undefined`, and how do you fix it in Postman?
