import { createSlice } from "@reduxjs/toolkit";
import { recommendationThunks } from "../domainThunks";

export const {
  fetchRecommendations,
  trackRecommendationInteraction,
  fetchTrendingProducts,
} = recommendationThunks;

const initialState = {
  list: [],
  trendingList: [],
  interaction: null,
  loading: false,
  loadingRecommendations: false,
  loadingTrending: false,
  error: null,
  recommendationsError: null,
  trendingError: null,
  lastFetchedAt: null,
};

const recommendationSlice = createSlice({
  name: "recommendation",
  initialState,
  reducers: {
    clearRecommendationErrors: (state) => {
      state.error = null;
      state.recommendationsError = null;
      state.trendingError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loadingRecommendations = true;
        state.loading = true;
        state.error = null;
        state.recommendationsError = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loadingRecommendations = false;
        state.loading = state.loadingTrending;
        state.lastFetchedAt = Date.now();
        const data = action.payload?.data;
        state.list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : [];
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        const message = action.payload || action.error?.message || "Failed to load recommendations";
        state.loadingRecommendations = false;
        state.loading = state.loadingTrending;
        state.error = message;
        state.recommendationsError = message;
      })
      .addCase(fetchTrendingProducts.pending, (state) => {
        state.loadingTrending = true;
        state.loading = true;
        state.error = null;
        state.trendingError = null;
      })
      .addCase(fetchTrendingProducts.fulfilled, (state, action) => {
        state.loadingTrending = false;
        state.loading = state.loadingRecommendations;
        state.lastFetchedAt = Date.now();
        const data = action.payload?.data;
        state.trendingList = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : [];
      })
      .addCase(fetchTrendingProducts.rejected, (state, action) => {
        const message = action.payload || action.error?.message || "Failed to load trending products";
        state.loadingTrending = false;
        state.loading = state.loadingRecommendations;
        state.error = message;
        state.trendingError = message;
      })
      .addCase(trackRecommendationInteraction.fulfilled, (state, action) => {
        state.interaction = action.payload?.data || null;
      });
  },
});

export const { clearRecommendationErrors } = recommendationSlice.actions;
export default recommendationSlice.reducer;
