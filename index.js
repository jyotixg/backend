import 'dotenv/config';
import express from 'express';
import prisma from './prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from './authMiddleware.js';
import crypto from 'crypto';
import { sendEmail } from './mailer.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World! My server is running 🚀');
});

app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2. Check if the email is already registered
    // SQL: SELECT * FROM "User" WHERE email = $1 LIMIT 1;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the new user
    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, verificationToken },
    });

    // Build a verification link and email it
    const verifyUrl = `http://localhost:${process.env.PORT || 3000}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify your email',
      html: `<p>Welcome! Please verify your email by clicking the link below:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`,
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      message: 'Registered! Check your email to verify your account.',
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;


    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2. Find the user by email
    // SQL: SELECT * FROM "User" WHERE email = $1 LIMIT 1;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. Compare the typed password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Block login until the email is verified
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }


    // 4. Create access + refresh tokens
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }              // short-lived
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,   // different secret
      { expiresIn: '7d' }               // long-lived
    );

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    });


  }

  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }

})


// Protected: only works with a valid token
app.get('/me', authenticate, async (req, res) => {
  // req.userId was set by the middleware
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, createdAt: true }, // never select password
  });
  res.json(user);
});

// Protected: update the logged-in user's own profile
app.patch('/me', authenticate, async (req, res) => {
  try {
    const { name } = req.body;

    // SQL: UPDATE "User" SET name = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, email, name;
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { name },
      select: { id: true, email: true, name: true },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Admin only: list all users
app.get('/admin/users', authenticate, authorize('admin'), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });
  res.json(users);
});

// Exchange a valid refresh token for a new access token
app.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // 1. Must provide a refresh token
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // 2. Verify it with the REFRESH secret (not the access secret!)
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // 3. Look up the user (refresh token only carries userId)
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // 4. Issue a fresh access token (with the user's CURRENT role)
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Step 1 of reset: user requests a reset token
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Security: respond identically whether or not the email exists
    if (!user) {
      return res.json({ message: 'If that email is registered, a reset link has been sent' });
    }

    // Generate a secure random token + 1-hour expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // now + 1 hour

    // Save them on the user's row
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // Email the reset link instead of returning the token
    const resetUrl = `http://localhost:${process.env.PORT || 3000}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: `<p>You requested a password reset. Use this token (valid 1 hour):</p>
             <p><b>${resetToken}</b></p>
             <p>Or open: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json({ message: 'If that email is registered, a reset link has been sent' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Step 2 of reset: user submits the token + a new password
app.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    // Find a user whose token matches AND hasn't expired
    // SQL: SELECT * FROM "User" WHERE "resetToken" = $1 AND "resetTokenExpiry" > NOW() LIMIT 1;
    const user = await prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash the new password (same as registration — never store plain text)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Set the new password and CLEAR the token (one-time use)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// User clicks the emailed link → verify their email
app.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;   // from the URL ?token=...
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },  // mark verified, clear token
    });

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
