import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ThumbsUp,
  UserCircle,
  X,
} from "lucide-react";

const ratingBreakdown = [
  {
    label: "Excellent",
    count: 2648,
    color: "bg-[var(--customer-success)]",
    width: "72%",
  },
  {
    label: "Very Good",
    count: 395,
    color: "bg-[var(--customer-success)]",
    width: "11%",
  },
  {
    label: "Good",
    count: 342,
    color: "bg-[var(--customer-warning)]",
    width: "9%",
  },
  { label: "Average", count: 290, color: "bg-[#f0793d]", width: "8%" },
  {
    label: "Poor",
    count: 574,
    color: "bg-[var(--customer-danger)]",
    width: "16%",
  },
];

const reviewImages = [
  "/image/jpg/productImg1.jpg",
  "/image/jpg/productImg2.jpg",
  "/image/jpg/productImg3.jpg",
  "/image/jpg/productImg4.jpg",
  "/image/png/luxury-watches.png",
  "/image/png/gold-watch-with-rhinestones 1.png",
];

const reviews = [
  {
    name: "Pooja",
    rating: "5.0",
    date: "5 Mar 2026",
    text: "I'm truly happy with my purchase – the wireless mouse is absolutely wonderful! It looks sleek and stylish, feels great in hand, and works so smoothly without any lag. It's extremely easy to use and quick and hassle-free connectivity.",
    helpful: 136,
    images: reviewImages.slice(0, 4),
  },
  {
    name: "Meesho User",
    rating: "5.0",
    date: "6 June 2026",
    text: "I'm truly happy with my purchase – the wireless mouse is absolutely wonderful! It looks sleek and stylish",
    helpful: 0,
    images: reviewImages.slice(1, 4),
  },
  {
    name: "Vinay Shah",
    rating: "5.0",
    date: "7 June 2026",
    text: "It's look classy and feel comfortable and rich",
    helpful: 0,
    images: reviewImages.slice(4, 5),
  },
  {
    name: "Rajni Kashyap",
    rating: "4.0",
    date: "10 June 2026",
    text: "Good quality and nice finishing. Packaging was also clean.",
    helpful: 12,
    images: reviewImages.slice(5, 6),
  },
];

function RatingPill({ rating }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--customer-success)] px-2.5 py-1 text-xs font-bold text-white">
      {rating} <span className="text-[10px]">★</span>
    </span>
  );
}

function ReviewCard({ review, compact = false, onImageClick }) {
  return (
    <article className="border-b border-[var(--customer-border)] py-5 last:border-b-0">
      <div className="mb-3 flex items-center gap-2">
        <UserCircle
          size={24}
          className="shrink-0 text-[var(--customer-border-strong)]"
        />
        <span className="text-sm font-bold text-[var(--customer-muted)]">
          {review.name}
        </span>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <RatingPill rating={review.rating} />
        <span className="text-[var(--customer-border-strong)]">•</span>
        <span className="text-xs font-semibold text-[var(--customer-muted)]">
          Posted on {review.date}
        </span>
      </div>
      <p className="text-sm font-medium leading-6 text-[var(--customer-ink)]">
        {review.text}
      </p>
      <div
        className={`mt-4 flex flex-wrap gap-2 ${compact ? "gap-2" : "gap-3"}`}
      >
        {review.images.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => onImageClick?.(review, image)}
            className={`${compact ? "h-[72px] w-[72px]" : "h-[74px] w-[74px]"} overflow-hidden rounded-[8px] border border-[var(--customer-border)] bg-[var(--customer-cream)]`}
          >
            <img src={image} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--customer-muted)]"
      >
        <ThumbsUp size={18} className="fill-[var(--customer-muted)]" />
        Helpful ({review.helpful})
      </button>
    </article>
  );
}

