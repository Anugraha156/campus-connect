import { useState, useEffect } from "react";
import { Eye, EyeOff, GraduationCap, Moon, Sun } from "lucide-react";
import { roleThemes } from "../config/roleThemes";
import campusBg from "../assets/campus-bg.jpg";
import ForgotPassword from "./ForgotPassword";
import { supabase } from "../config/supabaseClient";

export default function LoginCard({ onLoginSuccess }) {
  const [role, setRole] = useState("student");
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [identifier, setIdentifier] = useState(""); // reg number OR admin email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [spotlights, setSpotlights] = useState([]);

  const theme = roleThemes[role];

  const cardBg = darkMode ? "bg-neutral-800" : "bg-neutral-200";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const borderColor = darkMode ? "border-neutral-700" : "border-neutral-300";
  const inputBg = darkMode ? "bg-neutral-700" : "bg-neutral-50";

  const overlayGradient = darkMode
    ? "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.08) 68%, rgba(0,0,0,0) 80%)"
    : "linear-gradient(90deg, rgba(60,60,63,0.72) 0%, rgba(60,60,63,0.5) 45%, rgba(60,60,63,0.08) 68%, rgba(60,60,63,0) 80%)";

  useEffect(() => {
    async function fetchSpotlights() {
      const { data } = await supabase.from("spotlights").select("*").order("sort_order");
      setSpotlights(data || []);
    }
    fetchSpotlights();
  }, []);

  function resetFormState() {
    setIdentifier("");
    setPassword("");
    setError("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let emailToUse = identifier.trim();

      if (role === "student") {
        const { data: email, error: lookupError } = await supabase.rpc(
          "get_login_email",
          { reg: identifier.trim() }
        );

        if (lookupError || !email) {
          setError("Registration number not found.");
          setLoading(false);
          return;
        }
        emailToUse = email;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (signInError) {
        setError("Incorrect credentials. Please try again.");
        setLoading(false);
        return;
      }

      // Verify this account actually belongs to the selected role
      const tableToCheck = role === "admin" ? "admins" : "students";
      const { data: roleRow } = await supabase
        .from(tableToCheck)
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!roleRow) {
        await supabase.auth.signOut();
        setError(`This account is not registered as ${role === "admin" ? "an admin" : "a student"}.`);
        setLoading(false);
        return;
      }

      setLoading(false);
      if (onLoginSuccess) onLoginSuccess({ role, user: data.user });
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen relative bg-cover bg-center"
      style={{ backgroundImage: `url(${campusBg})` }}
    >
      <div className="absolute inset-0" style={{ background: overlayGradient }} />

      <div className="relative z-10 flex flex-col h-screen p-10">
  <div className="flex items-center gap-3 mb-10">
    <GraduationCap size={40} className="text-white drop-shadow-md" />
    <p className="text-white text-4xl md:text-5xl font-bold tracking-tight drop-shadow-md">
      CampusConnect
    </p>
  </div>

        <div className="max-w-md">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-4">
            Spotlights
          </p>
          <div className="flex flex-col gap-5">
            {spotlights.map((item) => (
              <div key={item.id}>
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
              onClick={() => { setRole("student"); setShowForgotPassword(false); resetFormState(); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                role === "student" ? `${cardBg} ${textPrimary} shadow-sm` : textSecondary
              }`}
            >
              Student
            </button>
            <button
              onClick={() => { setRole("admin"); setShowForgotPassword(false); resetFormState(); }}
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
            <form onSubmit={handleLogin}>
              <h2 className={`text-center text-base font-medium ${textPrimary} mb-1`}>{theme.heading}</h2>
              <p className={`text-center text-sm ${textSecondary} mb-5`}>{theme.subheading}</p>

              {error && (
                <p className="text-xs text-red-500 mb-3 text-center">{error}</p>
              )}

              <label className={`block text-xs ${textSecondary} mb-1`}>{theme.idLabel}</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={theme.idPlaceholder}
                className={`w-full px-3 py-2.5 mb-3.5 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm outline-none focus:ring-2 focus:ring-blue-500`}
              />

              <label className={`block text-xs ${textSecondary} mb-1`}>Password</label>
              <div className="relative mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  
                </label>
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-blue-600 font-medium">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full font-medium text-sm py-2.5 rounded-lg transition-colors disabled:opacity-60 ${
                  darkMode
                    ? "bg-neutral-300 hover:bg-neutral-200 text-neutral-900"
                    : "bg-blue-400 hover:bg-blue-500 text-white"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}