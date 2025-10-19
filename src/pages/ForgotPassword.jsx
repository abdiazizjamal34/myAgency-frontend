import React, { useState } from "react";
import { AuthAPI } from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { useNavigate } from "react-router-dom";


export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [method, setMethod] = useState("email");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthAPI.requestOtp({ identifier, method });
      showToast("OTP sent successfully!", "success");
      navigate("/reset-password", { state: { identifier, method } });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
      <Card className="w-full max-w-md p-8 dark:bg-slate-800 shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">Forgot Password</h2>
        <p className="text-center text-sm text-slate-500 mb-6">
          Choose how you want to receive your OTP.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Email or phone number"
            className="w-full border rounded-md p-2"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="email"
                checked={method === "email"}
                onChange={() => setMethod("email")}
              />
              Email
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="whatsapp"
                checked={method === "whatsapp"}
                onChange={() => setMethod("whatsapp")}
              />
              WhatsApp
            </label>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
