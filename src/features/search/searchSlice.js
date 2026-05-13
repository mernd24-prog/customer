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
      .addCase(searchThunks.searchElastic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchThunks.searchElastic.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data || {};
        state.hits = data.hits || data.products || data.results || (Array.isArray(data) ? data : []);
        state.facets = data.facets || null;
        state.meta = action.payload.meta;
        state.lastQuery = action.payload.arg;
      })
      .addCase(searchThunks.searchElastic.rejected, (state, action) => {
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
export const { searchElastic, searchAutocomplete } = searchThunks;
export default searchSlice.reducer;
