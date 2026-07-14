# 📘 Day 11 — Protected Routes

> Topic scope: applying the auth middleware to protect routes, and the security principle of using `req.userId` from the token.

---

## 1. Public vs protected
| Route | Type | Why |
|-------|------|-----|
| `POST /register` | 🌍 public | no token yet |
| `POST /login` | 🌍 public | you log in to GET a token |
| `GET /` | 🌍 public | health check |
| `GET /me` | 🔒 protected | must be logged in |
| `PATCH /me` | 🔒 protected | must be logged in |

**Protect a route by adding the middleware:**
```js
app.get('/me', authenticate, handler);   // authenticate runs first; handler only if next() called
```

## 2. 🔑 The core security principle
Use the user id from the **token**, never from client input:
```js
where: { id: req.userId }   // ✅ from the verified token
```
- ❌ Trusting a client id (e.g. `/users/:id` from the URL/body) lets anyone edit *others'* data.
- ✅ `req.userId` is set by the middleware from the cryptographically-signed token → a user can only act on **their own** data.
> Rule: for "my data" operations, get the id from the token.

## 3. Example: update own profile
```js
app.patch('/me', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    // SQL: UPDATE "User" SET name = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, email, name;
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { name },
      select: { id: true, email: true, name: true },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
```

### `prisma.user.update` — 3 keys
| Key | Question | Value |
|-----|----------|-------|
| `where` | which row? | `{ id: req.userId }` (must be a unique field) |
| `data` | what to change? | `{ name }` (only listed fields change) |
| `select` | what to return? | id, email, name (never password) |

### PATCH vs PUT
- `PATCH` = **partial** update (change some fields).
- `PUT` = **replace** the whole resource.

## 4. Placeholders ($1, $2)
Prisma builds parameterized SQL automatically. `$1`, `$2` are value placeholders sent separately from the query text → prevents **SQL injection**. Never concatenate user input into SQL.

## 5. Test results
| Request | Result |
|---------|--------|
| PATCH /me + valid token + `{name}` | `200` + updated user ✅ |
| PATCH /me + no token | `401` "No token provided" |
| DB check `SELECT ... WHERE id = 5` | `name` updated, `updatedAt` bumped |

## 6. psql reminder
The prompt shows your current DB: `postgres=#` vs `auth_db=#`. Your tables live in `auth_db` → `\c auth_db` first (or launch with `psql -U postgres -d auth_db`).

---

## ✅ Cheat-sheet
```js
app.patch('/path', authenticate, handler);          // protect + partial update
await prisma.user.update({ where:{id:req.userId}, data:{...}, select:{...} });
```

## 🧠 Quick self-check (revision questions)
1. How do you make a route protected?
2. Why get the user id from `req.userId` (token) instead of the request body/URL?
3. What do `where`, `data`, and `select` each control in `prisma.user.update`?
4. Difference between `PATCH` and `PUT`?
5. What do `$1`/`$2` protect against, and who generates them in your app?
