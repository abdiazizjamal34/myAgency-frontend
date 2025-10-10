import React, { useEffect, useState } from "react";
import { UsersAPI, AgenciesAPI } from "../services/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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
  const [error, setError] = useState("");

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
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  let payload = { ...form };
  // For non-SUPER_ADMIN, set agency to the ID
  if (user.role !== "SUPER_ADMIN") {
    payload.agency = user.agency._id || user.agency;
  }
  try {
    await UsersAPI.create(payload);
    setForm({ name: "", email: "", phone: "", password: "", role: "PARTNER", agency: "" });
    fetchUsers();
  } catch (e) {
    setError(e?.response?.data?.message || e.message || "Failed to create user");
  }
};

  const [phone, setPhone] = useState("");
const handlePhoneChange = (value) => {
  setPhone(value);
  setForm({ ...form, phone: value });
};

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Users</h2>
      {error && <div className="mb-2 text-rose-600">{error}</div>}

      {/* Create user form */}
      <Card className="p-4 mb-6">
        <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-2">
          <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <Input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
         <PhoneInput
  country={'et'} // default country Ethiopia
  value={phone}
  onChange={handlePhoneChange}
  disableCountryCode={true} // makes country code read-only
  disableDropdown={false}   // allows country selection
  inputProps={{
    name: 'phone',
    required: true,
    className: 'w-full border rounded mx-8 px-4 py-3 '
  }}
/>
          <Input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required />
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
              // value={user.agency?._id || user.agency}
              value= {user.agency.name || user.agency}
              readOnly
            />
          )}

          <Button type="submit" className="col-span-2">Create User</Button>
        </form>
      </Card>

      {/* Users list */}
      <Card className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="[&>th]:p-2 text-left bg-slate-100 dark:bg-slate-700">
              <th>Name</th> <th>Phone</th> <th>Email</th><th>Role</th><th>Agency</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="odd:bg-white even:bg-slate-50 border-t dark:odd:bg-slate-800 dark:even:bg-slate-700">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.phone}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2"> {user.agency && <span><b>{user.agency.name || user.agency}</b></span>}</td>
                
              </tr>
            ))}
            {users.length === 0 && <tr><td className="p-2" colSpan={4}>No users found.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
