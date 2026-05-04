import { createApiSlice } from "../createApiSlice";
import { pricingThunks } from "../domainThunks";
export const { fetchCoupons, createCoupon, fetchCouponById, updateCoupon, deleteCoupon } = pricingThunks;
export default createApiSlice({ name: "pricing", thunks: pricingThunks }).reducer;
