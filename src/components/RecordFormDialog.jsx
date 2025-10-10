import React, { useEffect, useState } from "react";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import RecordForm from "./RecordForm";
import { Plus, CheckCircle2, XCircle } from "lucide-react";

export default function RecordFormDialog({
  triggerLabel = "Add Record",
  editing = null,
  onSaved,
  onOpenChange,
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(editing);
  const [status, setStatus] = useState(""); // "success" | "error" | ""
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCurrent(editing || null);
    if (editing) setOpen(true);
  }, [editing]);

  const close = () => {
    setOpen(false);
    setStatus("");
    setMessage("");
    onOpenChange?.(false);
  };

  const afterSave = (result) => {
    if (result?.success) {
      setStatus("success");
      setMessage("Record added successfully!");
      onSaved?.();
      setTimeout(close, 1500); // Auto-close after feedback
    } else if (result?.error) {
      setStatus("error");
      setMessage(result.error);
    }
  };

  return (
    <>
      <Button onClick={() => { setCurrent(null); setOpen(true); onOpenChange?.(true); }} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        {triggerLabel}
      </Button>

      <Modal open={open} onClose={close} title={current ? "Edit Record" : "Add Record"} size="xl">
        {status === "success" && (
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <CheckCircle2 className="w-6 h-6" />
            <span>{message}</span>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 text-rose-600 mb-4">
            <XCircle className="w-6 h-6" />
            <span>{message}</span>
          </div>
        )}
        {/* Pass afterSave to RecordForm */}
        <RecordForm editing={current} afterSave={afterSave} />
      </Modal>
    </>
  );
}