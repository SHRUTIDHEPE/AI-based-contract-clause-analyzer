import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login"); // Redirect after logout
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Contract Analyzer</h1>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        <Link to="/" className="block p-2 rounded hover:bg-gray-700">Dashboard</Link>
        <Link to="/upload" className="block p-2 rounded hover:bg-gray-700">Upload Contract</Link>
        <Link to="/contracts" className="block p-2 rounded hover:bg-gray-700">My Contracts</Link>
        <div className="flex items-center justify-between p-2 rounded hover:bg-gray-700">
          <Link to="/notifications" className="flex-grow">Notifications</Link>
          <NotificationBell />
        </div>
        <Link to="/profile" className="block p-2 rounded hover:bg-gray-700">Profile</Link>
        <Link to="/audit" className="block p-2 rounded hover:bg-gray-70un">Audit Logs</Link>
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-2">
            Signed in as <strong>{user.username}</strong>
          </p>
          <button
            onClick={handleLogout}
            className="w-full text-left bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
