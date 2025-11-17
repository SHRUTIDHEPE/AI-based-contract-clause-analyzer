import { Notification } from "../models/notification.models.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {apiResponse} from "../utils/apiResponse.js";
import {apiError} from "../utils/apiError.js";


// Get paginated notifications for the logged-in user
 const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ userId });

  return res.status(200).json(
    new apiResponse(200, {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  );
});


// Mark a single notification as read
 const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notif = await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );

  if (!notif) throw new apiError(404, "Notification not found");

  return res
    .status(200)
    .json(new apiResponse(200, notif, "Notification marked as read"));
});


// Mark all notifications as read
 const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany({ userId, isRead: false }, { isRead: true });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "All notifications marked as read"));
});


// Delete a notification
 const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await Notification.findByIdAndDelete(id);

  if (!deleted) throw new apiError(404, "Notification not found");

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Notification deleted"));
});


// Get unread count
 const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const count = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  return res
    .status(200)
    .json(new apiResponse(200, { count }, "Unread count fetched"));
});

export {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getUnreadCount,
}
