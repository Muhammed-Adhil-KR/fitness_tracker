// auth.js
import express from 'express';
import { pool } from '../db.js';
// import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, gender } = req.body;
    if (!name || !email || !password || !age || !gender) {
      return res.status(400).json({ message: 'All fields required' });
    }

    // simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email' });

    // password length check
    if (password.length < 6) return res.status(400).json({ message: 'Password too short' });

    // check existing user
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) return res.status(409).json({ message: 'Email already registered' });

    // const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, age, gender) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, age, gender]
    );

    return res.status(201).json({ message: 'Registered', userId: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Missing fields' });

    const [rows] = await pool.query(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    );

    if (!rows.length)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    // const match = await bcrypt.compare(password, user.password);
    if (password!==user.password)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
