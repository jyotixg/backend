# 📘 Day 3 — PostgreSQL Installation & Basics

> Topic scope: understanding PostgreSQL, connecting with `psql`, and creating a database.
> (This IS the day's topic, so setup/CLI steps are included.)

---

## 1. Core concepts
| Concept | Meaning |
|---------|---------|
| **PostgreSQL** | A **relational database** — stores data in **tables** (rows = records, columns = fields) |
| **Server** | The running program (Windows service `postgresql-x64-18`). One server holds **many databases**. |
| **Database** | A named container for tables. One per project (we made `auth_db`). |
| **`postgres` superuser** | Default admin account, created at install. Needs a password to connect. |
| **Port `5432`** | Default port the Postgres server listens on (like `3000` for Express). |
| **`psql`** | Command-line client where you type SQL. |
| **pgAdmin 4** | Optional graphical (GUI) client, installed alongside. |

## 2. Making `psql` usable
`psql.exe` lives in `C:\Program Files\PostgreSQL\18\bin`.
- Either add that folder to the Windows **PATH** (then just type `psql`),
- or call it by full path: `& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres`.

## 3. Connecting
```
psql -U postgres
```
- `-U postgres` = connect as the `postgres` user.
- It prompts for the password (typed invisibly — no dots show).
- Success = the prompt becomes `postgres=#`.

## 4. Essential psql meta-commands
| Command | Does |
|---------|------|
| `\l` | **L**ist all databases (press `q` to exit the scroll view) |
| `\c dbname` | **C**onnect to / switch into a database |
| `\dt` | **D**isplay **t**ables in the current database |
| `\q` | **Q**uit psql |

> Meta-commands start with `\` and need **no** semicolon. SQL statements (below) **do** need a `;`.

## 5. Create a database (SQL)
```sql
CREATE DATABASE auth_db;
```
- Replies `CREATE DATABASE`.
- Every SQL statement ends with a **semicolon `;`** — without it, psql waits (prompt shows `-#`).

## 6. The connection string (carry-forward)
An app connects to Postgres with one string:
```
postgresql://postgres:postgres@localhost:5432/auth_db
```
| Part | Meaning |
|------|---------|
| `postgresql://` | database type |
| `postgres` (1st) | username |
| `postgres` (2nd) | password |
| `localhost` | host (this machine) |
| `5432` | port |
| `auth_db` | database name |

> 🔗 Ties into Day 2: this string will later live in `.env` as `DATABASE_URL=...`, never hardcoded.

## 7. Bonus: forgot the postgres password?
Standard safe reset (Windows):
1. Edit `C:\Program Files\PostgreSQL\18\data\pg_hba.conf` (as Administrator) → change the 3 `all` auth methods from `scram-sha-256` to `trust`.
2. `Restart-Service postgresql-x64-18` (admin PowerShell).
3. Connect (no password) → `ALTER USER postgres PASSWORD 'newpass';`
4. Revert `pg_hba.conf` back to `scram-sha-256` and restart again. 🔒

---

## ✅ Commands cheat-sheet
```
psql -U postgres              # connect (asks password)
\l                            # list databases
\c auth_db                    # switch into auth_db
\dt                           # list tables
\q                            # quit
CREATE DATABASE auth_db;      # make a database (note the ; )
```

## 🧠 Quick self-check (revision questions)
1. What's the difference between a **server** and a **database** in PostgreSQL?
2. Which command lists databases, and which lists tables?
3. Why did nothing appear when you typed your password?
4. What are the 6 parts of a connection string, in order?
5. When do you need a `;` — meta-commands (`\l`) or SQL statements (`CREATE DATABASE`)?
