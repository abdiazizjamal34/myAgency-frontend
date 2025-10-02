import React from "react";
export default function Card({ className="", children }) {
  return <div className={`bg-white dark:bg-slate-800 dark:border-slate-700  dark:text-white rounded-2xl shadow-soft border border-slate-200 ${className}`}>{children}</div>
}

