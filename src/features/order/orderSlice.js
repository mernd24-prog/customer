import { createApiSlice } from "../createApiSlice";
import { orderThunks } from "../domainThunks";
export const { createOrder, fetchMyOrders, fetchSellerOrders, fetchOrderById, cancelOrder, updateOrderStatus } = orderThunks;
export default createApiSlice({ name: "order", thunks: orderThunks }).reducer;
