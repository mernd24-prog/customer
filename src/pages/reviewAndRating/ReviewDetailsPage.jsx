import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, MessageCircle, ThumbsUp } from "lucide-react";
import {
  ratingBreakdown,
  reviewImages,
  reviews,
} from "./reviewAndRating";

const fallbackProduct = {
  title: "Doctor Extra Soft",
  category: "Women Thong Flip-Flops",
  price: "539",
  mrp: "1,999",
  discount: "73% OFF",
  image: "/image/png/luxury-watches.png",
};

function displayText(value, fallback = "") {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number") return value;
  return value.name || value.label || value.title || fallback;
}

function displayImage(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.url || value.src || value.path || "";
}

function getProductDisplay(product) {
  return {
    title: displayText(
      product?.title ||
      product?.name ||
        product?.productName,
      fallbackProduct.title,
    ),
    category: displayText(
      product?.category?.name ||
      product?.category ||
        product?.subcategory?.name,
      fallbackProduct.category,
    ),
    price: displayText(
      product?.price || product?.salePrice || product?.sellingPrice,
      fallbackProduct.price,
    ),
    mrp: displayText(
      product?.mrp || product?.originalPrice || product?.compareAtPrice,
      fallbackProduct.mrp,
    ),
    discount: displayText(
      product?.discountLabel || product?.discount,
      fallbackProduct.discount,
    ),
    image:
      displayImage(product?.thumbnail) ||
      displayImage(product?.image) ||
      displayImage(product?.images?.[0]) ||
      fallbackProduct.image,
  };
}

function MiniRatingBars() {
  return (
    <div className="space-y-2">
      {ratingBreakdown.map((item, index) => (
        <div key={item.label} className="grid grid-cols-[18px_1fr_28px] items-center gap-3">
          <span className="text-[11px] font-semibold text-[var(--customer-muted)]">
            {5 - index}
          </span>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--customer-border)]">
            <div
              className={`h-full rounded-full ${item.color}`}
              style={{ width: item.width }}
            />
          </div>
          <span className="text-[10px] font-semibold text-[var(--customer-muted)]">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function ReviewRow({ review }) {
  return (
    <article className="border-b border-[var(--customer-border)] py-4">
      <div className="flex items-start gap-3">
        <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[var(--customer-success)] text-[10px] font-bold text-white">
          ✓
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-5 text-[var(--customer-ink)]">
            {review.text}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {review.images.map((image) => (
              <img
                key={image}
                src={image}
                alt=""
                className="h-16 w-16 rounded-[4px] border border-[var(--customer-border)] object-cover"
              />
            ))}
          </div>
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
      </div>
    </article>
  );
}

export default function ReviewDetailsPage() {
  const { productId } = useParams();
  const { state } = useLocation();
  const product = getProductDisplay(state?.product);
  const allReviews = [
    ...reviews,
    ...reviews.map((review, index) => ({
      ...review,
      name: ["Ankita", "Mythra Customer", "Shivani", "Rachana"][index % 4],
      date: ["13 Feb 2026", "2 June 2026", "20 May 2026", "15 May 2026"][index % 4],
      helpful: index,
      images: reviewImages.slice(index % 3, (index % 3) + 2),
    })),
    ...reviews.map((review, index) => ({
      ...review,
      name: ["Priti", "Neha", "Divya", "Palavi"][index % 4],
      date: ["25 Mar 2026", "2 June 2026", "19 Mar 2026", "20 May 2026"][index % 4],
      text: [
        "Quality is too good. Soft and comfortable.",
        "Very soft and comfortable. Must buy.",
        "Very good purchase till date. Thank you.",
        "Nice slipper and clean finish.",
      ][index % 4],
      helpful: 0,
      images: reviewImages.slice(0, (index % 4) + 1),
    })),
  ];

  return (
    <main className="bg-white">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-[calc(var(--customer-header-height,0px)+24px)] lg:self-start">
          <Link
            to={productId ? `/products/${productId}` : "/products"}
            className="mb-4 inline-flex items-center gap-1 text-xs font-bold uppercase text-[var(--customer-gold-dark)]"
          >
            <ChevronLeft size={16} /> Back to product
          </Link>
          <img
            src={product.image}
            alt={product.title}
            className="aspect-[3/4] w-full rounded-[4px] bg-[var(--customer-cream)] object-cover"
          />
          <div className="mt-4">
            <h1 className="text-base font-bold uppercase text-[var(--customer-ink)]">
              {product.title}
            </h1>
            <p className="mt-1 text-sm text-[var(--customer-muted)]">{product.category}</p>
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

        <section>
          <div className="border-b border-[var(--customer-border)] pb-6">
            <h2 className="text-sm font-bold uppercase text-[var(--customer-ink)]">
              Ratings
            </h2>
            <div className="mt-5 grid max-w-[560px] grid-cols-[110px_1fr] gap-8">
              <div>
                <div className="flex items-center gap-2 text-4xl font-medium text-[var(--customer-ink)]">
                  4.5 <span className="text-xl text-[var(--customer-success)]">★</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-[var(--customer-info)]">
                  147 Verified Buyers
                </p>
              </div>
              <MiniRatingBars />
            </div>
          </div>

          <div className="border-b border-[var(--customer-border)] py-5">
            <h3 className="text-sm font-bold text-[var(--customer-ink)]">
              Customer Photos (33)
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {reviewImages.map((image) => (
                <img
                  key={image}
                  src={image}
                  alt=""
                  className="h-[70px] w-[70px] rounded-[4px] border border-[var(--customer-border)] object-cover"
                />
              ))}
            </div>
          </div>

          <div className="py-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--customer-ink)]">
                Customer Reviews (28)
              </h3>
              <span className="text-xs font-bold text-[var(--customer-gold-dark)]">
                Most Helpful
              </span>
            </div>
            {allReviews.map((review, index) => (
              <ReviewRow key={`${review.name}-${review.date}-${index}`} review={review} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
