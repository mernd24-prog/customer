import { Link } from "react-router-dom";
import { IoArrowForwardOutline } from "react-icons/io5";
import { TextWhiteButton } from "./button/static";
import { formatPageTitle } from "../../utils/common";
import StarRating from "./display/StarRating";
import { getProductPublicPath } from "../../utils/ecommerce";

export default function NewArrivalCard({
  title = "",
  seeAllLink = "/products",
  products = [],
}) {
  const displayProducts = Array.isArray(products) ? products : [];

  return (
    <article className="customer-card flex h-full flex-col overflow-hidden">
      <div className="flex flex-col justify-between bg-navy p-5">
        <div className="flex items-center justify-end w-full">
          
          <TextWhiteButton
            to={seeAllLink}
            rightIcon={<IoArrowForwardOutline className="text-xs" />}
            className=" text-sm  text-[#FFFFFF]"
          >
            See All
          </TextWhiteButton>
        </div>
        <h3 className="mt-4 text-left text-h4  line-clamp-1   font-bold text-[#FFFFFF]  ">
          {formatPageTitle(title)}
        </h3>
      </div>
      <div className="flex flex-grow flex-col divide-y divide-border bg-white">
        {displayProducts.map((prod, index) => (
          <Link
            key={prod.id || index}
            to={getProductPublicPath(prod)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 transition-colors duration-200 hover:bg-[var(--customer-surface-soft)] sm:p-5"
          >
            <div className="flex-shrink-0 h-[90px] w-[90px] rounded-[10px] border border-[var(--customer-border)] overflow-hidden transition-all duration-300  md:h-[90px] md:w-[90px] bg-white flex items-center justify-center">
              <img
                loading="lazy"
                src={prod.image}
                alt={prod.title}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex  flex-col min-w-0 flex-grow text-left">
              <h4
                className="truncate  font-dm-sans text-body font-semibold leading-[100%] tracking-[0%] align-middle text-ink transition-colors duration-200 hover:text-[var(--customer-navy)] sm:text-base lg:text-lg"
                title={prod.title}
              >
                {prod.title}
              </h4>
              <div className="flex items-baseline mt-4 mb-3 ">
                <span className="font-dmSans text-lg font-extrabold leading-none text-navy sm:text-[21px]">
                  {prod.price}
                </span>
                {prod.oldPrice && (
                  <span className="ml-2 font-dmSans text-lg font-semibold leading-none text-[#737373] line-through sm:text-[21px]">
                    {prod.oldPrice}
                  </span>
                )}
              </div>
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
