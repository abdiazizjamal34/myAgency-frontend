import React, { useEffect, useState } from "react";
import { UsersAPI, AgenciesAPI } from "../services/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "PARTNER",
    agency: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(""); // "success" | "error"
  const [showDialog, setShowDialog] = useState(false);

  // For delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteChecked, setDeleteChecked] = useState(false);

  // Fetch data
  const fetchUsers = async () => {
    try {
      const data = await UsersAPI.list();
      setUsers(data);
    } catch (e) {
      setError(e.message || "Failed to load users");
    }
  };

  const fetchAgencies = async () => {
    try {
      const data = await AgenciesAPI.list();
      setAgencies(data);
    } catch {
      // ignore for non-SUPER_ADMIN
    }
  };

  useEffect(() => {
    fetchUsers();
    if (user.role === "SUPER_ADMIN") fetchAgencies();
  }, [user]);

  // Form Handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [phone, setPhone] = useState("");
  const handlePhoneChange = (value) => {
    setPhone(value);
    setForm({ ...form, phone: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowDialog(true);
    setLoading(true);
    setStatus("");

    const payload = { ...form };
    if (user.role !== "SUPER_ADMIN") {
      payload.agency = user.agency._id || user.agency;
    }

    try {
      if (editingUser) {
        await UsersAPI.update(editingUser, payload);
        setStatus("success");
      } else {
        await UsersAPI.create(payload);
        setStatus("success");
      }
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "PARTNER",
        agency: "",
      });
      setPhone("");
      setEditingUser(null);
      fetchUsers();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to save user");
      setStatus("error");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setShowDialog(false);
        setStatus("");
      }, 2500);
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u._id);
    setForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      password: "",
      role: u.role || "PARTNER",
      agency: u.agency?._id || u.agency || "",
    });
  };

  // Delete handling
  const openDeleteDialog = (id) => {
    setDeleteUserId(id);
    setDeleteChecked(false);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteChecked) return;
    try {
      await UsersAPI.remove(deleteUserId);
      fetchUsers();
      setDeleteDialogOpen(false);
    } catch (e) {
      setError(e.message || "Failed to delete user");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Users</h2>
      {error && <div className="mb-2 text-rose-600">{error}</div>}

      {/* Create/Edit User Form */}
      <Card className="p-4 mb-6">
        <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-2">
          <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <Input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
          <PhoneInput
            country={"et"}
            value={phone}
            onChange={handlePhoneChange}
            disableDropdown={false}
            inputProps={{
              name: "phone",
              required: true,
              className: "w-full border rounded px-4 py-2",
            }}
          />
          <Input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required={!editingUser}
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="border p-2 rounded-xl"
          >
            <option value="AGENCY_ADMIN">AGENCY_ADMIN</option>
            <option value="PARTNER">PARTNER</option>
            <option value="ACCOUNTANT">ACCOUNTANT</option>
          </select>

          {user.role === "SUPER_ADMIN" ? (
            <select
              name="agency"
              value={form.agency}
              onChange={handleChange}
              className="border p-2 rounded-xl"
            >
              <option value="">Select Agency</option>
              {agencies.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
          ) : (
            <Input
              name="agency"
              value={user.agency.name || user.agency}
              readOnly
            />
          )}

          <Button type="submit" className="col-span-2" disabled={loading}>
            {editingUser ? "Update User" : "Create User"}
          </Button>

          {editingUser && (
            <Button
              type="button"
              className="col-span-2 bg-gray-400 mt-2"
              onClick={() => {
                setEditingUser(null);
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  password: "",
                  role: "PARTNER",
                  agency: "",
                });
              }}
            >
              Cancel Edit
            </Button>
          )}
        </form>
      </Card>

      {/* Success / Error Dialog */}
      <Modal open={showDialog} onClose={() => setShowDialog(false)} title="">
        <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
          {loading && (
            <div>
              <svg className="inline mr-2 h-10 w-10 animate-spin text-indigo-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <div className="mt-2 text-indigo-600 font-semibold">Saving user...</div>
            </div>
          )}
          {!loading && status === "success" && (
            <div className="text-green-600 flex flex-col items-center">
              <svg className="h-10 w-10 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div className="font-semibold">
                {editingUser ? "User updated successfully!" : "User created successfully!"}
              </div>
            </div>
          )}
          {!loading && status === "error" && (
            <div className="text-rose-600 flex flex-col items-center">
              <svg className="h-10 w-10 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div className="font-semibold">Failed to save user.</div>
              <div className="text-xs mt-1">{error}</div>
            </div>
          )}
        </div>
      </Modal>

      {/* User List */}
      <Card className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="[&>th]:p-2 text-left bg-slate-100 dark:bg-slate-700">
              <th>Name</th><th>Phone</th><th>Email</th><th>Role</th><th>Agency</th><th>Edit</th><th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="odd:bg-white even:bg-slate-50 border-t dark:odd:bg-slate-800 dark:even:bg-slate-700">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.phone}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.agency?.name || u.agency}</td>
                <td className="p-2"><Button onClick={() => handleEdit(u)}>Edit</Button></td>
                <td className="p-2"><Button variant="danger" onClick={() => openDeleteDialog(u._id)}>Delete</Button></td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="p-2" colSpan={7}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteDialogOpen} title="Delete User" onClose={() => setDeleteDialogOpen(false)} size="sm">
        <div className="mb-4">Are you sure you want to delete this user? This action cannot be undone.</div>
        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={deleteChecked} onChange={(e) => setDeleteChecked(e.target.checked)} />
          <span>I understand this action cannot be undone.</span>
        </label>
        <div className="flex justify-end gap-2">
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="danger" disabled={!deleteChecked} onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
