import { createApiSlice } from "../../../features/createApiSlice";
import { orderThunks } from "../../../features/domainThunks";
export const { quoteOrder, createOrder, fetchMyOrders,
     fetchSellerOrders, fetchOrderById, 
     cancelOrder, updateOrderStatus, retryOrderPayment } = orderThunks;
export default createApiSlice({ name: "order", thunks: orderThunks }).reducer;
