import { createApiSlice } from "../createApiSlice";
import { cartThunks } from "../domainThunks";
export const { fetchCart, updateCart } = cartThunks;
export default createApiSlice({ name: "cart", thunks: cartThunks }).reducer;
