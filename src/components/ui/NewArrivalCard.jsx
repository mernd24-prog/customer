import PricePill from "./PricePill";
import { Link } from "react-router-dom";

export default function NewArrivalCard({
    title,
    views,
    images = [],
    price,
    oldPrice,
    link
}) {
    const displayImages = images.slice(0, 2);
    return (
        <Link to={link} className="block">
            <article
                className="customer-card relative h-full min-w-0 px-3 pb-4 pt-4 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[var(--customer-shadow)]"
            >
                <h3
                    className="mx-auto w-full max-w-[90%] overflow-hidden text-ellipsis whitespace-nowrap text-center font-montserrat text-[13px] font-semibold leading-6 text-[var(--customer-ink)] sm:text-[15px]"
                    title={title}
                >
                    {title}
                </h3>

                <p className="mt-2 font-montserrat text-[12px] font-medium leading-5 text-[var(--customer-muted)]">
                    {views} Views
                </p>

                <div className="mt-3 flex gap-2 sm:gap-3 md:gap-4">
                    {displayImages.map((img, index) => (
                        <div key={`${img}-${index}`} className="flex-1 min-w-0">
                            <img
                                src={img}
                                alt={title}
                                className="aspect-[238/273] w-full rounded-[var(--customer-radius)] object-cover"
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
