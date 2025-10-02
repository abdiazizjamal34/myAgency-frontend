import React from "react";
export default function Input({ icon:Icon, className="", ...props }) {
  return (
    <div className={`relative ${className}`}>
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
      <input {...props} className={`w-full border border-slate-300 rounded-xl py-2 ${Icon ? "pl-9" : "pl-3"} pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-200`} />
    </div>
  );
}
