import { createApiSlice } from "../createApiSlice";
import { notificationThunks } from "../domainThunks";

export const { fetchNotifications, createNotification, fetchNotificationPreferences, updateNotificationPreferences } = notificationThunks;

const { fetchNotifications: _, ...otherThunks } = notificationThunks;

const notificationSlice = createApiSlice({ 
  name: "notification", 
  thunks: otherThunks,
  reducers: {
    markAsRead: (state, action) => {
      const id = action.payload;
      const notif = state.list.find(n => n.id === id || n._id === id);
      if (notif) {
        notif.read = true;
        notif.isRead = true;
      }
      
      try {
        const readIds = JSON.parse(localStorage.getItem("read_notifications") || "[]");
        if (!readIds.includes(id)) {
          readIds.push(id);
          // Keep only the latest 200 read IDs to prevent localStorage bloat
          if (readIds.length > 200) {
            readIds.shift();
          }
          localStorage.setItem("read_notifications", JSON.stringify(readIds));
        }
      } catch (e) {
        console.error("Could not persist read notification", e);
      }
    }
  },
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
        
        let readIds = [];
        try {
          readIds = JSON.parse(localStorage.getItem("read_notifications") || "[]");
        } catch (e) {}

        // Sync local storage read state
        newItems.forEach(item => {
          if (readIds.includes(item.id) || readIds.includes(item._id)) {
            item.read = true;
            item.isRead = true;
          }
        });

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
});

export const { markAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
