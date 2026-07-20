import { createApiSlice } from "../createApiSlice";
import { notificationThunks } from "../domainThunks";

export const { fetchNotifications, createNotification, fetchNotificationPreferences, updateNotificationPreferences } = notificationThunks;

const { fetchNotifications: _, ...otherThunks } = notificationThunks;

export default createApiSlice({ 
  name: "notification", 
  thunks: otherThunks,
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.meta = action.payload?.meta || null;
        state.lastFetchedAt = Date.now();
        const data = action.payload?.data;
        
        const pageArg = action.meta?.arg?.page || action.payload?.arg?.page || action.meta?.arg?.params?.page || action.payload?.arg?.params?.page;
        const isPageOne = !pageArg || pageArg === 1;
        const newItems = Array.isArray(data) ? data : (data?.list || data?.items || data?.results || []);

        if (isPageOne) {
          state.list = newItems;
        } else {
          // Prevent duplicates if API returns the same item
          const existingIds = new Set(state.list.map(item => item._id || item.id));
          const uniqueNewItems = newItems.filter(item => !existingIds.has(item._id || item.id));
          state.list = [...(state.list || []), ...uniqueNewItems];
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "An error occurred";
      });
  }
}).reducer;
