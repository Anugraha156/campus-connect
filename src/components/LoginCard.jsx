import { useState } from "react";
import {
  Calendar, ClipboardCheck, BarChart3, UserCircle,
  Users, PieChart, UserCog, Eye, EyeOff, GraduationCap,
  Moon, Sun,
} from "lucide-react";
import { roleThemes } from "../config/roleThemes";

const iconMap = {
  Calendar, ClipboardCheck, BarChart3, UserCircle,
  Users, PieChart, UserCog,
};

export default function LoginCard() {
  const [role, setRole] = useState("student");
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const theme = roleThemes[role];

  const bg = darkMode ? "bg-slate-900" : "bg-slate-50";
  const cardBg = darkMode ? "bg-slate-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const borderColor = darkMode ? "border-slate-700" : "border-slate-200";
  const inputBg = darkMode ? "bg-slate-700" : "bg-slate-50";

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center p-4 transition-colors`}>
      <div className="w-full max-w-md">

        <div className="flex justify-end mb-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-9 h-9 rounded-full flex items-center justify-center border ${borderColor} ${cardBg}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} className="text-slate-300" /> : <Moon size={18} className="text-slate-600" />}
          </button>
        </div>

        <div className={`${cardBg} border ${borderColor} rounded-2xl p-8 transition-colors`}>

          <div className="flex justify-center mb-3">
            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
              <GraduationCap size={22} className="text-blue-600" />
            </div>
          </div>

          <h1 className={`text-center text-lg font-medium ${textPrimary}`}>{theme.portalTitle}</h1>
          <p className="text-center text-sm text-blue-600 mt-0.5">{theme.portalSubtitle}</p>
          <p className={`text-center text-xs ${textSecondary} mt-1.5 mb-5`}>{theme.tagline}</p>

          <div className={`flex ${inputBg} rounded-lg p-1 mb-5`}>
            <button
              onClick={() => setRole("student")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                role === "student" ? `${cardBg} ${textPrimary} shadow-sm` : textSecondary
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                role === "admin" ? `${cardBg} ${textPrimary} shadow-sm` : textSecondary
              }`}
            >
              Admin
            </button>
          </div>

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
            <a href="#" className="text-blue-600 font-medium">Forgot Password?</a>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors">
            Login
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className={`flex-1 h-px ${borderColor} border-t`} />
            <span className={`text-xs ${textSecondary}`}>or continue with</span>
            <div className={`flex-1 h-px ${borderColor} border-t`} />
          </div>

          <div className="flex gap-3 mb-5">
            <button className={`flex-1 py-2 border ${borderColor} rounded-lg text-sm ${textPrimary}`}>Google</button>
            <button className={`flex-1 py-2 border ${borderColor} rounded-lg text-sm ${textPrimary}`}>Microsoft</button>
          </div>

          <p className={`text-center text-xs ${textSecondary}`}>
            {theme.footerText}{" "}
            <a href="#" className="text-blue-600 font-medium">{theme.footerLinkText}</a>
          </p>
        </div>

        <div className={`grid grid-cols-4 gap-2 mt-4 ${inputBg} rounded-2xl p-3.5`}>
          {theme.actions.map((action) => {
            const Icon = iconMap[action.icon];
            return (
              <div key={action.label} className="flex flex-col items-center gap-1 text-center">
                <Icon size={18} className="text-blue-600" />
                <span className={`text-[10px] ${textSecondary}`}>{action.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}