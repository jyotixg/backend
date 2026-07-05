# 📘 SQL Basics — CRUD (hands-on warm-up)

> Supplementary topic (between Day 5 and Day 6): core SQL run directly against the `User` table in `psql`.
> Goal: understand the raw SQL that Prisma generates for us.

---

## 1. CRUD = the 4 core operations
| Operation | Keyword | Purpose |
|-----------|---------|---------|
| **C**reate | `INSERT` | Add a new row |
| **R**ead | `SELECT` | Fetch rows |
| **U**pdate | `UPDATE` | Change existing rows |
| **D**elete | `DELETE` | Remove rows |

## 2. Connect
```bash
psql -U postgres -d auth_db      # then enter password (invisible)
```

## 3. INSERT (create)
```sql
INSERT INTO "User" (email, password, "updatedAt")
VALUES ('alice@example.com', 'temp123', NOW());
```
- Only provide columns that need values: `id` (auto), `createdAt` (default), `name` (optional) can be skipped; `updatedAt` has no default so it **must** be given → `NOW()`.
- Reply `INSERT 0 1` = one row added.

## 4. SELECT (read)
```sql
SELECT * FROM "User";                 -- all columns, all rows
SELECT id, email FROM "User";         -- only chosen columns
```

## 5. WHERE (filter)
```sql
SELECT * FROM "User" WHERE email = 'bob@example.com';
SELECT email, name FROM "User" WHERE id = 1;
```
- `WHERE <condition>` returns only matching rows.
- `=` compares; **text values go in single quotes** `'...'`.

## 6. UPDATE
```sql
UPDATE "User" SET name = 'Alice' WHERE id = 1;
```
- `SET column = value` defines the change; `WHERE` limits which rows.

## 7. DELETE
```sql
DELETE FROM "User" WHERE email = 'bob@example.com';
```

## ⚠️ 8. The #1 rule: never forget WHERE on UPDATE/DELETE
```sql
DELETE FROM "User";            -- deletes EVERY row!
UPDATE "User" SET name = 'X';  -- changes EVERY row!
```
Without `WHERE`, the statement hits the **whole table**. Always double-check the `WHERE` first.

## 9. Postgres quirk: double quotes on names
- Postgres lowercases unquoted identifiers. Our table is `User` (capital U) and column `updatedAt` (camelCase), so they **must** be wrapped in double quotes: `"User"`, `"updatedAt"`.
- All-lowercase names (`email`, `password`) don't need quotes.
- Reminder: **double quotes** = identifiers (table/column names); **single quotes** = text values.

## 10. 🔗 How this maps to Prisma
| Raw SQL | Prisma |
|---------|--------|
| `INSERT INTO "User" (...) VALUES (...)` | `prisma.user.create({ data: {...} })` |
| `SELECT * FROM "User"` | `prisma.user.findMany()` |
| `SELECT * FROM "User" WHERE email = ...` | `prisma.user.findUnique({ where: { email } })` |
| `UPDATE "User" SET ... WHERE ...` | `prisma.user.update({ where, data })` |
| `DELETE FROM "User" WHERE ...` | `prisma.user.delete({ where })` |

Prisma is a friendlier layer over this exact SQL.

---

## ✅ Commands cheat-sheet
```sql
INSERT INTO "User" (col1, col2) VALUES ('a', 'b');
SELECT * FROM "User";
SELECT col1, col2 FROM "User" WHERE id = 1;
UPDATE "User" SET col1 = 'x' WHERE id = 1;
DELETE FROM "User" WHERE id = 1;
SELECT COUNT(*) FROM "User";     -- bonus: how many rows
```

## 🧠 Quick self-check (revision questions)
1. What do the four CRUD keywords do?
2. Why must we write `"User"` with double quotes, but `email` without?
3. Single quotes vs double quotes in SQL — what's each for?
4. What happens if you run `DELETE FROM "User";` with no `WHERE`?
5. Which Prisma method matches a SQL `INSERT`? Which matches `SELECT ... WHERE`?
