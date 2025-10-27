


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


  