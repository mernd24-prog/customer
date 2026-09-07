import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, X } from "lucide-react";

import {
  formatMoney,
  getProductImage,
  getProductPublicPath,
  getProductPrice,
  getProductMrp,
  getOptimizedCloudinaryUrl,
  generateCloudinarySrcSet,
  getProductTitle,
  getProductAvailableStock,
} from "../../../utils/ecommerce";
import { cn } from "../../../utils/common";
import Label from "../../../components/ui/label/Label";
import StarRating from "../../../components/ui/display/StarRating";
import Price from "../../products/components/Price";
import { PillButton } from "../../../components/ui/button/static";

export function WatchlistItemCard({
  product,
  compact = false,
  onAddToCart,
  onRemove,
}) {
  const productPath = getProductPublicPath(product);
  const title = getProductTitle(product);
  const image = getProductImage(product);
  const price = getProductPrice(product);
  const oldPrice = getProductMrp(product);
  const currency = product?.currency;
  const rating =
    product?.rating ?? product?.averageRating ?? product?.ratingsAverage ?? 0;
  const ratingCount =
    product?.ratingCount ??
    product?.reviewsCount ??
    product?.reviewCount ??
    product?.totalReviews ??
    product?.totalReviewCount ??
    0;
  const discountPercent = product?.discountPercent ?? 0;

  const currentPriceNumber = Number(String(price || 0).replace(/[^\d.-]/g, ""));
  const oldPriceNumber = Number(String(oldPrice || 0).replace(/[^\d.-]/g, ""));
  const computedDiscountPercent =
    discountPercent ||
    (oldPriceNumber > currentPriceNumber && currentPriceNumber > 0
      ? Math.round(
          ((oldPriceNumber - currentPriceNumber) / oldPriceNumber) * 100,
        )
      : 0);
  const discountLabel = computedDiscountPercent
    ? `${computedDiscountPercent}% Off`
    : "";

  const availableStock = getProductAvailableStock(product);
  const isInStock =
    typeof product?.inStock === "boolean"
      ? product.inStock
      : typeof product?.isInStock === "boolean"
        ? product.isInStock
        : availableStock !== null
          ? availableStock > 0
          : true;

  const isUnavailable =
    !product?.image && title === "Untitled product" && !price;

  // ---------------------------------------------------------
  // Hover image state
  // ---------------------------------------------------------
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // ---------------------------------------------------------
  // Collect all product images
  // ---------------------------------------------------------
  const allImages = useMemo(() => {
    const list = [];

    const addImg = (img) => {
      if (!img) return;

      const url =
        typeof img === "string"
          ? img
          : img?.url || img?.src || img?.image || img?.link || "";

      if (url && typeof url === "string" && !list.includes(url)) {
        list.push(url);
      }
    };

    addImg(product?.image);
    addImg(product?.thumbnail);
    addImg(getProductImage(product));

    if (Array.isArray(product?.images)) {
      product.images.forEach(addImg);
    }
    if (Array.isArray(product?.gallery)) {
      product.gallery.forEach(addImg);
    }
    if (Array.isArray(product?.commonImages)) {
      product.commonImages.forEach(addImg);
    }
    if (Array.isArray(product?.media)) {
      product.media.forEach(addImg);
    }
    if (Array.isArray(product?.variants)) {
      product.variants.forEach((variant) => {
        addImg(variant?.image);
        if (Array.isArray(variant?.images)) {
          variant.images.forEach(addImg);
        }
      });
    }

    return list.length > 0 ? list : image ? [image] : [];
  }, [product, image]);

  // ---------------------------------------------------------
  // Change image automatically while hovering
  // ---------------------------------------------------------
  useEffect(() => {
    if (!isHovered || allImages.length <= 1) {
      setActiveImageIndex(0);
      return;
    }

    allImages.forEach((imgUrl) => {
      if (imgUrl) {
        const img = new Image();
        img.src = getOptimizedCloudinaryUrl(imgUrl, 400);
      }
    });

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % allImages.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isHovered, allImages]);

  const activeImage = allImages[activeImageIndex] || image;

  // ---------------------------------------------------------
  // Compact Watchlist Card
  // ---------------------------------------------------------
  if (compact) {
    return (
      <article
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex gap-3 border-b border-border p-3 transition-all duration-300 ease-in-out hover:bg-cream"
      >
        <Link
          to={productPath}
          target="_blank"
          rel="noopener noreferrer"
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border border-border"
          aria-label={`View ${title}`}
        >
          {activeImage ? (
            <img
              key={activeImage}
              src={getOptimizedCloudinaryUrl(activeImage, 200)}
              alt=""
              className="h-full w-full object-contain transition-all duration-300"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-gray">
              No Image
            </span>
          )}

          {/* Compact image indicators */}
          {isHovered && allImages.length > 1 && (
            <div className="absolute bottom-1 left-0 right-0 z-10 flex justify-center gap-0.5">
              {allImages.slice(0, 4).map((_, index) => (
                <span
                  key={index}
                  className={`h-0.5 rounded-full transition-all duration-300 ${
                    activeImageIndex % Math.min(allImages.length, 4) === index
                      ? "w-2.5 bg-[#1B1D60]"
                      : "w-1 bg-black/30"
                  }`}
                />
              ))}
            </div>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between pr-5">
          <div className="min-w-0">
            <h4 className="truncate text-[13px] font-semibold text-ink transition-all duration-300 ease-in-out group-hover:text-gold">
              <Link
                to={productPath}
                target="_blank"
                rel="noopener noreferrer"
                className="block min-w-0 truncate"
                title={title}
              >
                {title}
              </Link>
            </h4>

            <p className="mt-1 text-[12px] font-bold text-ink">
              {formatMoney(price, currency)}
            </p>
          </div>

          <Link
            to={productPath}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-[11px] font-medium text-gold hover:underline"
            aria-label={`View details for ${title}`}
          >
            View Item
          </Link>
        </div>

        <button
          type="button"
          className="absolute right-2 top-2 rounded-full p-1 text-gray transition-all duration-300 ease-in-out hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
          onClick={() => onRemove?.(product)}
          aria-label={`Remove ${title} from watchlist`}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </article>
    );
  }

  // ---------------------------------------------------------
  // Full Watchlist Card (Matching Product Card UI)
  // ---------------------------------------------------------
  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-[14px] sm:rounded-[20px] border border-[#CE9F2D80]/50 bg-white transition-all duration-300 ease-in-out hover:shadow-md"
    >
      {/* -----------------------------------------------------
          Badges (Discount % Off)
      ----------------------------------------------------- */}
      <div className="absolute left-2 top-2 sm:left-4 sm:top-4 z-20 flex max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] flex-wrap items-center gap-1 sm:gap-2">
        {discountLabel && (
          <Label
            variant="success"
            className="
              flex h-[20px] min-w-[54px] items-center justify-center
              rounded-[50px]
              bg-blue
              px-[8px] py-[3px]
              font-dmSans
              text-[10px] font-semibold
              leading-none
              tracking-[0%]
              text-white
              sm:h-[28px] sm:min-w-[84px]
              sm:px-[15px] sm:py-[5px]
              sm:text-[14px]
            "
          >
            {discountLabel}
          </Label>
        )}
      </div>

      {/* Remove Button (Cross Icon) */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove?.(product);
        }}
        className="absolute right-2 top-2 sm:right-3 sm:top-3 z-30 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm transition-all hover:bg-white hover:text-red-600 focus:outline-none"
        aria-label={`Remove ${title} from wishlist`}
        title={`Remove ${title} from wishlist`}
      >
        <X size={16} />
      </button>

      {/* -----------------------------------------------------
          Product Link (Image & Content)
      ----------------------------------------------------- */}
      <Link
        to={productPath}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col min-w-0"
      >
        {/* Product Image */}
        <div className="relative flex justify-center overflow-hidden h-[160px] xs:h-[190px] sm:h-[230px] md:h-[260px] items-center w-full rounded-t-[14px] sm:rounded-t-[20px] transition-all duration-300 ease-in-out group-hover:scale-[1.01]">
          {activeImage ? (
            <>
              <img
                key={activeImage}
                src={getOptimizedCloudinaryUrl(activeImage, 400)}
                srcSet={generateCloudinarySrcSet(activeImage, [300, 400, 800])}
                sizes="(max-width: 640px) 250px, (max-width: 1024px) 400px, 800px"
                alt={title}
                width="400"
                height="400"
                className="h-full w-full object-contain p-2 transition-all duration-300 ease-in-out group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />

              {/* Hover Carousel Dots */}
              {isHovered && allImages.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center items-center gap-1.5 px-2 pointer-events-none">
                  {allImages.slice(0, 6).map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300 shadow-sm",
                        activeImageIndex % Math.min(allImages.length, 6) === idx
                          ? "w-4 bg-[#1B1D60]"
                          : "w-1.5 bg-black/30",
                      )}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
              <span className="text-xs">No Image</span>
              {isUnavailable && (
                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                  UNAVAILABLE
                </span>
              )}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex min-w-0 flex-col px-2.5 sm:px-4 pt-2 sm:pt-3 pb-1 sm:pb-2">
          <StarRating rating={rating} count={ratingCount} />

          <h3
            className="my-1 sm:my-[10px] w-full text-xs sm:text-sm font-semibold text-[#2E2E2E] line-clamp-1"
            title={title}
          >
            {title}
          </h3>

          <Price
            price={price}
            oldPrice={oldPrice}
            currency={currency}
            className="my-0.5 sm:my-1 flex flex-wrap items-baseline gap-1 sm:gap-2.5"
            priceClassName="text-sm sm:text-base font-extrabold text-[#1B1D60] md:text-lg 2xl:text-[20px]"
            oldPriceClassName="text-xs sm:text-base font-semibold text-[#737373] line-through md:text-lg 2xl:text-[20px]"
          />
        </div>
      </Link>

      {/* -----------------------------------------------------
          Action Buttons (Add to Cart & Remove/Heart)
      ----------------------------------------------------- */}
      <div className="mt-auto flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-4 pb-2.5 sm:pb-3 pt-1">
        <PillButton
          disabled={isUnavailable || !isInStock}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          rightIcon={
            <ShoppingCart
              size={15}
              strokeWidth={2.4}
              className="shrink-0 hidden xs:inline-block sm:inline-block"
            />
          }
          className={cn(
            "w-full flex-1 gap-1 sm:gap-2 text-[10px] sm:text-[14px] md:text-[15px] font-semibold focus-visible:outline-[#1B1D60] whitespace-nowrap px-2 sm:px-4 py-1.5 sm:py-2.5 h-8 sm:h-10",
            (isUnavailable || !isInStock) && "cursor-not-allowed opacity-60",
          )}
        >
          <span className="truncate">Move to Cart</span>
        </PillButton>
      </div>
    </article>
  );
}
