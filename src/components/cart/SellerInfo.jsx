export default function SellerInfo({
    seller,
    feedback,
}) {
    return (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            {/* Left Side */}
            <div className="min-w-0">
                {/* Seller Name */}
                {seller && (
                    <h3 className="text-sm font-bold text-[#111] sm:text-base md:text-lg">
                        {seller}
                    </h3>
                )}

                {/* Feedback */}
                {feedback && (
                    <p className="mt-1 text-[11px] text-gray-500 sm:text-xs md:text-sm">
                        {feedback}
                    </p>
                )}
            </div>

            {/* Right Side */}
            <span className="w-fit rounded-full underline px-2 py-[2px] text-[12px] font-semibold text-[#b37804] sm:text-[11px] md:text-xs">
                Pay only this seller
            </span>
        </div>
    );
}