import { Link } from 'react-router-dom';
console.log("✅ main.jsx loaded");

import "./App.css";
function App() {
  return (
    <div>
      <h1>Contract Analyzer</h1>
      <nav>
        <Link to="/login">Login</Link> |
        <Link to="/register">Register</Link> |
        <Link to="/dashboard">Dashboard</Link> |
        <Link to="/upload">Upload</Link>
      </nav>
    </div>
  );
}

export default App;


