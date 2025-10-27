import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecordsAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import { currency } from "../utils/currency";
import html2pdf from "html2pdf.js";

export default function InvoicePage() {
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

  if (loading) return <div className="p-4">Loading invoice...</div>;
  if (!record) return <div className="p-4">Record not found.</div>;

  const agencyName = user?.agency?.name || "My Agency";
  const agencyLogo = user?.agency?.logo || "/logo.png";
  const agencyRole = user?.role || "User";

  const handleDownloadInvoice = () => {
    const invoiceElement = document.getElementById("invoice-content");
    html2pdf()
      .from(invoiceElement)
      .set({
        margin: 0.5,
        filename: `Invoice-${record.customerName}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  return (
    <div className="p-4 dark:text-slate-100 print:p-0">
      {/* Toolbar (hidden when printing) */}
      <div className="flex justify-between items-center mb-4 print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => window.print()}>
            🖨️ Print Invoice
          </Button>
          <Button variant="secondary" onClick={handleDownloadInvoice}>
            💾 Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div
        id="invoice-content"
        className="bg-white text-black font-sans p-8 max-w-2xl mx-auto rounded-xl shadow print:shadow-none"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{agencyName}</h1>
            <p className="text-sm text-gray-600">
              {user?.agency?.address || "Addis Ababa, Ethiopia"}
            </p>
            <p className="text-sm text-gray-600">
              {user?.agency?.phone || "+251 900 000 000"}
            </p>
          </div>
          <div className="text-right">
            <img
              src={agencyLogo}
              alt="Agency Logo"
              className="h-12 w-auto mb-2"
              onError={(e) => (e.target.style.display = "none")}
            />
            <h2 className="text-lg font-semibold">INVOICE</h2>
            <p>Invoice No: INV-{record._id.slice(-6).toUpperCase()}</p>
            <p>Date: {new Date(record.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-6">
          <h3 className="font-semibold text-sm">BILL TO:</h3>
          <p className="text-sm">{record.customerName}</p>
          {record.customerEmail && <p className="text-sm">{record.customerEmail}</p>}
        </div>

        {/* Table */}
        <table className="w-full text-sm border border-gray-300 border-collapse mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border">Description</th>
              <th className="text-right p-2 border">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">{record.typeOfService}</td>
              <td className="text-right p-2 border">
                {currency(record.sellingPrice)}
              </td>
            </tr>
            {/* <tr>
              <td className="p-2 text-right font-semibold border">Expenses</td>
              <td className="text-right p-2 border">{currency(record.expenses)}</td>
            </tr>
            <tr>
              <td className="p-2 text-right font-semibold border">Commission</td>
              <td className="text-right p-2 border">{currency(record.commission)}</td>
            </tr> */}
            <tr className="font-bold bg-gray-50">
              <td className="p-2 text-right border">Total Due</td>
              <td className="text-right p-2 border">
                {currency(record.sellingPrice)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer with signature */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-8">
            {/* <div>
              <p className="font-semibold text-sm">Payment Information:</p>
              <p className="text-sm">
                Bank: {user?.agency?.bankName || "Your Bank"}
              </p>
              <p className="text-sm">
                Account: {user?.agency?.bankAccount || "0000 0000 0000"}
              </p>
            </div> */}
            <div className="text-center">
              <div className="border-b border-gray-500 w-48 mx-auto mb-1"></div>
              <p className="text-sm font-medium">
                {user?.name || "Authorized Signatory"}
              </p>
              <p className="text-xs text-gray-500">{agencyRole}</p>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Thank you for your business!</p>
            <p>
              Generated by {agencyName} — {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
