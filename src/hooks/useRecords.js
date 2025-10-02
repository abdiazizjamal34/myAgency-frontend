import { useCallback, useEffect, useMemo, useState } from "react";
import { RecordsAPI } from "../services/api";

export function useRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await RecordsAPI.list();
      setRecords(data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  }, []);

  const totals = useMemo(() => {
    let totalExpenses = 0;
    let totalIncome = 0;
    for (const r of records) {
      const s = parseFloat(r.sellPrice || 0);
      const b = parseFloat(r.buyPrice || 0);
      const e = parseFloat(r.expenses || 0);
      totalExpenses += e;
      totalIncome += (s - b);
    }
    return { totalExpenses, totalIncome, totalProfit: totalIncome - totalExpenses };
  }, [records]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  return { records, setRecords, totals, loading, error, setError, refresh: fetchRecords };
}