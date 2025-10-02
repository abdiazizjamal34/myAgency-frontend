import React, { useMemo, useState, useEffect } from "react";
import { DollarSign, Briefcase, User, Coins, ReceiptText } from "lucide-react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import { RecordsAPI } from "../services/api";
import { useToast } from "./ui/Toast";
import { currency } from "../utils/currency";
import { useAuth } from "../hooks/useAuth"

// export default function RecordForm({ editing, afterSave }) {
//   const { user } = useAuth();
//   const [form, setForm] = useState({
//     customerName: "", serviceType: "", sellPrice: "", buyPrice: "", expenses: ""
//   });
export default function RecordForm({ editing, afterSave }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    customerName: "", serviceType: "", sellPrice: "", buyPrice: "", expenses: "", ticketNumber: ""
  });


  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  // useEffect(() => {
  //   if (editing) {
  //     setForm({
  //       customerName: editing.customerName || "",
  //       serviceType: editing.serviceType || "",
  //       sellPrice: editing.sellPrice ?? "",
  //       buyPrice: editing.buyPrice ?? "",
  //       expenses: editing.expenses ?? "",
  //     });
  //   } else {
  // setForm({ customerName: "", serviceType: "", sellPrice: "", buyPrice: "", expenses: "" });
  //   }
  // }, [editing]);

   useEffect(() => {
    if (editing) {
      setForm({
        customerName: editing.customerName || "",
        serviceType: editing.serviceType || "",
        sellPrice: editing.sellPrice ?? "",
        buyPrice: editing.buyPrice ?? "",
        expenses: editing.expenses ?? "",
        ticketNumber: editing.ticketNumber ?? "",
      });
    } else {
      setForm({ customerName: "", serviceType: "", sellPrice: "", buyPrice: "", expenses: "", ticketNumber: "" });
    }
  }, [editing]);

  const commission = useMemo(
    () => (Number(form.sellPrice || 0) - Number(form.buyPrice || 0)),
    [form.sellPrice, form.buyPrice]
  );

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // const submit = async (e) => {
  //   e.preventDefault();
  //   setSaving(true); setError("");
  //   const payload = {
  //     customerName: form.customerName?.trim(),
  //     typeOfService: form.serviceType?.trim(),
  //     sellingPrice: Number(form.sellPrice || 0),
  //     buyingPrice: Number(form.buyPrice || 0),
  //     expenses: Number(form.expenses || 0),
  //     agency: user.agency 
  //   };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    const payload = {
      customerName: form.customerName?.trim(),
      typeOfService: form.serviceType?.trim(),
      sellingPrice: Number(form.sellPrice || 0),
      buyingPrice: Number(form.buyPrice || 0),
      expenses: Number(form.expenses || 0),
      agency: user.agency,
      ...(form.serviceType === "Ticket" && { ticketNumber: form.ticketNumber?.trim() })
    };

    
    try {
      if (editing?._id) await RecordsAPI.update(editing._id, payload);
      else await RecordsAPI.create(payload);
      toast.push(editing?._id ? "Record updated" : "Record added");
      afterSave?.();
    } catch (e) {
      console.error("API error:", e);
      setError(e?.response?.data?.message || e.message || "Failed to save");
      toast.push("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

//   return (
//     <Card className="p-5">
//       <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {error && (
//           <div className="md:col-span-3 p-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
//             {error}
//           </div>
//         )}
//   <Input icon={User} name="customerName" placeholder="Customer name" value={form.customerName} onChange={handle} required />
//   <Input icon={Briefcase} name="serviceType" placeholder="Type of service" value={form.serviceType} onChange={handle} required />
//   <Input icon={DollarSign} type="number" step="0.01" name="sellPrice" placeholder="Selling price" value={form.sellPrice} onChange={handle} required />
//   <Input icon={DollarSign} type="number" step="0.01" name="buyPrice" placeholder="Buying price" value={form.buyPrice} onChange={handle} required />
//   <Input icon={ReceiptText} type="number" step="0.01" name="expenses" placeholder="Expenses" value={form.expenses} onChange={handle} />
//         <div className="md:col-span-3 flex items-center gap-3">
//           <div className="text-sm text-slate-700 flex items-center gap-2">
//             <Coins className="w-4 h-4 text-amber-500" />
//             Commission: <b>{currency(commission)}</b>
//           </div>
//           <div className="ml-auto flex gap-2">
//             <Button type="submit" disabled={saving}>
//               {editing?._id ? "Update" : "Add"} Record
//             </Button>
//           </div>
//         </div>
//       </form>
//     </Card>
//   );
// }

return (
    <Card className="p-5">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {error && (
          <div className="md:col-span-3 p-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}
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
            <option value="Visa">Visa</option>
            {/* Add more options as needed */}
          </select>
        </div>
        {form.serviceType === "Ticket" && (
          <Input
            icon={ReceiptText}
            name="ticketNumber"
            placeholder="Ticket number"
            value={form.ticketNumber}
            onChange={handle}
            required
          />
        )}
        <Input icon={DollarSign} type="number" step="0.01" name="sellPrice" placeholder="Selling price" value={form.sellPrice} onChange={handle} required />
        <Input icon={DollarSign} type="number" step="0.01" name="buyPrice" placeholder="Buying price" value={form.buyPrice} onChange={handle} required />
        <Input icon={ReceiptText} type="number" step="0.01" name="expenses" placeholder="Expenses" value={form.expenses} onChange={handle} />
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
      </form>
    </Card>
  );
}