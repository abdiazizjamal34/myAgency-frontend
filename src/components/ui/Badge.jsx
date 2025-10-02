import React from "react";
export default function Badge({ children, tone="muted" }) {
  const cls = {
    positive: "bg-emerald-100 text-emerald-700",
    negative: "bg-rose-100 text-rose-700",
    muted: "bg-slate-100 text-slate-700"
  }[tone];
  return <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${cls}`}>{children}</span>;
}
