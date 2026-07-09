# 📘 Day 7 — Password Hashing (bcrypt)

> Topic scope: hashing passwords before saving, so we never store readable passwords.
> Builds on the Step 6 register route. Verifying passwords (login) is Step 8.

---

## 1. Why hash?
- Storing plain-text passwords is catastrophic if the DB leaks (people reuse passwords everywhere).
- A **hash** is a **one-way** transformation — you can't reverse it back to the password.
- To check a login later, you hash the *attempt* and compare hashes (Step 8), never decrypt.
- 🔑 Rule: **never store passwords you can read.**

## 2. Two things bcrypt adds
| Concept | What it does |
|---------|--------------|
| **Salt** | Random data mixed in before hashing → same password gives a **different** hash per user (defeats rainbow tables). bcrypt generates it and stores it inside the hash. |
| **Cost factor** (rounds) | How slow the hash is. `10` = 2¹⁰ = 1,024 iterations; each +1 doubles the work. Slowness cripples brute-force attacks. |

## 3. Install
```bash
npm install bcryptjs
```
- Used **`bcryptjs`** (pure JavaScript) instead of `bcrypt` (native C++), which often fails to compile on Windows / new Node versions. Same API, no build tools needed.

## 4. Hash in the register route
```js
import bcrypt from 'bcryptjs';
// ...
const hashedPassword = await bcrypt.hash(password, 10);

const user = await prisma.user.create({
  data: { email, password: hashedPassword, name },   // save the HASH, not the plain password
});
```
| Code | Meaning |
|------|---------|
| `bcrypt.hash(password, 10)` | Salted hash with cost 10 |
| `await` | Hashing is intentionally slow → asynchronous |
| `password: hashedPassword` | Store the hash |

## 5. Anatomy of a bcrypt hash
```
$2b$10$0YXk6JmqL.RCF/S1rLFdNO g3Ev7g943SFV891UrPPSikHGQesuCIy
 │   │  └──── salt (22 chars) ┘└──────── hash ────────┘
 │   └─ cost (10)
 └───── algorithm/version (2b)
```
Everything (version, cost, salt, hash) is bundled in one string — that's how `bcrypt.compare()` re-hashes a login attempt the same way (Step 8).

## 6. Observations
- Rows created **before** hashing (Alice, Charlie) still show plain text — only **new** registrations are hashed. (Old test rows can be deleted.)
- Two users with the **same** password get **different** hashes — that's the salt.

## 7. ⚠️ Not done yet
Hashing only covers *saving*. **Logging in** (comparing a typed password to the stored hash with `bcrypt.compare`) is **Step 8**.

---

## ✅ Cheat-sheet
```js
import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash(plainPassword, 10);   // register
const ok   = await bcrypt.compare(attempt, hash);    // login (Step 8) -> true/false
```

## 🧠 Quick self-check (revision questions)
1. Why is hashing "one-way," and why does that matter if the DB leaks?
2. What problem does the **salt** solve?
3. What does increasing the **cost factor** do, and why do we *want* hashing to be slow?
4. Why did we use `bcryptjs` instead of `bcrypt`?
5. Why do Alice and Charlie still show plain-text passwords?
