
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, X } from "lucide-react";

import {
  formatMoney,
  getProductImage,
  getProductPublicPath,
  getProductPrice,
  getProductTitle,
  getProductAvailableStock,
  getOptimizedCloudinaryUrl,
} from "../../../utils/ecommerce";

import ProductCard from "../../products/components/ProductCard";
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
  const currency = product?.currency;

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

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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

  // Compact Watchlist Card - Preserved
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
            <h4 className="truncate text-sm font-semibold text-ink transition-all duration-300 ease-in-out group-hover:text-gold">
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

            <p className="mt-1 text-xs font-bold text-ink">
              {formatMoney(price, currency)}
            </p>
          </div>

          <Link
            to={productPath}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-xs font-medium text-gold hover:underline"
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

  // Full Watchlist Card - Reuses Existing ProductCard
  return (
    <div className="relative min-w-0 h-full">
      <ProductCard
        product={product}
        showActions={false}
        className="h-full pb-12"
      />

      {/* Wishlist Remove Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove?.(product);
        }}
        className="absolute right-2 top-2 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-black/5 bg-white/90 text-[#1B1D60] shadow-xs backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white hover:text-red-500 active:scale-95 sm:h-8 sm:w-8"
        aria-label={`Remove ${title} from wishlist`}
        title={`Remove ${title} from wishlist`}
      >
        <X size={15} strokeWidth={1.8} />
      </button>

      {/* Wishlist Move to Cart Button */}
      <div className="absolute inset-x-2 bottom-2 z-20">
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
              className="shrink-0"
            />
          }
          className="h-8 w-full gap-2 whitespace-nowrap px-3 py-1.5 text-xs font-semibold sm:h-10 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <span className="truncate">Move to Cart</span>
        </PillButton>
      </div>
    </div>
  );
}
