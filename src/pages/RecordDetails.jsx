import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecordsAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import { currency } from "../utils/currency";

export default function RecordDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await RecordsAPI.get(id);
        setRecord(data);
      } catch (err) {
        console.error("Failed to fetch record:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-4">Loading record details...</div>;
  if (!record) return <div className="p-4">Record not found.</div>;

  const profit =
    Number(record.sellingPrice || 0) -
    Number(record.buyingPrice || 0) -
    Number(record.expenses || 0);

  const agencyName = user?.agency?.name || "My Agency";
  const agencyLogo = user?.agency?.logo || "/logo.png";
  const agencyRole = user?.role || "User";

  return (
    <div className="p-4 space-y-6 dark:text-slate-100 print:p-0">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4 print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Back to Records
        </Button>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => window.print()}>
            🖨️ Print Record
          </Button>
          <Button variant="outline" onClick={() => navigate(`/invoice/${id}`)}>
            🧾 Invoice
          </Button>
        </div>
      </div>

      {/* Record Card */}
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow p-8 print:shadow-none print:bg-white print:dark:bg-white"
        style={{ maxWidth: "800px", margin: "auto" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6 print:border-black/20">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-900">
              {agencyName}
            </h1>
            <p className="text-slate-500 text-sm">Financial Transaction Report</p>
          </div>
          <img
            src={agencyLogo}
            alt="Agency Logo"
            className="h-12 w-auto print:filter-none dark:invert"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>

        {/* Record Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Detail label="Customer" value={record.customerName} />
          <Detail label="Service Type" value={record.typeOfService} />
          <Detail label="Sub-Service" value={record.subService} />
          <Detail label="From / To" value={record.fromTo} />
          <Detail label="Ticket Number" value={record.ticketNumber} />
          <Detail label="Payment Method" value={record.paymentMethod} />
          <Detail
            label="Consultants"
            value={
              record.consultants?.length
                ? record.consultants.join(", ")
                : "—"
            }
          />
          <Detail label="Selling Price" value={currency(record.sellingPrice)} />
          <Detail label="Buying Price" value={currency(record.buyingPrice)} />
          <Detail label="Expenses" value={currency(record.expenses)} />
          <Detail label="Commission" value={currency(record.commission)} />
          <Detail label="Profit" value={currency(profit)} />
          <Detail label="Recorded By" value={record.createdBy?.name || record.createdBy} />
          <Detail
            label="Created At"
            value={new Date(record.createdAt).toLocaleString()}
          />
          <Detail label="Last Updated" value={new Date(record.updatedAt).toLocaleString()} />
        </div>

        {/* Notes */}
        {record.notes && (
          <div className="mt-6">
            <h3 className="font-semibold text-slate-700 mb-1">Notes:</h3>
            <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200 dark:bg-slate-700 dark:text-slate-200">
              {record.notes}
            </p>
          </div>
        )}

        {/* Signature Section */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-10 text-center print:mt-20">
          <SignatureBlock
            label={
              agencyRole === "AGENCY_ADMIN"
                ? "Agency Admin Signature"
                : "Accountant Signature"
            }
            name={user?.name || "Authorized User"}
          />
        </div>

        {/* Footer */}
        <div className="mt-10 border-t pt-4 text-center text-xs text-slate-500 print:border-black/20">
          <p>
            Generated by <b>{agencyName}</b> — {new Date().toLocaleDateString()}
          </p>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Reusable UI Blocks */
function Detail({ label, value }) {
  return (
    <div className="flex flex-col border-b border-slate-200 dark:border-slate-700 pb-2 print:border-black/20">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-900">
        {value && value !== "" ? value : "—"}
      </span>
    </div>
  );
}

function SignatureBlock({ label, name }) {
  return (
    <div className="flex flex-col items-center justify-end h-28">
      <div className="border-b border-slate-400 w-48 mb-2"></div>
      <p className="font-medium text-slate-700">{name}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
