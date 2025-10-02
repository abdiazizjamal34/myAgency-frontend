import React from "react";
import Card from "../ui/Card";

/**
 * KPI card used on the Dashboard page.
 * Props:
 *  - icon: React component (optional)
 *  - label: string
 *  - value: string/number (already formatted)
 */
export default function KpiCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-50 border">
            <Icon className="w-5 h-5 text-indigo-600" />
          </div>
        )}
        <div>
          <div className="text-slate-500 text-xs">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </div>
    </Card>
  );
}
