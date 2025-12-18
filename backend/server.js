// backend/server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
// import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import activityRoutes from "./routes/activities.js";
import dailyMetricsRoutes from "./routes/dailyMetrics.js";
import goalsRoutes from "./routes/goals.js";


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes); // ← REQUIRED
app.use("/api/activities", activityRoutes);
app.use("/api/daily-metrics", dailyMetricsRoutes);
app.use("/api/goals", goalsRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// helper middleware to protect routes
const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Invalid auth format' });
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contains id, email
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};


// ----------------- PROFILE -----------------
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT 
        u.name, u.email, u.age, u.gender,
        p.height_cm, p.weight_kg, p.bmi, p.body_fat, p.measurement_date
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
      `,
      [userId]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

//     if (!height_cm || !weight_kg) {
//       return res.status(400).json({ message: 'Height and weight required' });
//     }

app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      height_cm,
      weight_kg,
      body_fat,
      measurement_date
    } = req.body;

    // calculate BMI
    let bmi = null;
    if (height_cm && weight_kg) {
      const h = height_cm / 100;
      bmi = (weight_kg / (h * h)).toFixed(2);
    }

    // check if profile already exists
    const [rows] = await pool.query(
      'SELECT id FROM profiles WHERE user_id = ?',
      [userId]
    );

    if (rows.length > 0) {
      // UPDATE
      await pool.query(
        `UPDATE profiles 
         SET height_cm=?, weight_kg=?, bmi=?, body_fat=?, measurement_date=?
         WHERE user_id=?`,
        [height_cm, weight_kg, bmi, body_fat, measurement_date, userId]
      );
    } else {
      // INSERT
      await pool.query(
        `INSERT INTO profiles 
         (user_id, height_cm, weight_kg, bmi, body_fat, measurement_date)
         VALUES (?,?,?,?,?,?)`,
        [userId, height_cm, weight_kg, bmi, body_fat, measurement_date]
      );
    }

    res.json({ message: 'Profile saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/profile', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM profiles WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MySQL Connected Successfully!
Server running on port ${PORT}`);
});
