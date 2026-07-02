import { cn } from "../../../lib/utils";
import { formatMoney } from "../../../utils/ecommerce";

export default function ProductPriceBlock({
  price,
  mrp,
  currency,
  discount,
  safeDynamicPrice = null,
  dynamicState = {},

  priceClassName = "",
  mrpClassName = "",
  discountClassName = "",
}) {
  return (
    <>
      <div>
        <div className="my-4 flex flex-wrap items-center gap-3">
          <span className={cn("    font-bold  text-navy", priceClassName)}>
            {formatMoney(price, currency)}
          </span>

          {mrp && mrp > price && (
            <span
              className={cn(
                "  font-semibold !text-gray line-through ",
                mrpClassName,
              )}
            >
              {formatMoney(mrp, currency)}
            </span>
          )}

          {discount > 0 && (
            <span
              className={cn(
                "rounded-full bg-[#FF3D31] px-3 py-1 text-sm font-bold uppercase text-white lg:text-base",
                discountClassName,
              )}
            >
              {discount}% Off
            </span>
          )}
        </div>

        <p className="text-sm font-medium text-[#2E2E2E] lg:text-base">
          Inclusive of all taxes
        </p>
      </div>

      {safeDynamicPrice && dynamicState.current?.loyalty && (
        <p className="inline-block w-fit rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-dark">
          ✦ Loyalty price applied
        </p>
      )}
    </>
  );
}
