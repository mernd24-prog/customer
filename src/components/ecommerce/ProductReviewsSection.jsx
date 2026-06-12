import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Star, ThumbsUp, Trash2, ChevronDown } from "lucide-react";
import {
  fetchProductReviews,
  submitProductReview,
  fetchMyProductReview,
  markReviewHelpful,
  deleteMyReview,
  resetSubmitState,
} from "../../features/review/reviewSlice";
import { fetchMyOrders } from "../../features/order/orderSlice";

// ── Helpers ───────────────────────────────────────────────────────────────────

function StarInput({ value, onChange, size = 28 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={n <= (hovered || value) ? "fill-gold text-gold" : "fill-border text-border"}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = 14 }) {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < stars ? "fill-gold text-gold" : "fill-border text-border"}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-right text-gray shrink-0">{label}★</span>
      <div className="flex-1 h-2 bg-surface-soft rounded-full overflow-hidden">
        <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-gray shrink-0">{count}</span>
    </div>
  );
}

function ReviewCard({ review, currentUserId, productId, onHelpful, onDelete }) {
  const isOwn = currentUserId && String(review.buyerId) === String(currentUserId);
  const alreadyVoted = (review.helpfulVotedBy || []).includes(String(currentUserId || ""));
  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "";

  return (
    <div className="panel flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gold-soft flex items-center justify-center font-bold text-gold-dark text-sm shrink-0">
            {String(review.buyerId || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              {review.buyerName || "Verified Buyer"}
            </p>
            <p className="text-xs text-gray">{dateStr}</p>
          </div>
        </div>
        <StarDisplay rating={review.rating} />
      </div>

      {review.title && (
        <p className="text-sm font-semibold text-ink">{review.title}</p>
      )}
      {review.reviewText && (
        <p className="text-sm text-muted leading-relaxed">{review.reviewText}</p>
      )}

      {review.media?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.media.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="h-16 w-16 rounded-lg object-cover border border-border"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ))}
        </div>
      )}

      {review.adminReply?.text && (
        <div className="bg-surface-soft rounded-lg p-3 border-l-2 border-gold">
          <p className="text-xs font-semibold text-gold-dark mb-1">Seller Response</p>
          <p className="text-xs text-muted">{review.adminReply.text}</p>
        </div>
      )}

      <div className="flex items-center gap-4 pt-1 border-t border-border">
        <button
          type="button"
          onClick={() => onHelpful(review._id || review.id)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            alreadyVoted ? "text-gold font-medium" : "text-gray hover:text-ink"
          }`}
        >
          <ThumbsUp size={13} className={alreadyVoted ? "fill-gold" : ""} />
          Helpful {review.helpfulVotes > 0 ? `(${review.helpfulVotes})` : ""}
        </button>
        {isOwn && (
          <button
            type="button"
            onClick={() => onDelete(review._id || review.id)}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 ml-auto transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ── Write-review form ─────────────────────────────────────────────────────────

function WriteReviewForm({ productId, deliveredOrders, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting, submitError, submitSuccess } = useSelector((s) => s.review);

  const [form, setForm] = useState({
    orderId: deliveredOrders[0]?.id || deliveredOrders[0]?.orderId || "",
    rating: 0,
    title: "",
    reviewText: "",
  });

  useEffect(() => {
    if (submitSuccess) {
      onSuccess();
      dispatch(resetSubmitState());
    }
  }, [submitSuccess, dispatch, onSuccess]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.rating) return;
    dispatch(submitProductReview({
      productId,
      orderId:    form.orderId,
      rating:     form.rating,
      title:      form.title.trim(),
      reviewText: form.reviewText.trim(),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="panel flex flex-col gap-4">
      <h3 className="text-base font-bold text-ink">Write a Review</h3>

      {deliveredOrders.length > 1 && (
        <div>
          <label className="text-xs font-semibold text-gray uppercase tracking-wide mb-1 block">
            Select Order
          </label>
          <select
            value={form.orderId}
            onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
            className="w-full border border-border-strong rounded-[6px] px-3 py-2 text-sm"
          >
            {deliveredOrders.map((o) => {
              const id = o.id || o.orderId;
              return (
                <option key={id} value={id}>
                  Order #{o.orderNumber || id?.slice(-8)}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-gray uppercase tracking-wide mb-2 block">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <StarInput
          value={form.rating}
          onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray uppercase tracking-wide mb-1 block">
          Title
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          maxLength={200}
          placeholder="Summarise your review"
          className="w-full border border-border-strong rounded-[6px] px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray uppercase tracking-wide mb-1 block">
          Review
        </label>
        <textarea
          rows={4}
          value={form.reviewText}
          onChange={(e) => setForm((f) => ({ ...f, reviewText: e.target.value }))}
          maxLength={2000}
          placeholder="Share your experience with this product…"
          className="w-full border border-border-strong rounded-[6px] px-3 py-2 text-sm resize-none"
        />
        <p className="text-xs text-gray text-right">{form.reviewText.length}/2000</p>
      </div>

      {submitError && (
        <p className="text-xs text-red-600 rounded-lg bg-red-50 px-3 py-2">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !form.rating || !form.orderId}
        className="w-full h-11 rounded-full bg-gold text-white font-semibold text-sm hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "newest",  label: "Most Recent" },
  { value: "helpful", label: "Most Helpful" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest",  label: "Lowest Rated" },
];

export default function ProductReviewsSection({ productId }) {
  const dispatch = useDispatch();

  const currentUser = useSelector((s) => s.auth.current);
  const userId = currentUser?.id || currentUser?._id || currentUser?.userId;
  const isLoggedIn = Boolean(currentUser);

  const reviewState = useSelector((s) => s.review);
  const bucket = reviewState.reviewsByProduct[productId] || {};
  const stats = reviewState.statsByProduct[productId] || null;
  const myReview = reviewState.myReviewByProduct[productId];
  const items = bucket.items || [];
  const total = bucket.total || 0;

  const orderState = useSelector((s) => s.order);
  const allOrders = orderState.list || [];
  const deliveredOrders = allOrders.filter(
    (o) =>
      ["delivered", "completed"].includes(o.status) &&
      (o.items || []).some(
        (item) => String(item.productId || item.product_id) === String(productId),
      ),
  );

  const [page, setPage]         = useState(1);
  const [sort, setSort]         = useState("newest");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const LIMIT = 5;

  useEffect(() => {
    dispatch(fetchProductReviews({ productId, page, limit: LIMIT, sort, rating: ratingFilter || undefined }));
  }, [dispatch, productId, page, sort, ratingFilter]);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchMyProductReview({ productId }));
      dispatch(fetchMyOrders());
    }
  }, [dispatch, productId, isLoggedIn]);

  const handleHelpful = (reviewId) => {
    if (!isLoggedIn) return;
    dispatch(markReviewHelpful({ productId, reviewId }));
  };

  const handleDelete = (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    dispatch(deleteMyReview({ productId, reviewId }));
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setPage(1);
    dispatch(fetchProductReviews({ productId, page: 1, limit: LIMIT, sort }));
    dispatch(fetchMyProductReview({ productId }));
  };

  const totalPages = Math.ceil(total / LIMIT);
  const canWriteReview = isLoggedIn && deliveredOrders.length > 0 && !myReview;

  return (
    <div className="panel" id="reviews">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-ink">
            Reviews {total > 0 && <span className="text-gray font-normal text-sm">({total})</span>}
          </h2>
          {stats && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-bold text-ink">{stats.avgRating?.toFixed(1)}</span>
              <div>
                <StarDisplay rating={stats.avgRating} size={16} />
                <p className="text-xs text-gray mt-0.5">{stats.count} verified reviews</p>
              </div>
            </div>
          )}
        </div>

        {canWriteReview && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="button px-5 py-2 text-sm font-semibold text-[#1B1D60]"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        )}
        {isLoggedIn && !canWriteReview && deliveredOrders.length === 0 && total === 0 && (
          <p className="text-xs text-gray">Purchase this product to leave a review.</p>
        )}
        {myReview && (
          <p className="text-xs text-success font-medium">You have already reviewed this product.</p>
        )}
      </div>

      {/* Rating distribution */}
      {stats?.distribution && total > 0 && (
        <div className="flex flex-col gap-1.5 mb-6 max-w-xs">
          {[5, 4, 3, 2, 1].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => { setRatingFilter(ratingFilter === n ? 0 : n); setPage(1); }}
              className={`rounded transition-opacity ${ratingFilter && ratingFilter !== n ? "opacity-40" : "opacity-100"}`}
            >
              <RatingBar label={n} count={stats.distribution[n] || 0} total={stats.count} />
            </button>
          ))}
          {ratingFilter > 0 && (
            <button
              onClick={() => setRatingFilter(0)}
              className="text-xs text-gold hover:text-gold-dark mt-1 text-left"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Write review form */}
      {showForm && canWriteReview && (
        <div className="mb-6">
          <WriteReviewForm
            productId={productId}
            deliveredOrders={deliveredOrders}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      {/* Sort + filter bar */}
      {total > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="appearance-none border border-border-strong rounded-[6px] pl-3 pr-8 py-1.5 text-xs bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray pointer-events-none" />
          </div>
          {ratingFilter > 0 && (
            <span className="text-xs bg-gold-soft text-gold-dark px-2 py-1 rounded-full">
              {ratingFilter}★ only
            </span>
          )}
        </div>
      )}

      {/* Reviews list */}
      {bucket.loading && items.length === 0 && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="panel animate-pulse h-28 bg-surface-soft" />
          ))}
        </div>
      )}

      {!bucket.loading && items.length === 0 && (
        <div className="py-12 text-center text-gray">
          <Star size={36} className="mx-auto mb-3 text-border" />
          <p className="text-sm font-medium">No reviews yet</p>
          {canWriteReview && (
            <p className="text-xs mt-1">Be the first to review this product!</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {items.map((review) => (
          <ReviewCard
            key={review._id || review.id}
            review={review}
            currentUserId={userId}
            productId={productId}
            onHelpful={handleHelpful}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-xs border border-border-strong rounded-full disabled:opacity-40 hover:bg-surface-soft transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-gray">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-xs border border-border-strong rounded-full disabled:opacity-40 hover:bg-surface-soft transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
