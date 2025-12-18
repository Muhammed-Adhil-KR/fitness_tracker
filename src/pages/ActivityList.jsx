import React, { useEffect, useState } from "react";
import { formatDateDMY } from "../utils/date";

export default function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({
    activity_type: "",
    duration_minutes: "",
    distance: "",
    steps: "",
    calories_burned: "",
    sleep_hours: "",
    activity_datetime: "",
    notes: ""
  });

  const token = localStorage.getItem("token");

  /* LOAD ACTIVITIES */
  const loadActivities = async () => {
    const res = await fetch("http://localhost:5000/api/activities", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    setActivities(data);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleDelete = async (id) => {
  if (!window.confirm("Delete this activity?")) return;

  await fetch(`http://localhost:5000/api/activities/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadActivities();
};


  /* HANDLE FORM SUBMIT */
  const handleSubmit = async (e) => {
  e.preventDefault();

  /* 🚨 DATE VALIDATION */
  if (!form.activity_datetime) {
    alert("Please select a date before adding activity.");
    return;
  }

  try {
    await fetch("http://localhost:5000/api/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    setForm({
      activity_type: "",
      duration_minutes: "",
      distance: "",
      steps: "",
      calories_burned: "",
      sleep_hours: "",
      activity_datetime: "",
      notes: ""
    });

    loadActivities();
  } catch (err) {
    alert("Failed to add activity");
    console.error(err);
  }
};


  return (
    <div className="section-card">

      {/* HEADER */}
      <div className="activity-header">
        <h2>Log Activity</h2>
        <input
          type="date"
          required
          value={form.activity_datetime}
          onChange={(e) => setForm({ ...form, activity_datetime: e.target.value })}
        />
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <select
          required
          value={form.activity_type}
          onChange={(e) => setForm({ ...form, activity_type: e.target.value })}
        >
          <option value="">Select Activity</option>
          <option>Running</option>
          <option>Walking</option>
          <option>Cycling</option>
          <option>Gym</option>
          <option>Yoga</option>
          <option>HIIT</option>
          <option>Swimming</option>
          <option>Other</option>
        </select>

        <input
          type="number"
          placeholder="Duration (minutes)"
          required
          value={form.duration_minutes}
          onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
        />

        <input
          type="number"
          placeholder="Distance (km / optional)"
          value={form.distance}
          onChange={(e) => setForm({ ...form, distance: e.target.value })}
        />

        <input
          type="number"
          placeholder="Steps (optional)"
          value={form.steps}
          onChange={(e) => setForm({ ...form, steps: e.target.value })}
        />

        <input
          type="number"
          placeholder="Calories Burned"
          required
          value={form.calories_burned}
          onChange={(e) => setForm({ ...form, calories_burned: e.target.value })}
        />

        <input
          type="number"
          step="0.1"
          placeholder="Sleep Hours (optional)"
          value={form.sleep_hours}
          onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })}
        />

        <textarea
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <button type="submit">Save Activity</button>
      </form>

     {/* DISPLAY */}
<h3 style={{ marginTop: 30 }}>My Activities</h3>

{activities.length === 0 && (
  <p className="muted-text">No activities logged yet.</p>
)}

{activities.map((a) => (
  <div key={a.activity_id} className="activity-card">
          <div className="activity-top">
            <b>{a.activity_type}</b>
            <button
              className="delete-btn"
              onClick={() => handleDelete(a.activity_id)}
            >
              Delete
            </button>
          </div>
          
    <p><b>Date:</b> — {formatDateDMY(a.activity_datetime)}</p>
    <p><b>Duration: </b> — {a.duration_minutes} min</p>
    <p><b>Calories: </b> — {a.calories_burned}</p>
    <p><b>Distance:</b> — {a.distance ? `${a.distance}` : "--"}</p>
    <p><b>Steps:</b> — {a.steps ?? "--"}</p>
    <p><b>Sleep:</b> — {a.sleep_hours ? `${a.sleep_hours} hrs` : "--"}</p>
  </div>
))}

    </div>
  );
}