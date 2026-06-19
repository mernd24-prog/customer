import { formatMoney } from "../../../utils/ecommerce";

export default function ProductPriceBlock({
  price,
  mrp,
  currency,
  discount,
  safeDynamicPrice,
  dynamicState,
}) {
  return (
    <>
      <div>
        <div className="flex  flex-wrap my-2 items-center gap-3">
          <span className="text-xl lg:text-[36px] font-bold leading-none text-navy">
            {formatMoney(price, currency)}
          </span>

          {mrp && mrp > price && (
            <span className="text-xl lg:text-[36px]  font-semibold text-gray line-through">
              {formatMoney(mrp, currency)}
            </span>
          )}

          {discount > 0 && (
            <span className="rounded-full bg-[#FF3D31] px-3 py-1 text-sm  lg:text-lg font-bold uppercase text-white">
              {discount}% Off
            </span>
          )}
        </div>

        <p className="text-[#2E2E2E] font-medium text-base lg:text-[20px]">
          Inclusive of all taxes
        </p>
      </div>

      {safeDynamicPrice && dynamicState.current?.loyalty && (
        <p className="inline-block w-fit d  rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-dark">
          ✦ Loyalty price applied
        </p>
      )}
    </>
  );
}
