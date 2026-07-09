# 📘 Day 6 — Registration API

> Topic scope: the first real endpoint — `POST /register` — using Express + Prisma + the User model.
> Password is still stored as **plain text** here; hashing is Step 7.

---

## 1. The registration flow
When a user signs up, the server must:
1. **Receive** email + password from the request body
2. **Validate** they aren't empty
3. **Check** the email isn't already taken (`SELECT ... WHERE email`)
4. **Save** the new user (`INSERT`)
5. **Respond** with success — without leaking the password

## 2. Shared Prisma Client (`prismaClient.js`)
```js
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;
```
- Create **one** client and reuse it everywhere (avoids opening too many DB connections).
- **Prisma 7 note:** it uses a *driver adapter* (`@prisma/adapter-pg`), built from `DATABASE_URL`. Older tutorials just do `new PrismaClient()` — v7 requires the adapter.

## 3. Read JSON bodies (in `index.js`)
```js
app.use(express.json());
```
- **Middleware** = code that runs on every request before it reaches the route.
- `express.json()` parses the incoming JSON body into **`req.body`**. Without it, `req.body` is undefined.

## 4. The route
```js
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // SQL: SELECT * FROM "User" WHERE email = $1 LIMIT 1;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // SQL: INSERT INTO "User" (email, password, name, "updatedAt")
    //      VALUES ($1, $2, $3, NOW()) RETURNING *;
    const user = await prisma.user.create({ data: { email, password, name } });

    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
```

### Key concepts
| Concept | Meaning |
|---------|---------|
| `app.post` | Handles `POST` requests (used to *create* resources) |
| `async` / `await` | DB calls are asynchronous; `await` pauses until the DB replies |
| `const { email } = req.body` | Destructuring — pull fields out of the JSON body |
| `return res.status(...)` | Send a response **and stop** the function |
| `try / catch` | Handle errors gracefully instead of crashing |

### HTTP status codes used
| Code | Meaning | When |
|------|---------|------|
| `201` | Created | user registered ✅ |
| `400` | Bad Request | missing email/password |
| `409` | Conflict | email already exists |
| `500` | Server Error | unexpected failure |

## 5. Prisma ↔ SQL (the queries this route runs)
| Prisma | Raw SQL |
|--------|---------|
| `prisma.user.findUnique({ where: { email } })` | `SELECT * FROM "User" WHERE email = $1 LIMIT 1;` |
| `prisma.user.create({ data: {...} })` | `INSERT INTO "User" (...) VALUES (...) RETURNING *;` |
- `$1` = a **parameter placeholder** (prevents SQL injection — values sent separately from the query text).

## 6. Testing (Postman)
- Made an **"Auth API" Postman collection** (`postman/auth-api.postman_collection.json`) with a `{{baseUrl}}` variable + Register request. Import it via Postman → Import.
- Tested: success → `201`; duplicate email → `409`; missing password → `400`.

## 7. ⚠️ Still insecure (on purpose)
The password is saved as **plain text**. Never do this in production — **Step 7 (bcrypt)** will hash it before saving.

---

## ✅ Commands / snippets cheat-sheet
```js
app.use(express.json());                       // parse JSON bodies
await prisma.user.findUnique({ where:{email}});// find one by unique field
await prisma.user.create({ data:{...} });      // insert
res.status(201).json({...});                   // respond with a status + JSON
```
```bash
npm run dev                                    # run server with auto-restart
# verify in DB:
psql -U postgres -d auth_db -c 'SELECT id, email FROM "User";'
```

## 🧠 Quick self-check (revision questions)
1. What does `express.json()` do, and what breaks without it?
2. Why do we `return` after `res.status(...).json(...)`?
3. Which status code means "created", and which means "conflict"?
4. What two SQL queries does the register route run, in order?
5. Why is storing the password as plain text a problem, and what fixes it?
