import React, { useState, useEffect } from "react";
import { AuthAPI } from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const START_SECONDS = 30;
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { state } = useLocation(); // { identifier, method }
  const [userId, setUserId] = useState(null);

  // Countdown state for resend
  const [cooldown, setCooldown] = useState(state?.identifier ? START_SECONDS : 0);

  // Countdown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthAPI.verifyOtp({ identifier: state.identifier, code: otp });
      setUserId(res.userId);
      showToast("OTP verified!", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Invalid or expired OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!userId) return showToast("Verify OTP first!", "error");
    setLoading(true);
    try {
      await AuthAPI.resetPassword({ userId, newPassword: password });
      showToast("Password reset successful!", "success");
      navigate("/login");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!state?.identifier) return showToast("Missing identifier to resend OTP", "error");
    try {
      await AuthAPI.requestOtp({ identifier: state.identifier, method: state.method || "email" });
      showToast("OTP resent successfully!", "success");
      setCooldown(START_SECONDS);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to resend OTP", "error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
      <Card className="w-full max-w-md p-8 dark:bg-slate-800 shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">Reset Password</h2>

        {/* Visible countdown banner when waiting */}
        {!userId && (
          <div className="text-center mb-4">
            {cooldown > 0 ? (
              <div className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                Resend available in{" "}
                <span className="font-semibold ml-1">{cooldown}s</span>
              </div>
            ) : (
              <div className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                You can resend the OTP now
              </div>
            )}
          </div>
        )}

        {!userId ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border rounded-md p-2"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
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
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              className="w-full border rounded-md p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
