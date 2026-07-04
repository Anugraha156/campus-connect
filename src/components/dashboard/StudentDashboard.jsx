import { useState, useEffect } from "react";
import { supabase } from "../../config/supabaseClient";
import Navbar from "./Navbar";
import CampusBanner from "./CampusBanner";
import UpcomingEvents from "./tabs/UpcomingEvents";
import MyEvents from "./tabs/MyEvents";
import News from "./tabs/News";
import Certificates from "./tabs/Certificates";
import { bannerImages } from "../../config/bannerImages";

export default function StudentDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [darkMode, setDarkMode] = useState(false);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    async function fetchName() {
      const { data, error } = await supabase
        .from("students")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setStudentName(data.full_name);
      }
    }
    fetchName();
  }, [user.id]);

  const pageBg = darkMode ? "bg-neutral-950" : "bg-neutral-50";

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  function renderTab() {
    switch (activeTab) {
      case "upcoming":
        return <UpcomingEvents darkMode={darkMode} />;
      case "my-events":
        return <MyEvents darkMode={darkMode} />;
      case "news":
        return <News darkMode={darkMode} />;
      case "certificates":
        return <Certificates darkMode={darkMode} />;
      default:
        return null;
    }
  }

  return (
    <div className={`min-h-screen ${pageBg}`}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
      />
      <CampusBanner studentName={studentName} darkMode={darkMode} images={bannerImages} />
      <div className="max-w-5xl mx-auto">{renderTab()}</div>
    </div>
  );
}