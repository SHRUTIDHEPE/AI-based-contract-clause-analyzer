import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { getUnreadNotificationCount } from "../api/notifications";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error("Failed to fetch unread notification count", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();

    // Fetch count every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const value = {
    unreadCount,
    fetchUnreadCount, // Expose to allow manual refresh
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
