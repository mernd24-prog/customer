<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, Star, ThumbsUp, UserCircle } from "lucide-react";
import {
  fetchProductReviews,
  markReviewHelpful,
} from "../../features/review/reviewSlice";
import { fetchProductById } from "../../features/product/productSlice";
=======
import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, MessageCircle, ThumbsUp } from "lucide-react";
import { ratingBreakdown, reviews } from "../../data/review";
>>>>>>> origin/aditi-dev

const LIMIT = 10;

function StarRow({ rating, size = 14 }) {
  const filled = Math.round(Number(rating || 0));
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= filled ? "fill-gold text-gold" : "fill-border text-border"}
        />
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
<<<<<<< HEAD
    <div className="grid grid-cols-[18px_1fr_32px] items-center gap-2">
      <span className="text-[11px] font-semibold text-muted">{star}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
=======
    <article className="border-b  border-[var(--customer-border)] py-4">
      <div className="flex items-start gap-3">
        <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[var(--customer-success)] text-[10px] font-bold text-white">
          ✓
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-5 text-[var(--customer-ink)]">
            {review.text}
          </p>

          <p className="mt-3 text-[11px] font-medium text-[var(--customer-muted)]">
            {review.name} | {review.date}
          </p>
        </div>
        <div className="ml-auto hidden items-center gap-4 text-[var(--customer-muted)] sm:flex">
          <span className="inline-flex items-center gap-1 text-[11px]">
            <ThumbsUp size={13} /> {review.helpful}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px]">
            <MessageCircle size={13} /> 0
          </span>
        </div>
>>>>>>> origin/aditi-dev
      </div>
      <span className="text-right text-[10px] font-semibold text-muted">{count}</span>
    </div>
  );
}

