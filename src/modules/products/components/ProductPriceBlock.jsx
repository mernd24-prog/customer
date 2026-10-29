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
    <div className="flex flex-col gap-1.5">
      {dealBadge ? (
        <span className="inline-flex w-fit rounded-full bg-[#1B1D60] px-3 py-1 text-xs font-bold uppercase text-white">
          {dealBadge}
        </span>
      ) : null}

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-2xl sm:text-3xl font-extrabold text-[#212121]">
          {formatMoney(price, currency)}
        </span>

        {mrp && mrp > price && (
          <span className="text-sm sm:text-base font-normal text-[#878787] line-through">
            {formatMoney(mrp, currency)}
          </span>
        )}

        {discount > 0 && (
          <span className="inline-flex items-center rounded-full bg-[#FDECEC] px-2.5 py-1 text-xs font-bold text-[#D32F2F]">
            {discount}% OFF
          </span>
        )}

        <span className="text-xs font-medium text-[#878787]">
          (Inclusive of all taxes)
        </span>
      </div>

      {safeDynamicPrice && dynamicState.current?.loyalty && (
        <p className="inline-block w-fit rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-dark">
          ✦✦✦ Loyalty Price Applied
        </p>
      )}
    </div>
  );
}
