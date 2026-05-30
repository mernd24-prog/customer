import { createApiSlice } from "../createApiSlice";
import { paymentThunks } from "../domainThunks";
export const { fetchPayments, fetchPaymentOptions, initiatePayment, verifyPayment } = paymentThunks;
export default createApiSlice({ name: "payment", thunks: paymentThunks }).reducer;
