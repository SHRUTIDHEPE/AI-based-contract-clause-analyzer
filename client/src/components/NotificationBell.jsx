import React from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <Link to="/notifications" className="relative">
      <div className="notif-bell text-2xl">
        <span>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
}
