import { Link } from "react-router-dom";
import PricePill from "./PricePill";

export default function TopDealCard({
  title,
  image,
  price,
  oldPrice,
  link = "/",
}) {
  return (
    <Link to={link} className="block h-full">
      <article className="customer-card flex h-full flex-col p-3 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[var(--customer-shadow)]">
        {/* Product Image */}
        <div className="overflow-hidden rounded-[var(--customer-radius)]">
          <img
            src={image}
            alt={title}
            className="aspect-[292/310] w-full object-cover transition-all duration-300 ease-in-out hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="mt-3 flex flex-1 flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Title */}
          <h3
            className="line-clamp-2 text-center  text-[13px] font-semibold leading-5 text-[var(--customer-ink)] sm:text-left"
            title={title}
          >
            {title}
          </h3>

          {/* Price */}
          <PricePill
            price={price}
            oldPrice={oldPrice}
            className="mx-auto h-[34px] w-full max-w-[130px] gap-1 rounded-full px-2 sm:mx-0 sm:h-[38px] sm:max-w-[150px] sm:gap-1.5 sm:px-3 md:h-[40px] md:max-w-[165px]"
            priceClassName="text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px]"
            oldPriceClassName="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px]"
          />
        </div>
      </article>
    </Link>
  );
}
