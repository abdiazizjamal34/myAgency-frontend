import React, { useEffect, useState } from "react";
import { ReportsAPI } from "../services/api";
import { currency } from "../utils/currency";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import DateRangePicker from "../components/ui/DateRangePicker";
import { Download, Printer } from "lucide-react";

export default function PaymentSummary() {
  const [summary, setSummary] = useState([]);
  const [range, setRange] = useState({});
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch payment summary from backend
  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await ReportsAPI.paymentSummary(range);
      setSummary(res || []);
    } catch (err) {
      console.error("Failed to fetch payment summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [range]);

  const totalAll = summary.reduce((acc, s) => acc + (s.totalPaid || 0), 0);

  const exportToCSV = () => {
    const headers = ["Payment Method", "Total Paid", "Transactions"];
    const csv = [headers, ...summary.map((s) => [s.paymentMethod, s.totalPaid, s.count])]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payment_summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-xl font-semibold">💰 Payment Summary</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </Button>
          <Button variant="secondary" onClick={exportToCSV}>
            <Download size={16} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Picker */}
      <Card className="p-4">
        <DateRangePicker onChange={setRange} />
      </Card>

      {/* Summary Table */}
      <Card className="p-4">
        {loading ? (
          <div>Loading payment summary...</div>
        ) : summary.length === 0 ? (
          <div>No data available.</div>
        ) : (
          <table className="w-full text-sm border-collapse border dark:text-slate-200">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="text-left p-2 border">Payment Method</th>
                <th className="text-right p-2 border">Total Paid</th>
                <th className="text-right p-2 border">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.paymentMethod} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-800 dark:even:bg-slate-700">
                  <td className="p-2 border">{s.paymentMethod || "—"}</td>
                  <td className="p-2 text-right border">{currency(s.totalPaid)}</td>
                  <td className="p-2 text-right border">{s.count}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-slate-100 dark:bg-slate-700">
                <td className="p-2 border text-right">Grand Total:</td>
                <td className="p-2 text-right border">{currency(totalAll)}</td>
                <td className="p-2 text-right border">
                  {summary.reduce((a, b) => a + b.count, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
