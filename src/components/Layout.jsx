import React from "react";

export default function Layout({ children }) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Finance Management</h1>
      <p className="text-slate-600 mb-6">Modular components for easy maintenance.</p>
      {children}
    </div>
  );
}