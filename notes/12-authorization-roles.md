# 📘 Day 12 — Authorization (Roles)

> Topic scope: role-based access control — restricting routes by user role.
> Builds on authentication (Steps 8–11).

---

## 1. Authentication vs Authorization
| | Question | Example |
|--|----------|---------|
| **Authentication** (authN) | *Who are you?* | "You are Joy." |
| **Authorization** (authZ) | *What are you allowed to do?* | "Joy is a `user`, so she can't list all accounts." |

## 2. New status code
| Code | Meaning |
|------|---------|
| `401 Unauthorized` | not logged in (no/invalid token) |
| `403 Forbidden` | logged in, but **not allowed** (wrong role) |

## 3. Add a role field (schema + migrate)
```prisma
role String @default("user")
```
```bash
npx prisma migrate dev --name add_user_role
```
`ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';` → existing rows backfilled to `'user'`.

## 4. Put role in the token (login)
```js
const token = jwt.sign(
  { userId: user.id, role: user.role },   // role travels in the token
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

## 5. Read role in `authenticate`
```js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.userId = decoded.userId;
req.userRole = decoded.role;   // available to later middleware
next();
```

## 6. `authorize` middleware (a factory)
```js
export function authorize(...allowedRoles) {   // called at route-setup time
  return (req, res, next) => {                  // returned middleware runs per request
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}
```
- A **function returning a function** so you can configure roles: `authorize('admin')`, `authorize('admin','moderator')`.
- `...allowedRoles` = **rest parameter** → gathers all args into an array, so `.includes()` works for any number of roles.

## 7. Protect a route with a middleware chain
```js
app.get('/admin/users', authenticate, authorize('admin'), handler);
// request -> authenticate (who?) -> authorize('admin') (allowed?) -> handler
```
**Order matters:** `authenticate` sets `req.userRole`; `authorize` reads it. Each must call `next()`.

## 8. Promote a user (SQL)
```sql
UPDATE "User" SET role = 'admin' WHERE id = 5;
```
⚠️ Role is baked into the token at login → after changing a role, the user must **log in again** to get a token with the new role. (Trade-off of storing role in the JWT: fast, but can be stale until re-login/expiry.)

## 9. 🐞 Big debugging lesson (real bug we hit)
The role kept missing from the token even though the DB had it. Cause: the **Prisma Client was stale** — `migrate dev` updated the database but did **not** regenerate the client, so `prisma.user.findUnique` didn't return `role` → `user.role` was `undefined`.

**Fix + the golden workflow after ANY schema change:**
```
1. edit schema.prisma
2. npx prisma migrate dev --name <x>   # updates the DATABASE
3. npx prisma generate                 # updates the CLIENT code  <-- easy to forget!
4. restart the server                  # loads the new client (node --watch won't do this on its own)
```

---

## ✅ Cheat-sheet
```js
app.get('/path', authenticate, authorize('admin'), handler);  // role-guarded route
// after schema change: migrate dev -> generate -> restart
```

## 🧠 Quick self-check (revision questions)
1. Difference between authentication and authorization?
2. When do you return `401` vs `403`?
3. Why is `authorize` written as a function that returns a function?
4. Why must a promoted user log in again before the admin route works?
5. What four steps must you do after changing your Prisma schema (and which is easy to forget)?
