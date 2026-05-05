export default function NewArrivalCard({
    title,
    views,
    images,
    price,
    oldPrice,
    badge,
}) {
    return (
        <div className="bg-[#f8f8f8] rounded-2xl p-4 relative">

            {/* Badge */}
            {badge && (
                <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md">
                    {badge}
                </span>
            )}

            {/* Title */}
            <h3 className="text-sm font-medium text-center text-gray-800">
                {title}
            </h3>

            {/* Views */}
            <p className="text-xs text-gray-500 mt-1 mb-3">
                {views} Views
            </p>

            {/* Images */}
            <div className="flex flex-row gap-3 mb-4">
                {images.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt=""
                        className="w-1/2 h-[120px] object-cover rounded-xl"
                    />
                ))}
            </div>

            {/* Price section */}
            <div className="flex justify-center gap-3">
                {[1, 2].map((_, i) => (
                    <div
                        key={i}
                        className="border border-primary rounded-full px-3 py-1 text-xs flex items-center gap-1"
                    >
                        <span className="font-semibold">₹{price}</span>
                        <span className="line-through text-gray-400 text-[10px]">
                            ₹{oldPrice}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}