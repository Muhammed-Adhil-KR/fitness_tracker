import React, { useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import "../styles/app.css";

export default function MainLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <h3>Fitness Tracker</h3>
        <br></br>
        {/* <p>Hi, {user.name}</p> */}

        <Link to="/dashboard">Dashboard</Link><br />
        <Link to="/profile">Profile</Link><br />
        <Link to="/goals">Goals</Link><br />
        <Link to="/activities">Activities</Link><br />
        <Link to="/metrics">Daily Metrics</Link><br />

        <button onClick={handleLogout}>Logout</button>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
