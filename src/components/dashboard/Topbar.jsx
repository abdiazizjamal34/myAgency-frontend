// src/components/dashboard/Topbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Menu, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 🔹 close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      {/* Mobile Topbar */}
      <div className="flex items-center justify-between dark:bg-slate-100 dark:text-stone-200 shadow px-4 py-3 lg:hidden">
        <button onClick={onMenuClick} className="text-slate-600 hover:text-slate-800">
          <Menu size={24} />
        </button>
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name
                )}&background=random`}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            </button>
            {open && (
              <Dropdown user={user} logout={logout} onClose={() => setOpen(false)} />
            )}
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-end dark:bg-slate-800 dark:text-stone-200 shadow px-6 py-3 relative">
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name
                )}&background=random`}
                alt={user.name}
                className="w-9 h-9 rounded-full"
              />
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium">{user.name}</span>
                {user.agency && (
                  <span className="text-xs text-slate-500">
                    {user.agency.name || user.agency}
                  </span>
                )}
              </div>
            </button>
            {open && (
              <Dropdown user={user} logout={logout} onClose={() => setOpen(false)} />
            )}
          </div>
        )}
      </div>
    </>
  );
}

// function Dropdown({ logout, onClose }) {
//   return (
//     <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50">
//       <button
//         onClick={onClose}
//         className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full"
//       >
//         <UserIcon size={16} /> Profile
//       </button>
//       <button
//         onClick={onClose}
//         className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full"
//       >
//         <Settings size={16} /> Settings
//       </button>
//       <button
//         onClick={() => {
//           logout();
//           onClose();
//         }}
//         className="flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 w-full"
//       >
//         <LogOut size={16} /> Logout
//       </button>
//     </div>
//   );
// }
function Dropdown({ logout, onClose }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border rounded-lg shadow-lg py-2 z-50">
      <button
        onClick={() => {
          navigate("/profile");
          onClose();
        }}
        className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <UserIcon size={16} /> Profile
      </button>

      {/* Settings with theme switcher */}
      <button
        onClick={() => {
          toggleTheme();
          onClose();
        }}
        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 w-full"
      >
        <Settings size={16} /> {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>

      <button
        onClick={() => {
          logout();
          onClose();
        }}
        className="flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 w-full"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}

