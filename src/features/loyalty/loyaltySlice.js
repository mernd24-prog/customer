import { createApiSlice } from "../createApiSlice";
import { loyaltyThunks } from "../domainThunks";
export const { fetchLoyaltyProfile, fetchLoyaltyBenefits, addLoyaltyPoints, fetchLoyaltyHistory, redeemLoyaltyPoints } = loyaltyThunks;
export default createApiSlice({ name: "loyalty", thunks: loyaltyThunks }).reducer;
