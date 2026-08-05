import { createApiSlice, defaultInitialState } from "../createApiSlice";
import { cartThunks } from "../domainThunks";

export const { fetchCart, updateCart } = cartThunks;

const cartSlice = createApiSlice({
  name: "cart",
  thunks: cartThunks,
  reducers: {
    setGuestCart: (state, action) => {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Clear cart when any user logs out so the next user starts fresh
    builder.addCase("auth/logout", () => defaultInitialState);
  },
});

export const { setGuestCart, resetState, clearError } = cartSlice.actions;
export default cartSlice.reducer;
