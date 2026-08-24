import { Link } from "react-router-dom";
import { IoArrowForwardOutline } from "react-icons/io5";
import { TextWhiteButton } from "../ui/button/static";
import { formatPageTitle } from "../../utils/common";
import StarRating from "../../pages/products/components/starRating";

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
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-4  p-6 items-center hover:bg-slate-50 transition-colors duration-200 pl-4"
          >
            {/* Product Thumbnail */}
            <img loading="lazy"
              src={prod.image}
              alt={prod.title}
              width="90"
              height="90"
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
                  <span className="ml-2 font-dmSans text-[18px] font-semibold leading-none text-[#737373] line-through sm:text-[21px]">
                    {prod.oldPrice}
                  </span>
                )}
              </div>

              {/* Star Rating Badge */}
              <div className="flex items-center mt-1">
                <StarRating rating={prod.rating} count={prod.reviewsCount} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
