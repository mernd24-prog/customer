import { createApiSlice } from "../createApiSlice";
import { orderThunks, paymentThunks } from "../domainThunks";
export const { createOrder } = orderThunks;
export const { fetchPaymentOptions, initiatePayment, verifyPayment } = paymentThunks;
export default createApiSlice({ name: "checkout", thunks: { createOrder, fetchPaymentOptions, initiatePayment, verifyPayment } }).reducer;
