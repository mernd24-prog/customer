import { createApiSlice } from "../createApiSlice";
import { orderThunks, paymentThunks } from "../domainThunks";
export const { createOrder } = orderThunks;
export const { initiatePayment, verifyPayment } = paymentThunks;
export default createApiSlice({ name: "checkout", thunks: { createOrder, initiatePayment, verifyPayment } }).reducer;
