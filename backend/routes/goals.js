import express from "express";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* AUTH MIDDLEWARE */
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

/* -------------------------------
   CREATE GOAL
-------------------------------- */
router.post("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { goal_type, target_value, start_date, end_date } = req.body;

    await pool.query(
      `
      INSERT INTO goals
      (user_id, goal_type, target_value, start_date, end_date)
      VALUES (?, ?, ?, ?, ?)
      `,
      [user_id, goal_type, target_value, start_date, end_date]
    );

    res.json({ message: "Goal created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------
   LIST GOALS + PROGRESS + STATUS
-------------------------------- */
router.get("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [goals] = await pool.query(
      `
      SELECT *
      FROM goals
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [user_id]
    );

    const today = new Date().toISOString().split("T")[0];
    const results = [];

    for (const goal of goals) {
      let achieved = 0;
      let metricColumn = "";

      /* ✅ MATCH DATABASE ENUM VALUES */
      if (goal.goal_type === "calories") metricColumn = "total_calories_burned";
      if (goal.goal_type === "steps") metricColumn = "total_steps";
      if (goal.goal_type === "active_minutes") metricColumn = "total_active_minutes";
      if (goal.goal_type === "sleep_hours") metricColumn = "sleep_hours";

      if (metricColumn) {
        const [rows] = await pool.query(
          `
          SELECT IFNULL(SUM(${metricColumn}),0) AS achieved
          FROM daily_health_metrics
          WHERE user_id = ?
            AND metric_date BETWEEN ? AND ?
          `,
          [user_id, goal.start_date, goal.end_date]
        );

        achieved = rows[0].achieved;
      }

      const progress_percent = Math.min(
        Math.round((achieved / goal.target_value) * 100),
        100
      );

      /* STATUS LOGIC */
      let status = "in progress";
      if (today < goal.start_date) status = "not started";
      if (achieved >= goal.target_value) status = "completed";

      results.push({
        goal_id: goal.goal_id,
        goal_type: goal.goal_type,
        target_value: goal.target_value,
        start_date: goal.start_date,
        end_date: goal.end_date,
        achieved,
        progress_percent,
        status
      });
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
