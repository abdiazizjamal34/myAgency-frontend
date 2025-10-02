import React from "react";

const currency = (n) => new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n||0));

export default function TotalsCards({ totals }) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl p-4 shadow border">
        <div className="text-slate-500 text-sm">Total Expenses</div>
        <div className="text-2xl font-semibold">{currency(totals.totalExpenses)}</div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow border">
        <div className="text-slate-500 text-sm">Total Income (Σ commissions)</div>
        <div className="text-2xl font-semibold">{currency(totals.totalIncome)}</div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow border">
        <div className="text-slate-500 text-sm">Total Profit (Income - Expenses)</div>
        <div className="text-2xl font-semibold">{currency(totals.totalProfit)}</div>
      </div>
    </div>
  );
}