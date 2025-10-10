// import React, { useEffect, useState } from "react";
// import { RecordsAPI } from "../services/api";
// import DateRangePicker from "../components/ui/DateRangePicker";
// import RecordsTable from "../components/RecordsTable";
// import RecordForm from "../components/RecordForm";

// function recordsToCSV(records) {
//   if (!records.length) return '';
//   const fields = [
//     'customerName',
//     'serviceType', // or 'typeOfService' if that's the field name in your data
//     'sellingPrice',
//     'buyingPrice',
//     'expenses',
//     'commission'
//   ];
//   const header = ['Customer Name', 'Service', 'Selling Price', 'Buying Price', 'Expenses', 'Commission'].join(',');
//   const rows = records.map(r => {
//     const comm = Number(r.sellingPrice || 0) - Number(r.buyingPrice || 0);
//     return [
//       r.customerName ?? '',
//       r.serviceType ?? r.typeOfService ?? '',
//       r.sellingPrice ?? '',
//       r.buyingPrice ?? '',
//       r.expenses ?? '',
//       comm
//     ].map(val => JSON.stringify(val)).join(',');
//   });
//   return [header, ...rows].join('\r\n');
// }

// export default function Records() {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [editing, setEditing] = useState(null);   // ✅ add this

//   const fetchRecords = async (params = {}) => {
//     setLoading(true);
//     try {
//       const data = await RecordsAPI.list(params);
//       setRecords(data);
//     } catch (err) {
//       console.error("Failed to fetch records", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRecords({ day: new Date().toISOString().slice(0, 10) }); // default = today
//   }, []);

//   const handleSave = () => {
//     setEditing(null);
//     fetchRecords({ day: new Date().toISOString().slice(0, 10) });
//   };

//   const handleDelete = async (id) => {
//     try {
//       await RecordsAPI.remove(id);
//       fetchRecords({ day: new Date().toISOString().slice(0, 10) });
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   const handleExportCSV = () => {
//     const csv = recordsToCSV(records);
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'records.csv';
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="space-y-4">
//       {/* Filter by day/month */}
//       <DateRangePicker onChange={fetchRecords} />

     

//       {/* Form to add/edit record */}
//       <RecordForm editing={editing} afterSave={handleSave} />

      
//        {/* Export to CSV button */}
//        <div className="flex justify-end">
//       <button
//         className="  px-2 py-2 bg-green-600 text-white rounded mb-2"
//         onClick={handleExportCSV}
//         disabled={!records.length}
//       >
//         Export Records to CSV
//       </button>
//       </div>
//       {/* Table of records */}
//       <RecordsTable
//         records={records}
//         loading={loading}
//         onEdit={setEditing}
//         onDelete={handleDelete}
//       />
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { RecordsAPI } from "../services/api";
import DateRangePicker from "../components/ui/DateRangePicker";
import RecordsTable from "../components/RecordsTable";
import RecordFormDialog from "../components/RecordFormDialog";
 import { exportToPDF } from "../utils/pdfExport";
import { FileText } from "lucide-react";
import Button from "../components/ui/Button";

export default function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState({ day: new Date().toISOString().slice(0, 10) });

  const fetchRecords = async (params = {}) => {
    setLoading(true);
    try {
      const data = await RecordsAPI.list(params);
      setRecords(data);
      setFilter(params);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(filter); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DateRangePicker onChange={fetchRecords} />
        <RecordFormDialog
          triggerLabel="Add Record"
          editing={editing}                          // when you click edit in table, this opens the dialog
          onSaved={() => fetchRecords(filter)}       // refresh after save
          onOpenChange={(open) => { if (!open) setEditing(null); }} // clear editing on close
        />
      </div>
     


<Button
  onClick={() =>
    exportToPDF(
      "Records Report",
      ["Customer", "Service", "Selling", "Buying", "Commission", "Date"],
      records.map((r) => [
        r.customerName,
        r.typeOfService,
        r.sellingPrice,
        r.buyingPrice,
        r.commission,
        new Date(r.createdAt).toLocaleDateString(),
      ])
    )
  }
  className="flex items-center gap-2"
>
  <FileText className="w-4 h-4" /> PDF
</Button>


      <RecordsTable
        records={records}
        loading={loading}
        onEdit={setEditing}                          // clicking Edit sets 'editing' → dialog opens
        onDelete={async (id) => {
          await RecordsAPI.remove(id);
          fetchRecords(filter);
        }}
      />
    </div>
  );
}


  