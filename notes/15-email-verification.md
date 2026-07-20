# 📘 Day 15 — Email Verification (+ real email sending)

> Topic scope: sending real emails (Nodemailer + Ethereal) and verifying new signups; plus emailing the reset token from Step 14.

---

## 1. Why verify email?
Confirm the user actually owns the address they signed up with → fewer fake/spam accounts, and you can trust sending them things (resets, notifications). They prove ownership by clicking a token you email them.

## 2. Sending email: Nodemailer + Ethereal (dev)
- **Nodemailer** = Node library for sending email.
- **Ethereal** = a free fake SMTP inbox for development; it **captures** emails and gives a **preview URL** (nothing is really delivered).
- To go to production you only swap the **transporter config** (host/port/auth, or `service: 'gmail'`/SendGrid/SES) — your `sendEmail()` calls stay the same.

### `mailer.js` (reusable helper)
```js
import nodemailer from 'nodemailer';
let transporter;
async function getTransporter() {
  if (transporter) return transporter;
  const testAccount = await nodemailer.createTestAccount();     // dev inbox
  transporter = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass } });
  return transporter;
}
export async function sendEmail({ to, subject, html }) {
  const info = await (await getTransporter()).sendMail({ from: '"Auth App" <no-reply@authapp.test>', to, subject, html });
  console.log('📧 Preview:', nodemailer.getTestMessageUrl(info));   // link to view the email
}
```
> You don't need to memorize the transporter boilerplate — understand the *flow* (transporter sends; preview in dev; swap config for prod).

## 3. Schema fields
```prisma
isVerified        Boolean  @default(false)
verificationToken String?
```
New users start unverified; token is cleared once verified.

## 4. Register → send verification email
```js
const verificationToken = crypto.randomBytes(32).toString('hex');
const user = await prisma.user.create({ data: { email, password: hashedPassword, name, verificationToken } });
const verifyUrl = `http://localhost:${process.env.PORT || 3000}/verify-email?token=${verificationToken}`;
await sendEmail({ to: email, subject: 'Verify your email', html: `<a href="${verifyUrl}">${verifyUrl}</a>` });
```

## 5. `GET /verify-email` (clicked from the email)
```js
const { token } = req.query;                 // data comes from the URL ?token=...
const user = await prisma.user.findFirst({ where: { verificationToken: token } });
if (!user) return res.status(400).json({ error: 'Invalid verification token' });
await prisma.user.update({ where: { id: user.id }, data: { isVerified: true, verificationToken: null } });
```
| `req.query` vs `req.body` | query = URL after `?` (links/GET); body = JSON in a POST |

## 6. Gate login on verification
```js
// AFTER the password check (identity first, then status):
if (!user.isVerified) {
  return res.status(403).json({ error: 'Please verify your email before logging in' });
}
```
- `403` = known, but not allowed yet. Placed after `bcrypt.compare` so we don't leak account status to wrong-password attempts.

## 7. Circled back: forgot-password now EMAILS the token
Instead of returning `resetToken` in the response, `/forgot-password` now calls `sendEmail(...)` with the reset link — the secure, real-world way. Steps 14 + 15 click together.

## 8. 🐞 Debugging lesson (again)
Unverified login "worked" even though the gate code was correct → a **stale `node` process** was serving old code. Rule: *when behavior doesn't match the code, suspect a stale/duplicate server* → kill all node, `npm run dev` fresh.

---

## ✅ Cheat-sheet
```js
sendEmail({ to, subject, html });                 // reusable helper (logs a preview URL)
const { token } = req.query;                      // read from ?token=...
// register: save verificationToken + email link ; /verify-email: set isVerified, clear token
// login: block if !user.isVerified (403)
```

## 🧠 Quick self-check (revision questions)
1. What does Ethereal let you do, and what changes when you go to production?
2. Why read the token from `req.query` (not `req.body`) in `/verify-email`?
3. Why is the `isVerified` check placed *after* the password check?
4. How is the verification token invalidated after use?
5. What's the tell-tale sign that a bug is actually a stale server process?
