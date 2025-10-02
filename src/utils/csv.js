export function exportRecordsToCSV(records, fileName = "records.csv") {
  const headers = ["Customer","Service","Selling","Buying","Expenses","Commission"];
  const rows = records.map(r => {
    const commission = Number(r.sellingPrice||0) - Number(r.buyingPrice||0);
    return [r.customerName, r.serviceType, r.sellingPrice, r.buyingPrice, r.expenses, commission];
  });
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v??"").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = fileName; a.click();
  URL.revokeObjectURL(url);
}
