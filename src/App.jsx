import { useState } from "react";
import LoginCard from "./components/LoginCard";
import StudentDashboard from "./components/dashboard/StudentDashboard";
import AdminDashboard from "./components/dashboard/AdminDashboard";

function App() {
  const [session, setSession] = useState(null);

  function handleLoginSuccess({ role, user }) {
    setSession({ role, user });
  }

  if (session?.role === "student") {
    return <StudentDashboard user={session.user} />;
  }

  if (session?.role === "admin") {
    return <AdminDashboard user={session.user} />;
  }

  return <LoginCard onLoginSuccess={handleLoginSuccess} />;
}

export default App;