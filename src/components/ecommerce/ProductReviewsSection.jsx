import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useAuthModal } from "../../features/auth/AuthModalContext";
import { ChevronRight, ThumbsUp } from "lucide-react";
import CustomDropdown from "../ui/CustomDropdown";
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
import ReviewImageUploader from "./ReviewImageUploader";
import ReviewMediaLightbox from "./ReviewMediaLightbox";
import { getImageUrlFromValue } from "../../utils/ecommerce";
import ShowMoreText from "../../utils/showMore";

// ── Helpers ───────────────────────────────────────────────────────────────────

function StarInput({ value, onChange, size = 24 }) {
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
                ? "fill-[#CE9F2D] text-[#CE9F2D]"
                : "fill-border text-border"
            }
          />
        </button>
      ))}
    </div>
  );
}

function RatingPill({ rating }) {
  const numRating = Number(rating);
  const bgColor =
    numRating > 3
      ? "bg-[#388e3c]"
      : numRating === 0
        ? "bg-[#9e9e9e]"
        : "bg-[#CE9F2D]";

  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] sm:text-xs font-bold text-white shadow-xs ${bgColor}`}>
      <IoIosStar className="text-xs" /> {rating}
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
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const rating = Number(review.rating || 0).toFixed(1);
  const isOwn =
    currentUserId &&
    (String(review.buyerId) === String(currentUserId) ||
      String(review.userId) === String(currentUserId) ||
      String(review.user?._id || review.user?.id || review.user) ===
        String(currentUserId));
  const alreadyVoted = (review.helpfulVotedBy || []).includes(
    String(currentUserId || ""),
  );
  const isAdminReview = review.orderId?.startsWith("admin:");

  let reviewerName = "";
  if (isOwn) {
    reviewerName = getUserDisplayName(currentUser);
  } else if (review.user && typeof review.user === "object") {
    reviewerName = getUserDisplayName(review.user);
  }
  if (!reviewerName || reviewerName === "Unknown") {
    reviewerName = review.buyerName || review.name || "";
  }
  if (reviewerName === "Unknown" && !isAdminReview) {
    reviewerName = "Customer";
  }

  const name = isAdminReview ? "Unknown" : reviewerName || "Customer";
  const text = review.reviewText || review.text;
  const reviewId = review._id || review.id;
  const helpfulVotes = review.helpfulVotes ?? review.helpful ?? 0;
  const media = Array.isArray(review.media)
    ? review.media.map(getImageUrlFromValue).filter(Boolean)
    : [];
  const buyerImage = review.buyerImage || review.buyerAvatarUrl || "";

  return (
    <article className="py-3.5 border-b border-[#E7D9B8]/50 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="size-8 shrink-0 overflow-hidden rounded-full border border-[#CE9F2D]/30 bg-[#FAF6EE]">
            <img
              src={buyerImage || "/image/png/person.png"}
              alt={name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/image/png/person.png";
              }}
            />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#1B1D60]">
                {name}
              </span>
              {isOwn && (
                <span className="rounded-md bg-[#CE9F2D]/15 px-2 py-0.5 text-[10px] font-bold text-[#A96F14]">
                  Your Review
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="text-[11px] sm:text-xs font-medium text-[#737373] shrink-0">
          {dateStr || review.date}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <RatingPill rating={rating} />
        {review.title && (
          <span className="text-xs sm:text-sm font-bold text-[#1F2430]">
            {review.title}
          </span>
        )}
      </div>

      {text && (
        <div className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#4E4E4E]">
          <ShowMoreText
            text={text}
            mode="lines"
            limit={3}
            buttonClassName="inline whitespace-nowrap text-xs font-semibold text-[#CE9F2D] hover:underline ml-1"
          />
        </div>
      )}

      {media.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {media.slice(0, 5).map((url, index) => (
            <button
              type="button"
              key={`${url}-${index}`}
              onClick={() => setLightboxIndex(index)}
              className="block size-14 shrink-0 overflow-hidden rounded-lg border border-[#E7D9B8] bg-white hover:opacity-90 transition-opacity"
            >
              <img
                src={url}
                alt={`Review media ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {review.adminReply?.text && (
        <div className="mt-2.5 rounded-lg border-l-3 border-[#CE9F2D] bg-[#FAF6EE] p-2.5 text-xs">
          <p className="font-bold text-[#A96F14] mb-0.5">Seller Response</p>
          <p className="font-medium text-[#6F7480]">{review.adminReply.text}</p>
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onHelpful?.(reviewId)}
          disabled={!reviewId || isOwn}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border transition disabled:cursor-not-allowed disabled:opacity-50 ${
            alreadyVoted
              ? "bg-[#CE9F2D]/15 border-[#CE9F2D]/40 text-[#1B1D60]"
              : "border-[#E7D9B8] bg-[#FAF6EE] text-[#6F7480] hover:border-[#CE9F2D] hover:text-[#1B1D60]"
          }`}
        >
          <ThumbsUp
            size={11}
            className={alreadyVoted ? "fill-[#CE9F2D] text-[#CE9F2D]" : ""}
          />
          Helpful ({helpfulVotes})
        </button>
      </div>

      {lightboxIndex !== null && (
        <ReviewMediaLightbox
          images={media}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
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
  const isUploadingImages = reviewImages.some(
    (image) => image.status === "uploading",
  );

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
      className="border border-[#E7D9B8] rounded-xl bg-white p-5 sm:p-6 flex flex-col gap-4 shadow-xs"
    >
      <h3 className="text-sm sm:text-base font-bold text-[#1B1D60]">
        Write a Review
      </h3>

      {deliveredOrders.length > 1 && (
        <div>
          <label className="text-xs font-semibold text-[#6F7480] uppercase tracking-wide mb-1 block">
            Select Order
          </label>
          <select
            value={form.orderId}
            onChange={(e) =>
              setForm((f) => ({ ...f, orderId: e.target.value }))
            }
            className="w-full border border-[#E7D9B8] rounded-lg px-3 py-2 text-xs sm:text-sm focus:border-[#CE9F2D] outline-none"
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
        <label className="text-xs font-semibold text-[#6F7480] uppercase tracking-wide mb-1.5 block">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <StarInput
          value={form.rating}
          onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
          size={24}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-[#6F7480] uppercase tracking-wide mb-1 block">
          Title
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          maxLength={200}
          required
          placeholder="Summarize your review in a few words"
          className="w-full border border-[#E7D9B8] rounded-lg px-3 py-2 text-xs sm:text-sm focus:border-[#CE9F2D] outline-none"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-[#6F7480] uppercase tracking-wide mb-1 block">
          Review
        </label>
        <textarea
          rows={3}
          value={form.reviewText}
          onChange={(e) =>
            setForm((f) => ({ ...f, reviewText: e.target.value }))
          }
          maxLength={2000}
          required
          placeholder="Share your experience with this product…"
          className="w-full border border-[#E7D9B8] rounded-lg px-3 py-2 text-xs sm:text-sm resize-none focus:border-[#CE9F2D] outline-none"
        />
        <p className="text-[11px] text-[#737373] text-right mt-1">
          {form.reviewText.length}/2000
        </p>
      </div>

      <ReviewImageUploader
        value={reviewImages}
        onChange={setReviewImages}
        disabled={submitting}
      />

      {submitError && (
        <p className="text-xs text-red-600 rounded-lg bg-red-50 px-3 py-2 border border-red-200">
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
        className="w-full h-10 rounded-lg bg-[#CE9F2D] text-white font-bold text-xs sm:text-sm hover:bg-[#A96F14] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
      >
        {submitting
          ? "Submitting…"
          : isUploadingImages
            ? "Uploading…"
            : "Submit Review"}
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
  const labels = ["Excellent", "Very Good", "Good", "Average", "Poor"];
  const colors = [
    "bg-[#CE9F2D]",
    "bg-[#CE9F2D]",
    "bg-[#EAB308]",
    "bg-[#F97316]",
    "bg-[#EF4444]",
  ];

  return [5, 4, 3, 2, 1].map((rating, index) => {
    const count = stats?.distribution?.[rating] || 0;
    const width = stats?.count
      ? `${Math.round((count / stats.count) * 100)}%`
      : "0%";
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
      (["delivered", "fulfilled", "completed"].includes(o.status) && o.items) ||
      [].some(
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
      myReview?.status === "published" &&
      (!ratingFilter || getReviewRating(myReview) === ratingFilter)
        ? myReview
        : null;
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
    if (!ownPublishedReview || sort !== "newest") return sorted;
    return [
      ownPublishedReview,
      ...sorted.filter(
        (review) =>
          String(review._id || review.id) !==
          String(ownPublishedReview._id || ownPublishedReview.id),
      ),
    ];
  }, [bucket.loading, hasApiReviews, items, myReview, ratingFilter, sort]);
  const hasOwnPublishedReview = myReview?.status === "published";
  const previewReviews = displayReviews.slice(
    0,
    hasOwnPublishedReview && sort === "newest" ? 3 : 2,
  );

  const displayRatingBreakdown = getRatingBreakdown(stats);
  const hasPublishedReviews =
    displayTotal > 0 ||
    Number(stats?.count || 0) > 0 ||
    displayReviews.length > 0 ||
    hasOwnPublishedReview;

  if (!hasPublishedReviews) return null;

  return (
    <section id="reviews" className="w-full mt-8 lg:mt-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-[280px] xl:w-[300px] shrink-0">
          <div className="overflow-hidden rounded-xl border border-[#E7D9B8] bg-white shadow-xs">
            <div className="px-4 py-3 bg-[#FAF6EE] border-b border-[#E7D9B8]">
              <h2 className="text-sm font-bold text-[#1B1D60]">
                Product Ratings &amp; Reviews
              </h2>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <IoIosStar className="text-2xl text-[#CE9F2D]" />
                  <span className="text-3xl font-extrabold text-[#1B1D60]">
                    {Number(displayAvgRating).toFixed(1)}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#6F7480] self-end mb-1">
                  / 5.0
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-[#6F7480]">
                {displayReviewCount}{" "}
                {displayReviewCount === 1 ? "Rating" : "Ratings"} &amp;{" "}
                {displayTotal} {displayTotal === 1 ? "Review" : "Reviews"}
              </p>

              {/* Rating Bars */}
              <div className="mt-4 space-y-2">
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
                      className={`flex w-full items-center gap-2 text-left text-xs transition-opacity ${
                        ratingFilter && ratingFilter !== rating
                          ? "opacity-35"
                          : "opacity-100 hover:opacity-80"
                      }`}
                    >
                      <span className="w-16 shrink-0 font-medium text-[#2E2E2E]">
                        {item.label}
                      </span>

                      <div className="h-2 rounded-full overflow-hidden bg-[#FAF6EE] flex-1 border border-[#E7D9B8]/40">
                        <div
                          className={`h-full transition-all duration-300 ${item.color}`}
                          style={{ width: item.width }}
                        />
                      </div>

                      <span className="w-5 shrink-0 text-right font-medium text-[#6F7480]">
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {ratingFilter > 0 && (
                <button
                  type="button"
                  onClick={() => setRatingFilter(0)}
                  className="mt-3 text-xs font-bold text-[#A96F14] hover:text-[#CE9F2D] underline block"
                >
                  Clear Filter ({ratingFilter}★)
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Right Section */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Bar: Heading + Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-[#E7D9B8]">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#1B1D60]">
                Customer Reviews
              </h3>
              {displayTotal > 0 && (
                <span className="rounded-full bg-[#FAF6EE] px-2.5 py-0.5 text-xs font-bold text-[#A96F14] border border-[#E7D9B8]">
                  {displayTotal}
                </span>
              )}
              {ratingFilter > 0 && (
                <span className="rounded-md bg-[#CE9F2D]/15 px-2 py-0.5 text-xs font-bold text-[#A96F14]">
                  {ratingFilter}★ Only
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* {canWriteReview && (
                <button
                  type="button"
                  onClick={() => setShowForm((prev) => !prev)}
                  className="rounded-lg bg-[#1B1D60] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#15115d] transition-colors shadow-xs"
                >
                  {showForm ? "Cancel Review" : "Write a Review"}
                </button>
              )} */}

              {displayTotal > 0 && (
                <CustomDropdown
                  className="w-[150px]"
                  buttonClassName="h-8 text-xs rounded-lg border-[#E7D9B8] font-semibold text-[#1B1D60] bg-white hover:bg-[#FAF6EE]"
                  options={SORT_OPTIONS}
                  value={sort}
                  onChange={(val) => {
                    setSort(val);
                    setPage(1);
                  }}
                  placeholder="Most Recent"
                />
              )}
            </div>
          </div>

          {/* Form */}
          {showForm && canWriteReview && (
            <div className="my-4">
              <WriteReviewForm
                productId={productId}
                deliveredOrders={deliveredOrders}
                onSuccess={handleFormSuccess}
              />
            </div>
          )}

          {/* Loading Skeleton */}
          {bucket.loading && items.length === 0 && (
            <div className="flex flex-col gap-3 py-2">
              {Array.from({ length: 2 }, (_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-lg bg-[#FAF6EE]"
                />
              ))}
            </div>
          )}

          {/* Reviews List */}
          {displayReviews.length > 0 && (
            <div className="divide-y divide-[#E7D9B8]/40">
              {previewReviews.map((review, index) => (
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
                  hasReviewed={hasOwnPublishedReview}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!bucket.loading && displayReviews.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-[#E7D9B8] bg-[#FAF6EE]/50 px-4 py-8 text-center">
              <div className="mx-auto flex w-full max-w-[320px] flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#CE9F2D]/15">
                  <img
                    src="/image/png/noReview.png"
                    alt="No Reviews Yet"
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <p className="mt-3 text-base font-bold text-[#1B1D60]">
                  No Reviews Yet
                </p>
                <p className="mt-1 text-xs text-[#6F7480]">
                  Customer reviews will appear here once verified buyers share
                  their feedback.
                </p>
              </div>
            </div>
          )}

          {/* View All Reviews Link */}
          {displayTotal > 0 && (
            <div className="mt-3 pt-3 border-t border-[#E7D9B8]/40 flex justify-end">
              <Link
                to={`/products/${productId}/reviews`}
                state={{ product }}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#CE9F2D] hover:text-[#A96F14] transition-colors"
              >
                View All Reviews ({displayTotal}) <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
