import express from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notifications.controllers.js";

const router = express.Router();

// GET notifications with pagination
router.get("/", verifyJWT, getNotifications);

// GET unread count
router.get("/unread/count", verifyJWT, getUnreadCount);

// Mark one as read
router.patch("/:id/read", verifyJWT, markNotificationRead);

// Mark all as read
router.patch("/read/all", verifyJWT, markAllNotificationsRead);

// Delete a notification
router.delete("/:id", verifyJWT, deleteNotification);

export default router;
