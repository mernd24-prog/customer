import { Link } from "react-router-dom";
import { IoStar, IoArrowForwardOutline } from "react-icons/io5";
import Label from "../common/label/Label";
import { TextWhiteButton } from "../dynamicComponent/button/static";

// const badgeVariants = {
//   new: "featured",
//   trending: "success",
//   luxe: "bestseller",
// };

export default function NewArrivalCard({
  badgeText = "New",
  badgeType = "new",
  title = "",
  seeAllLink = "/products",
  products = [],
}) {
  const displayProducts = Array.isArray(products) ? products : [];
  // const labelVariant = badgeVariants[badgeType] || "featured";

  return (
    <article className="flex flex-col h-full overflow-hidden rounded-[20px] border border-[#1B1D6066] bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ">
      {/* Card Header (Navy Blue background) */}
      <div className="bg-[#1B1D60] p-5 flex  flex-col justify-between">
        <div className="flex items-center justify-between w-full">
          {/* Badge */}
          <Label
            variant="featured"
            className="text-sm font-semibold"
            leftIcon="✦"
          >
            {badgeText}
          </Label>
          {/* See all Link */}
          <TextWhiteButton
            to={seeAllLink}
            rightIcon={<IoArrowForwardOutline className="text-[12px]" />}
            className="font-dmSans text-[14px] font-medium leading-none tracking-[0%] text-[#FFFFFF]"
          >
            See all
          </TextWhiteButton>
        </div>

        {/* Card Title */}
        <h3 className="mt-4 text-left font-dm-sans text-[18px] font-bold leading-[100%] tracking-[0%] align-middle text-[#FFFFFF] sm:text-[20px] xl:text-[24px]">
          {title}
        </h3>
      </div>

      {/* Card Body (Products List) */}
      <div className="flex flex-col divide-y divide-[#1B1D6066] bg-white flex-grow ">
        {displayProducts.map((prod, index) => (
          <Link
            key={prod.id || index}
            to={prod.link || "/products"}
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
                className="truncate font-dm-sans text-[15px] font-semibold leading-[100%] tracking-[0%] align-middle text-[#2E2E2E] transition-colors duration-200 hover:text-[var(--customer-navy)] sm:text-[16px] lg:text-[18px]"
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
                <div className="flex text-[#F58220] text-base gap-0.5">
                  <IoStar />
                  <IoStar />
                  <IoStar />
                  <IoStar />
                  <IoStar />
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
