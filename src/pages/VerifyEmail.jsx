import React, { useState, useEffect } from "react";
import { AuthAPI } from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function VerifyEmail() {
  const START_SECONDS = 30;
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(START_SECONDS); // visible immediately
  const [success, setSuccess] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth(); // <- added

  // countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  // auto-verify when link contains ?email=...&token=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token") || params.get("code");
    const emailParam = params.get("email");
    if (token) {
      setEmail(emailParam || "");
      setCode(token);
      (async () => {
        setLoading(true);
        try {
          await AuthAPI.verifyEmail({ email: emailParam, code: token });
          toast.push("Email verified", "success");
          // logout current session then redirect to login
          try { await logout(); } catch (e) { /* ignore logout errors */ }
          navigate("/login", { replace: true });
        } catch (err) {
          toast.push(err?.response?.data?.message || err.message || "Invalid or expired code", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [location.search]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthAPI.verifyEmail({ email, code });
      toast.push("Email verified", "success");
      // logout current session then redirect to login
      try { await logout(); } catch (e) { /* ignore logout errors */ }
      navigate("/login", { replace: true });
    } catch (err) {
      toast.push(err?.response?.data?.message || err.message || "Invalid or expired code", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.push("Please enter your email first", "error");
      return;
    }
    try {
      await AuthAPI.requestOtp({ identifier: email, method: "email" });
      toast.push("OTP resent", "success");
      setCooldown(START_SECONDS);
    } catch (err) {
      toast.push(err?.response?.data?.message || err.message || "Failed to resend OTP", "error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md p-8 dark:bg-slate-800 shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-2">Verify Your Email</h2>

        <div className="text-center mb-4">
          {cooldown > 0 ? (
            <div className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
              Resend available in <span className="font-semibold ml-1">{cooldown}s</span>
            </div>
          ) : (
            <div className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
              You can resend the OTP now
            </div>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mb-6">
          Enter the email and the 6-digit code sent to your inbox.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full border rounded-md p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="6-digit code"
            className="w-full border rounded-md p-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="text-center mt-4">
            <h6>Didn't receive the email? Check your spam folder or </h6>
          <Button
            type="button"
            variant="secondary"
            disabled={cooldown > 0}
            onClick={handleResend}
            className="w-full"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
          </Button>
        </div>
      </Card>

      <Modal open={success} title="">
        <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
          <CheckCircle size={60} className="text-green-500 animate-bounce" />
          <h2 className="text-2xl font-semibold">Email Verified!</h2>
          <p className="text-slate-500">Redirecting to login...</p>
        </div>
      </Modal>
    </div>
  );
}
