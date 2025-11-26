import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login: loginUser } = useAuth(); // Renaming to avoid conflict
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      // And clear the location state
      navigate(location.pathname, { replace: true });
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser({
        email: formData.identifier,
        username: formData.identifier,
        password: formData.password,
      });

      navigate("/"); // Redirect after successful login via context
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md bg-gray-900/70 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-900/30 py-2 rounded-lg border border-red-600">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-green-400 text-sm text-center bg-green-900/30 py-2 rounded-lg border border-green-600">
              {successMessage}
            </p>
          )}

          <div>
            <label className="text-gray-300 text-sm">Email or Username</label>
            <input
              type="text"
              name="identifier"
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Enter email or username"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <input
              type="password"
              name="password"
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Enter password"
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
