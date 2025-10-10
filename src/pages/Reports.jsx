// src/pages/Reports.jsx
import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import KpiCard from "../components/dashboard/KpiCard";
import MiniBar from "../components/dashboard/MiniBar";
import { currency } from "../utils/currency";
import { ReportsAPI } from "../services/api";
import DateRangePicker from "../components/ui/DateRangePicker";
import { Download, FileText } from "lucide-react";
import { exportToPDF } from "../utils/pdfExport";


export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [byService, setByService] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Date filter state
  const [range, setRange] = useState({
    day: new Date().toISOString().slice(0, 10),
  });

  // 🔹 Fetch reports whenever range changes
  const fetchReports = async (params = range) => {
    setLoading(true);
    try {
      const [s, bs] = await Promise.all([
        ReportsAPI.summary(params),
        ReportsAPI.byService(params),
      ]);
      setSummary(s);
      setByService(bs);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(range);
  }, [range]);

  if (loading) return <div>Loading reports...</div>;
  if (!summary) return <div>No report data available.</div>;

  return (
    <div className="space-y-6">
      {/* 🔹 Date Filter */}
      <div className="mb-4">
        <DateRangePicker onChange={setRange} />
      </div>

      {/* 🔹 PDF Export Button */}
      <div className="flex justify-between items-center mb-4">
  <h2 className="text-lg font-semibold">Commission by Service</h2>
  <div className="flex gap-2">
    <Button onClick={() => exportToCSV(byService)} className="flex items-center gap-2">
      <Download className="w-4 h-4" /> CSV
    </Button>
    <Button
      onClick={() =>
        exportToPDF(
          "Report by Service",
          ["Service", "Total Selling", "Total Buying", "Commission", "Profit"],
          byService.map((s) => [
            s._id || s.typeOfService,
            s.totalSelling || 0,
            s.totalBuying || 0,
            s.totalCommission || 0,
            s.totalProfit || 0,
          ])
        )
      }
      className="flex items-center gap-2"
    >
      <FileText className="w-4 h-4" /> PDF
    </Button>
  </div>
</div>

      {/* 🔹 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Total Income" value={currency(summary.totalIncome)} />
        <KpiCard label="Total Expenses" value={currency(summary.totalExpenses)} />
        <KpiCard label="Total Profit" value={currency(summary.totalProfit)} />
      </div>

      {/* 🔹 Breakdown by Service */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Profit by Service</h2>
          <Button
            onClick={() => exportToCSV(byService)}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        <MiniBar
          title="Services Breakdown"
          data={byService.map((s) => ({
            label: s._id || s.typeOfService || s.serviceType,
            value: s.totalProfit ?? s.commission ?? 0,
          }))}
        />
      </Card>
    </div>
  );
}

// 🔹 CSV Export Helper
function exportToCSV(rows) {
  if (!rows || rows.length === 0) return;

  const headers = [
    "Service",
    "Total Selling",
    "Total Buying",
    "Total Expenses",
    "Commission",
    "Profit",
    "total Records",
  ];

  const csv = [
    headers,
    ...rows.map((r) => [
      r._id || r.typeOfService || r.serviceType,
      r.totalSelling,
      r.totalBuying,
      r.totalExpenses,
      r.totalCommission ?? r.commission,
      r.totalProfit ?? 0,
      r.count,
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "report_by_service.csv";
  a.click();
  URL.revokeObjectURL(url);
}
