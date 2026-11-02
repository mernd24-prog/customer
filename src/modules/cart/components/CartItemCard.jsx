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
import { Heart, Trash2 } from "lucide-react";
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
  saveForLaterLabel = "Move to Wishlist",
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
  const product = item;
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
  const hasVariantTags = Boolean(
    item?.condition ||
    item?.color ||
    item?.size ||
    Object.keys(item?.attributes || {}).some(
      (key) => !["color", "size"].includes(key),
    ),
  );

  return (
    <article
      className={`w-full px-3 py-4 sm:px-4 sm:py-5 ${
        fullWidth ? "xl:max-w-none" : "xl:max-w-[1161px]"
      }`}
    >
      <div
        className={`grid grid-cols-[104px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-5 ${
          !isLastItem ? "border-b border-[#CE9F2D4D] pb-4 sm:pb-5" : ""
        }`}
      >
        {/* Product image and quantity */}
        <div className="flex min-w-0 flex-col items-center gap-2">
          <div className="relative flex w-full items-start justify-center">
            {showCheckbox && (
              <label className="absolute left-0 top-1 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-white shadow-sm sm:left-0">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(event) =>
                    onSelect?.(item?.id, event.target.checked)
                  }
                  className="m-0 h-4 w-4 cursor-pointer rounded-[4px] border-[#A9B4D8] accent-[#3F4095]"
                />
                <span className="sr-only">
                  Select {item?.title} For Checkout
                </span>
              </label>
            )}

            {item?.image && (
              <div className="h-[112px] w-[96px] shrink-0 overflow-hidden rounded-lg border border-[#E9E2D5] bg-white sm:h-[132px] sm:w-[112px]">
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
                      srcSet={generateCloudinarySrcSet(item.image, [200, 300, 400])}
                      sizes="(max-width: 640px) 96px, 112px"
                      alt=""
                      className="h-full w-full object-contain"
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
                    sizes="(max-width: 640px) 96px, 112px"
                    alt=""
                    className="h-full w-full object-contain"
                    onError={(event) =>
                      applyImageFallback(event, item.title, "cart")
                    }
                  />
                )}
              </div>
            )}
          </div>

          {showQuantitySelector && (
            <div className="flex w-full flex-col items-center gap-1">
              <QuantitySelector
                quantity={item.quantity}
                onIncrease={() => onIncrease(item.id)}
                onDecrease={() => onDecrease(item.id)}
                max={quantityMax}
                increaseDisabled={item.increaseDisabled}
                increaseDisabledLabel={item.stockMessage || undefined}
                variant="cart"
              />
              {item.stockMessage ? (
                <p className="text-center text-[11px] font-semibold leading-4 text-red-600">
                  {item.stockMessage}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* Product details start at exactly the same top edge as the image */}
        <div className="min-w-0 self-start">
          {Number.isFinite(ratingValue) && ratingValue > 0 && (
            <div className="mb-1.5">
              <StarRating rating={ratingValue} count={reviewCount} />
            </div>
          )}

          {productPath ? (
            <Link
              to={productPath}
              className="mb-2 block text-sm font-bold leading-5 text-[#2D2D2D] transition hover:text-[#1B1D60] sm:text-base sm:leading-6"
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
            <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-5 text-[#2D2D2D] sm:text-base sm:leading-6">
              {item?.title}
            </h3>
          )}

          <div className="mb-3 flex flex-col gap-2 sm:mb-3.5">
            <ProductStockStatus
              inStock={!isOutOfStock}
              selectedVariant={selectedVariant}
              product={product}
              availableStock={hasStockQuantity ? stockQuantity : undefined}
            />

            <ProductPriceBlock
              price={price}
              mrp={oldPrice}
              currency={item?.currency ?? item?._raw?.currency}
              discount={discountPct}
              priceClassName="text-base font-extrabold text-[#001F3F] sm:text-lg"
              mrpClassName="text-xs font-semibold text-[#737373] sm:text-sm"
              discountClassName="bg-emerald-50 text-emerald-700 text-[11px] font-semibold sm:text-xs"
            />

            {atMaxQty && !isOutOfStock && (
              <p className="text-xs font-medium text-[var(--customer-muted)]">
                Max {maxQty} Per Order
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#F0E6D2] pt-2.5 sm:gap-x-5 sm:pt-3">
            {saveForLaterLabel === "Move to Wishlist" ? (
              <button
                type="button"
                onClick={async () => {
                  if (isWishlisted) return;
                  setIsSaving(true);
                  try {
                    await onSaveForLater?.(item?.id);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isWishlisted}
                className={`inline-flex items-center gap-1.5 text-xs font-medium transition sm:text-sm ${
                  isWishlisted
                    ? "cursor-default text-[#1B1D60]"
                    : "text-[#2D2D2D] hover:text-[#1B1D60]"
                }`}
              >
                <Heart
                  size={16}
                  className="shrink-0 text-[#1B1D60]"
                  fill={isWishlisted || isSaving ? "currentColor" : "none"}
                />
                {isWishlisted ? "Wishlisted" : saveForLaterLabel}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSaveForLater?.(item?.id)}
                disabled={isOutOfStock}
                title={isOutOfStock ? "Out of stock" : undefined}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#CE9F2D] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#B98B20] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
              >
                <FaShoppingCart size={13} />
                {saveForLaterLabel}
              </button>
            )}

            <button
              type="button"
              onClick={() => onRemove?.(item?.id)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2D2D2D] transition hover:text-[#FF3B35] sm:text-sm"
            >
              <Trash2 size={15} className="shrink-0 text-[#FF3B35]" />
              {removeLabel}
            </button>

            {onBuyNow && (
              <button
                type="button"
                onClick={() => onBuyNow(item?.id)}
                className="inline-flex items-center text-xs font-semibold text-[#1B1D60] transition hover:text-[#CE9F2D] sm:text-sm"
              >
                Buy Now
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}