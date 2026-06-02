import QuantitySelector from "./QuantitySelector";
import SellerInfo from "./SellerInfo";
import CartActionButtons from "./CartActionButtons";
import Badge from "./Badge";
import { applyImageFallback, formatMoney } from "../../utils/ecommerce";
import { Link } from "react-router-dom";

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
  const shippingAmount = Number(item.shipping || 0);
  const productPath = item.productId ? `/products/${item.productId}` : "";

  return (
    <div className="customer-card p-4  sm:p-5">
      <SellerInfo seller={item.seller} feedback={item.feedback} />

      <div className="flex flex-col gap-6 md:flex-row">
        <label className="flex items-start gap-2  text-sm font-semibold text-[var(--customer-ink)] md:pt-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelect?.(item.id, event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[var(--customer-border-strong)] accent-[var(--customer-gold)]"
          />
          <span className="sr-only">Select {item.title} for checkout</span>
        </label>

        {item.image && (
          <div className="mx-auto h-[220px] w-full max-w-[220px] overflow-hidden rounded-[var(--customer-radius)] bg-[var(--customer-cream)] sm:h-[250px] sm:max-w-[250px] md:mx-0 md:h-[180px] md:w-[180px]">
            {productPath ? (
              <Link to={productPath} aria-label={`View details for ${item.title}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-all duration-300 ease-in-out hover:scale-105"
                  onError={(event) => applyImageFallback(event, item.title, "cart")}
                />
              </Link>
            ) : (
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
                onError={(event) => applyImageFallback(event, item.title, "cart")}
              />
            )}
          </div>
        )}

        <div className="flex-1">
          {item.sold && <Badge>{item.sold} Sold</Badge>}
          {productPath ? (
            <Link
              to={productPath}
              className="block text-base font-semibold leading-7 text-[var(--customer-ink)] underline-offset-2 transition-all duration-300 ease-in-out hover:text-[var(--customer-gold-dark)] hover:underline sm:text-lg"
            >
              {item.title}
            </Link>
          ) : (
            <h3 className="text-base font-semibold leading-7 text-[var(--customer-ink)] sm:text-lg">
              {item.title}
            </h3>
          )}

          <div className="flex flex-col">
            {item.condition && (
              <span className="text-[13px] font-medium text-[var(--customer-muted)]">
                {item.condition}
              </span>
            )}

            {item.color && (
              <span className="text-[13px] font-medium text-[var(--customer-muted)]">
                Color: {item.color}
              </span>
            )}

            {item.size && (
              <span className="text-[13px] font-medium text-[var(--customer-muted)]">
                Size: {item.size}
              </span>
            )}

            {Object.entries(item.attributes || {})
              .filter(([key]) => !["color", "size"].includes(key))
              .map(([key, value]) => (
                <span key={key} className="text-[13px] font-medium capitalize text-[var(--customer-muted)]">
                  {key.replace(/_/g, " ")}: {String(value)}
                </span>
              ))}
          </div>

          <div>
            <div className="mt-2 flex flex-col">
              <span className="text-base font-bold text-[var(--customer-navy)] sm:text-lg md:text-xl">
                {formatMoney(item.price)}
              </span>

              {item.oldPrice && (
                <span className="text-[11px] font-medium line-through text-[var(--customer-subtle)] sm:text-xs">
                  {formatMoney(item.oldPrice)}
                </span>
              )}
            </div>

            {shippingAmount > 0 ? (
              <div className="mt-1 flex flex-col gap-1">
                <span className="text-sm font-semibold text-[var(--customer-ink)] sm:text-base">
                  + {formatMoney(shippingAmount)}
                </span>

                <span className="text-[14px] font-medium text-[var(--customer-muted)] sm:text-sm">
                  Shipping
                </span>
              </div>
            ) : null}

            <span className="mt-1 block text-[14px] font-medium text-[var(--customer-muted)] sm:text-sm">
              Returns accepted
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <QuantitySelector
              quantity={item.quantity}
              onIncrease={() => onIncrease(item.id)}
              onDecrease={() => onDecrease(item.id)}
            />

            <CartActionButtons
              BuyNow="Buy it now"
              SaveForLater="Save for later"
              Remove="Remove"
              onRemove={() => onRemove(item.id)}
              onSaveForLater={() => onSaveForLater(item.id)}
              onBuyNow={() => onBuyNow?.(item.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
