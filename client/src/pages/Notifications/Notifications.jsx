import React, { useEffect, useState, useCallback } from "react";
import {
  getNotifications,
  markAllAsRead,
  markRead,
  deleteNotification,
} from "../../api/notifications";
import { useNotifications } from "../../context/NotificationContext";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });
  const { fetchUnreadCount } = useNotifications();

  const fetchNotifications = useCallback(async (page) => {
    try {
      setLoading(true);
      const response = await getNotifications(page);
      const { notifications, totalPages } = response.data.data;
      setNotifications(notifications);
      setPagination({ page, totalPages });
    } catch (err) {
      setError("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      // Refetch notifications and update unread count
      fetchNotifications(pagination.page);
      fetchUnreadCount();
    } catch (err) {
      setError("Failed to mark all as read.");
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await markRead(id);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      fetchUnreadCount();
    } catch (err) {
      setError("Failed to mark notification as read.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((n) => n._id !== id));
      fetchUnreadCount(); // The count might change
    } catch (err) {
      setError("Failed to delete notification.");
    }
  };

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 text-gray-800">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <button
          onClick={handleMarkAllRead}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Mark All as Read
        </button>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-lg shadow-md flex justify-between items-center ${
                n.isRead ? "bg-gray-100" : "bg-white"
              }`}
            >
              <div>
                <p className={!n.isRead ? "font-bold text-gray-500" : "text-gray-500"}>{n.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkOneRead(n._id)}
                    className="text-sm text-blue-500"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n._id)}
                  className="text-sm text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You have no notifications.</p>
      )}

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-center space-x-2">
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
          (p) => (
            <button
              key={p}
              onClick={() => fetchNotifications(p)}
              disabled={p === pagination.page}
              className="px-4 py-2 border rounded disabled:bg-gray-300"
            >
              {p}
            </button>
          )
        )}
      </div>
    </div>
  );
}
