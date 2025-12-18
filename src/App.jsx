import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { useContext } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ActivityList from "./pages/ActivityList";
import MainLayout from "./pages/MainLayout";
import DailyMetrics from "./pages/DailyMetrics";
import Goals from "./pages/Goals";

/* =======================
   ROUTE GUARDS
======================= */

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // or loader
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // or loader
  return user ? <Navigate to="/dashboard" replace /> : children;
}

/* =======================
   APP
======================= */

export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* PUBLIC */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* PRIVATE (Layout Wrapper) */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="activities" element={<ActivityList />} />
          <Route path="metrics" element={<DailyMetrics />} />
          <Route path="goals" element={<Goals />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </AuthProvider>
  );
}
