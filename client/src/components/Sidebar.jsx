import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/">Dashboard</Link>
      <Link to="/upload">Upload Contract</Link>
      <Link to="/contracts">My Contracts</Link>
      <Link to="/notifications">Notifications</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/audit">Audit Logs</Link>
    </aside>
  );
}
