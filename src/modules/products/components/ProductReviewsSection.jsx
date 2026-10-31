import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useAuthModal } from "../../../modules/auth/context/AuthModalContext";
import { ArrowRight, ThumbsUp } from "lucide-react";
import { IoIosStar } from "react-icons/io";
import {
  fetchProductReviews,
  submitProductReview,
  fetchMyProductReview,
  markReviewHelpful,
  deleteMyReview,
  resetSubmitState,
} from "../../../features/review/reviewSlice";
import { fetchMyOrders } from "../../orders/slices/orderSlice";
import { getReviewProductId } from "../../orders/utils/orderItems";
import ReviewImageUploader from "./ReviewImageUploader";
import ReviewMediaLightbox from "./ReviewMediaLightbox";
import { getImageUrlFromValue } from "../../../utils/ecommerce";
import ShowMoreText from "../../../utils/showMore";
import EmptyState from "../../../components/ui/feedback/EmptyState";

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

  const roundedRating = Math.round(Number(review.rating || 0));
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

  return (
    <article className="py-3.5 border-b border-[#E7D9B8]/50 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-0.5 text-[#CE9F2D] text-[17px] sm:text-[19px]">
          {[1, 2, 3, 4, 5].map((star) => (
            <IoIosStar
              key={star}
              className={
                star <= roundedRating
                  ? "fill-[#CE9F2D] text-[#CE9F2D]"
                  : "fill-[#D1D5DB] text-[#D1D5DB]"
              }
            />
          ))}
        </span>
        {review.title && (
          <span className="text-sm sm:text-base font-bold text-[#1F2430]">
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
              aria-label={`Open review photo ${index + 1}${index === 4 && media.length > 5 ? `, and ${media.length - 5} more` : ""}`}
              className="relative block size-14 shrink-0 overflow-hidden rounded-lg border border-[#E7D9B8] bg-white transition-opacity hover:opacity-90"
            >
              <img
                loading="lazy"
                width="400"
                height="400"
                src={url}
                alt={`Review media ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {index === 4 && media.length > 5 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-bold text-white">
                  +{media.length - 5}
                </span>
              )}
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

      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="break-words text-sm font-medium text-[#1F2430]/80">
            {name}
            {(dateStr || review.date) && (
              <span className="font-normal text-[#737373]">
                {" "}| {dateStr || review.date}
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onHelpful?.(reviewId)}
          disabled={!reviewId || isOwn}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            alreadyVoted
              ? "border-[#CE9F2D] bg-[#CE9F2D]/15 text-[#1B1D60]"
              : "border-[#E7D9B8] text-[#6F7480] hover:border-[#CE9F2D] hover:bg-[#FAF6EE] hover:text-[#1B1D60]"
          }`}
        >
          <ThumbsUp
            size={14}
            className={alreadyVoted ? "fill-[#CE9F2D] text-[#CE9F2D]" : ""}
          />
          <span>{helpfulVotes}</span>
        </button>
      </div>

      {lightboxIndex !== null && (
        <ReviewMediaLightbox
          images={media}
          index={lightboxIndex}
          review={review}
          currentUser={currentUser}
          currentUserId={currentUserId}
          onHelpful={onHelpful}
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
        <p className="text-xs text-[#737373] text-right mt-1">
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
  const deliveredStatuses = new Set([
    "delivered",
    "fulfilled",
    "completed",
    "delivered_verified",
  ]);
  const productIds = new Set(
    [
      productId,
      product?.id,
      product?._id,
      product?.productId,
      product?.product_id,
    ]
      .filter(Boolean)
      .map(String),
  );
  const deliveredOrders = allOrders.filter((order) => {
    const orderItems = [
      ...(Array.isArray(order.items) ? order.items : []),
      ...(Array.isArray(order.orderItems) ? order.orderItems : []),
      ...(Array.isArray(order.order_items) ? order.order_items : []),
    ];
    const productItems = orderItems.filter((item) =>
      productIds.has(String(getReviewProductId(item))),
    );
    if (!productItems.length) return false;

    const orderIsDelivered = [
      order.status,
      order.deliveryStatus,
      order.delivery_status,
    ].some((status) => deliveredStatuses.has(String(status || "").toLowerCase()));
    const itemIsDelivered = productItems.some(
      (item) =>
        item.deliveredAt ||
        item.delivered_at ||
        deliveredStatuses.has(
          String(
            item.deliveryStatus ||
              item.delivery_status ||
              item.status ||
              item.effective_status ||
              "",
          ).toLowerCase(),
        ),
    );

    return orderIsDelivered || itemIsDelivered;
  });

  const [page, setPage] = useState(1);
  const sort = "newest";
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
      dispatch(fetchMyOrders({ params: { limit: 20, page: 1 } }));
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
  const previewReviews = displayReviews.slice(0, 1);

  const displayRatingBreakdown = getRatingBreakdown(stats);
  const hasReviewSummary = displayReviewCount > 0 || displayTotal > 0;
  return (
    <section id="reviews" className="w-full mt-8 lg:mt-12">
      <div className={`flex flex-col gap-6 ${hasReviewSummary ? "lg:flex-row lg:items-start lg:gap-8" : ""}`}>
        {/* Left Sidebar */}
        {hasReviewSummary && <aside className="w-full shrink-0 lg:w-[280px] xl:w-[300px]">
          <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-xs">
            <div className="px-5 py-3.5 bg-white border-b border-[#E5E7EB]">
              <h2 className="text-base font-bold text-[#111827]">
                Ratings &amp; Reviews
              </h2>
            </div>

            <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 p-4 sm:p-5 lg:block">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {displayReviewCount > 0 && (
                      <IoIosStar className="text-2xl text-[#CE9F2D]" />
                    )}
                    <span className="text-3xl font-extrabold text-[#1B1D60]">
                      {displayReviewCount > 0
                        ? Number(displayAvgRating).toFixed(1)
                        : "—"}
                    </span>
                  </div>
                  <span className="mb-1 self-end text-xs font-semibold text-[#6F7480]">
                    / 5.0
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#6F7480]">
                  {displayReviewCount > 0 || displayTotal > 0 ? (
                    <>
                      {displayReviewCount}{" "}
                      {displayReviewCount === 1 ? "Rating" : "Ratings"} &amp;{" "}
                      {displayTotal} {displayTotal === 1 ? "Review" : "Reviews"}
                    </>
                  ) : (
                    "No ratings yet"
                  )}
                </p>
              </div>

              {/* Rating Bars */}
              <div className="space-y-2 lg:mt-4">
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
        </aside>}

        {/* Right Section */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Bar: Heading + Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 pt-3.5 mb-2">
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <h3 className="whitespace-nowrap text-sm font-bold text-[#1B1D60] sm:text-base">
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

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {canWriteReview ? (
                <button
                  type="button"
                  onClick={() => setShowForm((prev) => !prev)}
                  className="min-h-9 rounded-lg bg-[#1B1D60] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#15115d]"
                >
                  {showForm ? "Cancel Review" : "Write a Review"}
                </button>
              ) : !isLoggedIn ? (
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="min-h-9 rounded-md border border-[#1B1D60] px-3 py-1.5 text-xs font-bold text-[#1B1D60] transition-colors hover:bg-[#F4F4FA]"
                >
                  Sign in to review
                </button>
              ) : null}

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
            <EmptyState
              illustration="reviews"
              title="Be the First to Review"
              description={canWriteReview
                    ? "Your feedback can help other shoppers choose with confidence."
                    : "Verified customer reviews will appear here. Check back after shoppers share their experience."}
              className="!border-solid lg:!min-h-[350px] [&_p]:!max-w-[400px]"
            />
          )}

          {/* View All Reviews Link */}
          {displayTotal > 0 && (
            <div className=" pt-3 border-t border-[#E7D9B8]/40 flex justify-start">
              <Link
                to={`/products/${productId}/reviews`}
                state={{ product }}
                className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#CE9F2D] "
              >
                <span>
                  {displayTotal === 1
                    ? "View all reviews"
                    : `View all (${displayTotal}) reviews`}
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
