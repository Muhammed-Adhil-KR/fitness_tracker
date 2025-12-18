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

/* ADD ACTIVITY + UPDATE DAILY METRICS */
router.post("/", auth, async (req, res) => {
  try {
    const {
      activity_type,
      duration_minutes,
      distance,
      steps,
      calories_burned,
      sleep_hours,
      activity_datetime,
      notes
    } = req.body;

    const user_id = req.user.id;
    const metric_date = activity_datetime.split("T")[0]; // YYYY-MM-DD

    /*  Insert activity */
    await pool.query(
      `INSERT INTO activities
      (user_id, activity_type, duration_minutes, distance, steps, calories_burned, sleep_hours, activity_datetime, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        activity_type,
        duration_minutes,
        distance || null,
        steps || 0,
        calories_burned,
        sleep_hours || null,
        activity_datetime,
        notes || null
      ]
    );

    /* Check daily metrics */
    const [rows] = await pool.query(
      `SELECT * FROM daily_health_metrics
       WHERE user_id = ? AND metric_date = ?`,
      [user_id, metric_date]
    );

    let sleepQuality = null;
    if (sleep_hours) {
      if (sleep_hours < 5) sleepQuality = "Poor";
      else if (sleep_hours < 7) sleepQuality = "Average";
      else sleepQuality = "Good";
    }

    if (rows.length > 0) {
      // UPDATE existing metrics
      await pool.query(
        `UPDATE daily_health_metrics
         SET
           total_steps = total_steps + ?,
           total_calories_burned = total_calories_burned + ?,
           total_active_minutes = total_active_minutes + ?,
           sleep_hours = IFNULL(sleep_hours,0) + IFNULL(?,0),
           sleep_quality = ?
         WHERE user_id = ? AND metric_date = ?`,
        [
          steps || 0,
          calories_burned,
          duration_minutes,
          sleep_hours,
          sleepQuality,
          user_id,
          metric_date
        ]
      );
    } else {
      // INSERT new metrics row
      await pool.query(
        `INSERT INTO daily_health_metrics
         (user_id, metric_date, total_steps, total_calories_burned, total_active_minutes, sleep_hours, sleep_quality)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          metric_date,
          steps || 0,
          calories_burned,
          duration_minutes,
          sleep_hours || null,
          sleepQuality
        ]
      );
    }

    res.json({ message: "Activity logged & metrics updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* GET ACTIVITIES */
router.get("/", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const [rows] = await pool.query(
      `SELECT * FROM activities
       WHERE user_id=?
       ORDER BY activity_datetime DESC`,
      [user_id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* DELETE ACTIVITY + RECALCULATE DAILY METRICS (FIXED) */
router.delete("/:id", auth, async (req, res) => {
  try {
    const activityId = req.params.id;
    const userId = req.user.id;

    /*  Get activity date (STRING SAFE) */
    const [rows] = await pool.query(
      `
      SELECT DATE(activity_datetime) AS metric_date
      FROM activities
      WHERE activity_id = ? AND user_id = ?
      `,
      [activityId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const metricDate = rows[0].metric_date; // ✅ already YYYY-MM-DD

    /*  Delete activity */
    await pool.query(
      `DELETE FROM activities WHERE activity_id = ? AND user_id = ?`,
      [activityId, userId]
    );

    /*  Recalculate metrics from remaining activities */
    const [agg] = await pool.query(
      `
      SELECT 
        IFNULL(SUM(duration_minutes), 0) AS total_minutes,
        IFNULL(SUM(calories_burned), 0) AS total_calories,
        IFNULL(SUM(steps), 0) AS total_steps,
        IFNULL(SUM(sleep_hours), 0) AS total_sleep
      FROM activities
      WHERE user_id = ?
        AND DATE(activity_datetime) = ?
      `,
      [userId, metricDate]
    );

    const totals = agg[0];

    /*  If no activities left → delete metrics row */
    if (
      totals.total_minutes === 0 &&
      totals.total_calories === 0 &&
      totals.total_steps === 0 &&
      totals.total_sleep === 0
    ) {
      await pool.query(
        `
        DELETE FROM daily_health_metrics
        WHERE user_id = ? AND metric_date = ?
        `,
        [userId, metricDate]
      );

      return res.json({ message: "Activity deleted & metrics removed" });
    }

    /*  Recalculate sleep quality */
    let sleepQuality = null;
    if (totals.total_sleep > 0) {
      if (totals.total_sleep < 5) sleepQuality = "Poor";
      else if (totals.total_sleep < 7) sleepQuality = "Average";
      else sleepQuality = "Good";
    }

    /*  Update daily metrics */
    await pool.query(
      `
      UPDATE daily_health_metrics
      SET
        total_active_minutes = ?,
        total_calories_burned = ?,
        total_steps = ?,
        sleep_hours = ?,
        sleep_quality = ?
      WHERE user_id = ? AND metric_date = ?
      `,
      [
        totals.total_minutes,
        totals.total_calories,
        totals.total_steps,
        totals.total_sleep || null,
        sleepQuality,
        userId,
        metricDate
      ]
    );

    res.json({ message: "Activity deleted & metrics updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
