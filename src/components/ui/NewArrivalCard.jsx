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
    <article className="flex flex-col h-full overflow-hidden rounded-[1.5rem] border border-[#1B1D6066] bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Card Header (Navy Blue background) */}
      <div className="bg-[#1B1D60] p-5 flex  flex-col justify-between">
        <div className="flex items-center justify-between w-full">
          {/* Badge */}
          <Label
            variant="featured"
            className="text-sm font-semibold gap-1"
            leftIcon="✦"
          >
            {badgeText}
          </Label>
          {/* See all Link */}
          <TextWhiteButton
            to={seeAllLink}
            rightIcon={<IoArrowForwardOutline className="text-xs" />}
          >
            See all
          </TextWhiteButton>
        </div>

        {/* Card Title */}
        <h3 className="text-white text-lg xl:text-2xl font-bold  mt-4  text-left">
          {title}
        </h3>
      </div>

      {/* Card Body (Products List) */}
      <div className="flex flex-col divide-y divide-[#1B1D6066] bg-white flex-grow">
        {displayProducts.map((prod, index) => (
          <Link
            key={prod.id || index}
            to={prod.link || "/products"}
            className="flex gap-4 p-4 items-center hover:bg-slate-50 transition-colors duration-200"
          >
            {/* Product Thumbnail */}
            <img
              src={prod.image}
              alt={prod.title}
              className="w-[86px] h-[86px] hover:scale-105 transition-all duration-300 rounded-sm md:w-[90px] md:h-[90px] md:rounded-xl object-cover border border-[var(--customer-border)]"
            />

            {/* Product Info */}
            <div className="flex flex-col min-w-0 flex-grow text-left">
              {/* Product Title */}
              <h4
                className="text-lg font-semibold text-[var(--customer-ink)] hover:text-[var(--customer-navy)] transition-colors duration-200 truncate"
                title={prod.title}
              >
                {prod.title}
              </h4>

              {/* Price Row */}
              <div className="flex items-baseline mt-1 ">
                <span className="text-[var(--customer-navy)] font-bold text-[21px]">
                  {prod.price}
                </span>
                {prod.oldPrice && (
                  <span className="text-[var(--customer-muted)] text-[21px] line-through ml-2">
                    {prod.oldPrice}
                  </span>
                )}
              </div>

              {/* Star Rating Row */}
              <div className="flex gap-2 items-center mt-1">
                <span className="text-base font-semibold text-[#2E2E2E] mr-1">
                  {prod.rating || "0.0"}
                </span>
                <div className="flex text-[#F58220] text-base gap-0.5">
                  <IoStar />
                  <IoStar />
                  <IoStar />
                  <IoStar />
                  <IoStar />
                </div>
                <span className="text-base font-medium  text-[#2E2E2E] ml-1">
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
