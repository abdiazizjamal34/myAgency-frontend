// src/components/dashboard/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, Table, FileBarChart2, Building2, Users, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  const items = [
    { to: "/dashboard", label: "Dashboard", Icon: LayoutGrid },
    { to: "/records", label: "Records", Icon: Table, roles: ["SUPER_ADMIN", "AGENCY_ADMIN", "PARTNER", "ACCOUNTANT"] },
    { to: "/reports", label: "Reports", Icon: FileBarChart2, roles: ["SUPER_ADMIN", "AGENCY_ADMIN", "PARTNER", "ACCOUNTANT"] },
    { to: "/agencies", label: "Agencies", Icon: Building2, roles: ["SUPER_ADMIN"] },
    { to: "/payment-summary", label: "Accounts", Icon: FileBarChart2, roles: ["SUPER_ADMIN", "AGENCY_ADMIN", "ACCOUNTANT"] },
    { to: "/users", label: "Users", Icon: Users, roles: ["SUPER_ADMIN", "AGENCY_ADMIN"] },
    { to: "/profile", label: "Profile", Icon: Users },

  ];

  return (
    <>
      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} lg:hidden`}
      >
        <SidebarContent items={items} user={user} logout={logout} onClose={onClose} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:border-r lg:border-slate-200 dark:lg:border-slate-700 lg:bg-white dark:lg:bg-slate-800">
        <SidebarContent items={items} user={user} logout={logout} />
      </div>
    </>
  );
}

function SidebarContent({ items, user, logout, onClose }) {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-100">
        {user?.agency ? user.agency.name || user.agency : "MyAgency"}
      </div>
      <nav className="space-y-1 flex-1">
        {items
          .filter((i) => !i.roles || i.roles.includes(user?.role))
          .map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-700 text-indigo-600 dark:text-indigo-200 font-medium"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`
              }
            >
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
      </nav>

      <div className="border-t pt-4 border-slate-200 dark:border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-rose-600 hover:underline"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
