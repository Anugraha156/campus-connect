import { useState } from "react";
import LoginCard from "./components/LoginCard";

function App() {
  const [session, setSession] = useState(null);

  function handleLoginSuccess({ role, user }) {
    console.log("Login success:", role, user);
    setSession({ role, user });
  }

  if (session) {
    return (
      <div style={{ padding: "2rem", color: "white" }}>
        <h1>Logged in as {session.role}</h1>
        <p>User ID: {session.user.id}</p>
        <p>Email: {session.user.email}</p>
      </div>
    );
  }

  return <LoginCard onLoginSuccess={handleLoginSuccess} />;
}

export default App;