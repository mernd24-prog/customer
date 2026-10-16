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

const unwrapListPayload = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const candidates = [
    value.items,
    value.list,
    value.categories,
    value.results,
    value.hits,
    value.products,
    value.returns,
    value.returnRequests,
    value.return_requests,
    value.category,
    value.children,
    value.childCategories,
    value.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === "object") {
      const nested = unwrapListPayload(candidate);
      if (nested.length) return nested;
    }
  }

  if (value.category && typeof value.category === "object") {
    return [value.category];
  }

  return [];
};

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
      if (config.onSuccess) await config.onSuccess(result);
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
  setCurrentFromList = true,
  initialState = {},
  thunkReducers = {},
}) {
  const resolvedInitialState = { ...defaultInitialState, ...initialState };
  const slice = createSlice({
    name,
    initialState: resolvedInitialState,
    reducers: {
      resetState: () => resolvedInitialState,
      clearError: (state) => {
        state.error = null;
      },
      ...reducers,
    },
    extraReducers: (builder) => {
      Object.entries(thunks).forEach(([thunkName, thunk]) => {
        if (!thunk || !thunk.pending) return;
        const dedicatedReducers = thunkReducers[thunkName];

        builder
          .addCase(thunk.pending, (state, action) => {
            dedicatedReducers?.pending?.(state, action);
            if (dedicatedReducers?.skipDefault) return;
            state.loading = true;
            state.error = null;
          })
          .addCase(thunk.fulfilled, (state, action) => {
            dedicatedReducers?.fulfilled?.(state, action);
            if (dedicatedReducers?.skipDefault) return;
            state.loading = false;
            state.meta = action.payload?.meta || null;
            state.lastFetchedAt = Date.now();
            const data = action.payload?.data;

            if (Array.isArray(data)) {
              state.list = data;
              state.entities = Object.fromEntries(
                data.map((item, index) => [idOf(item) ?? index, item]),
              );
            } else if (data?.orders && Array.isArray(data.orders)) {
              state.list = data.orders;
              state.current = data;
              state.entities = Object.fromEntries(
                data.orders.map((item, index) => [idOf(item) ?? index, item]),
              );
            } else if (data?.returns && Array.isArray(data.returns)) {
              state.list = data.returns;
              state.current = data;
              state.entities = Object.fromEntries(
                data.returns.map((item, index) => [idOf(item) ?? index, item]),
              );
            } else if (data?.returnRequests && Array.isArray(data.returnRequests)) {
              state.list = data.returnRequests;
              state.current = data;
              state.entities = Object.fromEntries(
                data.returnRequests.map((item, index) => [idOf(item) ?? index, item]),
              );
            } else if (data?.return_requests && Array.isArray(data.return_requests)) {
              state.list = data.return_requests;
              state.current = data;
              state.entities = Object.fromEntries(
                data.return_requests.map((item, index) => [idOf(item) ?? index, item]),
              );
            } else if (idOf(data) !== undefined && idOf(data) !== null) {
              state.current = data;
              const keys = [
                idOf(data),
                data?.slug,
                action.payload?.arg?.slug,
                action.meta?.arg?.slug,
                action.payload?.arg?.id,
                action.meta?.arg?.id,
                action.payload?.arg?.productId,
                action.meta?.arg?.productId,
              ].filter((key) => key !== undefined && key !== null);
              keys.forEach((key) => {
                state.entities[key] = data;
              });
            } else {
              const list = unwrapListPayload(data);
              if (list.length) {
                state.list = list;
                if (setCurrentFromList) {
                  state.current = data;
                }
                state.entities = Object.fromEntries(
                  list.map((item, index) => [idOf(item) ?? index, item]),
                );
              } else if (data !== undefined && data !== null) {
                state.current = data;
              }
            }
          })
          .addCase(thunk.rejected, (state, action) => {
            dedicatedReducers?.rejected?.(state, action);
            if (dedicatedReducers?.skipDefault) return;
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
