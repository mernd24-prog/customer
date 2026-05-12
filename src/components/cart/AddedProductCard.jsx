import Badge from "./Badge";

export default function AddedProductCard({
    image,
    title,
    itemPrice,
    shipping,
    subtotal,
    badgeText,
}) {
    return (
        <div className="w-full">
            {/* Top Section */}
            <div className="flex flex-col gap-3 xs:gap-4 sm:flex-row sm:items-start">
                {/* Image */}
                <div className="mx-auto h-[85px] w-[85px] flex-shrink-0 overflow-hidden rounded-lg border-[#686565] sm:mx-0 sm:h-[95px] sm:w-[95px] md:h-[110px] md:w-[110px] lg:h-[120px] lg:w-[120px]">
                    <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    {/* Badge + Title */}
                    <div className="flex flex-wrap items-center gap-2">
                        {badgeText && (
                            <Badge>
                                {badgeText}
                            </Badge>
                        )}

                        <h3 className="line-clamp-2 text-xs font-medium leading-5 text-[#111] sm:text-sm md:text-base lg:text-lg">
                            {title}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Bottom Pricing */}
            <div className="mt-1 space-y-2 text-xs sm:mt-4 sm:space-y-3 sm:text-sm md:text-base">
                {/* Item */}
               <div className="flex items-center justify-between gap-2">
    <span className="text-gray-600 text-xs sm:text-sm">
        Item
    </span>

    <span className="text-xs font-medium text-[#111] sm:text-sm">
        ${itemPrice}
    </span>
</div>

{/* Shipping */}
<div className="flex items-center justify-between gap-2">
    <span className="text-gray-600 text-xs sm:text-sm">
        Shipping
    </span>

    <span className="text-xs font-medium text-[#111] sm:text-sm">
        ${shipping}
    </span>
</div>

                {/* Subtotal */}
                <div className="flex items-center justify-between gap-3 border-t pt-2 text-sm font-bold sm:pt-3 sm:text-base md:text-lg">
                    <span className="text-[#111]">
                        Subtotal
                    </span>

                    <span className="text-[#111]">
                        ${subtotal}
                    </span>
                </div>
            </div>
        </div>
    );
}