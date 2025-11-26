import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register: registerUser } = useAuth(); // Renaming to avoid conflict
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(formData);
      // Redirect to login page with a success message
      navigate("/login", {
        state: { message: "Registration successful! Please log in." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md bg-gray-900/70 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-900/30 py-2 rounded-lg border border-red-600">
              {error}
            </p>
          )}

          {/* Full Name */}
          <div>
            <label className="text-gray-300 text-sm">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter full name"
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              name="email"
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter email"
              onChange={handleChange}
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-gray-300 text-sm">Username</label>
            <input
              type="text"
              name="username"
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
              placeholder="Choose a username"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <input
              type="password"
              name="password"
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
              placeholder="Create a password"
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Redirect to Login */}
        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