function ReviewCard({ review, currentUserId, onHelpful }) {
  const isOwn = currentUserId && String(review.buyerId) === String(currentUserId);
  const alreadyVoted = (review.helpfulVotedBy || []).includes(String(currentUserId || ""));
  const name = review.buyerName || review.name || "Verified Buyer";
  const text = review.reviewText || review.text;
  const media = review.media || review.images || [];
  const helpfulVotes = review.helpfulVotes ?? review.helpful ?? 0;
  const reviewId = review._id || review.id;
  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : review.date || "";

  return (
    <article className="border-b border-border py-5 last:border-b-0">
      <div className="mb-3 flex items-center gap-2">
        <UserCircle size={22} className="shrink-0 text-border-strong" />
        <span className="text-sm font-semibold text-muted">{name}</span>
        {isOwn && (
          <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold-dark">
            Your review
          </span>
        )}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">
          {Number(review.rating || 0).toFixed(1)} ★
        </span>
        {review.title && (
          <span className="text-sm font-semibold text-ink">{review.title}</span>
        )}
        <span className="text-xs text-muted">{dateStr}</span>
      </div>

      {text && <p className="text-sm leading-relaxed text-ink">{text}</p>}

      {media.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {media.slice(0, 5).map((img, i) => (
            <img
              key={i}
              src={typeof img === "string" ? img : img?.url || img?.src || ""}
              alt=""
              className="h-16 w-16 rounded-[4px] border border-border object-cover"
            />
          ))}
        </div>
      )}

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

function getProductInfo(product) {
  if (!product) return null;
  return {
    title: product.title || product.name || "Product",
    category:
      product.category?.name ||
      (typeof product.category === "string" ? product.category : "") ||
      product.subcategory?.name ||
      "",
    price: product.salePrice ?? product.price ?? product.sellingPrice ?? null,
    mrp: product.mrp ?? product.originalPrice ?? product.compareAtPrice ?? null,
    image:
      (Array.isArray(product.images) ? product.images[0] : null) ||
      product.thumbnail ||
      product.image ||
      "",
  };
}

export default function ReviewDetailsPage() {
  const { productId } = useParams();
<<<<<<< HEAD
  const dispatch = useDispatch();

  const currentUser = useSelector((s) => s.auth.current);
  const userId = currentUser?.id || currentUser?._id;

  const productEntities = useSelector((s) => s.product.entities || {});
  const productCurrent = useSelector((s) => s.product.current);
  const rawProduct =
    productEntities[productId] ||
    (productCurrent?.id === productId || productCurrent?._id === productId
      ? productCurrent
      : null);
  const product = getProductInfo(rawProduct);

  const reviewState = useSelector((s) => s.review);
  const bucket = reviewState.reviewsByProduct[productId] || {};
  const stats = reviewState.statsByProduct[productId] || null;
  const reviews = bucket.items || [];
  const total = bucket.total || 0;
  const loading = bucket.loading ?? false;
  const error = bucket.error || null;

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState(0);

  useEffect(() => {
    if (productId) dispatch(fetchProductById({ productId }));
  }, [dispatch, productId]);

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

  const handleHelpful = (reviewId) => {
    if (!currentUser) return;
    dispatch(markReviewHelpful({ productId, reviewId }));
  };

  const handleFilter = (star) => {
    setRatingFilter((prev) => (prev === star ? 0 : star));
    setPage(1);
  };

  const handleSort = (value) => {
    setSort(value);
    setPage(1);
  };

  const avgRating = stats?.avgRating ?? stats?.averageRating ?? 0;
  const reviewCount = stats?.count ?? stats?.totalCount ?? total;
  const ratingDist = stats?.distribution || stats?.ratingDistribution || {};
  const totalPages = Math.ceil(total / LIMIT);
=======
  const { state } = useLocation();
  const product = getProductDisplay(state?.product);
  const allReviews = [
    ...reviews,
    ...reviews.map((review, index) => ({
      ...review,
      name: ["Ankita", "Mythra Customer", "Shivani", "Rachana"][index % 4],
      date: ["13 Feb 2026", "2 June 2026", "20 May 2026", "15 May 2026"][
        index % 4
      ],
      helpful: index,
    })),
    ...reviews.map((review, index) => ({
      ...review,
      name: ["Priti", "Neha", "Divya", "Palavi"][index % 4],
      date: ["25 Mar 2026", "2 June 2026", "19 Mar 2026", "20 May 2026"][
        index % 4
      ],
      text: [
        "Quality is too good. Soft and comfortable.",
        "Very soft and comfortable. Must buy.",
        "Very good purchase till date. Thank you.",
        "Nice slipper and clean finish.",
      ][index % 4],
      helpful: 0,
    })),
  ];
>>>>>>> origin/aditi-dev

  return (
    <main className="bg-white">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-8 lg:grid-cols-[280px_1fr]">
        {/* ── Sidebar ── */}
        <aside className="lg:sticky lg:top-[calc(var(--customer-header-height,0px)+24px)] lg:self-start">
          <Link
            to={productId ? `/products/${productId}` : "/products"}
            className="mb-4 inline-flex items-center gap-1 text-xs font-bold uppercase text-gold-dark"
          >
            <ChevronLeft size={16} /> Back to product
          </Link>
<<<<<<< HEAD

          {product ? (
            <>
              <img
                src={product.image}
                alt={product.title}
                className="aspect-[3/4] w-full rounded-[4px] bg-cream object-cover"
              />
              <div className="mt-4">
                <h1 className="text-base font-bold uppercase text-ink">{product.title}</h1>
                {product.category && (
                  <p className="mt-1 text-sm text-muted">{product.category}</p>
                )}
                {product.price != null && (
                  <p className="mt-4 text-sm font-bold text-ink">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                    {product.mrp != null && Number(product.mrp) > Number(product.price) && (
                      <span className="ml-2 font-medium text-muted line-through">
                        ₹{Number(product.mrp).toLocaleString("en-IN")}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="aspect-[3/4] w-full animate-pulse rounded-[4px] bg-cream" />
          )}
=======
          <img
            src={product.image}
            alt={product.title}
            className="aspect-[3/4]  w-full rounded-[4px] bg-[var(--customer-cream)] object-cover"
          />
          <div className="mt-4">
            <h1 className="text-base font-bold uppercase text-[var(--customer-ink)]">
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
>>>>>>> origin/aditi-dev
        </aside>

        {/* ── Main content ── */}
        <section className="min-w-0">
          {/* Rating summary */}
          <div className="border-b border-border pb-6">
            <h2 className="text-sm font-bold uppercase text-ink">Ratings &amp; Reviews</h2>
            <div className="mt-5 grid max-w-[540px] grid-cols-[120px_1fr] gap-8">
              <div>
                <div className="text-4xl font-bold text-ink">
                  {Number(avgRating).toFixed(1)}
                </div>
                <div className="mt-1">
                  <StarRow rating={avgRating} size={16} />
                </div>
                <p className="mt-2 text-xs font-semibold text-blue-600">
                  {reviewCount > 0 ? `${reviewCount.toLocaleString("en-IN")} verified buyer${reviewCount !== 1 ? "s" : ""}` : "No reviews yet"}
                </p>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleFilter(star)}
                    className={`w-full transition ${ratingFilter === star ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
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

<<<<<<< HEAD
          {/* Customer photos */}
          {reviews.some((r) => (r.media || r.images || []).length > 0) && (
            <div className="border-b border-border py-5">
              <h3 className="text-sm font-bold text-ink">Customer photos</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {reviews
                  .flatMap((r) => r.media || r.images || [])
                  .slice(0, 12)
                  .map((img, i) => (
                    <img
                      key={i}
                      src={typeof img === "string" ? img : img?.url || img?.src || ""}
                      alt=""
                      className="h-[70px] w-[70px] rounded-[4px] border border-border object-cover"
                    />
                  ))}
              </div>
            </div>
          )}
=======
          {/* <div className="border-b border-[var(--customer-border)] py-5">
            <h3 className="text-sm font-bold text-[var(--customer-ink)]">
              Customer Photos (33)
            </h3>
          </div> */}
>>>>>>> origin/aditi-dev

          {/* Sort + review list */}
          <div className="py-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-ink">
                Customer reviews
                {total > 0 && <span className="ml-1 font-normal text-muted">({total})</span>}
              </h3>
              <select
                value={sort}
                onChange={(e) => handleSort(e.target.value)}
                className="rounded-[6px] border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink focus:outline-none"
              >
                <option value="newest">Most recent</option>
                <option value="helpful">Most helpful</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
              </select>
            </div>

            {loading && reviews.length === 0 && (
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
            )}

            {error && !loading && (
              <p className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {!loading && !error && reviews.length === 0 && (
              <div className="rounded-[8px] border border-dashed border-border bg-cream px-4 py-8 text-center text-sm text-muted">
                {ratingFilter
                  ? `No ${ratingFilter}-star reviews yet.`
                  : "No reviews yet. Be the first to review this product."}
              </div>
            )}

            {reviews.map((review) => (
              <ReviewCard
                key={review._id || review.id}
                review={review}
                currentUserId={userId}
                onHelpful={handleHelpful}
              />
            ))}

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
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
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-[6px] border border-border px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40 hover:enabled:bg-cream"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
