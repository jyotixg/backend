# 📘 Day 14 — Password Reset

> Topic scope: the "forgot password" flow with a time-limited, single-use reset token.
> Emailing the token is Step 15; for now we return it in the response to test.

---

## 1. The challenge
Let a user who forgot their password set a new one — **without** letting an attacker reset anyone's password. Solution: prove they control the email via a **temporary, single-use, expiring reset token**.

## 2. The flow
```
POST /forgot-password { email }  → generate token, save with 1h expiry, (email it)
POST /reset-password  { resetToken, newPassword } → verify token + not expired → hash new password → clear token
```

## 3. Schema fields (both nullable)
```prisma
resetToken       String?
resetTokenExpiry DateTime?
```
| Field | Why |
|-------|-----|
| `resetToken` | the server's memory of the secret it issued → lets it verify a submitted token |
| `resetTokenExpiry` | a deadline so a leaked token can't be used forever (limits the attack window) |
Together = "this secret, valid until this time." Cleared to `null` after use (one-time). Stored in DB (not a JWT) so it's revocable/single-use.

## 4. `POST /forgot-password`
```js
const user = await prisma.user.findUnique({ where: { email } });
if (!user) return res.json({ message: 'If that email is registered, a reset link has been sent' }); // same msg (security)

const resetToken = crypto.randomBytes(32).toString('hex');          // secure random secret
const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);     // now + 1 hour

await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry } });
res.json({ message: '...', resetToken }); // resetToken returned TEMPORARILY (email in Step 15)
```
- `crypto.randomBytes` = cryptographically secure (never `Math.random()` for secrets).
- Same response whether or not the email exists → don't leak which emails are registered.

## 5. `POST /reset-password`
```js
// SQL: SELECT * FROM "User" WHERE "resetToken" = $1 AND "resetTokenExpiry" > NOW() LIMIT 1;
const user = await prisma.user.findFirst({
  where: { resetToken, resetTokenExpiry: { gt: new Date() } },
});
if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

const hashedPassword = await bcrypt.hash(newPassword, 10);
await prisma.user.update({
  where: { id: user.id },
  data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }, // clear = one-time use
});
```

### Two new Prisma concepts
| Concept | Meaning |
|---------|---------|
| `findFirst` | search by **any** condition(s) (vs `findUnique` = unique fields only). Used because `resetToken` isn't unique + we add an expiry condition. |
| `{ gt: new Date() }` | filter operator "greater than" → not expired. Family: `gt, gte, lt, lte, not, contains, in`… |

## 6. Test results
| Step | Result |
|------|--------|
| forgot-password | `200` + resetToken |
| reset-password (valid) | `200` success |
| login w/ new password | `200` ✅ |
| login w/ old password | `401` |
| reuse the same token | `400` (cleared → one-time use) |

---

## ✅ Cheat-sheet
```js
crypto.randomBytes(32).toString('hex');            // secure random token
new Date(Date.now() + 60*60*1000);                 // +1 hour expiry
prisma.user.findFirst({ where: { resetToken, resetTokenExpiry: { gt: new Date() } } });
// on success: hash new password + set resetToken/resetTokenExpiry to null
```

## 🧠 Quick self-check (revision questions)
1. Why do we need *both* `resetToken` and `resetTokenExpiry`?
2. Why `crypto.randomBytes` instead of `Math.random()`?
3. Why does `/forgot-password` return the same message even when the email doesn't exist?
4. Why `findFirst` here instead of `findUnique`? What does `{ gt: new Date() }` check?
5. How do we enforce that a reset token can only be used once?
