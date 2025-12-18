import React, { useEffect, useState } from "react";
import { formatDateDMY } from "../utils/date";

export default function DailyMetrics() {
  const [metrics, setMetrics] = useState([]);
  const [date, setDate] = useState("");
  const token = localStorage.getItem("token");

  const loadMetrics = async () => {
    const url = date
      ? `http://localhost:5000/api/daily-metrics?date=${date}`
      : `http://localhost:5000/api/daily-metrics`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setMetrics(data);
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="section-card">
      <h2>Daily Health Metrics</h2>

      {/* DATE FILTER */}
      <div className="filter-row">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={loadMetrics} style={{ marginLeft: 10 }}>
          View
        </button>
      </div>

      {metrics.length === 0 && <p className="muted-text">No data available</p>}

      {metrics.map((m) => (
        <div key={m.metric_id} className="metric-card">
  
          <p><b>Date: </b>{formatDateDMY(m.metric_date)}</p>
          <p><b>Steps:</b> {m.total_steps ?? 0} </p>
          <p><b>Calories Burned:</b> {m.total_calories_burned} </p>
          <p><b>Active Minutes:</b> {m.total_active_minutes} </p>

          <p><b>Sleep:</b>{" "}
          {m.sleep_hours
            ? `${m.sleep_hours} hrs (${m.sleep_quality})`
            : "—"}</p>
        </div>
      ))}
    </div>
  );
}
