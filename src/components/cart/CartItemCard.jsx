import QuantitySelector from "./QuantitySelector";
import { applyImageFallback, formatMoney } from "../../utils/ecommerce";
import { calculateDiscountPercent } from "../../utils/ecommerce/money";
import { Link } from "react-router-dom";
import { AlertTriangle, Heart, Trash2 } from "lucide-react";

const LOW_STOCK_THRESHOLD = 5;

export default function CartItemCard({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  onSaveForLater,
  onBuyNow,
  selected = true,
  onSelect,
}) {
  const shippingAmount = Number(item?.shipping || 0);
  const productPath = item?.productId ? `/products/${item.productId}` : "";
  const price = Number(item?.price || 0);
  const oldPrice = Number(item?.oldPrice || 0);
  const stock =
    item?.stock ?? item?.stockQuantity ?? item?.availableQty ?? null;
  const maxQty = item?.maxQuantity ?? item?.max_quantity ?? null;
  const quantity = Number(item?.quantity || 1);
  const rating = item?.rating ?? item?.averageRating ?? item?._raw?.rating;
  const ratingValue = Number(rating);
  const reviewCount =
    item?.reviewCount ?? item?.reviewsCount ?? item?._raw?.reviewCount;

  const discountPct = calculateDiscountPercent(price, oldPrice);
  const isLowStock =
    stock !== null && stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  const isOutOfStock = stock !== null && stock === 0;
  const atMaxQty = maxQty !== null && quantity >= maxQty;

  const returnsAccepted =
    item?.returnsAccepted ?? item?.returns_accepted ?? true;
  const returnDays = item?.returnDays ?? item?.return_days ?? null;
  const returnsText = isOutOfStock
    ? null
    : returnsAccepted
      ? returnDays
        ? `${returnDays}-day returns`
        : "Returns accepted"
      : "Non-returnable";

  return (
    <article className="relative w-full p-3 min-[375px]:p-4 sm:p-5 lg:p-6 xl:min-h-[433px] xl:max-w-[1161px] xl:p-[25px]">
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(220px,320px)_1fr] xl:grid-cols-[minmax(220px,399px)_1fr] xl:gap-9">
        {item?.image && (
          <div className="relative mx-auto flex aspect-[399/383] w-full max-w-[399px] items-center justify-center overflow-hidden rounded-[10px] border border-[#F0E6D2] bg-white lg:h-auto lg:max-w-[320px] xl:h-[383px] xl:w-[399px] xl:max-w-[399px]">
            <label className="absolute left-3 top-3 z-10 flex items-center justify-center sm:left-4 sm:top-4 xl:left-5 xl:top-5">
              <input
                type="checkbox"
                checked={selected}
                onChange={(event) => onSelect?.(item?.id, event.target.checked)}
                className="h-[18px] w-[18px] rounded-[4px] border-[#A9B4D8] accent-[#3F4095]"
              />
              <span className="sr-only">Select {item?.title} for checkout</span>
            </label>
            {productPath ? (
              <Link
                to={productPath}
                aria-label={`View details for ${item?.title}`}
                className="block h-full w-full"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-contain p-3 transition duration-300 hover:scale-105 min-[375px]:p-4 sm:p-6"
                  onError={(event) =>
                    applyImageFallback(event, item.title, "cart")
                  }
                />
              </Link>
            ) : (
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-contain p-3 min-[375px]:p-4 sm:p-6"
                onError={(event) =>
                  applyImageFallback(event, item.title, "cart")
                }
              />
            )}
          </div>
        )}

        <div className="min-w-0 py-1 lg:py-2">
          {productPath ? (
            <Link
              to={productPath}
              className="line-clamp-2 block text-lg font-semibold leading-snug text-[#2d2d2d] transition hover:text-[#1B1D60] min-[375px]:text-xl sm:text-2xl"
            >
              {item?.title}
            </Link>
          ) : (
            <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[#2d2d2d] min-[375px]:text-xl sm:text-2xl">
              {item?.title}
            </h3>
          )}

          {Number.isFinite(ratingValue) && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-[#2d2d2d] min-[375px]:text-base sm:gap-2 sm:text-lg">
              <span>{ratingValue.toFixed(1)}</span>
              <span className="tracking-wide text-[#FF7A1A]">★★★★★</span>
              {reviewCount != null && <span>({reviewCount} reviews)</span>}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
            {item?.condition && (
              <span className="rounded-full bg-[#F2F1F8] px-3 py-1 text-xs font-semibold text-[#1B1D60]">
                {item.condition}
              </span>
            )}

            {item?.color && (
              <span className="rounded-full bg-[#F2F1F8] px-3 py-1 text-xs font-semibold text-[#1B1D60]">
                Color: {item.color}
              </span>
            )}

            {item?.size && (
              <span className="rounded-full bg-[#F2F1F8] px-3 py-1 text-xs font-semibold text-[#1B1D60]">
                Size: {item.size}
              </span>
            )}

            {Object.entries(item?.attributes || {})
              .filter(([key]) => !["color", "size"].includes(key))
              .map(([key, value]) => (
                <span
                  key={key}
                  className="rounded-full bg-[#F2F1F8] px-3 py-1 text-xs font-semibold capitalize text-[#1B1D60]"
                >
                  {key.replace(/_/g, " ")}: {String(value)}
                </span>
              ))}
          </div>

          <div className="mt-3 sm:mt-4">
            {stock !== null && stock > 0 && (
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#078B24] sm:text-base">
                <span className="h-3 w-3 rounded-full bg-[#078B24]" />
                {stock} in Stock
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
              <span className="text-xl font-sans font-extrabold text-[#1B1D60] min-[375px]:text-2xl  sm:text-[28px]">
                {formatMoney(price)}
              </span>

              {oldPrice > 0 && oldPrice > price && (
                <span className="text-lg font-bold text-[#8C8C8C] line-through min-[375px]:text-xl sm:text-2xl">
                  {formatMoney(oldPrice)}
                </span>
              )}

              {discountPct > 0 && (
                <span className="rounded-full bg-[#FF3D31] px-3 py-1.5 text-xs font-bold text-[#FFFFFF] min-[375px]:text-sm sm:px-5 sm:py-2 sm:text-base">
                  {discountPct}% Off
                </span>
              )}
            </div>

            <p className="mt-2 text-sm font-medium text-[#2d2d2d] min-[375px]:text-base sm:mt-3 sm:text-lg">
              Inclusive of all taxes
            </p>

            {isOutOfStock ? (
              <p className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-red-600">
                <AlertTriangle size={12} /> Out of stock
              </p>
            ) : isLowStock ? (
              <p className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-amber-600">
                <AlertTriangle size={12} /> Only {stock} left in stock
              </p>
            ) : null}

            {atMaxQty && !isOutOfStock && (
              <p className="mt-1 text-[13px] font-medium text-[var(--customer-muted)]">
                Max {maxQty} per order
              </p>
            )}

            {returnsText && (
              <p
                className={`mt-1 text-[13px] font-medium ${
                  returnsAccepted
                    ? "text-[var(--customer-muted)]"
                    : "text-amber-700"
                }`}
              >
                {returnsText}
              </p>
            )}

            <p className="mt-1 text-[13px] font-medium text-[var(--customer-muted)]">
              {shippingAmount > 0
                ? `+ ${formatMoney(shippingAmount)} shipping`
                : "Free shipping"}
            </p>
          </div>

          <div className="mt-5 sm:mt-7">
              <QuantitySelector
                quantity={item.quantity}
                onIncrease={() => onIncrease(item.id)}
                onDecrease={() => onDecrease(item.id)}
                increaseDisabled={item.increaseDisabled}
                increaseDisabledLabel={item.stockMessage || undefined}
              />
              {item.stockMessage ? (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {item.stockMessage}
                </p>
              ) : null}
            </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-7 sm:gap-x-8">
            {quantity > 1 && price > 0 && (
              <span className="basis-full text-sm font-semibold text-[#1B1D60]">
                Subtotal: {formatMoney(price * quantity)}
              </span>
            )}

            <button
              type="button"
              onClick={() => onSaveForLater?.(item?.id)}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#2d2d2d] transition hover:text-[#1B1D60] min-[375px]:text-base sm:gap-3 sm:text-lg"
            >
              <Heart size={22} className="text-[#1B1D60] sm:size-[25px]" />
              Move to Wishlist
            </button>

            <button
              type="button"
              onClick={() => onRemove?.(item?.id)}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#2d2d2d] transition hover:text-[#FF3B35] min-[375px]:text-base sm:gap-3 sm:text-lg"
            >
              <Trash2 size={19} className="text-[#FF3B35] sm:size-[22px]" />
              Remove Item
            </button>

            {onBuyNow && (
              <button
                type="button"
                onClick={() => onBuyNow(item?.id)}
                className="inline-flex items-center text-sm font-medium text-[#1B1D60] transition hover:text-[#CE9F2D] min-[375px]:text-base sm:text-lg"
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
