import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../api/client";

export const defaultInitialState = {
  entities: {},
  list: [],
  current: null,
  meta: null,
  loading: false,
  error: null,
  lastFetchedAt: null
};

const idOf = (item) => item?.id || item?._id || item?.productId || item?.orderId || item?.slug || item?.categoryKey;

export function makeThunk(type, config) {
  return createAsyncThunk(type, async (arg = {}, { rejectWithValue }) => {
    try {
      const params = typeof config.params === "function" ? config.params(arg) : config.params || arg?.params;
      const data = typeof config.data === "function" ? config.data(arg) : config.data || arg?.data || arg;
      const url = typeof config.url === "function" ? config.url(arg) : config.url;
      const result = await apiRequest({
        method: config.method || "get",
        url,
        data,
        params,
        cache: config.cache || arg?.cache,
        cacheTtl: config.cacheTtl || arg?.cacheTtl,
        cacheKey:
          typeof config.cacheKey === "function"
            ? config.cacheKey(arg)
            : config.cacheKey || arg?.cacheKey,
      });
      return { ...result, arg };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });
}

export function createApiSlice({ name, thunks = {}, extraReducers, reducers = {} }) {
  const slice = createSlice({
    name,
    initialState: defaultInitialState,
    reducers: {
      resetState: () => defaultInitialState,
      clearError: (state) => {
        state.error = null;
      },
      ...reducers
    },
    extraReducers: (builder) => {
      Object.values(thunks).forEach((thunk) => {
        builder
          .addCase(thunk.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(thunk.fulfilled, (state, action) => {
            state.loading = false;
            state.meta = action.payload.meta;
            state.lastFetchedAt = Date.now();
            const data = action.payload.data;
            if (Array.isArray(data)) {
              state.list = data;
              state.entities = Object.fromEntries(data.map((item, index) => [idOf(item) || index, item]));
            } else if (data?.items && Array.isArray(data.items)) {
              state.list = data.items;
              state.current = data;
              state.entities = Object.fromEntries(data.items.map((item, index) => [idOf(item) || index, item]));
            } else if (data?.orders && Array.isArray(data.orders)) {
              state.list = data.orders;
              state.current = data;
              state.entities = Object.fromEntries(data.orders.map((item, index) => [idOf(item) || index, item]));
            } else {
              state.current = data;
              const key = idOf(data);
              if (key) state.entities[key] = data;
            }
          })
          .addCase(thunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || action.error.message;
          });
      });
      if (extraReducers) extraReducers(builder);
    }
  });

  return {
    reducer: slice.reducer,
    actions: slice.actions
  };
}
