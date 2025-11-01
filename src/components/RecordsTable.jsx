import React, { useMemo, useState } from "react";
import { Edit3, Trash2, Search, Eye } from "lucide-react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Badge from "./ui/Badge";
import Modal from "./ui/Modal";
import { currency } from "../utils/currency";
import { useNavigate } from "react-router-dom";

export default function RecordsTable({ records, onEdit, onDelete, loading }) {
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null); // 👁️ for view modal
  const navigate = useNavigate();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        String(r.customerName || "").toLowerCase().includes(q) ||
        String(r.typeOfService || "").toLowerCase().includes(q)
    );
  }, [records, query]);

  return (
    <Card className="p-5 mt-6 dark:text-slate-100 dark:bg-slate-800">
      {/* 🔍 Search Bar */}
      <div className="flex items-center gap-3 mb-4">
        <Input
          icon={Search}
          placeholder="Search by customer or service..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* 📋 Table */}
      <div className="overflow-x-auto rounded-xl border dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-700 dark:text-white sticky top-0">
            <tr className="[&>th]:p-3 [&>th]:text-left">
              <th>Customer</th>
              <th>Service</th>
              <th>Selling</th>
              <th>Buying</th>
              <th>Expenses</th>
              <th>Commission</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan="7">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-3" colSpan="7">No matching records.</td>
              </tr>
            ) : (
              filtered.map((r) => {
                const comm =
                  Number(r.sellingPrice || 0) -
                  Number(r.buyingPrice || 0) -
                  Number(r.expenses || 0);
                const tone = comm >= 0 ? "positive" : "negative";
                // highlight rows where paymentMethod is Loan
                const rowClass =
                  r.paymentMethod === "Loan"
                    ? "bg-yellow-900 border-t dark:bg-yellow-900"
                    : "odd:bg-white even:bg-gray-50 border-t dark:odd:bg-slate-800 dark:even:bg-slate-700";

                return (
                  <tr key={r._id} className={rowClass}>
                    <td className="p-3">{r.customerName}</td>
                    <td className="p-3">{r.typeOfService}</td>
                    <td className="p-3">{currency(r.sellingPrice)}</td>
                    <td className="p-3">{currency(r.buyingPrice)}</td>
                    <td className="p-3">{currency(r.expenses)}</td>
                    <td className="p-3">
                      <Badge tone={tone}>{currency(comm)}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          className="px-3 py-1"
                          onClick={() => navigate(`/records/${r._id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="px-3 py-1"
                          onClick={() => onEdit(r)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          className="px-3 py-1"
                          onClick={() => setConfirmId(r._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 🗑️ Delete Confirmation Modal */}
      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Confirm deletion">
        <p className="text-slate-700 mb-4 dark:text-slate-300">
          Are you sure you want to delete this record?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDelete(confirmId);
              setConfirmId(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* 👁️ View Details Modal */}
      <Modal
        open={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Record Details"
        size="md"
      >
        {selectedRecord && (
          <div className="space-y-3 text-sm dark:text-slate-200">
            <p><b>Customer:</b> {selectedRecord.customerName}</p>
            <p><b>Service Type:</b> {selectedRecord.typeOfService}</p>
            <p><b>Selling Price:</b> {currency(selectedRecord.sellingPrice)}</p>
            <p><b>Buying Price:</b> {currency(selectedRecord.buyingPrice)}</p>
            <p><b>Expenses:</b> {currency(selectedRecord.expenses)}</p>
            <p><b>Commission:</b> {currency(selectedRecord.commission)}</p>
            <p><b>Created By:</b> {selectedRecord.createdBy?.name || selectedRecord.createdBy}</p>
            <p><b>Date:</b> {new Date(selectedRecord.createdAt).toLocaleString()}</p>

            <div className="pt-2">
              <Button variant="outline" className="w-full" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}
