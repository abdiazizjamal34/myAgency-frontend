// src/pages/Profile.jsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { Mail, Shield, Edit3, Bell } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [action, setAction] = useState(null);
  const [notifications, setNotifications] = useState({
    emailReports: true,
    systemAlerts: true,
    newUsers: false,
  });

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
      setTimeout(onClose, 1500);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };
 console.log("Loading state:", loading);
   

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
    </form>
  );
}
