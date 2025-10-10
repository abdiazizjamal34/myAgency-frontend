import React, { useState, useRef, useEffect } from "react";
import { PasswordAPI } from "../services/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useToast } from "../components/ui/Toast";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const otpRef = useRef(null);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(""); // Add this

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await PasswordAPI.requestOtp(phone);
      // debug: log server response so we can see status in console
      console.log("PasswordAPI.requestOtp response:", resp);
      showToast("OTP sent via WhatsApp!", "success");
      setOtpSent(true);
      setStep(2);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP + reset
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send both common field names so backend accepting different shapes will work
      const payload = {
        phone,
        code: otp,
        otp: otp,
      };
      console.log("verifyOtp payload:", payload);
      const resp = await PasswordAPI.verifyOtp(payload);
      console.log("PasswordAPI.verifyOtp response:", resp);
      if (resp?.userId) {
        setUserId(resp.userId); // Store userId for later use
      }
      // Only proceed if backend response is truly successful
      const isVerified = resp?.success === true || (resp?.message && resp.message.toLowerCase().includes("verified"));
      if (isVerified) {
        showToast("OTP verified! Please set your new password.", "success");
        setOtpVerified(true);
        setStep(3);
      } else {
        showToast(resp?.message || "OTP verification failed. Please check your code and try again.", "error");
        setOtpVerified(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to verify OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showToast("Please enter and confirm your new password.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        userId, // Include userId if needed by backend
        newPassword: password,
        // password: password,
      };
      console.log("changePassword payload:", payload);
      const resp = await PasswordAPI.changePassword(payload);
      console.log("PasswordAPI.changePassword response:", resp);
      showToast(resp?.message || "Password changed successfully!", "success");
      navigate("/login");
    } catch (err) {
      console.error("changePassword error:", err);
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  // focus OTP input when we transition to step 2 and otp was sent
  useEffect(() => {
    if (otpSent && otpRef.current) {
      otpRef.current.focus();
    }
  }, [otpSent]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
      <Card className="w-full max-w-md p-8 shadow-lg dark:bg-slate-800">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {step === 1 ? "Forgot Password" : "Verify OTP"}
        </h2>

        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +251912345678"
              className="w-full border rounded-md p-2"
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send OTP via WhatsApp"}
            </Button>
          </form>
        )}


        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {otpSent && (
              <div className="p-2 text-sm bg-indigo-50 text-indigo-700 rounded">
                OTP sent to <strong>{phone}</strong>. Enter the code you received via WhatsApp below.
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">OTP Code</label>
              <input
                ref={otpRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full border rounded-md p-2"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="p-2 text-sm bg-green-50 text-green-700 rounded">
              OTP verified for <strong>{phone}</strong>. Now set your new password.
            </div>
            <div>
              <label className="block text-sm font-medium">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full border rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full border rounded-md p-2"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-slate-500">
          Remember your password? <Link to="/login" className="text-indigo-600 hover:underline">Back to Login</Link>
        </p>
      </Card>
    </div>
  );
}
