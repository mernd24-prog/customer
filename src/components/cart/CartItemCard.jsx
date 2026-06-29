import QuantitySelector from "./QuantitySelector";
import { applyImageFallback } from "../../utils/ecommerce";
import { calculateDiscountPercent } from "../../utils/ecommerce/money";
import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { FaShoppingCart } from "react-icons/fa";
import ProductPriceBlock from "../../pages/products/components/oldAndNewPrice";
import ProductStockStatus from "../../pages/products/components/stockStatus";
import StarRating from "../../pages/products/components/starRating";

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
  removeLabel = "Remove Item",
  showCheckbox,
  fullWidth = false,
}) {
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

  return (
    <article
      className={`relative w-full p-3 min-[375px]:p-4 sm:p-5 lg:p-6 xl:min-h-[433px] xl:p-[25px] ${
        fullWidth ? "xl:max-w-none" : "xl:max-w-[1161px]"
      }`}
    >
      <div
        className={`grid gap-5 sm:gap-6  lg:grid-cols-[minmax(220px,320px)_1fr] xl:grid-cols-[minmax(220px,399px)_1fr] xl:gap-9 pb-7 ${
          !isLastItem ? " border-b border-[#CE9F2D4D]" : ""
        }`}
      >
        {item?.image && (
          <div className=" relative  mx-auto flex aspect-[399/383] w-full max-w-[399px] items-center justify-center overflow-hidden rounded-[12px]  border border-[#F0E6D2] bg-white lg:h-auto lg:max-w-[320px] xl:h-[383px] xl:w-[399px] xl:max-w-[399px]">
            {showCheckbox && (
              <label className=" absolute left-3 top-3 z-10 flex items-center justify-center sm:left-4 sm:top-4 xl:left-5 xl:top-5">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(event) =>
                    onSelect?.(item?.id, event.target.checked)
                  }
                  className="h-[18px] w-[18px] rounded-[4px] border-[#A9B4D8] accent-[#3F4095]"
                />
                <span className="sr-only">
                  Select {item?.title} for checkout
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
              className="line-clamp-2 block text-lg font-bold leading-snug text-[#2d2d2d] transition hover:text-[#1B1D60] min-[375px]:text-xl sm:text-[26px]"
            >
              {item?.title}
            </Link>
          ) : (
            <h3 className="line-clamp-2  text-lg font-bold leading-snug text-[#2d2d2d] min-[375px]:text-xl sm:text-[26px]">
              {item?.title}
            </h3>
          )}

          <div className="my-4">
            <StarRating rating={ratingValue} count={reviewCount} />
          </div>

          <div className=" flex flex-wrap  gap-1.5  sm:gap-2">
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

          <div className="">
            <ProductStockStatus
              inStock={stock}
              selectedVariant={selectedVariant}
              product={product}
            />

            <ProductPriceBlock
              price={price}
              mrp={oldPrice}
              currency={item?.currency ?? item?._raw?.currency}
              discount={discountPct}
              priceClassName="text-[20px] lg:text-[24px] font-extrabold text-[#001F3F]"
              mrpClassName="text-[20px] lg:text-[24px] font-semibold text-[#949494]"
              discountClassName=" text-xs lg:text-base font-semibold"
            />

            {atMaxQty && !isOutOfStock && (
              <p className="mt-1 text-[13px] font-medium text-[var(--customer-muted)]">
                Max {maxQty} per order
              </p>
            )}
          </div>

          <div className="mt-5 sm:mt-7">
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

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-7 sm:gap-x-8">
            {saveForLaterLabel === "Move to Wishlist" ? (
              <button
                type="button"
                onClick={() => onSaveForLater?.(item?.id)}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#2d2d2d] transition hover:text-[#1B1D60] min-[375px]:text-base sm:gap-3 sm:text-lg"
              >
                <Heart size={22} className="text-[#1B1D60] sm:size-[25px]" />
                {saveForLaterLabel}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSaveForLater?.(item?.id)}
                disabled={isOutOfStock}
                title={isOutOfStock ? "Out of stock" : undefined}
                className="inline-flex items-center gap-2 rounded-lg bg-[#CE9F2D] px-14 py-2 font-medium text-white transition hover:bg-[#b8891f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#CE9F2D] disabled:active:scale-100 lg:px-20 lg:py-3"
              >
                <FaShoppingCart />
                {saveForLaterLabel}
              </button>
            )}

            <button
              type="button"
              onClick={() => onRemove?.(item?.id)}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#2d2d2d] transition hover:text-[#FF3B35] min-[375px]:text-base sm:gap-3 sm:text-lg"
            >
              <Trash2 size={19} className="text-[#FF3B35] sm:size-[22px]" />
              {removeLabel}
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
