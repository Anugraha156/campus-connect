import { useState, useEffect } from "react";
import { supabase } from "../../config/supabaseClient";
import Navbar from "./Navbar";
import { adminTabs } from "../../config/adminNav";
import EventsManager from "./admin/EventsManager";
import NewsManager from "./admin/NewsManager";
import AttendanceManager from "./admin/AttendanceManager";
import SpotlightsManager from "./admin/SpotlightsManager";
import AdminFeedback from "./admin/AdminFeedback";

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("events");
  const [darkMode, setDarkMode] = useState(false);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    async function fetchName() {
      const { data, error } = await supabase
        .from("admins")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setAdminName(data.full_name);
      }
    }
    fetchName();
  }, [user.id]);

  const pageBg = darkMode ? "bg-neutral-950" : "bg-neutral-50";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

function renderTab() {
  switch (activeTab) {
    case "events":
      return <EventsManager darkMode={darkMode} />;
    case "news":
      return <NewsManager darkMode={darkMode} />;
    case "attendance":
      return <AttendanceManager darkMode={darkMode} />;
    case "spotlights":
      return <SpotlightsManager darkMode={darkMode} />;
    case "feedback":
      return <AdminFeedback darkMode={darkMode} />;
    default:
      return null;
  }
}

  return (
    <div className={`min-h-screen ${pageBg}`}>
      <Navbar
        tabs={adminTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
      />
      <div className="px-8 py-6">
        <p className={`text-xs uppercase tracking-widest ${textSecondary} mb-1`}>Admin Console</p>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>Welcome, {adminName || "Admin"}</h1>
      </div>
      <div className="max-w-6xl mx-auto">{renderTab()}</div>
    </div>
  );
}