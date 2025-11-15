export default function Register() {
  return (
    <div className="page container skinny">
      <div className="card">
        <h2>Create account</h2>
        <p className="muted">Start analyzing contracts in seconds</p>
        <form className="form">
          <label>Full name
            <input type="text" placeholder="Jane Doe" />
          </label>
          <label>Work email
            <input type="email" placeholder="you@company.com" />
          </label>
          <label>Password
            <input type="password" placeholder="Choose a strong password" />
          </label>
          <div className="form-actions">
            <button className="btn-primary" type="submit">Create account</button>
          </div>
        </form>
      </div>
    </div>
  );
}