function ReviewImagePopup({
  activeReview,
  activeImage,
  onClose,
  onSelectImage,
}) {
  useEffect(() => {
    if (!activeReview) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeReview]);

  if (!activeReview) return null;

  const currentIndex = activeReview.images.indexOf(activeImage);
  const isFirstImage = currentIndex <= 0;
  const isLastImage = currentIndex >= activeReview.images.length - 1;
  const goToImage = (direction) => {
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= activeReview.images.length) return;
    onSelectImage(activeReview.images[nextIndex]);
  };

  return (
    <div className="fixed inset-0  z-[1000] flex items-center justify-center bg-black/75 px-3 py-4 sm:px-5 sm:py-6">
      <div className="relative flex max-h-[85vh] w-full max-w-[1040px]  flex-col overflow-hidden rounded-[8px] bg-white shadow-xl  md:h-[min(86vh,500px)] md:flex-row">
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center bg-[#F5F8FB] px-10 py-5 sm:px-14 md:px-0 md:py-6">
          <button
            type="button"
            aria-label="Close review image"
            onClick={onClose}
            className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors bg-black/20  sm:left-5 sm:top-5"
          >
            <X size={24} />
          </button>

          {activeReview.images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous review image"
                onClick={() => goToImage(-1)}
                disabled={isFirstImage}
                className="absolute left-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-black transition-colors bg-black/20 disabled:cursor-not-allowed disabled:opacity-30 sm:left-4 sm:h-11 sm:w-11"
              >
                <ChevronLeft size={34} />
              </button>
              <button
                type="button"
                aria-label="Next review image"
                onClick={() => goToImage(1)}
                disabled={isLastImage}
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-black transition-colors bg-black/20 disabled:cursor-not-allowed disabled:opacity-30 sm:right-4 sm:h-11 sm:w-11"
              >
                <ChevronRight size={34} />
              </button>
            </>
          )}

          <img
            src={activeImage}
            alt=""
            className="max-h-[44vh] max-w-full rounded-[4px] object-contain md:max-h-[calc(100%-110px)]"
          />

          <div className="mt-4 flex max-w-full justify-center gap-2 overflow-x-auto pb-1 sm:gap-3">
            {activeReview.images.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => onSelectImage(image)}
                className={`h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[4px] border-2 bg-white sm:h-[72px] sm:w-[72px] ${
                  image === activeImage
                    ? "border-[var(--customer-gold)]"
                    : "border-transparent"
                }`}
              >
                <img
                  src={image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <aside className="max-h-[34vh] shrink-0 overflow-y-auto bg-white px-5 py-5 sm:px-7 md:max-h-none md:w-[420px] md:py-10">
          <div className="flex items-start gap-3">
            <RatingPill rating={activeReview.rating} />
            <p className="text-sm font-medium leading-6 text-[var(--customer-ink)] sm:text-[15px] sm:leading-7">
              {activeReview.text}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-[var(--customer-muted)] sm:mt-6">
            <span>
              {activeReview.name} <span className="mx-2">|</span>{" "}
              {activeReview.date}
            </span>
            <span className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <ThumbsUp size={16} /> {activeReview.helpful}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle size={16} /> 1
              </span>
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ReviewAndRating({ productId, product }) {
  const [activePopup, setActivePopup] = useState(null);
  const reviewsPath = productId
    ? `/products/${productId}/reviews`
    : "/products";

  return (
    <>
      <section className="panel overflow-hidden p-4 sm:p-6">
        <h2 className="text-xl font-bold text-[var(--customer-ink)]">
          Product Ratings & Reviews
        </h2>

        <div className="mt-8 grid gap-8 md:grid-cols-[120px_1fr] md:items-center">
          <div>
            <div className="flex items-center gap-2 text-[42px] font-bold leading-none text-[var(--customer-success)]">
              4.0 <span className="text-2xl">★</span>
            </div>
            <p className="mt-3 text-xs font-bold leading-5 text-[var(--customer-muted)]">
              4249 Ratings,
              <br />
              1470 Reviews
            </p>
          </div>

          <div className="space-y-4">
            {ratingBreakdown.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[86px_1fr_48px] items-center gap-4"
              >
                <span className="text-right text-xs font-bold text-[var(--customer-ink)]">
                  {item.label}
                </span>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--customer-border)]">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: item.width }}
                  />
                </div>
                <span className="text-xs font-bold text-[var(--customer-muted)]">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--customer-border)]">
          {reviews.slice(0, 2).map((review) => (
            <ReviewCard
              key={`${review.name}-${review.date}`}
              review={review}
              onImageClick={(selectedReview, selectedImage) =>
                setActivePopup({ review: selectedReview, image: selectedImage })
              }
            />
          ))}
        </div>

        <Link
          to={reviewsPath}
          state={{ product }}
          className="flex w-full items-center gap-2 border-t border-[var(--customer-border)] pt-5 text-left text-sm font-bold uppercase text-[var(--customer-gold-dark)] transition-colors hover:text-[var(--customer-gold)]"
        >
          View all reviews <ChevronRight size={18} />
        </Link>
      </section>
      <ReviewImagePopup
        activeReview={activePopup?.review}
        activeImage={activePopup?.image}
        onClose={() => setActivePopup(null)}
        onSelectImage={(image) =>
          setActivePopup((current) =>
            current ? { ...current, image } : current,
          )
        }
      />
    </>
  );
}

export { ratingBreakdown, reviewImages, reviews, RatingPill, ReviewCard };
