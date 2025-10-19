import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { ShieldCheck, Info, CheckCircle } from "lucide-react";

export default function WelcomeModal({ user }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // if (!user) return; // wait until user is loaded
    // const seen = sessionStorage.getItem("welcomeShown");

    // console.log("👀 WelcomeModal check:", { user, seen }); // <-- add this log

    if (!seen) {
      setOpen(true);
      sessionStorage.setItem("welcomeShown", "true");
    }
  }, [user]);

  if (!user) return null ; // safety: don't render before login

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title={`Welcome, ${user.name?.split(" ")[0] || "User"} 👋`}
      size="md"
    >
      <div className="space-y-4 text-sm leading-relaxed">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
          <CheckCircle size={18} /> You’ve successfully logged in!
        </div>

        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
          <Info size={18} /> Important Usage & Safety Tips
        </div>
        <ul className="list-disc ml-6 space-y-1 text-slate-700 dark:text-slate-300">
          <li>Keep your login credentials private — never share your password.</li>
          <li>Always log out when you finish using the system.</li>
          <li>Double-check all financial data before submission.</li>
          <li>Use a secure network when accessing agency data.</li>
          <li>If you notice unusual activity, report it immediately.</li>
        </ul>

        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium pt-2">
          <ShieldCheck size={18} /> Remember: data security is everyone’s responsibility.
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => setOpen(false)}>Got it, continue</Button>
      </div>
    </Modal>
  );
}
