import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, Star, ThumbsUp } from "lucide-react";
import CustomDropdown from "../../components/ui/CustomDropdown";
import ReviewMediaLightbox from "../../modules/products/components/ReviewMediaLightbox";
import Seo from "../../components/ui/Seo";
import AppErrorBoundary from "../../components/ui/AppErrorBoundary";
import { useAuthModal } from "../../modules/auth/context/AuthModalContext";
import {
  fetchProductReviews,
  fetchMyProductReview,
  markReviewHelpful,
} from "../../features/review/reviewSlice";
import {
  getImageUrlFromValue,
  getProductPublicPath,
} from "../../utils/ecommerce";
import {
  sortReviews,
  getUserDisplayName,
  getProductDisplay,
} from "../../utils/pages/reviewUtils";

const LIMIT = 10;
const STAR_VALUES = [5, 4, 3, 2, 1];

function StarRow({ rating, size = 14 }) {
  const filled = Math.round(Number(rating || 0));

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= filled ? "fill-gold text-gold" : "fill-border text-border"
          }
        />
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0;

  return (
    <div className="grid grid-cols-[38px_1fr_30px] items-center gap-2 text-xs font-semibold text-muted">
      <span>{star} ★</span>
      <div className="h-2 overflow-hidden rounded-full bg-cream">
        <span
          className="block h-full rounded-full bg-gold"
          style={{ width: `${pct}%` }}
        />
      </div>

      <span className="text-right">{count}</span>
    </div>
  );
}

function ProductReviewSidebar({ product, productId }) {
  const navigate = useNavigate();
  const targetProduct = product?.rawProduct || product || { id: productId };
  const rawId = targetProduct?.id || targetProduct?._id || productId;
  const productPath = getProductPublicPath(
    targetProduct?.slug || rawId ? targetProduct : { id: productId },
  );

  const handleBack = (e) => {
    e.preventDefault();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(productPath);
    }
  };

  return (
    <aside className="lg:sticky lg:top-[calc(var(--customer-header-height,95px)+24px)] lg:self-start">
      <Link
        to={productPath}
        onClick={handleBack}
        className="mb-3.5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#CE9F2D] hover:text-[#1B1D60] transition-colors group cursor-pointer"
      >
        <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        Back to Product
      </Link>

      <Link
        to={productPath}
        className="block overflow-hidden rounded-[8px] border border-border bg-white transition hover:border-gold/70"
        aria-label={`Back to ${product.title}`}
      >
        <img
          loading="lazy"
          width="520"
          height="620"
          src={product.image}
          alt={product.title}
          className="aspect-[4/5] w-full bg-[var(--customer-cream)] object-cover"
        />
      </Link>

      <div className="mt-5 space-y-2">
        {product.brand && (
          <p className="text-xs font-extrabold uppercase text-[var(--customer-gold-dark)]">
            {product.brand}
          </p>
        )}

        <h1 className="text-base font-bold uppercase leading-snug text-[var(--customer-ink)]">
          {product.title}
        </h1>

        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-2 text-sm font-bold text-[var(--customer-ink)]">
          <span>Rs. {product.price}</span>
          {product.mrp && (
            <span className="font-medium text-[var(--customer-muted)] line-through">
              Rs. {product.mrp}
            </span>
          )}
          {product.discount && (
            <span className="font-bold text-[var(--customer-gold-dark)]">
              ({product.discount})
            </span>
          )}
        </p>
      </div>
    </aside>
  );
}

