import React, { useEffect, useState } from "react";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import RecordForm from "./RecordForm";
import { Plus } from "lucide-react";

/**
 * Usage:
 * <RecordFormDialog
 *   triggerLabel="Add Record"
 *   editing={editing}                  // pass the record to edit (or null)
 *   onSaved={() => refresh()}          // called after successful save
 *   onOpenChange={(open) => {          // optional: keep parent in sync
 *     if (!open) setEditing(null);
 *   }}
 * />
 */
export default function RecordFormDialog({
  triggerLabel = "Add Record",
  editing = null,
  onSaved,
  onOpenChange,
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(editing);

  // If parent sets an editing record, open the dialog automatically
  useEffect(() => {
    setCurrent(editing || null);
    if (editing) setOpen(true);
  }, [editing]);

  const close = () => {
    setOpen(false);
    onOpenChange?.(false);
  };

  const afterSave = () => {
    onSaved?.();
    close();
  };

  return (
    <>
      {/* Trigger button (for creating a new record) */}
      <Button onClick={() => { setCurrent(null); setOpen(true); onOpenChange?.(true); }} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        {triggerLabel}
      </Button>

      {/* Dialog with the form */}
      <Modal open={open} onClose={close} title={current ? "Edit Record" : "Add Record" } size="xl">
        {/* RecordForm is already responsive; in a modal it renders as a single-column layout */}
        <RecordForm editing={current} afterSave={afterSave} />
      </Modal>
    </>
  );
}
