import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "../config/supabaseClient";

export default function ForgotPassword({ onBack, cardBg, borderColor, inputBg, textPrimary, textSecondary }) {
  const [step, setStep] = useState("email"); // email -> otp -> reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage("OTP sent to your email.");
      setStep("otp");
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setStep("reset");
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      await supabase.auth.signOut();
      onBack();
    }
  }

  return (
    <div className={`w-full max-w-sm ${cardBg} border ${borderColor} rounded-2xl p-7 shadow-2xl transition-colors`}>
      <button onClick={onBack} className={`flex items-center gap-1 text-sm ${textSecondary} mb-5`}>
        <ArrowLeft size={16} />
        Back to Login
      </button>

      {error && <p className="text-xs text-red-500 mb-3 text-center">{error}</p>}
      {message && !error && <p className="text-xs text-green-600 mb-3 text-center">{message}</p>}

      {step === "email" && (
        <form onSubmit={handleSendOtp}>
          <h2 className={`text-center text-base font-medium ${textPrimary} mb-1`}>Forgot Password</h2>
          <p className={`text-center text-sm ${textSecondary} mb-5`}>Enter your registered email to receive an OTP</p>
          <label className={`block text-xs ${textSecondary} mb-1`}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
            className={`w-full px-3 py-2.5 mb-4 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-400 hover:bg-blue-500 text-white font-medium text-sm py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp}>
          <h2 className={`text-center text-base font-medium ${textPrimary} mb-1`}>Verify OTP</h2>
          <p className={`text-center text-sm ${textSecondary} mb-5`}>Enter the 6-digit code sent to {email}</p>
          <label className={`block text-xs ${textSecondary} mb-1`}>OTP Code</label>
          <input
            type="text"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className={`w-full px-3 py-2.5 mb-4 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm text-center tracking-widest outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-400 hover:bg-blue-500 text-white font-medium text-sm py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <button type="button" onClick={handleSendOtp} className="w-full text-xs text-blue-600 font-medium mt-3">
            Resend OTP
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword}>
          <h2 className={`text-center text-base font-medium ${textPrimary} mb-1`}>Set New Password</h2>
          <p className={`text-center text-sm ${textSecondary} mb-5`}>Choose a new password for your account</p>
          <label className={`block text-xs ${textSecondary} mb-1`}>New Password</label>
          <div className="relative mb-3.5">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className={`w-full px-3 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <label className={`block text-xs ${textSecondary} mb-1`}>Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className={`w-full px-3 py-2.5 mb-4 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-400 hover:bg-blue-500 text-white font-medium text-sm py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}