# 📘 Day 5 — User Model

> Topic scope: designing the `User` model in Prisma and migrating it into PostgreSQL.
> Replaced the temporary `Note` demo model from Day 4.

---

## 1. Why these fields?
An authentication system's user needs:

| Field | Type | Why |
|-------|------|-----|
| `id` | Int, primary key | Unique identifier per user |
| `email` | String, **unique** | The login identifier — no duplicates allowed |
| `password` | String | Holds the password (will be **hashed** in Step 7) |
| `name` | String, **optional** | Display name — not required |
| `createdAt` | DateTime | When the account was created |
| `updatedAt` | DateTime | Auto-updates on every change |

> Deliberately NOT added yet: `role` (Step 12 — Authorization). Password *hashing logic* is Step 7; today is just the table shape.

## 2. The model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Field attributes explained
| Code | Meaning |
|------|---------|
| `@id` | Primary key (unique row identifier) |
| `@default(autoincrement())` | Auto-numbers rows 1, 2, 3… |
| `@unique` | Database rejects duplicate values (here: no two users share an email) |
| `String?` | The `?` = **optional/nullable** column |
| `@default(now())` | Defaults to current timestamp on creation |
| `@updatedAt` | Prisma auto-sets this to "now" on every update |

## 3. Migrate it
```bash
npx prisma migrate dev --name add_user_model
```
Prisma detected two changes (Note removed, User added) and generated SQL to:
- `DROP TABLE "Note";`
- `CREATE TABLE "User" (...)` with a `SERIAL` id and a `UNIQUE INDEX` on email.

It also regenerated the Prisma Client so `prisma.user` is now available in code.

## 4. How the model became SQL
| Prisma | Generated SQL |
|--------|---------------|
| `id Int @id @default(autoincrement())` | `"id" SERIAL NOT NULL ... PRIMARY KEY` |
| `email String @unique` | `"email" TEXT NOT NULL` + `CREATE UNIQUE INDEX "User_email_key"` |
| `name String?` | `"name" TEXT` (nullable — no `NOT NULL`) |
| `createdAt DateTime @default(now())` | `"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP` |

## 5. Verify in Postgres
```bash
psql -U postgres -d auth_db -c "\dt"          # list tables -> User
psql -U postgres -d auth_db -c "\d \"User\""   # describe the User table's columns
```
(`\d "User"` needs the quotes because the table name is capitalized.)

---

## ✅ Commands cheat-sheet
```bash
npx prisma migrate dev --name add_user_model   # apply schema change
npx prisma studio                              # (bonus) view/edit the User table visually
psql -U postgres -d auth_db -c "\d \"User\""    # inspect columns
```

## 🧠 Quick self-check (revision questions)
1. Why must `email` be `@unique`?
2. What does the `?` in `name String?` do?
3. What's the difference between `@default(now())` and `@updatedAt`?
4. When you removed `Note` and added `User`, what two SQL operations did the migration perform?
5. Why is `password` just a plain `String` for now (what's still missing)?
