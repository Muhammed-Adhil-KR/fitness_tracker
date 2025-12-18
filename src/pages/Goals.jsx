import React, { useEffect, useState } from "react";
import { formatDateDMY } from "../utils/date";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({
    goal_type: "calories",
    target_value: "",
    start_date: "",
    end_date: ""
  });

  const token = localStorage.getItem("token");

  /* LOAD GOALS */
  const loadGoals = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/goals", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setGoals(data);
      else setGoals([]);
    } catch (err) {
      console.error("Failed to load goals", err);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  /* CREATE GOAL */
  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:5000/api/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    setForm({
      goal_type: "calories",
      target_value: "",
      start_date: "",
      end_date: ""
    });

    loadGoals();
  };

  const statusColor = (status) => {
    if (status === "completed") return "#4CAF50";
    if (status === "in progress") return "#FF9800";
    return "#9E9E9E";
  };

  const goalLabel = (type) => {
    if (type === "calories") return "Calories Burned";
    if (type === "steps") return "Steps";
    if (type === "active_minutes") return "Active Minutes";
    if (type === "sleep_hours") return "Sleep Hours";
    return type;
  };

  return (
    <div className="page-container">
      <div className="form-card">
      <h2>Goals</h2>

      {/* CREATE GOAL */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <select
          value={form.goal_type}
          onChange={(e) => setForm({ ...form, goal_type: e.target.value })}
        >
          <option value="calories">Calories</option>
          <option value="steps">Steps</option>
          <option value="active_minutes">Active Minutes</option>
          <option value="sleep_hours">Sleep Hours</option>
        </select>

        <input
          type="number"
          placeholder="Target value"
          required
          value={form.target_value}
          onChange={(e) =>
            setForm({ ...form, target_value: e.target.value })
          }
        />

        <input
          type="date"
          required
          value={form.start_date}
          onChange={(e) =>
            setForm({ ...form, start_date: e.target.value })
          }
        />

        <input
          type="date"
          required
          value={form.end_date}
          onChange={(e) =>
            setForm({ ...form, end_date: e.target.value })
          }
        />

        <button type="submit">Add Goal</button>
      </form>
      </div>
      {/* DISPLAY GOALS */}
      {goals.length === 0 && <p>No goals created yet.</p>}

      {goals.map((g) => (
        <div className="item-card">
      <div className="item-card-header">
        <b>{goalLabel(g.goal_type)}</b>
        <span className={`status-badge status-${g.status.replace(" ", "")}`}>
          {g.status}
        </span>
      </div>

          <p>
            {formatDateDMY(g.start_date)} → {formatDateDMY(g.end_date)}
          </p>

          <p>
            <b>Target:</b> {g.target_value} <br />
            <b>Achieved:</b> {g.achieved}
          </p>

           <div className="progress-track">
           <div className="progress-fill" style={{ width: `${g.progress_percent}%` }} />
        </div>

          <p>{g.progress_percent}% completed</p>
     </div>
      ))}
    </div>
  );
}
