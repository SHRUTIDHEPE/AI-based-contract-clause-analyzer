import axios from "../utils/axiosInstance";

export const getNotifications = (page = 1, limit = 10) =>
  axios.get(`/notifications?page=${page}&limit=${limit}`);

export const getUnreadNotificationCount = () =>
  axios.get("/notifications/unread/count");

export const markRead = (id) =>
  axios.patch(`/notifications/${id}/read`);

export const markAllAsRead = () =>
  axios.patch("/notifications/read/all");

export const deleteNotification = (id) =>
  axios.delete(`/notifications/${id}`);
