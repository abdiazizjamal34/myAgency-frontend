import React, { useEffect, useState } from "react";
import { AuthAPI } from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const START_SECONDS = 30;
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { state } = useLocation(); // { identifier, method }
  const [userId, setUserId] = useState(null);

  // dialog and result state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [result, setResult] = useState(null); // { ok: boolean, message: string }

  // Countdown state for resend (visible immediately if identifier present)
  const [cooldown, setCooldown] = useState(state?.identifier ? START_SECONDS : 0);
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDialogOpen(true);
    setResult(null);
    try {
      const res = await AuthAPI.verifyOtp({ identifier: state?.identifier, code: otp });
      setUserId(res?.userId || res?.id || null);
      setResult({ ok: true, message: "OTP verified — you may now set a new password." });
    } catch (err) {
      setResult({ ok: false, message: err?.response?.data?.message || "Invalid or expired OTP." });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.push("Please verify OTP first", "error");
      return;
    }
    setLoading(true);
    setDialogOpen(true);
    setResult(null);
    try {
      await AuthAPI.resetPassword({ userId, newPassword: password });
      setResult({
        ok: true,
        message: "Password reset successful. Redirecting to login...",
      });
      // show success then redirect to login
      setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (err) {
      setResult({ ok: false, message: err?.response?.data?.message || "Failed to reset password." });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!state?.identifier) {
      toast.push("Missing identifier to resend OTP", "error");
      return;
    }
    try {
      await AuthAPI.requestOtp({ identifier: state.identifier, method: state.method || "email" });
      toast.push("OTP resent successfully!", "success");
      setCooldown(START_SECONDS);
    } catch (err) {
      toast.push(err?.response?.data?.message || "Failed to resend OTP", "error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md p-8 dark:bg-slate-800 shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">Reset Password</h2>

        {!userId ? (
          <>
            <p className="text-center text-sm text-slate-500 mb-4">
              Enter the OTP sent to your email/phone to verify identity.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                placeholder="Enter OTP"
                className="w-full border rounded-md p-2"
                required
              />

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={cooldown > 0}
                  onClick={handleResend}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-center text-sm text-slate-500">
              Enter a strong new password. You will be redirected to sign in.
            </p>

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="New password"
              className="w-full border rounded-md p-2"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        )}
      </Card>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} title="">
        <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
          {loading && (
            <div className="flex flex-col items-center">
              <svg className="h-10 w-10 animate-spin text-indigo-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <div className="mt-2">Processing...</div>
            </div>
          )}

          {!loading && result?.ok && (
            <>
              <CheckCircle size={56} className="text-green-500" />
              <div className="font-semibold text-lg">Success</div>
              <div className="text-sm text-slate-600">{result.message}</div>
            </>
          )}

          {!loading && result && !result.ok && (
            <>
              <svg className="h-14 w-14 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div className="font-semibold text-lg">Failed</div>
              <div className="text-sm text-slate-600">{result.message}</div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}