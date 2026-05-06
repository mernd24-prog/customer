export default function NewArrivalCard({
    title,
    views,
    images = [],
    price,
    oldPrice,
    badge,
}) {
    const displayImages = images.slice(0, 2);
    const formatPrice = (value) => Number(value).toLocaleString("en-IN");
    const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
    const badgeText = badge ?? currentMonth;

    return (
        <article className="relative h-full min-w-0 rounded-[12px] bg-white px-4 pb-6 pt-5 shadow-sm sm:px-5">
            {badgeText && (
                <div className="absolute left-[-10px] top-[18px] h-[37px] w-[102px] overflow-hidden rounded-l-full">
                    {/* <img
                        src="image/png/image.png"
                        alt=""
                        className="h-full w-full object-fill"
                    /> */}
                    <span className="absolute inset-x-0 top-0 flex h-[30px] items-center justify-center pl-3 pr-5 font-montserrat text-[15px] font-bold leading-none text-white">
                        {badgeText}
                    </span>
                </div>
            )}

            <h3
                className="mx-auto h-[34px] max-w-full overflow-hidden text-ellipsis whitespace-nowrap pl-[72px] pr-2 text-center font-montserrat text-[15px] font-medium leading-[34px] text-[#2E2E2E] sm:pl-[84px] sm:text-[16px] lg:text-[17px] xl:text-[18px]"
                title={title}
            >
                {title}
            </h3>

            <p className="mt-3 font-montserrat text-[14px] font-medium leading-[24px] text-[#A6A6A6] sm:text-[15px] lg:text-[16px]">
                {views} Views
            </p>

            <div className="mt-2 grid grid-cols-2 gap-3">
                {displayImages.map((img, index) => (
                    <div key={`${img}-${index}`} className="min-w-0">
                        <img
                            src={img}
                            alt={title}
                            className="aspect-[238/273] w-full rounded-[10px] object-cover"
                        />

                        <div className="mx-auto mt-4 flex h-[34px] w-full max-w-[160px] items-center justify-center gap-1 rounded-full border border-[#CE9F2D] px-2 font-montserrat">
                            <span className="text-[12px] font-semibold leading-none text-[#2E2E2E] sm:text-[13px] lg:text-[14px] xl:text-[15px]">
                                ₹{formatPrice(price)}
                            </span>
                            <span className="text-[10px] leading-none text-[#A26D27] line-through sm:text-[11px] lg:text-[12px] xl:text-[13px]">
                                ₹{formatPrice(oldPrice)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
}
