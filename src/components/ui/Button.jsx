import React from "react";
export default function Button({ className="", variant="primary", as:Tag="button", ...props }) {
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    ghost: "text-slate-700 hover:bg-slate-100",
  }[variant];
  return <Tag className={`px-4 py-2 rounded-xl transition ${styles} ${className}`} {...props} />;
}
