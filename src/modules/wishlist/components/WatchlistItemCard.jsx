import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

import {
  formatMoney,
  getProductImage,
  getProductPublicPath,
  getProductPrice,
  getProductMrp,
  getOptimizedCloudinaryUrl,
  generateCloudinarySrcSet,
  getProductTitle,
} from "../../../utils/ecommerce";

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

    // Main product image
    addImg(product?.image);
    addImg(product?.thumbnail);
    addImg(getProductImage(product));

    // Product images
    if (Array.isArray(product?.images)) {
      product.images.forEach(addImg);
    }

    // Gallery images
    if (Array.isArray(product?.gallery)) {
      product.gallery.forEach(addImg);
    }

    // Common images
    if (Array.isArray(product?.commonImages)) {
      product.commonImages.forEach(addImg);
    }

    // Media images
    if (Array.isArray(product?.media)) {
      product.media.forEach(addImg);
    }

    // Variant images
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

    // Preload images
    allImages.forEach((imgUrl) => {
      if (imgUrl) {
        const img = new Image();
        img.src = getOptimizedCloudinaryUrl(imgUrl, 400);
      }
    });

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % allImages.length);
    }, 1000);

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
  // Full Watchlist Card
  // ---------------------------------------------------------
  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[12px] border border-border bg-white transition-all duration-300 hover:shadow-md"
    >
      {/* -----------------------------------------------------
          Image Container
      ----------------------------------------------------- */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[#F8F9FA] p-3 sm:p-4">
        {/* Remove Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove?.(product);
          }}
          className="absolute right-2.5 top-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm transition-colors hover:bg-white hover:text-red-600 focus:outline-none"
          aria-label={`Remove ${title} from wishlist`}
        >
          <X size={16} />
        </button>

        {/* Product Image */}
        <Link
          to={productPath}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-full w-full items-center justify-center"
        >
          {activeImage ? (
            <div className="relative flex h-full w-full items-center justify-center">
              <img
                key={activeImage}
                src={getOptimizedCloudinaryUrl(activeImage, 400)}
                srcSet={generateCloudinarySrcSet(activeImage, [300, 400, 800])}
                sizes="(max-width: 640px) 300px, 400px"
                alt={title}
                width="400"
                height="400"
                className="max-h-full max-w-full object-contain transition-all duration-300 ease-in-out"
                loading="lazy"
                decoding="async"
              />

              {/* ------------------------------------------------
                  Image Indicators
              ------------------------------------------------ */}
              {isHovered && allImages.length > 1 && (
                <div className="pointer-events-none absolute bottom-2.5 left-0 right-0 z-10 flex justify-center gap-1.5">
                  {allImages.slice(0, 5).map((_, index) => (
                    <span
                      key={index}
                      className={`h-1 rounded-full shadow-sm transition-all duration-300 ${
                        activeImageIndex % Math.min(allImages.length, 5) ===
                        index
                          ? "w-4 bg-[#1B1D60]"
                          : "w-1.5 bg-black/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
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
        </Link>
      </div>

      {/* -----------------------------------------------------
          Product Information
      ----------------------------------------------------- */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div>
          {/* Product Title */}
          {isUnavailable ? (
            <span className="line-clamp-2 text-xs font-semibold text-gray-400 sm:text-sm">
              Product no longer available
            </span>
          ) : (
            <Link
              to={productPath}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-2 text-xs font-semibold text-[#111111] transition-colors hover:text-[#001F3F] sm:text-sm"
              title={title}
            >
              {title}
            </Link>
          )}

          {/* Price */}
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-[#001F3F] sm:text-lg">
              {formatMoney(price, currency)}
            </span>

            {oldPrice && Number(oldPrice) > Number(price) && (
              <span className="text-sm font-semibold text-[#737373] line-through sm:text-lg">
                {formatMoney(oldPrice, currency)}
              </span>
            )}
          </div>
        </div>

        {/* -----------------------------------------------------
            Move To Bag
        ----------------------------------------------------- */}
        <div className="mt-3.5 border-t border-[#F0F0F0] pt-2.5 text-center">
          <button
            type="button"
            disabled={isUnavailable}
            onClick={() => onAddToCart?.(product)}
            className={`w-full py-1 text-center text-xs font-bold uppercase tracking-wider transition-colors sm:text-sm ${
              isUnavailable
                ? "cursor-not-allowed text-gray-400"
                : "text-blue hover:text-[#001F3F]"
            }`}
          >
            MOVE TO BAG
          </button>
        </div>
      </div>
    </article>
  );
}
