import QuantitySelector from "./QuantitySelector";
import SellerInfo from "./SellerInfo";
import CartActionButtons from "./CartActionButtons";
import Badge from "./Badge";
import { applyImageFallback, formatMoney } from "../../utils/ecommerce";
import { calculateDiscountPercent } from "../../utils/ecommerce/money";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

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
  const stock = item?.stock ?? item?.stockQuantity ?? item?.availableQty ?? null;
  const maxQty = item?.maxQuantity ?? item?.max_quantity ?? null;
  const quantity = Number(item?.quantity || 1);

  const discountPct = calculateDiscountPercent(price, oldPrice);
  const isLowStock = stock !== null && stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  const isOutOfStock = stock !== null && stock === 0;
  const atMaxQty = maxQty !== null && quantity >= maxQty;

  const returnsAccepted = item?.returnsAccepted ?? item?.returns_accepted ?? true;
  const returnDays = item?.returnDays ?? item?.return_days ?? null;
  const returnsText = isOutOfStock
    ? null
    : returnsAccepted
    ? returnDays
      ? `${returnDays}-day returns`
      : "Returns accepted"
    : "Non-returnable";

  return (
    <div className="customer-card p-4 sm:p-5">
      <SellerInfo seller={item?.seller} feedback={item?.feedback} />

      <div className="flex flex-col gap-6 md:flex-row">
        <label className="flex items-start gap-2 text-sm font-semibold text-[var(--customer-ink)] md:pt-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelect?.(item?.id, event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[var(--customer-border-strong)] accent-[var(--customer-gold)]"
          />
          <span className="sr-only">Select {item?.title} for checkout</span>
        </label>

        {item?.image && (
          <div className="relative mx-auto h-[220px] w-full max-w-[220px] overflow-hidden rounded-[var(--customer-radius)] bg-[var(--customer-cream)] sm:h-[250px] sm:max-w-[250px] md:mx-0 md:h-[180px] md:w-[180px]">
            {discountPct > 0 && (
              <span className="absolute left-2 top-2 z-10 rounded-full bg-[var(--customer-gold)] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                {discountPct}% OFF
              </span>
            )}
            {productPath ? (
              <Link
                to={productPath}
                aria-label={`View details for ${item?.title}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-all duration-300 ease-in-out hover:scale-105"
                  onError={(event) =>
                    applyImageFallback(event, item.title, "cart")
                  }
                />
              </Link>
            ) : (
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
                onError={(event) =>
                  applyImageFallback(event, item.title, "cart")
                }
              />
            )}
          </div>
        )}

        <div className="flex-1">
          {item?.sold && <Badge>{item.sold} Sold</Badge>}
          {productPath ? (
            <Link
              to={productPath}
              className="block text-base font-semibold leading-7 text-[var(--customer-ink)] underline-offset-2 transition-all duration-300 ease-in-out hover:text-[var(--customer-gold-dark)] hover:underline sm:text-lg"
            >
              {item?.title}
            </Link>
          ) : (
            <h3 className="text-base font-semibold leading-7 text-[var(--customer-ink)] sm:text-lg">
              {item?.title}
            </h3>
          )}

          <div className="flex flex-col">
            {item?.condition && (
              <span className="text-[13px] font-medium text-[var(--customer-muted)]">
                {item.condition}
              </span>
            )}

            {item?.color && (
              <span className="text-[13px] font-medium text-[var(--customer-muted)]">
                Color: {item.color}
              </span>
            )}

            {item?.size && (
              <span className="text-[13px] font-medium text-[var(--customer-muted)]">
                Size: {item.size}
              </span>
            )}

            {Object.entries(item?.attributes || {})
              .filter(([key]) => !["color", "size"].includes(key))
              .map(([key, value]) => (
                <span
                  key={key}
                  className="text-[13px] font-medium capitalize text-[var(--customer-muted)]"
                >
                  {key.replace(/_/g, " ")}: {String(value)}
                </span>
              ))}
          </div>

          <div>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-base font-bold text-[var(--customer-navy)] sm:text-lg md:text-xl">
                {formatMoney(price)}
              </span>

              {oldPrice > 0 && oldPrice > price && (
                <span className="text-[11px] font-medium line-through text-[var(--customer-subtle)] sm:text-xs">
                  MRP {formatMoney(oldPrice)}
                </span>
              )}

              {discountPct > 0 && (
                <span className="text-[11px] font-semibold text-emerald-600 sm:text-xs">
                  {discountPct}% off
                </span>
              )}
            </div>

            {shippingAmount > 0 ? (
              <p className="mt-1 text-[13px] font-medium text-[var(--customer-muted)]">
                + {formatMoney(shippingAmount)} shipping
              </p>
            ) : (
              <p className="mt-1 text-[13px] font-medium text-emerald-600">
                Free shipping
              </p>
            )}

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
              <p className={`mt-1 text-[13px] font-medium ${returnsAccepted ? "text-[var(--customer-muted)]" : "text-amber-700"}`}>
                {returnsText}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div>
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

            {quantity > 1 && price > 0 && (
              <span className="text-sm font-semibold text-[var(--customer-navy)]">
                Subtotal: {formatMoney(price * quantity)}
              </span>
            )}

            <CartActionButtons
              BuyNow="Buy it now"
              SaveForLater="Save for later"
              Remove="Remove"
              onRemove={() => onRemove(item?.id)}
              onSaveForLater={() => onSaveForLater(item?.id)}
              onBuyNow={() => onBuyNow?.(item?.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
