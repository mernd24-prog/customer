import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useAuthModal } from "../../context/AuthModalContext";
import { ChevronRight, ThumbsUp } from "lucide-react";
import { IoIosStar } from "react-icons/io";
import {
  fetchProductReviews,
  submitProductReview,
  fetchMyProductReview,
  markReviewHelpful,
  deleteMyReview,
  resetSubmitState,
} from "../../features/review/reviewSlice";
import { fetchMyOrders } from "../../features/order/orderSlice";
import { ratingBreakdown as fallbackRatingBreakdown } from "../../data/review";
import ReviewImageUploader from "./ReviewImageUploader";

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
          <IoIosStar
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
    <span className="inline-flex items-center gap-1 rounded-full bg-[#CE9F2D] px-2 py-1 text-[10px] font-bold text-white lg:text-base">
      <IoIosStar className="text-[10px] lg:text-base" />({rating})
    </span>
  );
}

function getUserDisplayName(user = {}) {
  const first = user.profile?.firstName || user.firstName || "";
  const last = user.profile?.lastName || user.lastName || "";
  return (
    [first, last].filter(Boolean).join(" ").trim() ||
    user.fullName ||
    user.displayName ||
    user.name ||
    user.email ||
    ""
  );
}

function ProductReviewCard({ review, currentUser, currentUserId, onHelpful }) {
  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const rating = Number(review.rating || 0).toFixed(1);
  const isOwn =
    currentUserId && String(review.buyerId) === String(currentUserId);
  const alreadyVoted = (review.helpfulVotedBy || []).includes(
    String(currentUserId || ""),
  );
  const name =
    review.buyerName ||
    review.name ||
    (isOwn ? getUserDisplayName(currentUser) : "") ||
    "Customer";
  const text = review.reviewText || review.text;
  const reviewId = review._id || review.id;
  const helpfulVotes = review.helpfulVotes ?? review.helpful ?? 0;
  const media = Array.isArray(review.media) ? review.media.filter(Boolean) : [];
  const buyerImage = review.buyerImage || review.buyerAvatarUrl || "";

  return (
    <article className="border-b  border-[var(--customer-border)] last:border-b-0 sm:pb-4 mb-4 lg:mb-6">
      <div className="mb-2  flex min-w-0 items-center gap-2.5">
        <span className="w-8 h-8 lg:w-10 lg:h-10">
          <img
            src={buyerImage || "/image/png/person.png"}
            alt={name}
            className="h-full w-full rounded-full object-cover"
          />
        </span>
        <span className="text-base lg:text-2xl font-bold text-[#2E2E2E]">
          {name}
        </span>
      </div>

      <div className="my-2 lg:my-4 flex flex-wrap items-center gap-2">
        <RatingPill rating={rating} />
        <span className="text-base flex gap-2 font-medium text-[#949494]">
          <div className="w-1 h-1 my-auto rounded-full bg-[#949494]" />
          Posted on {dateStr || review.date}
        </span>
      </div>

      {review.title && (
        <p className="mb-1 text-sm font-bold text-[var(--customer-ink)]">
          {review.title}
        </p>
      )}
      {text && (
        <p className="text-sm text-[#2E2E2E] sm:text-lg  my-4 lg:mt-8 ">
          {text}
        </p>
      )}

      {media.length > 0 && (
        <div className="mb-4 mt-3 flex flex-wrap gap-2">
          {media.slice(0, 5).map((url, index) => (
            <a
              key={`${url}-${index}`}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block size-20 overflow-hidden rounded-[8px] border border-[#CE9F2D33] bg-[#FFFDF8] sm:size-24"
            >
              <img
                src={url}
                alt={`Review media ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </a>
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

      <button
        type="button"
        onClick={() => onHelpful?.(reviewId)}
        disabled={!reviewId || isOwn}
        className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          alreadyVoted
            ? "bg-[#CE9F2D1A] text-[#1B1D60]"
            : "text-[#949494] hover:bg-[#F7F7FA] hover:text-[#1B1D60]"
        }`}
      >
        <ThumbsUp size={13} className={alreadyVoted ? "fill-[#CE9F2D] text-[#CE9F2D]" : ""} />
        Helpful ({helpfulVotes})
      </button>
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
  const [reviewImages, setReviewImages] = useState([]);
  const isUploadingImages = reviewImages.some((image) => image.status === "uploading");

  useEffect(() => {
    if (submitSuccess) {
      onSuccess();
      dispatch(resetSubmitState());
    }
  }, [submitSuccess, dispatch, onSuccess]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.rating || !form.title.trim() || !form.reviewText.trim()) return;
    dispatch(
      submitProductReview({
        productId,
        orderId: form.orderId,
        rating: form.rating,
        title: form.title.trim(),
        reviewText: form.reviewText.trim(),
        media: reviewImages.map((image) => image.url).filter(Boolean),
      }),
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[#e4ddcf] rounded-xl bg-[#ffffff] p-10 flex flex-col gap-4"
    >
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
          required
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
          required
          placeholder="Share your experience with this product…"
          className="w-full border border-border-strong rounded-[6px] px-3 py-2 text-sm resize-none"
        />
        <p className="text-xs text-gray text-right">
          {form.reviewText.length}/2000
        </p>
      </div>

      <ReviewImageUploader
        value={reviewImages}
        onChange={setReviewImages}
        disabled={submitting}
      />

      {submitError && (
        <p className="text-xs text-red-600 rounded-lg bg-red-50 px-3 py-2">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={
          submitting ||
          isUploadingImages ||
          !form.rating ||
          !form.orderId ||
          !form.title.trim() ||
          !form.reviewText.trim()
        }
        className="w-full h-11 rounded-full bg-gold text-white font-semibold text-sm hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : isUploadingImages ? "Uploading…" : "Submit Review"}
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

const EMPTY_REVIEWS = [];

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

function getReviewRating(review) {
  return Number(review?.rating || 0);
}

function getReviewHelpfulVotes(review) {
  return Number(review?.helpfulVotes ?? review?.helpful ?? 0);
}

function getReviewTime(review) {
  const rawDate = review?.createdAt || review?.date;
  const time = rawDate ? new Date(rawDate).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

function sortReviewsByOption(reviews, sort) {
  const sorted = [...reviews];

  sorted.sort((a, b) => {
    if (sort === "highest") return getReviewRating(b) - getReviewRating(a);
    if (sort === "lowest") return getReviewRating(a) - getReviewRating(b);
    if (sort === "helpful") {
      return getReviewHelpfulVotes(b) - getReviewHelpfulVotes(a);
    }

    return getReviewTime(b) - getReviewTime(a);
  });

  return sorted;
}

export default function ProductReviewsSection({ productId, product }) {
  const dispatch = useDispatch();
  const { openAuthModal } = useAuthModal();

  const currentUser = useSelector((s) => s.auth.current);
  const userId = currentUser?.id || currentUser?._id || currentUser?.userId;
  const isLoggedIn = Boolean(currentUser);

  const reviewState = useSelector((s) => s.review);
  const bucket = reviewState.reviewsByProduct[productId] || {};
  const stats = reviewState.statsByProduct[productId] || null;
  const myReview = reviewState.myReviewByProduct[productId];
  const items = bucket.items || EMPTY_REVIEWS;
  const total = bucket.total || 0;

  const orderState = useSelector((s) => s.order);
  const allOrders = orderState.list || [];
  const deliveredOrders = allOrders.filter(
    (o) =>
      ["delivered", "fulfilled", "completed"].includes(o.status) &&
      (o.items || []).some(
        (item) =>
          String(item.productId || item.product_id) === String(productId),
      ),
  );

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortMenuRef = useRef(null);
  const LIMIT = 5;

  useEffect(() => {
    if (!sortOpen) return undefined;

    const handlePointerDown = (event) => {
      if (sortMenuRef.current?.contains(event.target)) return;
      setSortOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [sortOpen]);

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
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
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
  const hasApiReviews = items.length > 0;
  const displayTotal = total || items.length;
  const displayReviewCount = stats?.count || displayTotal;
  const displayAvgRating =
    stats?.avgRating ||
    product?.rating ||
    product?.averageRating ||
    product?.reviewsAverage ||
    0;
  const displayReviews = useMemo(() => {
    if (bucket.loading && items.length === 0) return [];
    const ownPublishedReview =
      myReview?.status === "published" ? myReview : null;
    const sourceReviews = ownPublishedReview
      ? [
          ownPublishedReview,
          ...items.filter(
            (review) =>
              String(review._id || review.id) !==
              String(ownPublishedReview._id || ownPublishedReview.id),
          ),
        ]
      : items;
    if (!sourceReviews.length || (!hasApiReviews && !ownPublishedReview))
      return [];
    const sorted = sortReviewsByOption(sourceReviews, sort);
    if (!ownPublishedReview) return sorted;
    return [
      ownPublishedReview,
      ...sorted.filter(
        (review) =>
          String(review._id || review.id) !==
          String(ownPublishedReview._id || ownPublishedReview.id),
      ),
    ];
  }, [bucket.loading, hasApiReviews, items, myReview, sort]);
  const displayRatingBreakdown = getRatingBreakdown(stats);
  const selectedSortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ||
    "Most Recent";

  return (
    <section id="reviews" className="w-full overflow-hidden">
      <div className="flex mt-4 lg:mt-8 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-12">
        <aside className=" lg:sticky lg:top-20   lg:self-start">
          <div className="w-full lg:w-[420px] xl:w-[580px]  rounded-xl  border border-[#CE9F2D66] bg-white">
            <div className=" px-4 py-6  rounded-xl bg-[#CE9F2D33] sm:px-5">
              <h2 className="text-lg lg:text-[24px] font-bold text-[#2E2E2E]">
                Product Ratings & Reviews
              </h2>
            </div>

            <div className="p-3 lg:p-5">
              <div className="flex  items-center gap-2  font-bold  text-[#008425]">
                <span>
                  <IoIosStar className="text-xl lg:text-3xl" />
                </span>
                <span className="text-[28px] lg:text-[42px]">
                  {Number(displayAvgRating).toFixed(1)}
                </span>
              </div>
              <p className="text-base lg:text-lg  font-medium text-[#2E2E2E]">
                {displayReviewCount} Ratings, {displayTotal} Reviews
              </p>

              <div className="py-2 lg:py-3">
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
                      className={`grid  w-full  items-center gap-1 text-left   ${
                        ratingFilter && ratingFilter !== rating
                          ? "opacity-40"
                          : "opacity-100"
                      }`}
                    >
                      <div className="my-3 flex justify-between">
                        <span className="  text-[11px]  font-medium text-[#2E2E2E] sm:text-lg">
                          {item.label}
                        </span>
                        <span className="text-right  text-[11px] font-medium text-[#2E2E2E] sm:text-lg">
                          {item.count}
                        </span>
                      </div>

                      <span className="h-0.5  overflow-hidden bg-[var(--customer-border)]">
                        <span
                          className={`block h-full ${item.color}`}
                          style={{ width: item.width }}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>

              {ratingFilter > 0 && (
                <button
                  type="button"
                  onClick={() => setRatingFilter(0)}
                  className="mt-4 text-xs font-bold text-[var(--customer-gold-dark)] hover:text-[var(--customer-gold)]"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {canWriteReview && (
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="button w-full px-5 py-2 text-sm font-semibold text-[#1B1D60]"
              >
                {showForm ? "Cancel" : "Write a Review"}
              </button>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {showForm && canWriteReview && (
            <div className="mb-6">
              <WriteReviewForm
                productId={productId}
                deliveredOrders={deliveredOrders}
                onSuccess={handleFormSuccess}
              />
            </div>
          )}

          {displayTotal > 0 && (
            <div className="flex flex-col gap-3  mt-2 lg:mt-6 sm:flex-row items-end justify-end ">
              <div className="flex flex-wrap items-center gap-2">
                {ratingFilter > 0 && (
                  <span className="rounded-full bg-gold-soft px-2 py-1 text-xs text-gold-dark">
                    {ratingFilter}★ only
                  </span>
                )}
                <div ref={sortMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setSortOpen((open) => !open)}
                    className="flex min-h-9 min-w-[160px] items-center justify-between gap-3 rounded-[6px] border border-[var(--customer-border)] bg-white py-2 pl-3 pr-2 text-left text-xs font-bold text-[var(--customer-gold-dark)] focus:outline-none"
                  >
                    <span>{selectedSortLabel}</span>
                    <span className="text-[10px] text-ink">▾</span>
                  </button>

                  {sortOpen && (
                    <div className="absolute right-0 top-[calc(100%+4px)] z-50 w-[160px] overflow-hidden rounded-[6px] border border-[var(--customer-border)] bg-white">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSort(option.value);
                            setPage(1);
                            setSortOpen(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs font-medium ${
                            sort === option.value
                              ? "bg-[#1B1D60] text-white"
                              : "bg-white text-[var(--customer-gold-dark)] hover:bg-[#F8F3E7]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {bucket.loading && items.length === 0 && (
            <div className="flex flex-col gap-3 pt-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-[8px] bg-surface-soft"
                />
              ))}
            </div>
          )}

          <div>
            {displayReviews.map((review, index) => (
              <ProductReviewCard
                key={
                  review._id ||
                  review.id ||
                  `${review.name}-${review.date}-${index}`
                }
                review={review}
                currentUser={currentUser}
                currentUserId={userId}
                onHelpful={handleHelpful}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {!bucket.loading && displayReviews.length === 0 && (
            <div className="flex flex-1  items-center justify-center rounded-[10px] border border-[#CE9F2D66] bg-[#FFFDF8] px-4 py-8 text-center sm:min-h-[340px] lg:min-h-0">
              <div className="mx-auto flex w-full max-w-[420px] flex-col items-center">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#CE9F2D1F] sm:h-36 sm:w-36 lg:h-44 lg:w-44">
                  <img
                    src="/image/png/noReview.png"
                    alt="No reviews yet"
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <p className="mt-5 text-lg font-bold text-[#1B1D60] sm:text-xl">
                  No reviews yet
                </p>
                <p className="mt-2 max-w-[320px] text-sm font-medium leading-6 text-[#5F6078] sm:text-base">
                  Published customer reviews will appear here.
                </p>
              </div>
            </div>
          )}

          {displayTotal > 0 && (
            <Link
              to={`/products/${productId}/reviews`}
              state={{ product }}
              className=" flex w-full items-center gap-2 text-left text-sm lg:text-lg font-semibold  text-[#CE9F2D] transition-colors "
            >
              View all reviews <ChevronRight size={16} />
            </Link>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-full border border-border-strong px-4 py-2 text-xs transition-colors hover:bg-surface-soft disabled:opacity-40"
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
                className="rounded-full border border-border-strong px-4 py-2 text-xs transition-colors hover:bg-surface-soft disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
