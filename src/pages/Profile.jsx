// src/pages/Profile.jsx
import React, { useState, useRef } from "react";
import { AgenciesAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { Mail, Shield, Edit3, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/Toast";
import { useEffect } from "react";

export default function Profile() {
  const { user, setUser, refreshUser } = useAuth(); // setUser/refreshUser optional
  const toast = useToast();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(user?.agency?.logo || null);
  const [uploading, setUploading] = useState(false);
  const [action, setAction] = useState(null);
  const [notifications, setNotifications] = useState({
    emailReports: true,
    systemAlerts: true,
    newUsers: false,
  });
    const [logoUrl, setLogoUrl] = useState(null);
  const navigate = useNavigate();

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
  

  const chooseFile = () => fileRef.current?.click();

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !user?.agency?._id) return;
    setUploading(true);
    try {
      const updatedAgency = await AgenciesAPI.uploadLogo(user.agency._id, f);
      // update preview
      setPreview(URL.createObjectURL(f));
      // try to update auth state in-place
      if (typeof refreshUser === "function") {
        await refreshUser();
      } else if (typeof setUser === "function" && updatedAgency) {
        setUser((prev) => ({ ...prev, agency: updatedAgency }));
      } else {
        window.location.reload();
      }
      toast.push("Logo uploaded");
    } catch (err) {
      console.error("Upload failed", err);
      toast.push("Logo upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero Profile */}
      <Card className="p-10 flex flex-col md:flex-row items-center md:items-start gap-10">
        {/* Avatar */}
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name
          )}&background=random`}
          alt={user.name}
          className="w-32 h-32 rounded-full shadow-lg"
        />

         {/* {logoUrl ? (
        <img
          src={logoUrl}
          alt="Agency Logo"
          className="w-full h-full object-contain rounded-lg "
        />
      ) : (
        <span className="text-sm font-semibold text-indigo-700 dark:text-slate-200">
          {user?.agency?.name?.[0]?.toUpperCase() || "A"}
        </span>
      )} */}

        {/* Info */}
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-slate-500">{user.role}</p>
          {user.agency && (
            <p className="text-sm text-slate-400">
              Agency: {user.agency.name || user.agency}
            </p>
          )}
          <p className="text-sm text-slate-400">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <Button onClick={() => setAction("edit")} className="flex items-center gap-2 justify-center">
            <Edit3 size={18} /> Edit Profile
          </Button>
          <Button
            onClick={() => setAction("email")}
            variant="secondary"
            className="flex items-center gap-2 justify-center"
          >
            <Mail size={18} /> Change Email
          </Button>
          <Button
            onClick={() => setAction("password")}
            variant="secondary"
            className="flex items-center gap-2 justify-center"
          >
            <Shield size={18} /> Change Password
          </Button>
        </div>
      </Card>

      {/* Profile Picture / Logo Upload */}
      <Card className="p-8">
        <h2 className="text-xl font-semibold mb-6">Profile Picture / Logo</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded overflow-hidden border bg-white/5">
            {/* {preview ? (
              <img src={preview} alt="agency logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">No logo</div>
            )} */}
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

          <div className="flex-1">
            <div className="text-sm text-slate-700 mb-2">{user?.agency?.name || "No agency"}</div>

            {user?.role === "AGENCY_ADMIN" ? (
              <>
                <div className="flex gap-2">
                  <Button onClick={chooseFile} disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload logo"}
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
                <div className="text-xs text-slate-500 mt-2">Allowed formats: jpg, png. Max size: (enforce on server)</div>
              </>
            ) : (
              <div className="text-xs text-slate-500">Contact agency admin to update logo.</div>
            )}
          </div>
        </div>
      </Card>

      {/* Notifications Settings */}
      <Card className="p-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Bell size={20} /> Notifications
        </h2>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    setNotifications((n) => ({ ...n, [key]: !n[key] }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Modals */}
      {action === "edit" && (
        <Modal open={true} onClose={() => setAction(null)} title="Edit Profile">
          <EditProfileForm user={user} onClose={() => setAction(null)} />
        </Modal>
      )}
      {action === "email" && (
        <Modal open={true} onClose={() => setAction(null)} title="Change Email">
          <ChangeEmailForm user={user} onClose={() => setAction(null)} />
        </Modal>
      )}
      {action === "password" && (
        <Modal open={true} onClose={() => setAction(null)} title="Change Password">
          <ChangePasswordForm onClose={() => setAction(null)} />
        </Modal>
      )}
    </div>
  );
}

/* ---- Sub Forms ---- */
function EditProfileForm({ user, onClose }) {
  const [form, setForm] = useState({ name: user.name });
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Full Name</label>
        <input
          className="w-full border rounded-md p-2 mt-1"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
        />
      </div>
      <Button type="button" onClick={onClose} className="w-full">
        Save Changes
      </Button>
    </form>
  );
}

function ChangeEmailForm({ user, onClose }) {
  const [email, setEmail] = useState(user.email);
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium">New Email</label>
        <input
          className="w-full border rounded-md p-2 mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="button" onClick={onClose} className="w-full">
        Update Email
      </Button>
    </form>
  );
}

import { UserAPI } from "../services/api";

function ChangePasswordForm({ onClose }) {
  const [pw, setPw] = useState({ current: "", newPass: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // NEW
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!pw.current || !pw.newPass || !pw.confirm) {
      setError("All fields are required.");
      return;
    }
    if (pw.newPass !== pw.confirm) {
      setError("New password and confirm password do not match.");
      return;
    }
    setLoading(true);
    try {
      await UserAPI.changePassword({ currentPassword: pw.current, newPassword: pw.newPass });
      setSuccess("Password updated successfully.");
      setPw({ current: "", newPass: "", confirm: "" });
      setTimeout(() => setShowLogoutModal(true), 1200); // Show modal after success
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };
 console.log("Loading state:", loading);
   
const handleLogoutAll = () => {
    logout(); // Clear token and user state
    navigate("/login");
  };


  return (
    <>

    {/* // ...inside ChangePasswordForm return... */}
<form className="space-y-4" onSubmit={handleSubmit}>
  {error && <div className="text-rose-600 text-sm">{error}</div>}
  {success && <div className="text-green-600 text-sm">{success}</div>}
  {loading && (
    <div className="flex flex-col items-center justify-center py-4">
      {/* SVG spinner */}
      <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="text-indigo-600 text-sm font-medium">
        🔒 Updating password... Please wait!
      </span>
    </div>
  )}
  <div>
    <label className="block text-sm font-medium">Current Password</label>
    <input
      type="password"
      className="w-full border rounded-md p-2 mt-1"
      value={pw.current}
      onChange={(e) => setPw({ ...pw, current: e.target.value })}
      disabled={loading}
    />
  </div>
  <div>
    <label className="block text-sm font-medium">New Password</label>
    <input
      type="password"
      className="w-full border rounded-md p-2 mt-1"
      value={pw.newPass}
      onChange={(e) => setPw({ ...pw, newPass: e.target.value })}
      disabled={loading}
    />
  </div>
  <div>
    <label className="block text-sm font-medium">Confirm Password</label>
    <input
      type="password"
      className="w-full border rounded-md p-2 mt-1"
      value={pw.confirm}
      onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
      disabled={loading}
    />
  </div>
  <Button type="submit" disabled={loading} className="w-full">
    {loading ? "Updating..." : "Update Password"}
  </Button>
</form>
    {/* <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <div className="text-rose-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <div>
        <label className="block text-sm font-medium">Current Password</label>
        <input
          type="password"
          className="w-full border rounded-md p-2 mt-1"
          value={pw.current}
          onChange={(e) => setPw({ ...pw, current: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">New Password</label>
        <input
          type="password"
          className="w-full border rounded-md p-2 mt-1"
          value={pw.newPass}
          onChange={(e) => setPw({ ...pw, newPass: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Confirm Password</label>
        <input
          type="password"
          className="w-full border rounded-md p-2 mt-1"
          value={pw.confirm}
          onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Password"}
      </Button>
    </form> */}
    {/* Logout confirmation modal */}
      {showLogoutModal && (
        <Modal open={true} onClose={() => { setShowLogoutModal(false); onClose(); }} title="Logout from all devices?">
          <div className="space-y-4">
            <p>
              Your password has been changed.<br />
              Do you want to log out from every device (expire all sessions)?
            </p>
            <div className="flex gap-2">
              <Button onClick={handleLogoutAll} className="w-full bg-indigo-600 text-white">
                Yes, log out everywhere
              </Button>
              <Button onClick={() => { setShowLogoutModal(false); onClose(); }} variant="secondary" className="w-full">
                No, stay logged in
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
