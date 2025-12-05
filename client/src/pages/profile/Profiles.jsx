import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  updateAccount,
  changePassword,
  getAccountDetails,
} from "../../api/auth";

export default function Profile() {
  const { user, isLoading: isAuthLoading } = useAuth();

  // State for account details form
  const [details, setDetails] = useState({ fullName: "", email: "" });
  const [detailsError, setDetailsError] = useState("");
  const [detailsSuccess, setDetailsSuccess] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);

  // State for password change form
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // State for user stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setDetails({ fullName: user.fullName, email: user.email });

      const fetchStats = async () => {
        try {
          setStatsLoading(true);
          const response = await getAccountDetails(user.username);
          setStats(response.data.data);
        } catch (error) {
          console.error("Failed to fetch user stats", error);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchStats();
    }
  }, [user]);

  const handleDetailsChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setDetailsLoading(true);
    setDetailsError("");
    setDetailsSuccess("");
    try {
      await updateAccount(details);
      setDetailsSuccess("Profile updated successfully!");
    } catch (err) {
      setDetailsError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await changePassword(passwordData);
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "" }); // Clear fields
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Failed to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isAuthLoading || !user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-12">
      {/* User Info and Stats */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">
          Welcome, {user.username}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-700">Full Name</p>
            <p className="text-gray-500">{user.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-700">Email</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-700">Member Since</p>
            <p className="text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          {statsLoading ? (
            <p>Loading stats...</p>
          ) : (
            stats && (
              <>
                <div>
                  <p className="text-sm text-gray-700">Total Contracts</p>
                  <p className="text-gray-500">{stats.totalContracts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Last Upload</p>
                  <p className="text-gray-500">
                    {stats.lastUpload
                      ? new Date(stats.lastUpload).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </>
            )
          )}
        </div>
      </div>

      {/* Update Profile Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Update Profile</h3>
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          {detailsError && <p className="text-red-500">{detailsError}</p>}
          {detailsSuccess && <p className="text-green-500">{detailsSuccess}</p>}
          <div className="flex flex-col text-gray-700">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              value={details.fullName}
              onChange={handleDetailsChange}
              className="border rounded p-2 text-gray-700"
            />
          </div>
          <div className="flex flex-col text-gray-700">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={details.email}
              onChange={handleDetailsChange}
              className="border rounded p-2"
            />
          </div>
          <button
            type="submit"
            disabled={detailsLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            {detailsLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError && <p className="text-red-500">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-500">{passwordSuccess}</p>}
          <div className="flex flex-col text-gray-700">
            <label htmlFor="oldPassword">Old Password</label>
            <input
              type="password"
              name="oldPassword"
              id="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              className="border rounded p-2"
              required
            />
          </div>
          <div className="flex flex-col text-gray-700">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="border rounded p-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            {passwordLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}