import { useState } from "react";
import { Eye, EyeOff, GraduationCap, Moon, Sun, Mail } from "lucide-react";
import { roleThemes } from "../config/roleThemes";
import { spotlights } from "../config/spotlights";
import campusBg from "../assets/campus-bg.jpg";
import ForgotPassword from "./ForgotPassword";

export default function LoginCard() {
  const [role, setRole] = useState("student");
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const theme = roleThemes[role];

  const cardBg = darkMode ? "bg-neutral-800" : "bg-neutral-200";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const borderColor = darkMode ? "border-neutral-700" : "border-neutral-300";
  const inputBg = darkMode ? "bg-neutral-700" : "bg-neutral-50";

  const overlayGradient = darkMode
    ? "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.08) 68%, rgba(0,0,0,0) 80%)"
    : "linear-gradient(90deg, rgba(60,60,63,0.72) 0%, rgba(60,60,63,0.5) 45%, rgba(60,60,63,0.08) 68%, rgba(60,60,63,0) 80%)";

  return (
    <div
      className="min-h-screen relative bg-cover bg-center"
      style={{ backgroundImage: `url(${campusBg})` }}
    >
      <div className="absolute inset-0" style={{ background: overlayGradient }} />

      <div className="relative z-10 flex flex-col h-screen p-10">
        <p className="text-white text-4xl md:text-5xl font-bold tracking-tight mb-10 drop-shadow-md">
          CampusConnect
        </p>

        <div className="max-w-md">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-4">
            Spotlights
          </p>
          <div className="flex flex-col gap-5">
            {spotlights.map((item) => (
              <div key={item.title}>
                <p className="text-white text-base font-semibold mb-1 drop-shadow-sm">{item.title}</p>
                <p className="text-white/75 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 h-full w-full sm:w-[42%] sm:min-w-[340px] flex items-center justify-center p-6 z-20">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`absolute top-5 right-6 w-9 h-9 rounded-full flex items-center justify-center border ${borderColor} ${cardBg}`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} className="text-slate-300" /> : <Moon size={18} className="text-slate-600" />}
        </button>

        <div className={`w-full max-w-sm ${cardBg} border ${borderColor} rounded-2xl p-7 shadow-2xl transition-colors`}>

          <div className="flex justify-center mb-3">
            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
              <GraduationCap size={22} className="text-blue-600" />
            </div>
          </div>

          <p className="text-center text-sm text-blue-600 mb-5">{theme.portalSubtitle}</p>

          <div className={`flex ${inputBg} rounded-lg p-1 mb-5`}>
            <button
              onClick={() => { setRole("student"); setShowForgotPassword(false); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                role === "student" ? `${cardBg} ${textPrimary} shadow-sm` : textSecondary
              }`}
            >
              Student
            </button>
            <button
              onClick={() => { setRole("admin"); setShowForgotPassword(false); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                role === "admin" ? `${cardBg} ${textPrimary} shadow-sm` : textSecondary
              }`}
            >
              Admin
            </button>
          </div>

          {showForgotPassword ? (
            <ForgotPassword
              onBack={() => setShowForgotPassword(false)}
              cardBg={cardBg}
              borderColor={borderColor}
              inputBg={inputBg}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
            />
          ) : (
            <>
              <h2 className={`text-center text-base font-medium ${textPrimary} mb-1`}>{theme.heading}</h2>
              <p className={`text-center text-sm ${textSecondary} mb-5`}>{theme.subheading}</p>

              <label className={`block text-xs ${textSecondary} mb-1`}>{theme.idLabel}</label>
              <input
                type="text"
                placeholder={theme.idPlaceholder}
                className={`w-full px-3 py-2.5 mb-3.5 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm outline-none focus:ring-2 focus:ring-blue-500`}
              />

              <label className={`block text-xs ${textSecondary} mb-1`}>Password</label>
              <div className="relative mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
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

              <div className="flex justify-between items-center mb-5 text-xs">
                <label className={`flex items-center gap-1.5 ${textSecondary}`}>
                  <input type="checkbox" className="w-3.5 h-3.5" />
                  Remember me
                </label>
                <button onClick={() => setShowForgotPassword(true)} className="text-blue-600 font-medium">
                  Forgot Password?
                </button>
              </div>

              <button
                className={`w-full font-medium text-sm py-2.5 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-neutral-300 hover:bg-neutral-200 text-neutral-900"
                    : "bg-blue-400 hover:bg-blue-500 text-white"
                }`}
              >
                Login
              </button>

              <button
                className={`w-full mt-5 py-2.5 border ${borderColor} rounded-lg text-sm font-medium ${textPrimary} flex items-center justify-center gap-2 hover:bg-black/5 transition-colors`}
              >
                <Mail size={16} />
                Continue with Google
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}