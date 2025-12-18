import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [intent, setIntent] = useState("");

  const intentSuggestions = {
    weight_loss: {
      title: "Lose Weight",
      activities: [
        "Brisk walking / Jogging",
        "Cycling",
        "HIIT workouts"
      ],
      metrics: [
        "🔥 Burn 2500–3000 calories / week",
        "👣 8,000–10,000 steps / day",
        "⏱ 30–60 active minutes / day"
      ]
    },
    muscle_gain: {
      title: "Gain Muscle",
      activities: [
        "Strength training",
        "Weight lifting",
        "Resistance workouts"
      ],
      metrics: [
        "⏱ 45–75 active minutes / day",
        "🔥 Moderate calorie burn",
        "🛌 Proper recovery & sleep"
      ]
    },
    stay_fit: {
      title: "Stay Fit",
      activities: [
        "Walking",
        "Yoga",
        "Light cardio"
      ],
      metrics: [
        "👣 6,000–8,000 steps / day",
        "⏱ 20–40 active minutes / day",
        "😴 7–8 hours sleep"
      ]
    },
    stamina: {
      title: "Improve Stamina",
      activities: [
        "Running / jogging",
        "Cycling",
        "Swimming"
      ],
      metrics: [
        "⏱ 40–60 active minutes / day",
        "🔥 Calorie burn steadily over time",
        "😴 Consistent 7–8 hours sleep"
      ]
    },
    better_sleep: {
      title: "Improve Sleep",
      activities: [
        "Evening walks",
        "Stretching",
        "Meditation"
      ],
      metrics: [
        "😴 7–9 hours sleep",
        "📉 Reduce late-night activity",
        "🧘 Consistent sleep routine"
      ]
    }
  };

  return (
    <div>
      <h1>Welcome, {user.name} 👋</h1>
      {/* ABOUT */}
      <div className="card">
        <h2>About Fitness Tracker:</h2>
        <p>
          This Fitness Tracker helps you monitor your health, track activities,
          manage fitness goals, and analyze your progress over time.
        </p>
      {/* </div> */}

      {/* WHY USE */}
      {/* <div className="card"> */}
        <h2>Why Use This App?</h2>
        <ul>
          <li>Track body measurements & BMI</li>
          <li>Set and achieve fitness goals</li>
          <li>Monitor daily activities</li>
          <li>Compare progress over time</li>
        </ul>
      </div>

      {/* INTENT GOAL (UI ONLY) */}
      <div className="card">
        <h2>Your Intent Goal</h2>

        <select
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          style={{ padding: 8, marginTop: 10 }}
        >
          <option value="">-- Select your goal --</option>
          <option value="weight_loss">Lose Weight</option>
          <option value="muscle_gain">Gain Muscle</option>
          <option value="stay_fit">Stay Fit</option>
          <option value="stamina">Improve Stamina</option>
          <option value="better_sleep">Improve Sleep</option>
        </select>

        {intent && (
          <div className="intent-box">
            <h3>{intentSuggestions[intent].title}</h3>

            <p><b>Suggested Activities:</b></p>
            <ul>
              {intentSuggestions[intent].activities.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>

            <p><b>Target Health Metrics:</b></p>
            <ul>
              {intentSuggestions[intent].metrics.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>

            <p style={{ fontSize: 13, color: "#777" }}>
              ℹ️ These are recommendations only.  
              You can create exact metric-based goals in the Goals section.
            </p>
          </div>
        )}
      </div>

      {/* CONTACT */}
      <section style={{ marginTop: 30 }}>
        <h2>Contact</h2>
        <p><b>Email:</b>  fitness_tracker@gmail.com</p>
        <p><b>Phone:</b>  +91 98765 43210</p>
      </section>
    </div>
  );
}
