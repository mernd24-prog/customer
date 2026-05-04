import { createApiSlice } from "../createApiSlice";
import { simpleThunks } from "../domainThunks";
export const { fetchAnalytics, trackAnalyticsEvent } = simpleThunks.analytics;
export default createApiSlice({ name: "analytics", thunks: simpleThunks.analytics }).reducer;
