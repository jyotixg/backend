# 📘 Day 8 — Login API

> Topic scope: verifying a password against the stored hash with `bcrypt.compare`.
> Builds on Step 7 (hashing). Issuing a JWT token is Step 9.

---

## 1. The login flow
1. Receive email + password
2. Find the user by email (`SELECT ... WHERE email`)
3. Compare the typed password to the stored **hash**
4. Respond: success or error

## 2. How you verify a password you can't un-hash
You can't reverse a hash. Instead:
```js
const isMatch = await bcrypt.compare(typedPassword, user.password); // true / false
```
The stored hash contains the **salt**, so bcrypt re-hashes the attempt with that same salt and compares. No decryption — just re-hash and compare.

## 3. The route
```js
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // SQL: SELECT * FROM "User" WHERE email = $1 LIMIT 1;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
```

## 4. Key decisions
| Choice | Why |
|--------|-----|
| `401 Unauthorized` | Standard status for failed authentication |
| **Same** error message for "no user" and "wrong password" | 🔒 Security — don't reveal which emails are registered |
| `200 OK` (not 201) | Login doesn't *create* anything |
| No token yet | JWT is Step 9 |

## 5. Status codes
| Code | When |
|------|------|
| `200` | correct credentials ✅ |
| `400` | missing email/password |
| `401` | wrong password OR unknown email |
| `500` | unexpected error |

## 6. Observations
- Old plain-text rows (alice/charlie) **can't log in** — their stored value isn't a bcrypt hash, so `bcrypt.compare` always returns false. Only hashed (properly registered) users work.

## 7. ⚠️ Not done yet
On success we just return user info. There's no way yet to *stay* logged in across requests — that's what a **JWT token** provides (Step 9).

---

## ✅ Cheat-sheet
```js
const user = await prisma.user.findUnique({ where: { email } });   // find
const ok   = await bcrypt.compare(password, user.password);        // verify
// success -> 200 ; failure -> 401 (same message for both failure types)
```

## 🧠 Quick self-check (revision questions)
1. Since you can't un-hash a password, how does `bcrypt.compare` check a login?
2. Why use the **same** error message for "unknown email" and "wrong password"?
3. Why `200` for login but `201` for register?
4. Why can't the old plain-text users log in?
5. What's still missing after a successful login (what does Step 9 add)?
