import React, { useEffect, useState } from "react";
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
  const [cooldown, setCooldown] = useState(START_SECONDS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [result, setResult] = useState(null); // { ok: true|false, message, details }
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  // auto-verify when link is clicked: /verify-email?email=...&token=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token") || params.get("code");
    const emailParam = params.get("email");
    if (token) {
      setEmail(emailParam || "");
      setCode(token);
      (async () => {
        setLoading(true);
        setDialogOpen(true);
        try {
          const res = await AuthAPI.verifyEmail({ email: emailParam, code: token });
          // expect backend to return data; include agency info if provided
          setResult({
            ok: true,
            message: res?.message || "Email successfully verified.",
            details: res?.agency || null,
          });
          // force logout (as requested) then redirect to login
          try { await logout(); } catch (e) { /* ignore logout errors */ }
          setTimeout(() => navigate("/login", { replace: true }), 2000);
        } catch (err) {
          setResult({
            ok: false,
            message: err?.response?.data?.message || "Verification failed or token expired.",
            details: null,
          });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [location.search, logout, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDialogOpen(true);
    try {
      const res = await AuthAPI.verifyEmail({ email, code });
      setResult({
        ok: true,
        message: res?.message || "Email verified successfully.",
        details: res?.agency || null,
      });
      try { await logout(); } catch (e) {}
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setResult({
        ok: false,
        message: err?.response?.data?.message || "Invalid or expired code.",
        details: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return toast.push("Enter your email first", "error");
    try {
      await AuthAPI.requestOtp({ identifier: email, method: "email" });
      toast.push("OTP resent", "success");
      setCooldown(START_SECONDS);
    } catch (err) {
      toast.push(err?.response?.data?.message || "Failed to resend OTP", "error");
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
          Enter the email and the 6-digit code sent to your inbox. After verification you will be logged out and must sign in again.
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

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} title="">
        <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
          {loading && <div className="flex flex-col items-center"><svg className="h-10 w-10 animate-spin text-indigo-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg><div className="mt-2">Processing...</div></div>}

          {!loading && result?.ok && (
            <>
              <CheckCircle size={56} className="text-green-500" />
              <div className="font-semibold text-lg">Verification successful</div>
              <div className="text-sm text-slate-600">
                {result.message}
              </div>

              {result.details && (
                <div className="mt-2 text-left w-full bg-slate-50 p-3 rounded text-sm">
                  <div className="font-medium">Agency details</div>
                  <div>Name: {result.details.name || "—"}</div>
                  {result.details.contact && <div>Contact: {result.details.contact}</div>}
                  {result.details.address && <div>Address: {result.details.address}</div>}
                </div>
              )}

              <div className="mt-3 text-left w-full text-sm">
                <div className="font-medium">Important:</div>
                <ul className="list-disc ml-5">
                  <li>You have been logged out for security. Please sign in again.</li>
                  <li>On first login, immediately change your password from your profile.</li>
                  <li>Do not share your credentials. Contact your agency admin for access issues.</li>
                </ul>
              </div>
            </>
          )}

          {!loading && result && !result.ok && (
            <>
              <svg className="h-14 w-14 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              <div className="font-semibold text-lg">Verification failed</div>
              <div className="text-sm text-slate-600">{result.message}</div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
