import React, { useMemo, useState, useEffect } from "react";
import { DollarSign, Briefcase, User, Coins, ReceiptText, CheckCircle2, XCircle, } from "lucide-react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import { RecordsAPI } from "../services/api";
import { useToast } from "./ui/Toast";
import { currency } from "../utils/currency";
import { useAuth } from "../hooks/useAuth";

export default function RecordForm({ editing, afterSave }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    customerName: "", serviceType: "", sellPrice: "", buyPrice: "", expenses: "", ticketNumber: "", subService: "", fromTo: "" , notes: "" , paymentMethod: "", 
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(""); // "success" | "error" | ""
  const [message, setMessage] = useState("");
  const toast = useToast();

  useEffect(() => {
    if (editing) {
      setForm({
        customerName: editing.customerName || "",
        serviceType: editing.serviceType || "",
        sellPrice: editing.sellPrice ?? "",
        buyPrice: editing.buyPrice ?? "",
        expenses: editing.expenses ?? "",
        ticketNumber: editing.ticketNumber ?? "",
        paymentMethod: editing.paymentMethod ?? "",
        subService: editing.subService ?? "",
        fromTo: editing.fromTo ?? "",
      });
    } else {
      setForm({ customerName: "", serviceType: "", sellPrice: "", buyPrice: "", expenses: "", ticketNumber: "", subService: "", fromTo: "" , notes: "" , paymentMethod: "",  });
    }
    setStatus("");
    setMessage("");
  }, [editing]);

  const commission = useMemo(
    () => (Number(form.sellPrice || 0) - Number(form.buyPrice || 0)),
    [form.sellPrice, form.buyPrice]
  );

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    setMessage("");
    const payload = {
      customerName: form.customerName?.trim(),
      typeOfService: form.serviceType?.trim(),
      sellingPrice: Number(form.sellPrice || 0),
      buyingPrice: Number(form.buyPrice || 0),
      notes: form.notes?.trim(),
      paymentMethod: form.paymentMethod?.trim(),
      fromTo: form.fromTo?.trim(),
      expenses: Number(form.expenses || 0),
      agency: user.agency,
      ...(form.serviceType === "Ticket" && { ticketNumber: form.ticketNumber?.trim() }),
      ...(form.serviceType === "Consulting" && { subService: form.subService?.trim() }),

    };

    try {
      if (editing?._id) {
        await RecordsAPI.update(editing._id, payload);
        setStatus("success");
        setMessage("Record updated successfully!");
        toast.push("Record updated");
        afterSave?.({ success: true });
      } else {
        await RecordsAPI.create(payload);
        setStatus("success");
        setMessage("Record added successfully!");
        toast.push("Record added");
        afterSave?.({ success: true });
      }
    } catch (e) {
      setStatus("error");
      setMessage(e?.response?.data?.message || e.message || "Failed to save");
      toast.push("Failed to save", "error");
      afterSave?.({ error: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Loading spinner */}
        {saving && (
          <div className="md:col-span-3 flex flex-col items-center py-4">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-indigo-600 text-sm font-medium">
              Saving, please wait...
            </span>
          </div>
        )}
        {/* Success message */}
        {status === "success" && (
          <div className="md:col-span-3 flex items-center gap-2 text-green-600 mb-4">
            <CheckCircle2 className="w-6 h-6" />
            <span>{message}</span>
          </div>
        )}
        {/* Error message */}
        {status === "error" && (
          <div className="md:col-span-3 flex items-center gap-2 text-rose-600 mb-4">
            <XCircle className="w-6 h-6" />
            <span>{message}</span>
          </div>
        )}
        {/* Hide form fields while saving or after feedback */}
        {!saving && !status && (
          <>
            <Input icon={User} name="customerName" placeholder="Customer name" value={form.customerName} onChange={handle} required />
            <div className="flex items-center">
              <Briefcase className="mr-2" />
              <select
                name="serviceType"
                value={form.serviceType}
                onChange={handle}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select service type</option>
                <option value="Ticket">Ticket</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>

             {form.serviceType === "Consulting" && (
              <div className="flex items-center">
                <Briefcase className="mr-2 opacity-0" /> {/* keep alignment */}
                <select
                  name="subService"
                  value={form.subService}
                  onChange={handle}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select consulting subtype</option>
                  <option value="Visa">Visa</option>
                  <option value="Appointment">Appointment</option>
                  <option value="Forum">Form</option>
                </select>
              </div>
            )}

            {form.serviceType === "Ticket" && (
              <>
                <Input
                  icon={ReceiptText}
                  name="ticketNumber"
                  placeholder="Ticket number"
                  value={form.ticketNumber}
                  onChange={handle}
                  required
                />
                <Input
                  icon={ReceiptText}
                  name="fromTo"
                  placeholder="From / To"
                  value={form.fromTo}
                  onChange={handle}
                  required
                />
              </>
            )}
            <Input icon={DollarSign} type="number" step="0.01" name="sellPrice" placeholder="Selling price" value={form.sellPrice} onChange={handle} required />
            <Input icon={DollarSign} type="number" step="0.01" name="buyPrice" placeholder="Buying price" value={form.buyPrice} onChange={handle} required />
            <Input icon={ReceiptText} type="number" step="0.01" name="expenses" placeholder="Expenses" value={form.expenses} onChange={handle} />
            {/* <Input icon={DollarSign} type="textArea" name="notes" placeholder="Additional notes" value={form.notes} onChange={handle} className="md:col-span-2" />   */}
            {/* <Input icon={ReceiptText} type="textArea" name="notes" placeholder="Additional notes" value={form.notes} onChange={handle} className="md:col-span-2" /> */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className="sr-only">Additional notes</label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Additional notes"
                value={form.notes || ""}  
                onChange={handle}
                className="w-full border rounded px-3 py-2 min-h-[96px] resize-vertical"
            />
           </div>
            
            <div className="flex items-center">
              <Briefcase className="mr-2" />
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handle}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select payment method</option>
                <option value="Cash"> in Cash</option>
                <option value="Ebirr">Ebirr</option>
                <option value="CBE">CBE</option>

              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-3">
              <div className="text-sm text-slate-700 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                Commission: <b>{currency(commission)}</b>
              </div>
              <div className="ml-auto flex gap-2">
                <Button type="submit" disabled={saving}>
                  {editing?._id ? "Update" : "Add"} Record
                </Button>
              </div>
            </div>
          </>
        )}
      </form>
    </Card>
  );
}