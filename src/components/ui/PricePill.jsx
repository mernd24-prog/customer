export default function PricePill({
    price,
    oldPrice,
    className = "",
    priceClassName = "",
    oldPriceClassName = "",
}) {
    const formatPrice = (value) => Number(value).toLocaleString("en-IN");

    return (
        <div
            className={`flex h-[34px] w-full max-w-[160px] items-center justify-evenly gap-1 rounded-full border border-[#CE9F2D] px-2 font-montserrat ${className}`}
        >
            <span className={`text-[12px] font-semibold leading-none text-[#2E2E2E] sm:text-[13px] lg:text-[14px] xl:text-[15px] ${priceClassName}`}>
                ₹{formatPrice(price)}
            </span>
            <span className={`text-[10px] leading-none text-[#A26D27] line-through sm:text-[11px] lg:text-[12px] xl:text-[13px] ${oldPriceClassName}`}>
                ₹{formatPrice(oldPrice)}
            </span>
        </div>
    );
}
