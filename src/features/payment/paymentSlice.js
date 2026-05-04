import { createApiSlice } from "../createApiSlice";
import { paymentThunks } from "../domainThunks";
export const { fetchPayments, initiatePayment, verifyPayment } = paymentThunks;
export default createApiSlice({ name: "payment", thunks: paymentThunks }).reducer;
