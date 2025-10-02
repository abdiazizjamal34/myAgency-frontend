import React, { useState } from "react";

export default function DateRangePicker({ onChange }) {
  const [type, setType] = useState("daily");
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const month = today.slice(0, 7); // YYYY-MM

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleTypeChange = (e) => {
    const val = e.target.value;
    setType(val);

    if (val === "daily") {
      onChange({ day: today }); // 👉 backend expects ?day=YYYY-MM-DD
    } else if (val === "monthly") {
      onChange({ month }); // 👉 backend expects ?month=YYYY-MM
    }
  };

  const handleCustom = () => {
    if (from && to) {
      onChange({ from, to }); // 👉 backend expects ?from=...&to=...
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={type}
        onChange={handleTypeChange}
        className="border p-2 rounded"
      >
        <option value="daily">Daily</option>
        <option value="monthly">Monthly</option>
        <option value="custom">Custom Range</option>
      </select>

      {type === "custom" && (
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            type="button"
            onClick={handleCustom}
            className="px-3 py-2 bg-indigo-600 text-white rounded"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
