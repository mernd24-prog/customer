import PricePill from "./PricePill";
import { SkeletonBox } from "../common/skeleton";

export default function ProductsForYouCard({
    image,
    title,
    subtitle,
    price,
    oldPrice,
    rating = 3,
    loading = false,
}) {
    if (loading) {
        return (
            <article className="min-w-0 rounded-[8px] bg-white p-3 shadow-sm">
                <SkeletonBox className="aspect-[1/1.15] w-full rounded-[8px]" />
                <div className="mt-2">
                    <SkeletonBox className="h-[12px] w-12" />
                    <SkeletonBox className="mt-1 h-[12px] w-4/5" />
                    <SkeletonBox className="mt-1 h-[12px] w-3/4" />
                    <SkeletonBox className="mt-3 h-[34px] w-full max-w-[160px] rounded-full" />
                </div>
            </article>
        );
    }

    const stars = "★★★★★".slice(0, Math.max(0, Math.min(5, rating)));

    return (
        <article className="min-w-0 rounded-[8px] bg-white p-3 shadow-sm">
            <img
                src={image}
                alt={title}
                className="aspect-[1/1.15] w-full rounded-[8px] object-cover mb-2 mt-1 mx-auto "
                // lassName="w-auto h-[483] top-[4025px] left-[978p] aspect-[1/1.15] w-full rounded-[8px] object-cover mb-2 mt-1 mx-auto "
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
    );
}


