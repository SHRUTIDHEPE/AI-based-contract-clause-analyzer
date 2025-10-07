import { Link } from 'react-router-dom';
console.log("✅ main.jsx loaded");

import "./App.css";
function App() {
  return (
    <div>
      <h1>Contract Analyzer</h1>
      <nav>
        <Link to="pages/Login">Login</Link> | 
        <Link to="pages/Register">Register</Link> | 
        <Link to="pages/Dashboard">Dashboard</Link> | 
        <Link to="pages/Uploads">Upload</Link>
      </nav>
    </div>
  );
}

export default App;


