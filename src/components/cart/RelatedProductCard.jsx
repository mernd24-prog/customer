export default function RelatedProductCard({
    image,
    title,
    price,
}) {
    return (
        <div className="w-[31%] sm:w-[32%]">
            {/* Image */}
            <div className="overflow-hidden rounded-xl border-[#686565] ">
                <img
                    src={image}
                    alt={title}
                    className="h-[120px] w-full object-cover sm:h-[140px] md:h-[160px] lg:h-[180px]"
                />
            </div>

            {/* Content */}
            <div className="mt-2">
                <h3 className="line-clamp-3 text-[11px] font-medium leading-5 text-[#111] sm:text-xs md:text-sm lg:text-base">
                    {title}
                </h3>

                <span className="mt-2 block text-xs font-bold text-[#111] sm:text-sm md:text-base lg:text-lg">
                    ${price}
                </span>
            </div>
        </div>
    );
}