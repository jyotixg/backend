# 📘 Day 4 — Prisma Setup & First Migration

> Topic scope: installing Prisma, connecting it to PostgreSQL, and running the first migration.
> Note: we used a temporary `Note` model to demo migrations — the real **User model is Step 5**.

---

## 1. What is Prisma?
An **ORM** (Object-Relational Mapper) for Node.js. Instead of writing raw SQL, you write JavaScript and Prisma translates it to SQL.

```js
// Instead of: SELECT * FROM "User" WHERE email = 'a@b.com';
prisma.user.findUnique({ where: { email: 'a@b.com' } })
```

### Prisma's 3 pieces
| Piece | Role |
|-------|------|
| **`schema.prisma`** | Blueprint: describes the DB connection + your models (tables) |
| **Prisma Migrate** | Turns models into **SQL migration** files and applies them to Postgres |
| **Prisma Client** | Auto-generated, type-safe library you `import` to run queries |

## 2. Install
```bash
npm install prisma --save-dev     # CLI tool (dev dependency)
npm install @prisma/client        # runtime query library (regular dependency)
```

## 3. Initialize
```bash
npx prisma init --datasource-provider postgresql
```
Creates:
- `prisma/schema.prisma` — the schema file
- `prisma.config.ts` — **(Prisma 7)** config that loads `.env` and provides the DB URL
- a `DATABASE_URL` line in `.env`

## 4. Prisma 7 specifics (important — differs from older tutorials)
- The **connection URL is read in `prisma.config.ts`**, not in `schema.prisma`:
  ```ts
  import "dotenv/config";
  export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: { url: process.env["DATABASE_URL"] },
  });
  ```
- So `schema.prisma`'s `datasource db` block only needs `provider = "postgresql"`.
- The generator is `prisma-client`, which outputs the client to `./generated/prisma` (gitignored).

## 5. Configure the connection string (in `.env`)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_db?schema=public"
```
(user:password @ host:port / database — from Day 3.) `.env` is gitignored, so the password stays private.

## 6. A model = a table
```prisma
model Note {
  id        Int      @id @default(autoincrement())
  text      String
  createdAt DateTime @default(now())
}
```
| Part | Meaning |
|------|---------|
| `Note` | model name → creates a `Note` table |
| `id Int` | a column named `id` of type integer |
| `@id` | marks it the **primary key** (unique row identifier) |
| `@default(autoincrement())` | auto-numbers each new row (1, 2, 3…) |
| `String`, `DateTime` | column types |
| `@default(now())` | defaults to the current timestamp |

## 7. Run the first migration
```bash
npx prisma migrate dev --name init
```
What happens:
1. Prisma compares your models to the database.
2. Generates SQL in `prisma/migrations/<timestamp>_init/migration.sql` (e.g. `CREATE TABLE "Note" (...)`).
3. Applies it to `auth_db`.
4. Creates a `_prisma_migrations` table to **track** which migrations have run.

## 8. Generate the client
```bash
npx prisma generate
```
Regenerates the type-safe client (in `./generated/prisma`) whenever the schema changes.

## 9. Verify in Postgres (Day 3 callback)
```bash
psql -U postgres -d auth_db -c "\dt"
```
Shows `Note` and `_prisma_migrations` tables. 🎉

---

## ✅ Commands cheat-sheet
```bash
npm i -D prisma                      # CLI
npm i @prisma/client                 # runtime client
npx prisma init --datasource-provider postgresql
npx prisma migrate dev --name <name> # create + apply a migration
npx prisma generate                  # regenerate the client
npx prisma studio                    # (bonus) visual DB browser in the browser
```

## 🧠 Quick self-check (revision questions)
1. What does "ORM" mean, and what problem does it solve?
2. What are Prisma's three pieces and what does each do?
3. In Prisma 7, where does the database connection URL actually come from?
4. What does `npx prisma migrate dev` do, step by step?
5. What is the `_prisma_migrations` table for?
