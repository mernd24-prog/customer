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
      <div
        className={`grid items-start gap-2.5 p-2.5 min-[375px]:gap-3 min-[375px]:p-3 sm:gap-5 sm:p-5 ${
          showCheckbox
            ? "grid-cols-[20px_88px_minmax(0,1fr)] min-[375px]:grid-cols-[20px_96px_minmax(0,1fr)] sm:grid-cols-[24px_112px_minmax(0,1fr)]"
            : "grid-cols-[88px_minmax(0,1fr)] min-[375px]:grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[112px_minmax(0,1fr)]"
        }`}
      >
        {/* Selection checkbox */}
        {showCheckbox && (
          <label className="flex cursor-pointer items-start justify-center pt-1">
            <input
              type="checkbox"
              checked={selected}
              onChange={(event) => onSelect?.(item?.id, event.target.checked)}
              aria-label={`Select ${item?.title} for checkout`}
              className="m-0 h-5 w-5 cursor-pointer rounded-[4px] border border-[#C9CDD6] accent-[#3F4095] focus:outline-none sm:h-[15px] sm:w-[15px]"
            />
          </label>
        )}

        {/* Product image */}
        <div className="flex min-w-0 items-start justify-center">
          {item?.image && (
            <div className="h-[112px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-white min-[375px]:h-[120px] min-[375px]:w-[96px] sm:h-[140px] sm:w-[115px]">
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
                    sizes="(max-width: 374px) 88px, (max-width: 640px) 96px, 112px"
                    alt={item?.title || ""}
                    className="h-full w-full object-contain p-0 sm:p-1"
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
                  sizes="(max-width: 374px) 88px, (max-width: 640px) 96px, 112px"
                  alt={item?.title || ""}
                  className="h-full w-full object-contain p-0 sm:p-1"
                  onError={(event) =>
                    applyImageFallback(event, item.title, "cart")
                  }
                />
              )}
            </div>
          )}
        </div>

        {/* Product details */}
        <div className="flex min-w-0 flex-col items-start gap-2 self-start">
          {/* Product title */}
          {productPath ? (
            <Link to={productPath} className="block w-full min-w-0">
              <h3 className="w-full truncate whitespace-nowrap text-[13px] font-bold leading-[19px] text-[#2D2D2D] transition hover:text-[#1B1D60] sm:line-clamp-2 sm:whitespace-normal sm:break-words sm:text-base sm:leading-6">
                {item?.title}
              </h3>
            </Link>
          ) : (
            <h3 className="w-full truncate whitespace-nowrap text-[13px] font-bold leading-[19px] text-[#2D2D2D] sm:line-clamp-2 sm:whitespace-normal sm:break-words sm:text-base sm:leading-6">
              {item?.title}
            </h3>
          )}

          {/* Rating and stock */}
          <div
            className={`w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1 ${
              Number.isFinite(ratingValue) && ratingValue > 0
                ? "flex"
                : "hidden sm:flex"
            }`}
          >
            {Number.isFinite(ratingValue) && ratingValue > 0 && (
              <div className="flex min-w-0 shrink-0 items-center">
                <StarRating rating={ratingValue} count={reviewCount} />
              </div>
            )}

            <div className="min-w-0">
              <ProductStockStatus
                inStock={!isOutOfStock}
                selectedVariant={selectedVariant}
                product={item}
                availableStock={hasStockQuantity ? stockQuantity : undefined}
                hideOnMobile={true}
              />
            </div>
          </div>

          {/* Product price */}
          <div className="w-full min-w-0">
            <ProductPriceBlock
              price={price}
              mrp={oldPrice}
              currency={item?.currency ?? item?._raw?.currency}
              discount={discountPct}
              hideTaxLabelOnMobile={true}
              priceClassName="text-[15px] font-extrabold text-[#001F3F] min-[375px]:text-base sm:text-lg"
              mrpClassName="text-[11px] font-semibold text-[#737373] min-[375px]:text-xs sm:text-sm"
              discountClassName="bg-emerald-50 text-emerald-700 text-[10px] font-semibold min-[375px]:text-[11px] sm:text-xs"
            />
          </div>

          {/* Maximum quantity */}
          {atMaxQty && !isOutOfStock && (
            <p className="text-[10px] font-medium text-[var(--customer-muted)] sm:text-xs">
              Max {maxQty} Per Order
            </p>
          )}

          {/* Quantity selector */}
          {showQuantitySelector && (
            <div className="flex min-w-0 flex-col items-start gap-1">
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
                <p className="text-[10px] font-semibold leading-4 text-red-600 sm:text-xs">
                  {item.stockMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product actions */}
      <div className="grid grid-cols-3 divide-x divide-[#EAE6DC] border-t border-[#E9DFC8] bg-[#F8F5EE]">
        {/* Save for later */}
        <button
          type="button"
          onClick={handleSaveForLater}
          disabled={isWishlistAction && (isWishlisted || isSaving)}
          aria-label={isWishlisted ? "Wishlisted" : saveForLaterLabel}
          className={`flex min-w-0 min-h-[52px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-semibold text-[#51545A] transition-colors hover:bg-[#F5F0E7] hover:text-[#1B1D60] sm:min-h-[36px] sm:flex-row sm:gap-2 sm:px-2 sm:py-1 sm:text-xs ${
            isWishlisted ? "text-[#1B1D60]" : ""
          }`}
        >
          <Heart
            size={15}
            className="shrink-0"
            fill={isWishlisted ? "currentColor" : "none"}
          />
          <span className="truncate">{isWishlisted ? "Saved" : "Save"}</span>
        </button>

        {/* Remove */}
        <button
          type="button"
          onClick={() => onRemove?.(item?.id)}
          aria-label={removeLabel}
          className="flex min-w-0 min-h-[52px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-semibold text-[#51545A] transition-colors hover:bg-[#F5F0E7] hover:text-[#1B1D60] sm:min-h-[36px] sm:flex-row sm:gap-2 sm:px-2 sm:py-1 sm:text-xs"
        >
          <Trash2 size={15} className="shrink-0" />
          <span className="truncate">Remove</span>
        </button>

        {/* Buy Now */}
        <button
          type="button"
          onClick={() => onBuyNow?.(item?.id)}
          disabled={!onBuyNow || isOutOfStock}
          aria-label="Buy this now"
          className="flex min-w-0 min-h-[52px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-semibold text-[#51545A] transition-colors hover:bg-[#F5F0E7] hover:text-[#1B1D60] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[36px] sm:flex-row sm:gap-2 sm:px-2 sm:py-1 sm:text-xs"
        >
          <Zap size={15} className="shrink-0" />
          <span className="truncate">Buy Now</span>
        </button>
      </div>
    </article>
  );
}