import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    identifier: "", // Can be email or username
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // The backend expects 'email' or 'username', so we pass the identifier as both.
      // The backend logic `$or: [{ email }, { username }]` will handle it correctly.
      const response = await login({
        email: formData.identifier,
        username: formData.identifier,
        password: formData.password,
      });
      const { user } = response.data.data;

      // Store token for API requests and set user in context
      setUser(user);

      // Redirect to dashboard or home page
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          name="identifier"
          placeholder="Email or Username"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
