import { createApiSlice } from "../createApiSlice";
import { badgeThunks } from "../domainThunks";

export const { fetchBadges, fetchActiveBadges, fetchBadge } = badgeThunks;

export default createApiSlice({ name: "badges", thunks: badgeThunks }).reducer;
