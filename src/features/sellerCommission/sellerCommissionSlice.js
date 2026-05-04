import { createApiSlice } from "../createApiSlice";
import { sellerCommissionThunks } from "../domainThunks";
export const { fetchMyCommissions, fetchMyPayouts, calculateCommission, processPayouts, fetchSettlements } = sellerCommissionThunks;
export default createApiSlice({ name: "sellerCommission", thunks: sellerCommissionThunks }).reducer;
