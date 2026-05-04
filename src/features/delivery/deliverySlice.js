import { createApiSlice } from "../createApiSlice";
import { deliveryThunks } from "../domainThunks";
export const { checkServiceability, fetchEwayBillByOrder, createEwayBill, updateEwayBillStatus } = deliveryThunks;
export default createApiSlice({ name: "delivery", thunks: deliveryThunks }).reducer;
