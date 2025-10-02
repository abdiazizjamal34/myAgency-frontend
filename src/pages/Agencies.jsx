import React, { useEffect, useState } from "react";
import { AgenciesAPI } from "../services/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Agencies() {
  const [agencies, setAgencies] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", address: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const data = await AgenciesAPI.list();
      setAgencies(data);
    } catch (e) {
      setError(e.message || "Failed to load agencies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgencies(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await AgenciesAPI.create(form);
      setForm({ name: "", code: "", address: "", phone: "" });
      fetchAgencies();
    } catch (e) {
      setError(e.message || "Failed to create agency");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Agencies</h2>
      {error && <div className="mb-2 text-rose-600">{error}</div>}

      {/* Create agency form */}
      <Card className="p-4 mb-6">
        <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-2">
          <Input name="name" placeholder="Agency Name" value={form.name} onChange={handleChange} required />
          <Input name="code" placeholder="Code" value={form.code} onChange={handleChange} required />
          <Input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
          <Input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <Button type="submit" className="col-span-2">Create Agency</Button>
        </form>
      </Card>

      {/* List of agencies */}
      <Card className="p-4">
        {loading ? (
          <p>Loading agencies…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="[&>th]:p-2 text-left bg-slate-100">
                <th>Name</th>
                <th>Code</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((a) => (
                <tr key={a._id} className="odd:bg-white even:bg-slate-50 border-t">
                  <td className="p-2">{a.name}</td>
                  <td className="p-2">{a.code}</td>
                  <td className="p-2">{a.phone}</td>
                  <td className="p-2">
                    <Button
                      variant="outline"
                      onClick={() => AgenciesAPI.assignAdmin(a._id, { userId: prompt("Enter user ID to assign as admin:") })}
                    >
                      Assign Admin
                    </Button>
                  </td>
                </tr>
              ))}
              {agencies.length === 0 && <tr><td className="p-2" colSpan={4}>No agencies found.</td></tr>}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
