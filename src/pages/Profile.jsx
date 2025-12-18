import React, { useEffect, useState } from "react";
import { formatDateDMY } from "../utils/date";


export default function Profile() {
  const token = localStorage.getItem("token");

  const [userInfo, setUserInfo] = useState(null);
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    height_cm: "",
    weight_kg: "",
    body_fat: "",
    measurement_date: "",
  });

  // 🔹 Fetch profile on load
  useEffect(() => {
    fetch("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserInfo(data);

        if (data.height_cm || data.weight_kg) {
          setProfile(data);
          setForm({
            height_cm: data.height_cm || "",
            weight_kg: data.weight_kg || "",
            body_fat: data.body_fat || "",
            measurement_date: data.measurement_date
              ? data.measurement_date.split("T")[0]
              : "",
          });
        }
      });
  }, []);

  // 🔹 Auto BMI calculation
  const calculateBMI = () => {
    if (!form.height_cm || !form.weight_kg) return null;
    const h = form.height_cm / 100;
    return (form.weight_kg / (h * h)).toFixed(2);
  };
  const getBmiCategory = (bmi) => {
  if (!bmi) return '';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};


  // 🔹 Submit profile
  const handleSubmit = async (e) => {
    e.preventDefault(); // 🚫 stops refresh

    const bmi = calculateBMI();

    await fetch("http://localhost:5000/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        bmi,
      }),
    });

    // Re-fetch profile to display updated values
    const res = await fetch("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProfile(data);
  };

  // 🔹 Delete profile
  const handleDelete = async () => {
    if (!window.confirm("Delete profile?")) return;

    await fetch("http://localhost:5000/api/profile", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setProfile(null);
    setForm({
      height_cm: "",
      weight_kg: "",
      body_fat: "",
      measurement_date: "",
    });
  };

  if (!userInfo) return <p>Loading...</p>;

  return (
    <div className="card">
      <h2>Profile</h2>

      {/* Registered details */}
      <p><b>Name:</b> {userInfo.name}</p>
      <p><b>Email:</b> {userInfo.email}</p>
      <p><b>Age:</b> {userInfo.age || "-"}</p>
      <p><b>Gender:</b> {userInfo.gender}</p>

      <hr />

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Height (cm)"
          value={form.height_cm}
          onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
          required
        />
        <br /><br />

        <input
          type="number"
          placeholder="Weight (kg)"
          value={form.weight_kg}
          onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
          required
        />
        <br /><br />

        <input
          type="number"
          placeholder="Body Fat % (optional)"
          value={form.body_fat}
          onChange={(e) => setForm({ ...form, body_fat: e.target.value })}
        />
        <br /><br />

        <input
          type="date"
          value={form.measurement_date}
          onChange={(e) =>
            setForm({ ...form, measurement_date: e.target.value })
          }
        />
        <br /><br />

        <button className="primary" type="submit">Save Profile</button>
      </form>

      {/* Display saved profile */}
      {profile && (
        <div className="card profile-details">
          <hr />
          <h3>Saved Details</h3>
          <p><b>Height:</b> {profile.height_cm} cm</p>
          <p><b>Weight:</b> {profile.weight_kg} kg</p>
          <p><b>Body Fat:</b> {profile.body_fat || "-"}%</p>
          <p>
            <strong>BMI:</strong>{' '}
            {profile.bmi}{' '}
              <span style={{ color: '#555' }}>
                ({getBmiCategory(profile.bmi)})
              </span>
          </p>  
          <p>
            <b>Last Measured Date:</b>{" "}
                {formatDateDMY(profile.measurement_date)}
          </p>
          <button className="primary" onClick={handleDelete} >
            Delete Profile
          </button>
        </div>
      )}
    </div>
  );
}
