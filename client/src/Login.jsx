export default function Login() {
  return (
    <div className="page container skinny">
      <div className="card">
        <h2>Welcome back</h2>
        <p className="muted">Sign in to view your contract analyses</p>
        <form className="form">
          <label>Email
            <input type="email" placeholder="you@company.com" />
          </label>
          <label>Password
            <input type="password" placeholder="••••••••" />
          </label>
          <div className="form-actions">
            <button className="btn-primary" type="submit">Sign in</button>
            <button className="btn-ghost" type="button">Forgot?</button>
          </div>
        </form>
      </div>
    </div>
  );
}
