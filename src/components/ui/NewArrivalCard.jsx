import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { IoArrowForwardOutline } from "react-icons/io5";
import { TextWhiteButton } from "../dynamicComponent/button/static";
import { formatPageTitle } from "../../lib/utils";

export default function NewArrivalCard({
  title = "",
  seeAllLink = "/products",
  products = [],
}) {
  const displayProducts = Array.isArray(products) ? products : [];

  return (
    <article className="flex flex-col h-full overflow-hidden rounded-[20px] border border-[#1B1D6066] bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ">
      {/* Card Header (Navy Blue background) */}
      <div className="bg-[#1B1D60] p-5 flex  flex-col justify-between">
        <div className="flex items-center justify-end w-full">
          {/* Badge
          <Label
            variant="featured"
            className="text-sm font-semibold "
            leftIcon="✦"
          >
            {badgeText}
          </Label> */}
          {/* See All Link */}
          <TextWhiteButton
            to={seeAllLink}
            rightIcon={<IoArrowForwardOutline className="text-[12px]" />}
            className=" text-[14px]  text-[#FFFFFF]"
          >
            See All
          </TextWhiteButton>
        </div>

        {/* Card Title */}
        <h3 className="mt-4 text-left text-h4  line-clamp-1   font-bold text-[#FFFFFF]  ">
          {formatPageTitle(title)}
        </h3>
      </div>

      {/* Card Body (Products List) */}
      <div className="flex flex-col divide-y divide-[#1B1D6066] bg-white flex-grow ">
        {displayProducts.map((prod, index) => (
          <Link
            key={prod.id || index}
            to={`/products/${prod.id}`}
            className="flex gap-4  p-6 items-center hover:bg-slate-50 transition-colors duration-200 pl-4"
          >
            {/* Product Thumbnail */}
            <img
              src={prod.image}
              alt={prod.title}
              className="h-[90px] w-[90px] rounded-[10px] border border-[var(--customer-border)] object-cover transition-all duration-300 hover:scale-105 md:h-[90px] md:w-[90px]"
            />

            {/* Product Info */}
            <div className="flex  flex-col min-w-0 flex-grow text-left">
              {/* Product Title */}
              <h4
                className="truncate  font-dm-sans text-[15px] font-semibold leading-[100%] tracking-[0%] align-middle text-[#2E2E2E] transition-colors duration-200 hover:text-[var(--customer-navy)] sm:text-[16px] lg:text-[18px]"
                title={prod.title}
              >
                {prod.title}
              </h4>

              {/* Price Row */}
              <div className="flex items-baseline mt-4 mb-3 ">
                <span className="font-dmSans text-[18px] font-extrabold leading-none text-[#1B1D60] sm:text-[21px]">
                  {prod.price}
                </span>
                {prod.oldPrice && (
                  <span className="ml-2 font-dmSans text-[18px] font-semibold leading-none text-[#949494] line-through sm:text-[21px]">
                    {prod.oldPrice}
                  </span>
                )}
              </div>

              {/* Star Rating Row */}
              <div className="flex items-center mt-1">
                <span className="mr-3 font-dm-sans text-[12px] font-medium leading-[100%] tracking-[0px] align-middle text-[#2E2E2E] sm:text-[13px] lg:text-[14px]">
                  {prod.rating || "0.0"}
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const stars = Math.round(Math.max(0, Math.min(Number(prod.rating || 0), 5)));
                    return (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < stars
                            ? "fill-[#F58220] text-[#F58220]"
                            : "fill-border text-border"
                        }
                      />
                    );
                  })}
                </div>
                <span className="ml-3 font-dm-sans text-[12px] font-medium leading-[100%] tracking-[0px] align-middle text-[#2E2E2E] sm:text-[13px] lg:text-[14px]">
                  ({prod.reviewsCount || "0"})
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
