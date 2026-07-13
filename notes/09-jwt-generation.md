# 📘 Day 9 — JWT Generation

> Topic scope: issuing a signed JWT on successful login. Verifying it (middleware) is Step 10.

---

## 1. Why JWT?
HTTP is **stateless** — the server forgets you after each request. A **JWT** is a signed token the server gives you on login; the client sends it with future requests to prove "I'm logged in." No server-side session storage needed = *stateless auth*.

## 2. Structure: `header.payload.signature`
Three base64url parts separated by dots.
| Part | Contains | Secret needed to read? |
|------|----------|------------------------|
| Header | algorithm (e.g. `HS256`) + type | no |
| Payload | your "claims" — e.g. `{ userId, iat, exp }` | no (base64, **readable by anyone**) |
| Signature | HMAC of header+payload made with `JWT_SECRET` | — (can't be "read"; it's a stamp) |

- **Payload is encoded, NOT encrypted** → never put secrets in it.
- **Signature = tamper-proofing.** Editing the payload breaks it; only someone with `JWT_SECRET` can forge a valid one.

## 3. Install
```bash
npm install jsonwebtoken
```

## 4. Secret in `.env`
Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
```
JWT_SECRET=<the long hex string>
```
It's a secret → `.env` only, never committed.

## 5. Issue the token (in `/login` success branch)
```js
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: user.id },        // payload — minimal, no sensitive data
  process.env.JWT_SECRET,     // secret used to sign
  { expiresIn: '1h' }         // auto-expiry
);

res.status(200).json({
  message: 'Login successful',
  token,
  user: { id: user.id, email: user.email, name: user.name },
});
```

## 6. register vs login (a mistake worth remembering)
| Route | Job | Returns |
|-------|-----|---------|
| `/register` | create the account | `201` + new user (**no token**) |
| `/login` | authenticate | `200` + **token** |
Registration creates the account; **login** is what grants the token.

## 7. Reading a token (jwt.io or code)
```
HEADER    {"alg":"HS256","typ":"JWT"}
PAYLOAD   {"userId":5,"iat":1783970660,"exp":1783974260}   // iat->exp = 60 min
SIGNATURE (cannot decode — cryptographic stamp)
```
- `iat` = issued-at, `exp` = expiry (unix seconds). `exp - iat` = the `expiresIn`.

## 8. ⚠️ Not done yet
We only *issue* the token. Nothing yet *checks* it on protected requests — that's **Step 10 (auth middleware)** with `jwt.verify(...)`.

---

## ✅ Cheat-sheet
```js
const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' }); // create
// later (Step 10): jwt.verify(token, process.env.JWT_SECRET) -> payload or throws
```

## 🧠 Quick self-check (revision questions)
1. Why do we need a token at all — what problem with HTTP does it solve?
2. What are the three parts of a JWT, and which are readable without the secret?
3. Why must you never put a password in a JWT payload?
4. What actually stops someone from editing the payload to become another user?
5. Which route issues the token, and why not the other one?
