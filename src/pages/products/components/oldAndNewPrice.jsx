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
          <span
            className={cn(
              "text-xl font-bold leading-none text-navy lg:text-[36px]",
              priceClassName,
            )}
          >
            {formatMoney(price, currency)}
          </span>

          {mrp && mrp > price && (
            <span
              className={cn(
                "text-xl font-semibold text-gray line-through lg:text-[36px]",
                mrpClassName,
              )}
            >
              {formatMoney(mrp, currency)}
            </span>
          )}

          {discount > 0 && (
            <span
              className={cn(
                "rounded-full bg-[#FF3D31] px-3 py-1 text-sm font-bold uppercase text-white lg:text-lg",
                discountClassName,
              )}
            >
              {discount}% Off
            </span>
          )}
        </div>

        <p className="text-base font-medium text-[#2E2E2E] lg:text-[18px]">
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
