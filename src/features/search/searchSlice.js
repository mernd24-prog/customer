import { createSlice } from "@reduxjs/toolkit";
import { searchThunks } from "../domainThunks";

const getSuggestionLabel = (suggestion) => {
  if (typeof suggestion === "string") return suggestion;
  if (!suggestion || typeof suggestion !== "object") return "";

  return (
    suggestion.title ||
    suggestion.name ||
    suggestion.query ||
    suggestion.keyword ||
    suggestion.label ||
    suggestion.productName ||
    suggestion.brandName ||
    suggestion.categoryName ||
    ""
  );
};

const extractSuggestions = (data) => {
  const source = Array.isArray(data)
    ? data
    : data?.suggestions ||
      data?.items ||
      data?.results ||
      data?.hits ||
      data?.products ||
      data?.list ||
      [];

  const seen = new Set();

  return source.filter((suggestion) => {
    const label = getSuggestionLabel(suggestion).trim().toLowerCase();
    if (!label || seen.has(label)) return false;
    seen.add(label);
    return true;
  });
};

const initialState = {
  hits: [],
  facets: null,
  suggestions: [],
  meta: null,
  loading: false,
  autocompleteLoading: false,
  autocompleteRequestId: null,
  error: null,
  lastQuery: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearSearch: () => initialState,
    clearSuggestions: (state) => {
      state.suggestions = [];
      state.autocompleteLoading = false;
      state.autocompleteRequestId = null;
    },
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
        const limit = Number(data.limit ?? action.payload.meta?.limit ?? action.payload.arg?.params?.limit ?? 20);
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
      .addCase(searchThunks.searchAutocomplete.pending, (state, action) => {
        state.autocompleteLoading = true;
        state.autocompleteRequestId = action.meta.requestId;
      })
      .addCase(searchThunks.searchAutocomplete.fulfilled, (state, action) => {
        if (state.autocompleteRequestId !== action.meta.requestId) return;

        state.autocompleteLoading = false;
        state.autocompleteRequestId = null;
        const data = action.payload.data;
        state.suggestions = extractSuggestions(data);
      })
      .addCase(searchThunks.searchAutocomplete.rejected, (state, action) => {
        if (state.autocompleteRequestId !== action.meta.requestId) return;

        state.autocompleteLoading = false;
        state.autocompleteRequestId = null;
        state.suggestions = [];
      });
  },
});

export const { clearSearch, clearSuggestions } = searchSlice.actions;
export const { searchCatalog, searchAutocomplete } = searchThunks;
export default searchSlice.reducer;
