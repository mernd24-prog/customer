import { cn } from "../../../utils/common";
import { formatMoney } from "../../../utils/ecommerce";

export default function ProductPriceBlock({
  price,
  mrp,
  currency,
  discount,
  safeDynamicPrice = null,
  dynamicState = {},
  dealBadge = "",

  priceClassName = "",
  mrpClassName = "",
  discountClassName = "",
}) {
  return (
    <>
      <div>
        {dealBadge ? (
          <span className="inline-flex  rounded-full bg-[#1B1D60] px-3 py-1 text-xs  font-bold uppercase text-white">
            {dealBadge}
          </span>
        ) : null}
        <div className="mb-1 flex flex-wrap items-center gap-3">
          <span className={cn("    font-bold  text-navy", priceClassName)}>
            {formatMoney(price, currency)}
          </span>

          {mrp && mrp > price && (
            <span
              className={cn(
                "font-semibold text-[#595959] line-through",
                mrpClassName,
              )}
            >
              {formatMoney(mrp, currency)}
            </span>
          )}

          {discount > 0 && (
            <span
              className={cn(
                "rounded-full bg-[#D93025] px-3 py-1 text-[8px] font-bold uppercase text-white",
                discountClassName,
              )}
            >
              {discount}% Off
            </span>
          )}
        </div>

        <p className="text-xs font-medium text-[#2E2E2E] lg:text-sm">
          Inclusive of All Taxes
        </p>
      </div>

      {safeDynamicPrice && dynamicState.current?.loyalty && (
        <p className="inline-block w-fit rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-dark">
          ✦✦✦ Loyalty Price Applied
        </p>
      )}
    </>
  );
}
