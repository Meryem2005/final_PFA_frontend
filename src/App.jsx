import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AssistantPage from "./pages/assistant/AssistantPage";
import MonitoringPage from "./pages/monitoring/MonitoringPage";

/* =========================
   PROTECTED ROUTE
========================= */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================
   ROUTES
========================= */
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  const [reportData, setReportData] = useState(null);
  const [inputData, setInputData] = useState(null);

  return (
    <Routes>
      {/* HOME (toujours accessible) */}
      <Route path="/" element={<HomePage />} />

      {/* LOGIN */}
      {/* LOGIN */}
      <Route path="/login" element={<LoginPage />} />

      {/* REGISTER */}
      <Route path="/register" element={<RegisterPage />} />

      {/* ASSISTANT (protégé) */}
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <AssistantPage
              onReportReady={(data, input) => {
                setReportData(data);
                setInputData(input);
              }}
            />
          </ProtectedRoute>
        }
      />

      {/* MONITORING (protégé) */}
      <Route
        path="/monitoring"
        element={
          <ProtectedRoute>
            <MonitoringPage
              reportData={reportData}
              inputData={inputData}
              onBack={() => window.history.back()}
            />
          </ProtectedRoute>
        }
      />

      {/* 404 → HOME */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/* =========================
   APP ROOT
========================= */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
