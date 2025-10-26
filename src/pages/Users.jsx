import React, { useEffect, useState } from "react";
import { UsersAPI, AgenciesAPI } from "../services/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "PARTNER",
    agency: "",
  });
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteChecked, setDeleteChecked] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await UsersAPI.list();
      setUsers(data);
    } catch (e) {
      setError(e.message || "Failed to load users");
    }
  };

  console.log(users);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  } 

  // Edit user: populate form with user data
  const handleEdit = (user) => {
    setEditingUser(user._id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "", // don't show password
      role: user.role || "PARTNER",
      agency: user.agency?._id || user.agency || "",
    });
  };

  // Show delete dialog
  const openDeleteDialog = (id) => {
    setDeleteUserId(id);
    setDeleteChecked(false);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteChecked) return;
    try {
      await UsersAPI.remove(deleteUserId);
      fetchUsers();
      setDeleteDialogOpen(false);
      setDeleteUserId(null);
    } catch (e) {
      setError(e.message || "Failed to delete user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await UsersAPI.update(editingUser, form);
      } else {
        await UsersAPI.create(form);
      }
      setForm({ name: "", email: "", password: "", role: "PARTNER", agency: "" });
      setEditingUser(null);
      fetchUsers();
    } catch (e) {
      setError(e.message || (editingUser ? "Failed to update user" : "Failed to create user"));
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Users</h2>
      {error && <div className="mb-2 text-rose-600">{error}</div>}

      {/* Create/Edit user form */}
      <Card className="p-4 mb-6">
        <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-2">
          <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <Input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
          <Input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required={!editingUser} />
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

          {/* Agency field: SUPER_ADMIN picks, others auto-filled */}
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

          <Button type="submit" className="col-span-2">{editingUser ? "Update User" : "Create User"}</Button>
          {editingUser && (
            <Button type="button" className="col-span-2 bg-gray-400 mt-2" onClick={() => { setEditingUser(null); setForm({ name: "", email: "", password: "", role: "PARTNER", agency: "" }); }}>Cancel Edit</Button>
          )}
        </form>
      </Card>

      {/* Users list */}
      <Card className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="[&>th]:p-2 text-left bg-slate-100 dark:bg-slate-700">
              <th>Name</th><th>Email</th><th>Role</th><th>Agency</th><th>Edit</th><th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="odd:bg-white even:bg-slate-50 border-t dark:odd:bg-slate-800 dark:even:bg-slate-700">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2"> {u.agency?.name || u.agency}</td>
                <td className="p-2">
                  <Button onClick={() => handleEdit(u)}>Edit</Button>
                </td>
                <td className="p-2">
                  <Button variant="danger" onClick={() => openDeleteDialog(u._id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td className="p-2" colSpan={6}>No users found.</td></tr>}
          </tbody>
        </table>
      </Card>
      {/* Delete Confirmation Modal */}
      <Modal open={deleteDialogOpen} title="Delete User" onClose={() => setDeleteDialogOpen(false)} size="sm">
        <div className="mb-4">Are you sure you want to delete this user? This action cannot be undone.</div>
        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={deleteChecked} onChange={e => setDeleteChecked(e.target.checked)} />
          <span>I understand this action cannot be undone.</span>
        </label>
        <div className="flex justify-end gap-2">
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="danger" disabled={!deleteChecked} onClick={handleConfirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