function RatingSummary({
  avgRating,
  reviewCount,
  ratingDist,
  ratingFilter,
  onFilter,
}) {
  return (
    <div className="border-b border-border pb-6">
      <h2 className="text-sm font-bold uppercase text-ink">
        Ratings &amp; Reviews
      </h2>

      <div className="mt-5 grid max-w-[540px] grid-cols-[120px_1fr] gap-8">
        <div>
          <div className="text-4xl font-bold text-ink">
            {Number(avgRating).toFixed(1)}
          </div>

          <div className="mt-1">
            <StarRow rating={avgRating} size={16} />
          </div>

          <p className="mt-2 text-xs font-semibold text-blue-600">
            {reviewCount > 0
              ? `${reviewCount.toLocaleString("en-IN")} verified buyer${
                  reviewCount !== 1 ? "s" : ""
                }`
              : "No Reviews Yet"}
          </p>
        </div>

        <div className="space-y-2">
          {STAR_VALUES.map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onFilter(star)}
              className={`w-full transition ${
                ratingFilter === star
                  ? "opacity-100"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              <RatingBar
                star={star}
                count={ratingDist[star] ?? ratingDist[String(star)] ?? 0}
                total={reviewCount}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewsHeader({ total, sort, onSort }) {
  const sortOptions = [
    { value: "newest", label: "Most Recent" },
    { value: "helpful", label: "Most Helpful" },
    { value: "highest", label: "Highest Rated" },
    { value: "lowest", label: "Lowest Rated" },
  ];

  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-sm font-bold text-ink">
        Customer Reviews
        {total > 0 && (
          <span className="ml-1 font-normal text-muted">({total})</span>
        )}
      </h3>

      <CustomDropdown
        className="z-30 w-[190px]"
        buttonClassName="h-10 rounded-[10px] border-[#CE9F2D] font-semibold text-[#1B1D60] hover:bg-[#FFF9EA] focus:ring-2 focus:ring-[#EAD9B6]"
        options={sortOptions}
        value={sort}
        onChange={onSort}
        placeholder="Most Recent"
      />
    </div>
  );
}

function ReviewCard({ review, currentUser, currentUserId, onHelpful }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
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

  const helpfulVotes = review.helpfulVotes ?? review.helpful ?? 0;
  const reviewId = review._id || review.id;
  const media = Array.isArray(review.media)
    ? review.media.map(getImageUrlFromValue).filter(Boolean)
    : [];

  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : review.date || "";

  return (
    <article className="border-b border-border pb-4 pt-1 last:border-b-0">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-0.5 text-gold">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={18}
              className={
                star <= Math.round(Number(review.rating || 0))
                  ? "fill-gold text-gold"
                  : "fill-border text-border"
              }
            />
          ))}
        </span>

        {review.title && (
          <span className="text-base sm:text-lg font-bold text-ink">
            {review.title}
          </span>
        )}
      </div>

      {text && <p className="text-sm leading-relaxed text-ink">{text}</p>}

      {media.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {media.slice(0, 5).map((url, index) => (
            <button
              type="button"
              key={`${url}-${index}`}
              onClick={() => setLightboxIndex(index)}
              className="block h-20 w-20  overflow-hidden rounded-[8px] border border-gold/20 bg-cream sm:h-24 sm:w-24"
            >
              <img
                loading="lazy"
                width="400"
                height="400"
                src={url}
                alt={`Review media ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm sm:text-base font-medium text-black/70">
          {name}
          {dateStr && (
            <span className="font-normal text-muted"> | {dateStr}</span>
          )}
        </p>

        <button
          type="button"
          onClick={() => onHelpful(reviewId)}
          disabled={!reviewId || isOwn}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            alreadyVoted
              ? "border-gold bg-gold/15 text-ink"
              : "border-border text-muted hover:border-gold hover:bg-cream/60 hover:text-ink"
          }`}
        >
          <ThumbsUp
            size={14}
            className={alreadyVoted ? "fill-gold text-gold" : ""}
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

function ReviewSkeletonList() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map((n) => (
        <div key={n} className="animate-pulse border-b border-border py-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-cream" />
            <div className="h-3 w-24 rounded bg-cream" />
          </div>

          <div className="h-3 w-full rounded bg-cream" />
          <div className="mt-2 h-3 w-3/4 rounded bg-cream" />
        </div>
      ))}
    </div>
  );
}

function ReviewError({ error }) {
  if (!error) return null;

  return (
    <p className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}
    </p>
  );
}

function ReviewEmptyState({ ratingFilter }) {
  return (
    <div className="rounded-[8px] border border-dashed border-border bg-cream px-4 py-8 text-center text-sm text-muted">
      {ratingFilter
        ? `No ${ratingFilter}-star reviews yet.`
        : "No reviews yet. Be the first to review this product."}
    </div>
  );
}

function ReviewList({
  loading,
  error,
  visibleReviews,
  ratingFilter,
  userId,
  currentUser,
  onHelpful,
  hasReviewed,
}) {
  if (loading && visibleReviews.length === 0) {
    return <ReviewSkeletonList />;
  }

  if (error && !loading) {
    return <ReviewError error={error} />;
  }

  if (!loading && !error && visibleReviews.length === 0) {
    return <ReviewEmptyState ratingFilter={ratingFilter} />;
  }

  return (
    <>
      {visibleReviews.map((review) => (
        <ReviewCard
          key={review._id || review.id}
          review={review}
          currentUser={currentUser}
          currentUserId={userId}
          onHelpful={onHelpful}
          hasReviewed={hasReviewed}
        />
      ))}
    </>
  );
}

function ReviewPagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={onPrev}
        className="rounded-[6px] border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40 hover:enabled:bg-cream"
      >
        Previous
      </button>

      <span className="text-xs text-muted">
        Page {page} Of {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={onNext}
        className="rounded-[6px] border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40 hover:enabled:bg-cream"
      >
        Next
      </button>
    </div>
  );
}

export default function ReviewDetailsPage() {
  const { productId: routeProductId, publicCode, productToken } = useParams();
  const rawRouteProductId = publicCode || routeProductId;
  const isRawObjectIdRoute =
    !productToken && /^[a-f0-9]{24}$/i.test(String(rawRouteProductId || ""));
  const productId = isRawObjectIdRoute ? "" : productToken || rawRouteProductId;
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openAuthModal } = useAuthModal();

  const product = getProductDisplay(state?.product);
  const currentUser = useSelector((store) => store.auth.current);
  const userId =
    currentUser?.id || currentUser?._id || currentUser?.userId || null;
  const reviewState = useSelector((store) => store.review);
  const bucket = reviewState.reviewsByProduct[productId] || {};
  const stats = reviewState.statsByProduct[productId] || null;
  const myReview = reviewState.myReviewByProduct[productId];
  const allReviews = useMemo(() => {
    const items = bucket.items || [];
    if (myReview?.status !== "published") return items;
    return [
      myReview,
      ...items.filter(
        (review) =>
          String(review._id || review.id) !==
          String(myReview._id || myReview.id),
      ),
    ];
  }, [bucket.items, myReview]);

  const [ratingFilter, setRatingFilter] = useState(null);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isRawObjectIdRoute) {
      navigate("/products", { replace: true });
    }
  }, [isRawObjectIdRoute, navigate]);

  const loading = Boolean(bucket.loading);
  const error = bucket.error || "";

  const ratingDist = useMemo(() => {
    if (stats?.distribution) return stats.distribution;
    return allReviews.reduce((acc, review) => {
      const rating = Math.round(Number(review.rating || 0));

      if (rating >= 1 && rating <= 5) {
        acc[rating] = (acc[rating] || 0) + 1;
      }

      return acc;
    }, {});
  }, [allReviews, stats]);

  const reviewCount = Number(
    stats?.count || bucket.total || allReviews.length || 0,
  );

  const avgRating =
    stats?.avgRating ??
    (reviewCount > 0
      ? allReviews.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0,
        ) / Math.max(allReviews.length, 1)
      : 0);

  useEffect(() => {
    if (!productId) return;
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
    if (!productId || !userId) return;
    dispatch(fetchMyProductReview({ productId }));
  }, [dispatch, productId, userId]);

  const filteredReviews = useMemo(
    () =>
      sortReviews(allReviews, sort).reduce((acc, review) => {
        const rating = Math.round(Number(review.rating || 0));

        if (!ratingFilter || rating === ratingFilter) {
          acc.push(review);
        }

        return acc;
      }, []),
    [allReviews, ratingFilter, sort],
  );

  const total = ratingFilter
    ? Number(bucket.total ?? filteredReviews.length)
    : Number(bucket.total || filteredReviews.length || 0);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const visibleReviews = filteredReviews;
  const ownReviewId =
    myReview?.status === "published" ? String(myReview._id || myReview.id) : "";
  const pinnedVisibleReviews =
    ownReviewId && sort === "newest"
      ? [
          ...visibleReviews.filter(
            (review) => String(review._id || review.id) === ownReviewId,
          ),
          ...visibleReviews.filter(
            (review) => String(review._id || review.id) !== ownReviewId,
          ),
        ]
      : visibleReviews;
  const handleFilter = useCallback((star) => {
    setRatingFilter((current) => (current === star ? null : star));
    setPage(1);
  }, []);

  const handleSort = useCallback((value) => {
    setSort(value);
    setPage(1);
  }, []);

  const handleHelpful = useCallback(
    (reviewId) => {
      if (!userId) {
        openAuthModal();
        return;
      }
      if (!reviewId) return;
      dispatch(markReviewHelpful({ productId, reviewId }));
    },
    [userId, openAuthModal, dispatch, productId],
  );

  return (
    <AppErrorBoundary>
      <main className="bg-white">
        <Seo
          title={
            product?.title
              ? `${product.title} Reviews - Sam Global`
              : "Product Reviews - Sam Global"
          }
          metaDescription={`Read customer reviews and ratings for ${product?.title || "this product"}.`}
        />
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-8 lg:grid-cols-[340px_1fr] xl:grid-cols-[360px_1fr]">
          <ProductReviewSidebar product={product} productId={productId} />

          <section className="min-w-0">
            <RatingSummary
              avgRating={avgRating}
              reviewCount={reviewCount}
              ratingDist={ratingDist}
              ratingFilter={ratingFilter}
              onFilter={handleFilter}
            />

            <div className="py-4">
              <ReviewsHeader total={total} sort={sort} onSort={handleSort} />

              <ReviewList
                loading={loading}
                error={error}
                visibleReviews={pinnedVisibleReviews}
                ratingFilter={ratingFilter}
                userId={userId}
                currentUser={currentUser}
                onHelpful={handleHelpful}
                hasReviewed={myReview?.status === "published"}
              />

              <ReviewPagination
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage((p) => p - 1)}
                onNext={() => setPage((p) => p + 1)}
              />
            </div>
          </section>
        </div>
      </main>
    </AppErrorBoundary>
  );
}
