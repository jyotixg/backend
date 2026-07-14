import 'dotenv/config';
import express from 'express';
import prisma from './prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from './authMiddleware.js';

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
    // SQL: INSERT INTO "User" (email, password, name, "updatedAt")
    //      VALUES ($1, $2, $3, NOW()) RETURNING *;
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    // 4. Respond (never send the password back)
    res.status(201).json({ id: user.id, email: user.email, name: user.name });

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

    // 4. Create a JWT and return it
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
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



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
