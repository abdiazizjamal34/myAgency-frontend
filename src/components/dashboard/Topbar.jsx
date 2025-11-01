// src/components/dashboard/Topbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Menu, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useNavigate } from "react-router-dom";
import { AgenciesAPI } from "../../services/api";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState(null);

  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // fetch protected logo as blob and use object URL so img gets auth'd via axios
  useEffect(() => {
    let mounted = true;
    let objectUrl = null;
    async function loadLogo() {
      try {
        const agencyId = user?.agency?._id || user?.agency;
        if (!agencyId) {
          setLogoUrl(null);
          return;
        }
        const blob = await AgenciesAPI.getLogo(agencyId);
        objectUrl = URL.createObjectURL(blob);
        if (mounted) setLogoUrl(objectUrl);
      } catch (err) {
        console.error("Failed to load agency logo", err);
        if (mounted) setLogoUrl(null);
      }
    }
    loadLogo();
    return () => {
      mounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [user?.agency]);

  return (
    <>
      {/* Mobile Topbar */}
      <div className="flex items-center justify-between dark:bg-slate-100 dark:text-stone-200 shadow px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded overflow-hidden bg-white/30 flex items-center justify-center border">
            {logoUrl ? (
              <img src={logoUrl} alt="agency logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-slate-600">Logo</span>
            )}
          </div>
        </div>

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
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            </button>
            {open && <Dropdown user={user} logout={logout} onClose={() => setOpen(false)} />}
          </div>
        )}
      </div>

      {/* Desktop Header */}
      {/* <div className="hidden lg:flex items-center justify-end dark:bg-slate-800 dark:text-stone-200 shadow px-6 py-3 relative">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <div className="w-10 h-10 rounded overflow-hidden bg-white/10 flex items-center justify-center border">
            {logoUrl ? (
              <img src={logoUrl} alt="agency logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-slate-300">Logo</span>
            )}
          </div>
        </div>

        {user && (
          <div className="relative ml-auto" ref={dropdownRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                alt={user.name}
                className="w-9 h-9 rounded-full"
              />
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium">{user.name}</span>
                {user.agency && <span className="text-xs text-slate-500">{user.agency.name || user.agency}</span>}
              </div>
            </button>
            {open && <Dropdown user={user} logout={logout} onClose={() => setOpen(false)} />}
          </div>
        )}
      </div> */}
      {/* deasktop Header */}
<div className="hidden lg:flex items-center justify-end dark:bg-slate-900 bg-white shadow px-6 py-3 relative">
  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
    <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center 
                    bg-gradient-to-br from-indigo-100 to-indigo-300 dark:from-slate-700 dark:to-slate-600 
                    border border-indigo-200 dark:border-slate-600 shadow-md">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Agency Logo"
          className="w-full h-full object-contain rounded-lg "
        />
      ) : (
        <span className="text-sm font-semibold text-indigo-700 dark:text-slate-200">
          {user?.agency?.name?.[0]?.toUpperCase() || "A"}
        </span>
      )}
    </div>
    <span className="text-base font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[160px]">
      {user?.agency?.name || "My Agency"}
    </span>
  </div>

  {user && (
    <div className="relative ml-auto" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
          alt={user.name}
          className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-600"
        />
        <div className="flex flex-col text-left">
          <span className="text-sm font-medium">{user.name}</span>
          {user.agency && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {user.agency.name || user.agency}
            </span>
          )}
        </div>
      </button>
      {open && <Dropdown user={user} logout={logout} onClose={() => setOpen(false)} />}
    </div>
  )}
</div>

    </>
  );
}

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

