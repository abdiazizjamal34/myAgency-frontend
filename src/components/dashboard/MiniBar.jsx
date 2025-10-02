import React from "react";
import Card from "../ui/Card";

/**
 * Simple CSS bar chart.
 * Props:
 *  - title: string
 *  - data: Array<{ label: string, value: number }>
 */
export default function MiniBar({ title, data = [] }) {
  const max = Math.max(1, ...data.map(d => Number(d.value) || 0));

  return (
    <Card className="p-4">
      <div className="text-sm font-semibold mb-3">{title}</div>
      <div className="space-y-2">
        {data.map((d, i) => {
          const val = Number(d.value) || 0;
          const pct = (val / max) * 100;
          return (
            <div key={i}>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span className="truncate pr-2">{d.label}</span>
                <span>{val}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        {data.length === 0 && <div className="text-xs text-slate-500">No data</div>}
      </div>
    </Card>
  );
}
