import { Link } from "react-router-dom";
import "./App.css";

export default function App() {
  return (
    <div className="app-root">
      <header className="header">
        <div className="brand">
          <svg className="logo" viewBox="0 0 24 24" aria-hidden><path d="M3 12a9 9 0 1018 0 9 9 0 10-18 0" fill="currentColor"/></svg>
          <div>
            <h1>ClauseSight</h1>
            <p className="tag">Contract clause analyzer &amp; risk detection</p>
          </div>
        </div>
        <nav className="nav-links">
          <Link to="/login" className="btn-link">Login</Link>
          <Link to="/register" className="btn-primary">Sign up</Link>
        </nav>
      </header>

      <main className="hero">
        <div className="hero-inner">
          <h2>Find hidden risks inside contracts — instantly.</h2>
          <p className="lead">Upload contracts, get clause-level analysis, risk scores and suggested redlines powered by your system.</p>
          <div className="hero-cta">
            <Link to="/upload" className="btn-cta">Upload a contract</Link>
            <Link to="/dashboard" className="btn-ghost">View dashboard</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden>
          <div className="card-sample">
            <div className="card-header">Clause: Confidentiality</div>
            <div className="card-body">
              <p><strong>Risk:</strong> High — broad obligations</p>
              <p className="muted">Suggested change: Narrow purpose & include termination carve-out.</p>
            </div>
          </div>
        </div>
      </main>

      <section className="features">
        <div className="feature">
          <h3>Clause-level insights</h3>
          <p>Precise flags and explanations for confidentiality, indemnity, termination, and more.</p>
        </div>
        <div className="feature">
          <h3>Risk scoring</h3>
          <p>Automatically grade contracts and prioritize the highest-risk items.</p>
        </div>
        <div className="feature">
          <h3>Export & collaborate</h3>
          <p>Download redlines, comments, and share with stakeholders.</p>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} ClauseSight — Built for clarity and speed.</p>
        <p className="muted">Prepared for presentation — responsive and production-ready UI.</p>
      </footer>
    </div>
  );
}
