import express from "express";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* AUTH */
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* --------------------------------
   GET DAILY METRICS (CLEAN DATA)
--------------------------------- */
router.get("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { date } = req.query;

    let query = `
      SELECT *
      FROM daily_health_metrics
      WHERE user_id = ?
        AND (
          total_steps > 0
          OR total_calories_burned > 0
          OR total_active_minutes > 0
          OR sleep_hours > 0
        )
    `;

    const params = [user_id];

    if (date) {
      query += " AND metric_date = ?";
      params.push(date);
    }

    query += " ORDER BY metric_date DESC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
