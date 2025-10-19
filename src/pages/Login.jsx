import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import { Mail, Lock } from "lucide-react";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate and Link

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const [successMessage, setSuccessMessage] = useState(""); // Add success message state
  const navigate = useNavigate(); // Initialize useNavigate

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when form is submitted
    setError(""); // Clear any previous errors

    try {
      await login(email, password);

      // Simulate loading delay (up to 6 seconds)
      const delay = Math.random() * 6000;

      setTimeout(() => {
        setLoading(false); // Set loading to false after delay
        setSuccessMessage("Login successful!"); // Set success message
        navigate("/dashboard"); // Redirect to dashboard
      }, delay);
    } catch (err) {
      if (err.response?.status === 403) {
        // showToast may not be defined in this file; guard the call
        if (typeof showToast === "function") {
          showToast("Please verify your email before logging in", "warning");
        }
        navigate("/verify-email");
      } else {
        setLoading(false); // Also set loading to false in case of error
        setError("Invalid email or password");
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side with image + text */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: "url('img/img2.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-indigo-800 bg-opacity-40 flex flex-col items-center justify-center text-center text-white p-10">
          <h1 className="text-3xl font-bold mb-4">Welcome to Finance App</h1>
          <p className="max-w-md text-slate-200">
            Manage your agency’s finances with ease. Track records, generate
            reports, and stay in control — anytime, anywhere.
          </p>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-indigo-600">
              💰 Finance App
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Display success message */}
          {successMessage && (
            <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
              {successMessage}
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="Email address"
                className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Update the Button component */}
            <Button
              type="submit"
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
              disabled={loading} // Disable the button while loading
            >
              {loading ? "Signing In..." : "Sign In"} {/* Change button text based on loading state */}
            </Button>
          </form>

            <p className="text-sm text-center mt-3">
              <Link to="/forgot-password" className="text-indigo-600 hover:underline">
                Forgot Password?
              </Link>
            </p>


          <div className="text-center text-xs text-slate-400 mt-6">
            © {new Date().getFullYear()} Finance App. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
