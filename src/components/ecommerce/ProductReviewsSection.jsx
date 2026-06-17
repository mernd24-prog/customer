import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Star,
  ThumbsUp,
  Trash2,
  UserCircle,
} from "lucide-react";
import {
  fetchProductReviews,
  submitProductReview,
  fetchMyProductReview,
  markReviewHelpful,
  deleteMyReview,
  resetSubmitState,
} from "../../features/review/reviewSlice";
import { fetchMyOrders } from "../../features/order/orderSlice";
import {
  ratingBreakdown as fallbackRatingBreakdown,
  reviews as fallbackReviews,
} from "../../data/review";

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
            className={
              n <= (hovered || value)
                ? "fill-gold text-gold"
                : "fill-border text-border"
            }
          />
        </button>
      ))}
    </div>
  );
}

function RatingPill({ rating }) {
  return (
    <span className="inline-flex items-center gap-1  rounded-full bg-[var(--customer-success)] px-2.5 py-1 text-xs font-bold text-white">
      {rating} <span className="text-[10px]">★</span>
    </span>
  );
}

function ProductReviewCard({ review, currentUserId, onHelpful, onDelete }) {
  const isOwn =
    currentUserId && String(review.buyerId) === String(currentUserId);
  const alreadyVoted = (review.helpfulVotedBy || []).includes(
    String(currentUserId || ""),
  );
  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const rating = Number(review.rating || 0).toFixed(1);
  const name = review.buyerName || review.name || "Verified Buyer";
  const text = review.reviewText || review.text;
  const media = review.media || review.images || [];
  const helpfulVotes = review.helpfulVotes ?? review.helpful ?? 0;
  const reviewId = review._id || review.id;

  return (
    <article className="border-b border-[var(--customer-border)] py-5 last:border-b-0">
      <div className="mb-3 flex items-center gap-2">
        <UserCircle
          size={24}
          className="shrink-0 text-[var(--customer-border-strong)]"
        />
        <span className="text-sm font-bold text-[var(--customer-muted)]">
          {name}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <RatingPill rating={rating} />
        <span className="text-[var(--customer-border-strong)]">•</span>
        <span className="text-xs font-semibold text-[var(--customer-muted)]">
          Posted on {dateStr || review.date}
        </span>
      </div>

      {review.title && (
        <p className="mb-1 text-sm font-bold text-[var(--customer-ink)]">
          {review.title}
        </p>
      )}
      {text && (
        <p className="text-sm font-medium leading-6 text-[var(--customer-ink)]">
          {text}
        </p>
      )}

      {media.length > 0 && (
        <div className="mt-4  flex flex-wrap gap-3">
          {media.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt=""
              className="h-[74px] w-[74px] rounded-[8px] border border-[var(--customer-border)] bg-[var(--customer-cream)] object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ))}
        </div>
      )}

      {review.adminReply?.text && (
        <div className="mt-4 rounded-[6px] border-l-2 border-[var(--customer-gold)] bg-[var(--customer-cream)] p-3">
          <p className="mb-1 text-xs font-bold text-[var(--customer-gold-dark)]">
            Seller Response
          </p>
          <p className="text-xs font-medium text-[var(--customer-muted)]">
            {review.adminReply.text}
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center gap-4">
        {reviewId ? (
          <button
            type="button"
            onClick={() => onHelpful(reviewId)}
            className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
              alreadyVoted
                ? "text-[var(--customer-gold-dark)]"
                : "text-[var(--customer-muted)] hover:text-[var(--customer-ink)]"
            }`}
          >
            <ThumbsUp
              size={18}
              className={
                alreadyVoted
                  ? "fill-[var(--customer-gold-dark)]"
                  : "fill-[var(--customer-muted)]"
              }
            />
            Helpful ({helpfulVotes})
          </button>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--customer-muted)]">
            <ThumbsUp size={18} className="fill-[var(--customer-muted)]" />
            Helpful ({helpfulVotes})
          </span>
        )}
        {isOwn && (
          <button
            type="button"
            onClick={() => onDelete(reviewId)}
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-red-400 transition-colors hover:text-red-600"
          >
            <Trash2 size={12} /> Delete
          </button>
        )}
      </div>
    </article>
  );
}

// ── Write-review form ─────────────────────────────────────────────────────────

function WriteReviewForm({ productId, deliveredOrders, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting, submitError, submitSuccess } = useSelector(
    (s) => s.review,
  );

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
    dispatch(
      submitProductReview({
        productId,
        orderId: form.orderId,
        rating: form.rating,
        title: form.title.trim(),
        reviewText: form.reviewText.trim(),
      }),
    );
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
            onChange={(e) =>
              setForm((f) => ({ ...f, orderId: e.target.value }))
            }
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
          onChange={(e) =>
            setForm((f) => ({ ...f, reviewText: e.target.value }))
          }
          maxLength={2000}
          placeholder="Share your experience with this product…"
          className="w-full border border-border-strong rounded-[6px] px-3 py-2 text-sm resize-none"
        />
        <p className="text-xs text-gray text-right">
          {form.reviewText.length}/2000
        </p>
      </div>

      {submitError && (
        <p className="text-xs text-red-600 rounded-lg bg-red-50 px-3 py-2">
          {submitError}
        </p>
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
  { value: "newest", label: "Most Recent" },
  { value: "helpful", label: "Most Helpful" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
];

function getRatingBreakdown(stats) {
  if (!stats?.distribution || !stats.count) return fallbackRatingBreakdown;

  const labels = ["Excellent", "Very Good", "Good", "Average", "Poor"];
  const colors = [
    "bg-[var(--customer-success)]",
    "bg-[var(--customer-success)]",
    "bg-[var(--customer-warning)]",
    "bg-[#f0793d]",
    "bg-[var(--customer-danger)]",
  ];

  return [5, 4, 3, 2, 1].map((rating, index) => {
    const count = stats.distribution[rating] || 0;
    const width = `${Math.round((count / stats.count) * 100)}%`;
    return {
      label: labels[index],
      count,
      color: colors[index],
      width,
      rating,
    };
  });
}

export default function ProductReviewsSection({ productId, product }) {
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
        (item) =>
          String(item.productId || item.product_id) === String(productId),
      ),
  );

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const LIMIT = 5;

  useEffect(() => {
    dispatch(
      fetchProductReviews({
        productId,
        page,
        limit: LIMIT,
        sort,
        rating: ratingFilter || undefined,
      }),
    );
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
  const filteredFallbackReviews = ratingFilter
    ? fallbackReviews.filter(
        (review) => Math.round(Number(review.rating || 0)) === ratingFilter,
      )
    : fallbackReviews;
  const hasApiReviews = items.length > 0;
  const displayTotal = total || filteredFallbackReviews.length;
  const displayReviewCount = stats?.count || displayTotal;
  const displayAvgRating = stats?.avgRating || 4;
  const displayReviews =
    bucket.loading && items.length === 0
      ? []
      : hasApiReviews
        ? items
        : filteredFallbackReviews;
  const displayRatingBreakdown = getRatingBreakdown(stats);

  return (
    <div className="panel overflow-hidden p-4 sm:p-6" id="reviews">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--customer-ink)]">
            Product Ratings & Reviews
          </h2>
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
        {isLoggedIn &&
          !canWriteReview &&
          deliveredOrders.length === 0 &&
          total === 0 && (
            <p className="text-xs text-gray">
              Purchase this product to leave a review.
            </p>
          )}
        {myReview && (
          <p className="text-xs text-success font-medium">
            You have already reviewed this product.
          </p>
        )}
      </div>

      {/* Rating distribution */}
      <div className="mt-8 grid gap-8 md:grid-cols-[120px_1fr] md:items-center">
        <div>
          <div className="flex items-center gap-2 text-[42px] font-bold leading-none text-[var(--customer-success)]">
            {Number(displayAvgRating).toFixed(1)}{" "}
            <span className="text-2xl">★</span>
          </div>
          <p className="mt-3 text-xs font-bold leading-5 text-[var(--customer-muted)]">
            {displayReviewCount} Ratings,
            <br />
            {displayTotal} Reviews
          </p>
        </div>

        <div className="space-y-4">
          {displayRatingBreakdown.map((item, index) => {
            const rating = item.rating || 5 - index;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setRatingFilter(ratingFilter === rating ? 0 : rating);
                  setPage(1);
                }}
                className={`grid w-full grid-cols-[86px_1fr_48px] items-center gap-4 transition-opacity ${
                  ratingFilter && ratingFilter !== rating
                    ? "opacity-40"
                    : "opacity-100"
                }`}
              >
                <span className="text-right text-xs font-bold text-[var(--customer-ink)]">
                  {item.label}
                </span>
                <span className="h-1.5 overflow-hidden rounded-full bg-[var(--customer-border)]">
                  <span
                    className={`block h-full rounded-full ${item.color}`}
                    style={{ width: item.width }}
                  />
                </span>
                <span className="text-left text-xs font-bold text-[var(--customer-muted)]">
                  {item.count}
                </span>
              </button>
            );
          })}
          {ratingFilter > 0 && (
            <button
              onClick={() => setRatingFilter(0)}
              className="text-xs font-bold text-[var(--customer-gold-dark)] hover:text-[var(--customer-gold)]"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Write review form */}
      {showForm && canWriteReview && (
        <div className="mt-8">
          <WriteReviewForm
            productId={productId}
            deliveredOrders={deliveredOrders}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      {/* Sort + filter bar */}
      {displayTotal > 0 && (
        <div className="mt-5 flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[var(--customer-ink)]">
            Customer Reviews ({displayTotal})
          </h3>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="appearance-none border-0 bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-[var(--customer-gold-dark)]"
              style={{
                backgroundImage: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
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

      <div className="mt-2">
        {displayReviews.map((review, index) => (
          <ProductReviewCard
            key={
              review._id ||
              review.id ||
              `${review.name}-${review.date}-${index}`
            }
            review={review}
            currentUserId={userId}
            onHelpful={handleHelpful}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {displayTotal > 0 && (
        <Link
          to={`/products/${productId}/reviews`}
          state={{ product }}
          className="flex w-full items-center gap-2 border-t border-[var(--customer-border)] pt-5 text-left text-sm font-bold uppercase text-[var(--customer-gold-dark)] transition-colors hover:text-[var(--customer-gold)]"
        >
          View all reviews <ChevronRight size={18} />
        </Link>
      )}

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
