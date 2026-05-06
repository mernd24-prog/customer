import PricePill from "./PricePill";

export default function NewArrivalCard({
    title,
    views,
    images = [],
    price,
    oldPrice,
    badge,
}) {
    const displayImages = images.slice(0, 2);
    const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
    const badgeText = badge ?? currentMonth;

    return (
        <article
            className="relative h-full min-w-0 rounded-[12px] bg-white px-3 pb-4 pt-4 shadow-sm transition hover:shadow-lg sm:px-4 sm:pb-5 sm:pt-5"
        >
            {badgeText && (
                <div className="absolute left-[-8px] top-4 h-[34px] w-[94px] overflow-hidden rounded-l-full sm:left-[-10px] sm:top-[18px] sm:h-[37px] sm:w-[102px]">
                    <img
                        src="image/png/image.png"
                        alt=""
                        className="h-full w-full object-fill"
                    />
                    <span className="absolute inset-x-0 top-0 flex h-[28px] items-center justify-center pl-3 pr-4 font-montserrat text-[13px] font-bold leading-none text-white sm:h-[30px] sm:pl-3 sm:pr-5 sm:text-[15px]">
                        {badgeText}
                    </span>
                </div>
            )}

            <h3
                className="mx-auto h-[32px] max-w-full overflow-hidden text-ellipsis whitespace-nowrap pl-[66px] pr-2 text-center font-montserrat text-[14px] font-medium leading-[32px] text-[#2E2E2E] sm:h-[34px] sm:pl-[84px] sm:text-[16px] sm:leading-[34px] lg:text-[17px] xl:text-[18px]"
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

                        <PricePill className="mx-auto mt-4" price={price} oldPrice={oldPrice} />
                    </div>
                ))}
            </div>
        </article>
    );
}
