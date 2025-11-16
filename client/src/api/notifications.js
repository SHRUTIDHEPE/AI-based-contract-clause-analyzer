import axios from "../utils/axiosInstance";

export const getNotifications = () =>
  axios.get("/notifications");

export const markRead = (id) =>
  axios.patch(`/notifications/${id}/read`);
