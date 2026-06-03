import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../api/client";

export const defaultInitialState = {
  entities: {},
  list: [],
  current: null,
  meta: null,
  loading: false,
  error: null,
  lastFetchedAt: null,
};

const idOf = (item) =>
  item?.id ||
  item?._id ||
  item?.productId ||
  item?.orderId ||
  item?.slug ||
  item?.cmsKey ||
  item?.metadata?.cmsKey ||
  item?.metadata?.data?.cmsKey ||
  item?.data?.cmsKey ||
  item?.categoryKey;

export function makeThunk(type, config) {
  return createAsyncThunk(type, async (arg = {}, { rejectWithValue }) => {
    try {
      const method = config.method || "get";

      const params =
        typeof config.params === "function"
          ? config.params(arg)
          : config.params !== undefined
            ? config.params
            : arg?.params;

      let data;
      if (typeof config.data === "function") {
        data = config.data(arg);
      } else if (config.data !== undefined) {
        data = config.data;
      } else if (arg?.data !== undefined) {
        data = arg.data;
      } else if (method.toLowerCase() !== "get") {
        data = arg;
      }

      const url =
        typeof config.url === "function" ? config.url(arg) : config.url;

      const result = await apiRequest({
        method,
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

export function createApiSlice({
  name,
  thunks = {},
  extraReducers,
  reducers = {},
}) {
  const slice = createSlice({
    name,
    initialState: defaultInitialState,
    reducers: {
      resetState: () => defaultInitialState,
      clearError: (state) => {
        state.error = null;
      },
      ...reducers,
    },
    extraReducers: (builder) => {
      Object.values(thunks).forEach((thunk) => {
        // Skip if thunk doesn't have a valid action creator
        if (!thunk || !thunk.pending) return;

        builder
          .addCase(thunk.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(thunk.fulfilled, (state, action) => {
            state.loading = false;
            state.meta = action.payload?.meta || null;
            state.lastFetchedAt = Date.now();
            const data = action.payload?.data;

            if (Array.isArray(data)) {
              state.list = data;
              state.entities = Object.fromEntries(
                data.map((item, index) => [idOf(item) ?? index, item]),
              );
            } else if (
              Array.isArray(data?.items) ||
              Array.isArray(data?.results) ||
              Array.isArray(data?.hits) ||
              Array.isArray(data?.products) ||
              Array.isArray(data?.list)
            ) {
              const list =
                data.items ||
                data.results ||
                data.hits ||
                data.products ||
                data.list ||
                [];
              state.list = list;
              state.current = data;
              state.entities = Object.fromEntries(
                list.map((item, index) => [idOf(item) ?? index, item]),
              );
            } else if (data?.orders && Array.isArray(data.orders)) {
              state.list = data.orders;
              state.current = data;
              state.entities = Object.fromEntries(
                data.orders.map((item, index) => [idOf(item) ?? index, item]),
              );
            } else if (data !== undefined && data !== null) {
              state.current = data;
              const keys = [
                idOf(data),
                data?.slug,
                action.payload?.arg?.slug,
                action.meta?.arg?.slug,
                action.payload?.arg?.id,
                action.meta?.arg?.id,
              ].filter((key) => key !== undefined && key !== null);
              keys.forEach((key) => {
                state.entities[key] = data;
              });
            }
          })
          .addCase(thunk.rejected, (state, action) => {
            state.loading = false;
            state.error =
              action.payload || action.error?.message || "An error occurred";
          });
      });
      if (extraReducers) extraReducers(builder);
    },
  });

  return {
    reducer: slice.reducer,
    actions: slice.actions,
  };
}
