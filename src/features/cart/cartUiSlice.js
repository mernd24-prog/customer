import { createSlice } from "@reduxjs/toolkit";
import { getProductId } from "../../utils/ecommerce";

const initialState = {
  addedModalOpen: false,
  addedProduct: null,
};

const cartUiSlice = createSlice({
  name: "cartUi",
  initialState,
  reducers: {
    openAddedToCartModal(state, action) {
      const product = action.payload?.product || null;
      state.addedModalOpen = true;
      state.addedProduct = product
        ? {
            ...product,
            _modalId: getProductId(product),
          }
        : null;
    },
    closeAddedToCartModal(state) {
      state.addedModalOpen = false;
    },
  },
});

export const { openAddedToCartModal, closeAddedToCartModal } = cartUiSlice.actions;
export default cartUiSlice.reducer;

