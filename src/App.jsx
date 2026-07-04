import { useState } from "react";
import LoginCard from "./components/LoginCard";
import StudentDashboard from "./components/dashboard/StudentDashboard";

function App() {
  const [session, setSession] = useState(null);

  function handleLoginSuccess({ role, user }) {
    setSession({ role, user });
  }

  if (session?.role === "student") {
    return <StudentDashboard user={session.user} />;
  }

  if (session?.role === "admin") {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Admin dashboard coming soon</h1>
      </div>
    );
  }

  return <LoginCard onLoginSuccess={handleLoginSuccess} />;
}

export default App;