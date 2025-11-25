import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <Link to="/">Dashboard</Link>
      <Link to="/upload">Upload Contract</Link>
      <Link to="/contracts">My Contracts</Link>
      <Link to="/notifications">Notifications</Link>
      <Link to="/profile">Profile</Link>
      {!user && <Link to="/login">Login</Link>}
      {!user && <Link to="/register">Register</Link>}
      <Link to="/audit">Audit Logs</Link>
      {user && (
        <button
          onClick={handleLogout}
          style={{
            marginTop: "1rem",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer"
          }}
          aria-label="Logout"
        >
          Logout
        </button>
      )}
    </aside>
  );
}
