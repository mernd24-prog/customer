import { createApiSlice } from "../createApiSlice";
import { warrantyThunks } from "../domainThunks";
export const { fetchProductWarranty, registerWarranty, fetchWarrantyById, fetchOrderWarranties, fetchCustomerWarranties, claimWarranty } = warrantyThunks;
export default createApiSlice({ name: "warranty", thunks: warrantyThunks }).reducer;
