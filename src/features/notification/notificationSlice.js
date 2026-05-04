import { createApiSlice } from "../createApiSlice";
import { notificationThunks } from "../domainThunks";
export const { fetchNotifications, createNotification, fetchNotificationPreferences, updateNotificationPreferences } = notificationThunks;
export default createApiSlice({ name: "notification", thunks: notificationThunks }).reducer;
