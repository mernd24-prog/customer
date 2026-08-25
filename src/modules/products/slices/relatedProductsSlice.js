import { createSlice } from "@reduxjs/toolkit";
import { makeThunk } from "../../../features/createApiSlice";
import { PRODUCT_API_ENDPOINTS } from "../routes/apiRoutes";

const q = (arg) => arg?.params || arg;

export const fetchRelatedProducts = makeThunk("relatedProducts/fetchRelated", {
  url: ({ productId }) => PRODUCT_API_ENDPOINTS.related(productId),
  params: q,
  cache: true,
  cacheTtl: 120000,
});

export const fetchCrossSellProducts = makeThunk("relatedProducts/fetchCrossSell", {
  url: ({ productId }) => PRODUCT_API_ENDPOINTS.crossSell(productId),
  params: q,
  cache: true,
  cacheTtl: 120000,
});

export const fetchUpSellProducts = makeThunk("relatedProducts/fetchUpSell", {
  url: ({ productId }) => PRODUCT_API_ENDPOINTS.upSell(productId),
  params: q,
  cache: true,
  cacheTtl: 120000,
});

const extractItems = (payload) => {
  const data = payload?.data?.data || payload?.data || {};
  return data.items || data.list || (Array.isArray(data) ? data : []);
};

const initialState = {
  relatedByProduct: {},
  crossSellByProduct: {},
  upSellByProduct: {},
};

const relatedProductsSlice = createSlice({
  name: "relatedProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRelatedProducts.pending, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (pid) state.relatedByProduct[pid] = { items: [], loading: true, error: null };
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (pid) state.relatedByProduct[pid] = { items: extractItems(action.payload), loading: false, error: null };
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (pid) state.relatedByProduct[pid] = { items: [], loading: false, error: action.payload || "Failed" };
      });

    builder
      .addCase(fetchCrossSellProducts.pending, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (pid) state.crossSellByProduct[pid] = { items: [], loading: true, error: null };
      })
      .addCase(fetchCrossSellProducts.fulfilled, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (pid) state.crossSellByProduct[pid] = { items: extractItems(action.payload), loading: false, error: null };
      })
      .addCase(fetchCrossSellProducts.rejected, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (pid) state.crossSellByProduct[pid] = { items: [], loading: false, error: action.payload || "Failed" };
      });

    builder
      .addCase(fetchUpSellProducts.pending, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (pid) state.upSellByProduct[pid] = { items: [], loading: true, error: null };
      })
      .addCase(fetchUpSellProducts.fulfilled, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (pid) state.upSellByProduct[pid] = { items: extractItems(action.payload), loading: false, error: null };
      })
      .addCase(fetchUpSellProducts.rejected, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (pid) state.upSellByProduct[pid] = { items: [], loading: false, error: action.payload || "Failed" };
      });
  },
});

export default relatedProductsSlice.reducer;
