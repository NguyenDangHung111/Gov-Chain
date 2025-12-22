import { useState, useEffect } from "react";
import Login from "./components/Login";
import CitizenDashboard from "./components/CitizenDashboard";
import OfficerDashboard from "./components/OfficerDashboard";
import "./index.css";
import "./App.css";

function App() {
  const [user, setUser] = useState(null); // null means not logged in

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-logo">GovChain Demo</h1>
        <div className="user-info">
          <span className="user-name">Xin chào, {user.name}</span>
          <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
        </div>
      </header>
      
      {user.role === "officer" ? (
        <OfficerDashboard user={user} />
      ) : (
        <CitizenDashboard user={user} />
      )}
    </div>
  );
}

export default App;
