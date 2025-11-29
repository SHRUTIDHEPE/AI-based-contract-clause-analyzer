import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyContracts } from "../../api/contracts";

export default function Dashboard() {
  const [recentContracts, setRecentContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentContracts = async () => {
      try {
        setLoading(true);
        const response = await getMyContracts(1, 5); // Fetch page 1, limit 5
        setRecentContracts(response.data.data.contracts);
      } catch (err) {
        setError("Failed to fetch recent contracts.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecentContracts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Welcome to your Contract Analyzer
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* Placeholder Stats */}
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Total Contracts</p>
          <h3 className="text-2xl font-semibold mt-2 text-gray-500">128</h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-500">High Risk</p>
          <h3 className="text-2xl font-semibold mt-2 text-red-500">14</h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Medium Risk</p>
          <h3 className="text-2xl font-semibold mt-2 text-yellow-500">37</h3>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Low Risk</p>
          <h3 className="text-2xl font-semibold mt-2 text-green-600">77</h3>
        </div>
      </div>

      {/* Large Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-xl from-neutral-700 text-gray-500">Recent Uploaded Contracts</h3>
          <div className="space-y-3">
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && recentContracts.length > 0
              ? recentContracts.map((c) => (
                  <Link
                    key={c._id}
                    to={`/contracts/${c._id}`}
                    className="block p-3 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition"
                  >
                    {c.fileName}
                  </Link>
                ))
              : !loading && <p className="text-gray-500">No recent contracts found.</p>}
          </div>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-xl from-neutral-700 text-gray-500">Risk Overview</h3>
          <div className="h-48 flex items-center justify-center text-gray-400">
            <p>Chart Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}
