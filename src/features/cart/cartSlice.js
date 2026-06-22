import { createApiSlice, defaultInitialState } from "../createApiSlice";
import { cartThunks } from "../domainThunks";

export const { fetchCart, updateCart } = cartThunks;

export default createApiSlice({
  name: "cart",
  thunks: cartThunks,
  extraReducers: (builder) => {
    // Clear cart when any user logs out so the next user starts fresh
    builder.addCase("auth/logout", () => defaultInitialState);
  },
}).reducer;
