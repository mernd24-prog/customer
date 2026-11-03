import { useState } from "react";
import QuantitySelector from "./QuantitySelector";
import {
  applyImageFallback,
  getOptimizedCloudinaryUrl,
  generateCloudinarySrcSet,
  getProductPublicPath,
} from "../../../utils/ecommerce";
import { calculateDiscountPercent } from "../../../utils/ecommerce/money";
import { Link } from "react-router-dom";
import { Heart, Trash2, Zap } from "lucide-react";
import { FaShoppingCart } from "react-icons/fa";
import ProductPriceBlock from "../../products/components/ProductPriceBlock";
import ProductStockStatus from "../../products/components/ProductStockStatus";
import StarRating from "../../../components/ui/display/StarRating";
import ShowMoreText from "../../../utils/showMore";

export default function CartItemCard({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  onSaveForLater,
  onBuyNow,
  isLastItem = false,
  selected = true,
  onSelect,
  saveForLaterLabel = "Save for later",
  removeLabel = "Remove",
  showCheckbox,
  fullWidth = false,
  showQuantitySelector = true,
  isWishlisted = false,
}) {
  const [isSaving, setIsSaving] = useState(false);

  const productPath = getProductPublicPath(
    item?.product || item?.productId || item,
  );

  const price = Number(item?.price || 0);
  const oldPrice = Number(item?.oldPrice || 0);

  const stock =
    item?.stock ?? item?.stockQuantity ?? item?.availableQty ?? null;

  const selectedVariant = item?.selectedVariant ?? item?.variant ?? null;
  const maxQty = item?.maxQuantity ?? item?.max_quantity ?? null;
  const quantity = Number(item?.quantity || 1);

  const stockQuantity = stock == null ? null : Number(stock);
  const hasStockQuantity = Number.isFinite(stockQuantity);

  const rating = item?.rating ?? item?.averageRating ?? item?._raw?.rating;
  const ratingValue = Number(rating);

  const reviewCount =
    item?.reviewCount ?? item?.reviewsCount ?? item?._raw?.reviewCount;

  const discountPct = calculateDiscountPercent(price, oldPrice);
  const isOutOfStock = hasStockQuantity && stockQuantity <= 0;
  const atMaxQty = maxQty !== null && quantity >= maxQty;

  const quantityMax =
    hasStockQuantity && stockQuantity > 0
      ? maxQty !== null
        ? Math.min(stockQuantity, Number(maxQty))
        : stockQuantity
      : maxQty;

  const isWishlistAction =
    saveForLaterLabel === "Save for later" ||
    saveForLaterLabel === "Move to Wishlist";

  const handleSaveForLater = async () => {
    if (isWishlistAction && (isWishlisted || isSaving)) return;

    if (!isWishlistAction) {
      onSaveForLater?.(item?.id);
      return;
    }

    setIsSaving(true);
    try {
      await onSaveForLater?.(item?.id);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article
      className={`group w-full min-w-0 overflow-hidden rounded-lg border border-[#E9DFC8] bg-[#FFFEFB] transition-colors hover:bg-[#FFFCF4] ${
        fullWidth ? "xl:max-w-none" : "xl:max-w-[1161px]"
      }`}
    >
      {/* Product information */}
      <div className="grid grid-cols-[76px_minmax(0,1fr)] items-start gap-2.5 p-2.5 min-[375px]:grid-cols-[88px_minmax(0,1fr)] min-[375px]:gap-3 min-[375px]:p-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-5 sm:p-5">
        {/* Product image */}
        <div className="relative flex min-w-0 items-start justify-center">
          {showCheckbox && (
            <label className="absolute left-0 top-1 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-white shadow-sm">
              <input
                type="checkbox"
                checked={selected}
                onChange={(event) => onSelect?.(item?.id, event.target.checked)}
                className="m-0 h-4 w-4 cursor-pointer rounded-[4px] border-[#A9B4D8] accent-[#3F4095]"
              />
              <span className="sr-only">Select {item?.title} For Checkout</span>
            </label>
          )}

          {item?.image && (
            <div className="h-[92px] w-[76px] shrink-0 overflow-hidden rounded-lg bg-white min-[375px]:h-[104px] min-[375px]:w-[88px] sm:h-[138px] sm:w-[112px]">
              {productPath ? (
                <Link
                  to={productPath}
                  aria-label={`View details for ${item?.title}`}
                  className="block h-full w-full"
                >
                  <img
                    loading="lazy"
                    width="400"
                    height="400"
                    src={getOptimizedCloudinaryUrl(item.image, 300)}
                    srcSet={generateCloudinarySrcSet(
                      item.image,
                      [200, 300, 400],
                    )}
                    sizes="(max-width: 374px) 76px, (max-width: 640px) 88px, 112px"
                    alt={item?.title || ""}
                    className="h-full w-full object-contain p-1.5"
                    onError={(event) =>
                      applyImageFallback(event, item.title, "cart")
                    }
                  />
                </Link>
              ) : (
                <img
                  loading="lazy"
                  width="400"
                  height="400"
                  src={getOptimizedCloudinaryUrl(item.image, 300)}
                  srcSet={generateCloudinarySrcSet(item.image, [200, 300, 400])}
                  sizes="(max-width: 374px) 76px, (max-width: 640px) 88px, 112px"
                  alt={item?.title || ""}
                  className="h-full w-full object-contain p-1.5"
                  onError={(event) =>
                    applyImageFallback(event, item.title, "cart")
                  }
                />
              )}
            </div>
          )}
        </div>

        {/* Product details */}
        <div className="min-w-0 self-start">
          {/* Product title */}
          {productPath ? (
            <Link
              to={productPath}
              className="mb-2 block break-words text-[13px] font-bold leading-[19px] text-[#2D2D2D] transition hover:text-[#1B1D60] min-[375px]:text-sm sm:text-base sm:leading-6"
            >
              <ShowMoreText
                text={item?.title}
                mode="characters"
                limit={65}
                moreLabel="more"
                lessLabel="less"
                textClassName="inline"
                buttonClassName="ml-1 text-xs font-semibold text-[#1B1D60] hover:underline"
              />
            </Link>
          ) : (
            <h3 className="mb-2 line-clamp-2 break-words text-[13px] font-bold leading-[19px] text-[#2D2D2D] min-[375px]:text-sm sm:text-base sm:leading-6">
              {item?.title}
            </h3>
          )}

          {/* Rating and stock */}
          <div className="flex min-w-0 flex-col items-start gap-1.5 sm:gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              {Number.isFinite(ratingValue) && ratingValue > 0 && (
                <div className="shrink-0">
                  <StarRating rating={ratingValue} count={reviewCount} />
                </div>
              )}

              <div className="min-w-0 shrink-0">
                <ProductStockStatus
                  inStock={!isOutOfStock}
                  selectedVariant={selectedVariant}
                  product={item}
                  availableStock={hasStockQuantity ? stockQuantity : undefined}
                />
              </div>
            </div>

            {/* Price */}
            <ProductPriceBlock
              price={price}
              mrp={oldPrice}
              currency={item?.currency ?? item?._raw?.currency}
              discount={discountPct}
              priceClassName="text-base font-extrabold text-[#001F3F] sm:text-lg"
              mrpClassName="text-xs font-semibold text-[#737373] sm:text-sm"
              discountClassName="bg-emerald-50 text-emerald-700 text-[11px] font-semibold sm:text-xs"
            />

            {/* Maximum quantity */}
            {atMaxQty && !isOutOfStock && (
              <p className="text-[11px] font-medium text-[var(--customer-muted)] sm:text-xs">
                Max {maxQty} Per Order
              </p>
            )}

            {/* Quantity selector */}
            {showQuantitySelector && (
              <div className="flex min-w-0 flex-col items-start gap-1 pt-0.5">
                <QuantitySelector
                  quantity={item.quantity}
                  onIncrease={() => onIncrease(item.id)}
                  onDecrease={() => onDecrease(item.id)}
                  max={quantityMax}
                  increaseDisabled={item.increaseDisabled}
                  increaseDisabledLabel={item.stockMessage || undefined}
                  variant="cart"
                />

                {item.stockMessage && (
                  <p className="text-[11px] font-semibold leading-4 text-red-600">
                    {item.stockMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="grid grid-cols-3 divide-x divide-[#EAE6DC] border-t border-[#E9DFC8] bg-[#F8F5EE]">
        {/* Save for later */}
        <button
          type="button"
          onClick={handleSaveForLater}
          disabled={isWishlistAction && (isWishlisted || isSaving)}
          className={`flex min-w-0 min-h-[46px] items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold text-[#51545A] transition-colors hover:text-[#1B1D60] min-[375px]:gap-1.5 min-[375px]:text-xs sm:min-h-[52px] sm:gap-2 sm:text-base ${
            isWishlisted ? "text-[#1B1D60]" : ""
          }`}
        >
          {isWishlistAction ? (
            <Heart
              size={16}
              className="shrink-0"
              fill={isWishlisted ? "currentColor" : "none"}
            />
          ) : (
            <FaShoppingCart size={14} className="shrink-0" />
          )}

          <span className="truncate">
            {isWishlisted ? "Wishlisted" : saveForLaterLabel}
          </span>
        </button>

        {/* Remove */}
        <button
          type="button"
          onClick={() => onRemove?.(item?.id)}
          className="flex min-w-0 min-h-[46px] items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold text-[#51545A] transition-colors hover:text-[#1B1D60] min-[375px]:gap-1.5 min-[375px]:text-xs sm:min-h-[52px] sm:gap-2 sm:text-base"
        >
          <Trash2 size={16} className="shrink-0" />
          <span className="truncate">{removeLabel}</span>
        </button>

        {/* Buy now */}
        <button
          type="button"
          onClick={() => onBuyNow?.(item?.id)}
          disabled={!onBuyNow || isOutOfStock}
          className="flex min-w-0 min-h-[46px] items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold text-[#51545A] transition-colors hover:text-[#1B1D60] disabled:cursor-not-allowed disabled:opacity-50 min-[375px]:gap-1.5 min-[375px]:text-xs sm:min-h-[52px] sm:gap-2 sm:text-base"
        >
          <Zap size={16} className="shrink-0" />
          <span className="truncate">Buy this now</span>
        </button>
      </div>
    </article>
  );
}
