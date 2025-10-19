import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import WelcomeModal from "../ui/WelcomeModal";   
import { useAuth } from "../../hooks/useAuth";   

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();  

  console.log("AppShell user:", user);

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar (mobile only) */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 dark:bg-slate-800 lg:p-6">
          {children}
        </main>
      </div>

      {/* ✅ Add Welcome & Safety Dialog */}
      <WelcomeModal user={user} />
    </div>
  );
}