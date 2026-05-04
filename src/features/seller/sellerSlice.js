import { createApiSlice } from "../createApiSlice";
import { sellerThunks } from "../domainThunks";
export const { submitSellerKyc, updateSellerOnboardingProfile, fetchSellerWebStatus, fetchSellerWebTracking, fetchSellerWebTrackingOrder, fetchSellerProfile, updateSellerProfile, updateSellerBusinessAddress, updateSellerPickupAddress, updateSellerBankDetails, updateSellerMoreInfo, updateSellerSettings, fetchSellerDashboard, createSellerSubAdmin, fetchSellerSubAdmins, updateSellerSubAdminModules } = sellerThunks;
export default createApiSlice({ name: "seller", thunks: sellerThunks }).reducer;
