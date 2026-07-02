import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword({ onBack, cardBg, borderColor, inputBg, textPrimary, textSecondary }) {
  const [step, setStep] = useState("phone"); // phone -> otp -> reset
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOtp = (e) => {
    e.preventDefault();
    // TODO: call backend API to send OTP to `phone`
    setStep("otp");
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    // TODO: call backend API to verify `otp`
    setStep("reset");
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    // TODO: call backend API to set new password
    onBack(); // return to login after success
  };

  return (
    <div>
      <button
        onClick={onBack}
        className={`flex items-center gap-1 text-xs ${textSecondary} mb-4`}
      >
        <ArrowLeft size={14} /> Back to login
      </button>

      {step === "phone" && (
        <form onSubmit={handleSendOtp}>
          <h2 className={`text-center text-base font-medium ${textPrimary} mb-1`}>Reset Password</h2>
          <p className={`text-center text-sm ${textSecondary} mb-5`}>
            Enter your registered phone number
          </p>

          <label className={`block text-xs ${textSecondary} mb-1`}>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            required
            className={`w-full px-3 py-2.5 mb-5 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm outline-none focus:ring-2 focus:ring-blue-500`}
          />

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors">
            Send OTP
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp}>
          <h2 className={`text-center text-base font-medium ${textPrimary} mb-1`}>Enter OTP</h2>
          <p className={`text-center text-sm ${textSecondary} mb-5`}>
            Sent to {phone}
          </p>

          <label className={`block text-xs ${textSecondary} mb-1`}>6-digit OTP</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            required
            className={`w-full px-3 py-2.5 mb-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm text-center tracking-widest outline-none focus:ring-2 focus:ring-blue-500`}
          />

          <button
            type="button"
            onClick={handleSendOtp}
            className="text-xs text-blue-600 font-medium mb-5 block mx-auto"
          >
            Resend OTP
          </button>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors">
            Verify OTP
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword}>
          <h2 className={`text-center text-base font-medium ${textPrimary} mb-1`}>New Password</h2>
          <p className={`text-center text-sm ${textSecondary} mb-5`}>
            Create a new password for your account
          </p>

          <label className={`block text-xs ${textSecondary} mb-1`}>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            required
            className={`w-full px-3 py-2.5 mb-3.5 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm outline-none focus:ring-2 focus:ring-blue-500`}
          />

          <label className={`block text-xs ${textSecondary} mb-1`}>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            required
            className={`w-full px-3 py-2.5 mb-5 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm outline-none focus:ring-2 focus:ring-blue-500`}
          />

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors">
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
}