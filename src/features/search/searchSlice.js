import { createSlice } from "@reduxjs/toolkit";
import { searchThunks } from "../domainThunks";

const initialState = {
  hits: [],
  facets: null,
  suggestions: [],
  meta: null,
  loading: false,
  autocompleteLoading: false,
  error: null,
  lastQuery: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearSearch: () => initialState,
    clearSuggestions: (state) => { state.suggestions = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchThunks.searchCatalog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchThunks.searchCatalog.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data || {};
        state.hits = data.hits || data.products || data.results || (Array.isArray(data) ? data : []);
        state.facets = data.facets || null;
        const total = Number(data.total ?? action.payload.meta?.total ?? state.hits.length);
        const limit = Number(data.limit ?? action.payload.meta?.limit ?? action.payload.arg?.params?.limit ?? 12);
        state.meta = {
          ...(action.payload.meta || {}),
          page: Number(data.page ?? action.payload.meta?.page ?? action.payload.arg?.params?.page ?? 1),
          limit,
          total,
          totalPages: Number(
            data.totalPages ??
              action.payload.meta?.totalPages ??
              Math.max(1, Math.ceil(total / Math.max(1, limit))),
          ),
          source: data.source || action.payload.meta?.source || "elasticsearch",
        };
        state.lastQuery = action.payload.arg;
      })
      .addCase(searchThunks.searchCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(searchThunks.searchAutocomplete.pending, (state) => {
        state.autocompleteLoading = true;
      })
      .addCase(searchThunks.searchAutocomplete.fulfilled, (state, action) => {
        state.autocompleteLoading = false;
        const data = action.payload.data;
        state.suggestions = Array.isArray(data) ? data : data?.suggestions || [];
      })
      .addCase(searchThunks.searchAutocomplete.rejected, (state) => {
        state.autocompleteLoading = false;
        state.suggestions = [];
      });
  },
});

export const { clearSearch, clearSuggestions } = searchSlice.actions;
export const { searchCatalog, searchAutocomplete } = searchThunks;
export default searchSlice.reducer;
