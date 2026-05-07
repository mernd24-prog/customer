import PricePill from "./PricePill";
import { SkeletonLoader } from "../common/skeleton";
import { Link } from "react-router-dom";
import { formatAmount, getRatingStars } from "../../utils/ecommerce";

export default function ProductsForYouCard({
    image,
    title,
    subtitle,
    price,
    oldPrice,
    rating = 3,
    loading = false,
    link = "/",
    variant = "grid",
}) {
    const isListVariant = variant === "list" || variant === "compact";

    if (loading) {
        return (
            <SkeletonLoader
                preset={isListVariant ? "PRODUCTS_FOR_YOU_LIST_CARD" : "PRODUCTS_FOR_YOU_CARD"}
                wrapperClass={isListVariant ? "min-w-0 bg-white" : "min-w-0 rounded-[8px] bg-white p-3 shadow-sm"}
                containerClass=""
            />
        );
    }

    const { stars, emptyStars } = getRatingStars(rating);

    if (isListVariant) {
        return (
            <Link to={link} className="block h-full">
                <article className="min-w-0 bg-white">
                    <img
                        src={image}
                        alt={title}
                        className="aspect-[302/300] w-full rounded-[8px] object-cover"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3 border-b border-[#E9E9E9] pb-2">
                        <h3
                            className="min-w-0 truncate font-montserrat text-[12px] font-medium text-[#787878]"
                            title={title}
                        >
                            {title}
                        </h3>
                        <p className="shrink-0 font-montserrat text-[15px] leading-none text-[#F79A3E]">
                            {stars}
                            <span className="text-[#F79A3E]">{emptyStars}</span>
                        </p>
                    </div>
                    <p
                        className="mt-3 line-clamp-2 min-h-[34px] font-montserrat text-[13px] leading-5 text-[#2E2E2E]"
                        title={subtitle}
                    >
                        {subtitle}
                    </p>
                    <div className="mt-3 flex items-center gap-2 font-montserrat">
                        <span className="text-[13px] font-semibold text-[#2E2E2E]">
                            ₹{formatAmount(price)}
                        </span>
                        <span className="text-[12px] text-[#E23B3B] line-through">
                            ₹{formatAmount(oldPrice)}
                        </span>
                    </div>
                </article>
            </Link>
        );
    }

    return (
        <Link to={link} className="block">
            <article className="min-w-0 rounded-[8px] bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-xl sm:px-4 sm:pb-5 sm:pt-5">
                <img
                    src={image}
                    alt={title}
                    className="mx-auto mb-2 mt-1 aspect-[1/1.15] w-full rounded-[8px] object-cover"
                />
                <div className="mt-2">
                    <p className="font-montserrat text-[18px] leading-none text-[#CE9F2D]">{stars}</p>
                    <h3
                        className="mt-1 line-clamp-1 font-montserrat text-[12px] font-semibold text-[#2E2E2E] sm:text-[14px]"
                        title={title}
                    >
                        {title}
                    </h3>
                    <p
                        className="mt-1 line-clamp-2 min-h-[28px] font-montserrat text-[13px] leading-4 text-[#787878]"
                        title={subtitle}
                    >
                        {subtitle}
                    </p>
                    <PricePill
                        price={price}
                        oldPrice={oldPrice}
                        className="mt-3 h-[34px] w-full max-w-[160px]"
                    />
                </div>
            </article>
        </Link>
    );
}
