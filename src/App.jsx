// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ToastProvider } from "./components/ui/Toast";
import Sidebar from "./components/dashboard/Sidebar";
import Topbar from "./components/dashboard/Topbar";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
import Reports from "./pages/Reports";
import Agencies from "./pages/Agencies";
import Users from "./pages/Users";
import Login from "./pages/Login";
import { ThemeProvider } from "./hooks/useTheme";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound"; // create if missing

function AppShell() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If user is not authenticated, still allow public routes like
  // /forgot-password. Default to the Login page for other paths.
  if (!user) {
    return (
      <ToastProvider>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="h-screen flex flex-col">
        {/* Topbar visible only on mobile */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex flex-1 min-h-0">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/records" element={<Records />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              {user.role === "SUPER_ADMIN" && (
                <Route path="/agencies" element={<Agencies />} />
              )}
              {["SUPER_ADMIN", "AGENCY_ADMIN"].includes(user.role) && (
                <Route path="/users" element={<Users />} />
              )}
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}