import React from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { exportRecordsToCSV } from "../utils/csv";
import { Download } from "lucide-react";

export default function Toolbar({ records }) {
  return (
    <Card className="p-4 mt-6 flex items-center justify-between">
      <div className="text-slate-700 text-sm">Manage your data: export or filter below.</div>
      <Button onClick={() => exportRecordsToCSV(records)} className="flex items-center gap-2">
        <Download className="w-4 h-4" /> Export CSV
      </Button>
    </Card>
  );
}
