import PricePill from "./PricePill";
import { Link } from "react-router-dom";

export default function NewArrivalCard({
    title,
    views,
    images = [],
    price,
    oldPrice,
    badge,
    link
}) {
    const displayImages = images.slice(0, 2);
    const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
    const badgeText = badge ?? currentMonth;

    return (
        <Link to={link} className="block">
            <article
                className="relative h-full min-w-0 rounded-[12px] bg-white px-3 pb-4 pt-4 shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg sm:px-4 sm:pb-5 sm:pt-5"
            >
                <h3
                    className="mx-auto w-full max-w-[90%] overflow-hidden text-ellipsis whitespace-nowrap text-center font-montserrat text-[13px] font-medium leading-6 text-[#2E2E2E] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]"
                    title={title}
                >
                    {title}
                </h3>

                <p className="mt-3 font-montserrat text-[14px] font-medium leading-[24px] text-[#A6A6A6] sm:text-[15px] lg:text-[16px]">
                    {views} Views
                </p>

                <div className="mt-3 flex gap-2 sm:gap-3 md:gap-4">
                    {displayImages.map((img, index) => (
                        <div key={`${img}-${index}`} className="flex-1 min-w-0">
                            <img
                                src={img}
                                alt={title}
                                className="aspect-[238/273] w-full rounded-[8px] object-cover sm:rounded-[10px] md:rounded-[12px]"
                            />

                            <PricePill
                                className="mx-auto mt-2 w-full max-w-[120px] sm:mt-3 sm:max-w-[140px] md:mt-4"
                                price={price}
                                oldPrice={oldPrice}
                            />
                        </div>
                    ))}
                </div>
            </article>
        </Link>
    );
}
