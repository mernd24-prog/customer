import { createSlice } from "@reduxjs/toolkit";
import { reviewThunks } from "../domainThunks";

export const {
  fetchProductReviews,
  submitProductReview,
  fetchMyProductReview,
  markReviewHelpful,
  deleteMyReview,
} = reviewThunks;

const initialState = {
  reviewsByProduct: {},
  statsByProduct: {},
  myReviewByProduct: {},
  submitting: false,
  submitError: null,
  submitSuccess: false,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.submitting = false;
      state.submitError = null;
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch reviews list
    builder
      .addCase(fetchProductReviews.pending, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (pid && !state.reviewsByProduct[pid]) {
          state.reviewsByProduct[pid] = { items: [], total: 0, loading: true, error: null };
        } else if (pid) {
          state.reviewsByProduct[pid].loading = true;
          state.reviewsByProduct[pid].error = null;
        }
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (!pid) return;
        const data = action.payload?.data;
        const items = data?.items || data?.list || (Array.isArray(data) ? data : []);
        const total =
          action.payload?.meta?.pagination?.total ??
          action.payload?.meta?.total ??
          data?.pagination?.total ??
          data?.total ??
          items.length;
        const stats = action.payload?.meta?.stats || data?.stats || null;
        state.reviewsByProduct[pid] = { items, total, loading: false, error: null };
        if (stats) state.statsByProduct[pid] = stats;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (!pid) return;
        if (!state.reviewsByProduct[pid]) state.reviewsByProduct[pid] = { items: [], total: 0 };
        state.reviewsByProduct[pid].loading = false;
        state.reviewsByProduct[pid].error = action.payload || "Failed to load reviews";
      });

    // My review
    builder
      .addCase(fetchMyProductReview.fulfilled, (state, action) => {
        const pid = action.meta.arg?.productId;
        if (pid) state.myReviewByProduct[pid] = action.payload?.data || null;
      });

    // Submit review
    builder
      .addCase(submitProductReview.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(submitProductReview.fulfilled, (state) => {
        state.submitting = false;
        state.submitSuccess = true;
      })
      .addCase(submitProductReview.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload || "Failed to submit review";
      });

    // Helpful vote — update in place
    builder
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const pid = action.meta.arg?.productId;
        const rid = action.meta.arg?.reviewId;
        const updated = action.payload?.data;
        if (!pid || !rid || !updated) return;
        const bucket = state.reviewsByProduct[pid];
        if (bucket) {
          bucket.items = bucket.items.map((r) =>
            (r._id || r.id) === rid ? { ...r, ...updated } : r,
          );
        }
      });

    // Delete own review — remove from list
    builder
      .addCase(deleteMyReview.fulfilled, (state, action) => {
        const pid = action.meta.arg?.productId;
        const rid = action.meta.arg?.reviewId;
        if (!pid || !rid) return;
        const bucket = state.reviewsByProduct[pid];
        if (bucket) {
          bucket.items = bucket.items.filter((r) => (r._id || r.id) !== rid);
          bucket.total = Math.max(0, bucket.total - 1);
        }
        state.myReviewByProduct[pid] = null;
      });
  },
});

export const { resetSubmitState } = reviewSlice.actions;
export default reviewSlice.reducer;
