import { useState } from "react";
import QuantitySelector from "./QuantitySelector";
import {
  applyImageFallback,
  getOptimizedCloudinaryUrl,
  generateCloudinarySrcSet,
} from "../../../utils/ecommerce";
import { calculateDiscountPercent } from "../../../utils/ecommerce/money";
import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { FaShoppingCart } from "react-icons/fa";
import ProductPriceBlock from "../../../pages/products/components/oldAndNewPrice";
import ProductStockStatus from "../../../pages/products/components/stockStatus";
import StarRating from "../../../pages/products/components/starRating";
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
}) {
  const [isSaving, setIsSaving] = useState(false);
  const productPath = item?.productId ? `/products/${item.productId}` : "";
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
      className={`relative w-full p-3 sm:p-4 lg:p-5 ${
        fullWidth ? "xl:max-w-none" : "xl:max-w-[1161px]"
      }`}
    >
      <div
        className={`grid grid-cols-1 sm:grid-cols-[170px_1fr] lg:grid-cols-[190px_1fr] gap-4 sm:gap-5 pb-5 ${
          !isLastItem ? " border-b border-[#CE9F2D4D]" : ""
        }`}
      >
        <div className="flex flex-col items-start sm:items-center gap-2 w-full">
          {item?.image && (
            <div className="relative flex aspect-square w-full max-w-full sm:max-w-[165px] h-auto max-h-[260px] sm:max-h-[190px] items-center justify-center overflow-hidden rounded-[10px] border border-[#F0E6D2] bg-white">
              {showCheckbox && (
                <label className="absolute left-2.5 top-2.5 z-20 flex min-h-[32px] min-w-[32px] cursor-pointer items-center justify-center p-2">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) =>
                      onSelect?.(item?.id, event.target.checked)
                    }
                    className="h-4 w-4 rounded-[4px] border-[#A9B4D8] accent-[#3F4095]"
                  />
                  <span className="sr-only">
                    Select {item?.title} For Checkout
                  </span>
                </label>
              )}

              {productPath ? (
                <Link
                  to={productPath}
                  aria-label={`View details for ${item?.title}`}
                  className="block h-full w-full"
                >
                  <img
                    src={getOptimizedCloudinaryUrl(item.image, 300)}
                    srcSet={generateCloudinarySrcSet(
                      item.image,
                      [200, 300, 400],
                    )}
                    sizes="(max-width: 640px) 165px, 200px"
                    alt=""
                    className="h-full w-full object-contain p-2 transition duration-300 hover:scale-105 sm:p-3"
                    onError={(event) =>
                      applyImageFallback(event, item.title, "cart")
                    }
                  />
                </Link>
              ) : (
                <img
                  src={getOptimizedCloudinaryUrl(item.image, 300)}
                  srcSet={generateCloudinarySrcSet(item.image, [200, 300, 400])}
                  sizes="(max-width: 640px) 165px, 200px"
                  alt=""
                  className="h-full w-full object-contain p-2 sm:p-3"
                  onError={(event) =>
                    applyImageFallback(event, item.title, "cart")
                  }
                />
              )}
            </div>
          )}

          <div className="hidden sm:flex mt-1 w-full flex-col items-center">
            <QuantitySelector
              quantity={item.quantity}
              onIncrease={() => onIncrease(item.id)}
              onDecrease={() => onDecrease(item.id)}
              max={quantityMax}
              increaseDisabled={item.increaseDisabled}
              increaseDisabledLabel={item.stockMessage || undefined}
            />
            {item.stockMessage ? (
              <p className="mt-1 text-center text-xs font-semibold text-red-600">
                {item.stockMessage}
              </p>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 py-0.5">
          <div className="my-1.5">
            <StarRating rating={ratingValue} count={reviewCount} />
          </div>
          {productPath ? (
            <Link
              to={productPath}
              className="block font-bold text-sm sm:text-base text-[#2d2d2d] transition hover:text-[#1B1D60]"
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
            <h3 className="line-clamp-2 block font-bold text-sm sm:text-base text-[#2d2d2d]">
              {item?.title}
            </h3>
          )}

          {hasVariantTags && (
            <div className="my-2 flex flex-wrap gap-1.5">
              {item?.condition && (
                <span className="rounded-full bg-[#F2F1F8] px-2.5 py-0.5 text-[11px] font-semibold text-[#1B1D60]">
                  {item.condition}
                </span>
              )}

              {item?.color && (
                <span className="rounded-full bg-[#F2F1F8] px-2.5 py-0.5 text-[11px] font-semibold text-[#1B1D60]">
                  Color: {item.color}
                </span>
              )}

              {item?.size && (
                <span className="rounded-full bg-[#F2F1F8] px-2.5 py-0.5 text-[11px] font-semibold text-[#1B1D60]">
                  Size: {item.size}
                </span>
              )}

              {Object.entries(item?.attributes || {})
                .filter(([key]) => !["color", "size"].includes(key))
                .map(([key, value]) => (
                  <span
                    key={key}
                    className="rounded-full bg-[#F2F1F8] px-2.5 py-0.5 text-[11px] font-semibold capitalize text-[#1B1D60]"
                  >
                    {key.replace(/_/g, " ")}: {String(value)}
                  </span>
                ))}
            </div>
          )}

          <div>
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
              priceClassName="text-base sm:text-lg font-extrabold text-[#001F3F]"
              mrpClassName="text-xs sm:text-sm font-semibold text-[#737373]"
              discountClassName="text-xs font-semibold"
            />

            {atMaxQty && !isOutOfStock && (
              <p className="mt-0.5 text-xs font-medium text-[var(--customer-muted)]">
                Max {maxQty} Per Order
              </p>
            )}

            <div className="mt-2.5 sm:hidden">
              <QuantitySelector
                quantity={item.quantity}
                onIncrease={() => onIncrease(item.id)}
                onDecrease={() => onDecrease(item.id)}
                max={quantityMax}
                increaseDisabled={item.increaseDisabled}
                increaseDisabledLabel={item.stockMessage || undefined}
              />
              {item.stockMessage ? (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {item.stockMessage}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
            {saveForLaterLabel === "Move to Wishlist" ? (
              <button
                type="button"
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    await onSaveForLater?.(item?.id);
                  } finally {
                    // Opening or cancelling authentication must not leave the
                    // guest-facing heart in its selected state.
                    setIsSaving(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#2d2d2d] transition hover:text-[#1B1D60]"
              >
                <Heart
                  size={16}
                  className="text-[#1B1D60]"
                  fill={isSaving ? "currentColor" : "none"}
                />
                {saveForLaterLabel}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSaveForLater?.(item?.id)}
                disabled={isOutOfStock}
                title={isOutOfStock ? "Out of stock" : undefined}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F2430] bg-[linear-gradient(#CE9F2D,#CE9F2D)] px-6 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:opacity-60 disabled:active:scale-100"
              >
                <FaShoppingCart size={13} />
                {saveForLaterLabel}
              </button>
            )}

            <button
              type="button"
              onClick={() => onRemove?.(item?.id)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#2d2d2d] transition hover:text-[#FF3B35]"
            >
              <Trash2 size={16} className="text-[#FF3B35]" />
              {removeLabel}
            </button>

            {onBuyNow && (
              <button
                type="button"
                onClick={() => onBuyNow(item?.id)}
                className="inline-flex items-center text-xs sm:text-sm font-semibold text-[#1B1D60] transition hover:text-[#CE9F2D]"
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
