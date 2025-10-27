import React, { useEffect, useState } from "react";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import RecordForm from "./RecordForm";
import { Plus, CheckCircle2, XCircle, Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false); // NEW 🌀

  useEffect(() => {
    setCurrent(editing || null);
    if (editing) setOpen(true);
  }, [editing]);

  const close = () => {
    setOpen(false);
    setStatus("");
    setMessage("");
    setLoading(false);
    onOpenChange?.(false);
  };

  // Updated afterSave — adds loading state and timed closing
  const afterSave = async (result) => {
    setLoading(true);
    try {
      if (result?.success) {
        setStatus("success");
        setMessage("Record saved successfully!");
        onSaved?.();
        setTimeout(() => {
          setLoading(false);
          close();
        }, 1500);
      } else if (result?.error) {
        setStatus("error");
        setMessage(result.error);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setCurrent(null);
          setOpen(true);
          onOpenChange?.(true);
        }}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        {triggerLabel}
      </Button>
        
  

      <Modal
        open={open}
        onClose={close}
        title={current ? "Edit Record" : "Add Record"}
        size="xl"
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-50">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <span className="mt-3 text-indigo-600 dark:text-indigo-300 font-medium">
              Saving record...
            </span>
          </div>
        )}

        {/* Feedback messages */}
        {!loading && status === "success" && (
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <CheckCircle2 className="w-6 h-6" />
            <span>{message}</span>
          </div>
        )}
        {!loading && status === "error" && (
          <div className="flex items-center gap-2 text-rose-600 mb-4">
            <XCircle className="w-6 h-6" />
            <span>{message}</span>
          </div>
        )}

        {/* The actual form */}
        <RecordForm editing={current} afterSave={afterSave} />
      </Modal>
    </>
  );
}
