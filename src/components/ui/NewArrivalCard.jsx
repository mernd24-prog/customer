import { Link } from "react-router-dom";
import { IoStar, IoArrowForwardOutline } from "react-icons/io5";

export default function NewArrivalCard({
  badgeText = "New",
  badgeType = "new",
  title = "",
  seeAllLink = "/products",
  products = [],
}) {
  const displayProducts = Array.isArray(products) ? products : [];

  return (
    <article className="flex flex-col h-full overflow-hidden rounded-[1.5rem] border border-[#1B1D6066] bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Card Header (Navy Blue background) */}
      <div className="bg-[#1B1D60] p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between w-full">
          {/* Badge */}
          <div className="flex items-center gap-1 bg-[#D6A323] text-white px-3 py-1 rounded-full text-sm font-semibold">
            <span>✦</span>
            <span>{badgeText}</span>
          </div>

          {/* See all Link */}
          <Link
            to={seeAllLink}
            className="flex items-center gap-1 text-white hover:text-white/80 text-sm transition-colors duration-200"
          >
            <span>See all</span>
            <IoArrowForwardOutline className="text-xs" />
          </Link>
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
                <span className="text-[var(--customer-navy)] font-bold text-lg">
                  {prod.price}
                </span>
                {prod.oldPrice && (
                  <span className="text-[var(--customer-muted)] text-lg line-through ml-2">
                    {prod.oldPrice}
                  </span>
                )}
              </div>

              {/* Star Rating Row */}
              <div className="flex items-center mt-1">
                <span className="text-base font-semibold text-[var(--customer-muted)] mr-1">
                  {prod.rating || "0.0"}
                </span>
                <div className="flex text-[#D6A323] text-base gap-0.5">
                  <IoStar />
                  <IoStar />
                  <IoStar />
                  <IoStar />
                  <IoStar />
                </div>
                <span className="text-base text-[var(--customer-muted)] ml-1">
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
