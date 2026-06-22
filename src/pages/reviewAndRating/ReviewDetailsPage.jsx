import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, Star, ThumbsUp, UserCircle } from "lucide-react";
import { reviews as fallbackReviews } from "../../data/review";
import {
  getImageFallbackSrc,
  getProductImage,
  getProductMrp,
  getProductPrice,
  getProductTitle,
} from "../../utils/ecommerce";

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
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="grid grid-cols-[32px_1fr_40px] items-center gap-2 text-xs font-semibold text-muted">
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
  return (
    <aside className="lg:sticky lg:top-[calc(var(--customer-header-height,0px)+24px)] lg:self-start">
      <Link
        to={productId ? `/products/${productId}` : "/products"}
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold uppercase text-gold-dark"
      >
        <ChevronLeft size={16} />
        Back to product
      </Link>

      <img
        src={product.image}
        alt={product.title}
        className="aspect-[10/10] max-w-[800px] w-full rounded-[4px] bg-[var(--customer-cream)] object-cover"
      />

      <div className="mt-4">
        <h1 className="text-base  font-bold uppercase text-[var(--customer-ink)]">
          {product.title}
        </h1>

        <p className="mt-1 text-sm text-[var(--customer-muted)]">
          {product.category}
        </p>

        <p className="mt-5 text-sm font-bold text-[var(--customer-ink)]">
          Rs. {product.price}
          <span className="ml-2 font-medium text-[var(--customer-muted)] line-through">
            Rs. {product.mrp}
          </span>
          <span className="ml-2 font-bold text-[var(--customer-gold-dark)]">
            ({product.discount})
          </span>
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
              : "No reviews yet"}
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
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-sm font-bold text-ink">
        Customer reviews
        {total > 0 && (
          <span className="ml-1 font-normal text-muted">({total})</span>
        )}
      </h3>

      <select
        value={sort}
        onChange={(e) => onSort(e.target.value)}
        className="rounded-[6px] border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink focus:outline-none"
      >
        <option value="newest">Most recent</option>
        <option value="helpful">Most helpful</option>
        <option value="highest">Highest rated</option>
        <option value="lowest">Lowest rated</option>
      </select>
    </div>
  );
}

function ReviewCard({ review, currentUserId, onHelpful }) {
  const isOwn =
    currentUserId && String(review.buyerId) === String(currentUserId);

  const alreadyVoted = (review.helpfulVotedBy || []).includes(
    String(currentUserId || ""),
  );

  const name = review.buyerName || review.name || "Verified Buyer";
  const text = review.reviewText || review.text;
  const helpfulVotes = review.helpfulVotes ?? review.helpful ?? 0;
  const reviewId = review._id || review.id;

  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : review.date || "";

  return (
    <article className="border-b border-border py-5 last:border-b-0">
      <div className="mb-3 flex items-center gap-2">
        <UserCircle size={22} className="shrink-0 text-black/70" />

        <span className="text-base font-bold text-black/70">{name}</span>

        {isOwn && (
          <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold-dark">
            Your review
          </span>
        )}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full  bg-gold px-2 py-0.5 text-[11px] font-bold text-white">
          {Number(review.rating || 0).toFixed(1)} ★
        </span>

        {review.title && (
          <span className="text-lg  font-semibold  text-ink">
            {review.title}
          </span>
        )}

        <span className="text-sm text-muted">{dateStr}</span>
      </div>

      {text && <p className="text-sm leading-relaxed text-ink">{text}</p>}

      <button
        type="button"
        onClick={() => onHelpful(reviewId)}
        disabled={alreadyVoted || isOwn}
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-ink disabled:opacity-50"
      >
        <ThumbsUp size={12} />
        Helpful ({helpfulVotes})
      </button>
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
  onHelpful,
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
          currentUserId={userId}
          onHelpful={onHelpful}
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
        Page {page} of {totalPages}
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

function getProductDisplay(product) {
  const title = getProductTitle(product, "Product");

  const category =
    product?.category?.name ||
    (typeof product?.category === "string" ? product.category : "") ||
    product?.subcategory?.name ||
    "";

  const price = getProductPrice(product) ?? product?.salePrice ?? "";
  const mrp = getProductMrp(product) ?? product?.originalPrice ?? "";

  const discount =
    mrp && price && Number(mrp) > Number(price)
      ? `${Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100)}% off`
      : product?.discount || "";

  return {
    title,
    category,
    price,
    mrp,
    discount,
    image: getProductImage(product) || getImageFallbackSrc(title, category),
  };
}

export default function ReviewDetailsPage() {
  const { productId } = useParams();
  const { state } = useLocation();

  const product = getProductDisplay(state?.product);

  const [ratingFilter, setRatingFilter] = useState(null);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const loading = false;
  const error = "";
  const userId = null;

  const allReviews = useMemo(
    () => [
      ...fallbackReviews,
      ...fallbackReviews.map((review, index) => ({
        ...review,
        id: `copy-a-${index}`,
        name: ["Ankita", "Mythra Customer"][index % 2],
        date: ["13 Feb 2026", "2 June 2026", "20 May 2026", "15 May 2026"][
          index % 4
        ],
        helpful: index,
      })),
    ],
    [],
  );

  const ratingDist = useMemo(
    () =>
      allReviews.reduce((acc, review) => {
        const rating = Math.round(Number(review.rating || 0));

        if (rating >= 1 && rating <= 5) {
          acc[rating] = (acc[rating] || 0) + 1;
        }

        return acc;
      }, {}),
    [allReviews],
  );

  const reviewCount = allReviews.length;

  const avgRating =
    reviewCount > 0
      ? allReviews.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0,
        ) / reviewCount
      : 0;

  const filteredReviews = useMemo(() => {
    const nextReviews = ratingFilter
      ? allReviews.filter(
          (review) => Math.round(Number(review.rating || 0)) === ratingFilter,
        )
      : [...allReviews];

    nextReviews.sort((a, b) => {
      if (sort === "helpful") {
        return (
          (b.helpfulVotes ?? b.helpful ?? 0) -
          (a.helpfulVotes ?? a.helpful ?? 0)
        );
      }

      if (sort === "highest") {
        return Number(b.rating || 0) - Number(a.rating || 0);
      }

      if (sort === "lowest") {
        return Number(a.rating || 0) - Number(b.rating || 0);
      }

      return (
        new Date(b.createdAt || b.date || 0) -
        new Date(a.createdAt || a.date || 0)
      );
    });

    return nextReviews;
  }, [allReviews, ratingFilter, sort]);

  const total = filteredReviews.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const visibleReviews = filteredReviews.slice(
    (page - 1) * LIMIT,
    page * LIMIT,
  );

  const handleFilter = (star) => {
    setRatingFilter((current) => (current === star ? null : star));
    setPage(1);
  };
  const handleSort = (value) => {
    setSort(value);
    setPage(1);
  };
  const handleHelpful = () => {};

  return (
    <main className="bg-white">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-8 lg:grid-cols-[280px_1fr]">
        <ProductReviewSidebar product={product} productId={productId} />

        <section className="min-w-0">
          <RatingSummary
            avgRating={avgRating}
            reviewCount={reviewCount}
            ratingDist={ratingDist}
            ratingFilter={ratingFilter}
            onFilter={handleFilter}
          />

          <div className="py-5">
            <ReviewsHeader total={total} sort={sort} onSort={handleSort} />

            <ReviewList
              loading={loading}
              error={error}
              visibleReviews={visibleReviews}
              ratingFilter={ratingFilter}
              userId={userId}
              onHelpful={handleHelpful}
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
  );
}
