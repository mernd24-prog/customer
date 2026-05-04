import { createApiSlice } from "../createApiSlice";
import { subscriptionThunks } from "../domainThunks";
export const { fetchSubscriptionPlans, purchaseSubscription, fetchMySubscriptions, pauseSubscription, resumeSubscription, cancelSubscription, createAdminSubscriptionPlan, fetchAdminSubscriptionPlans, updateAdminSubscriptionPlan, deleteAdminSubscriptionPlan } = subscriptionThunks;
export default createApiSlice({ name: "subscription", thunks: subscriptionThunks }).reducer;
