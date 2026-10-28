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
      <article className="customer-card customer-card--interactive customer-card-padding flex h-full flex-col">
        {/* Product Image */}
        <div className="overflow-hidden rounded-[var(--customer-radius)]">
          <img loading="lazy"
            src={image}
            alt={title}
            width="292"
            height="310"
            className="aspect-[292/310] w-full object-cover transition-all duration-300 ease-in-out hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="mt-3 flex flex-1 flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Title */}
          <h3
            className="line-clamp-2 text-center  text-label font-semibold leading-5 text-[var(--customer-ink)] sm:text-left"
            title={title}
          >
            {title}
          </h3>

          {/* Price */}
          <PricePill
            price={price}
            oldPrice={oldPrice}
            className="mx-auto h-[34px] w-full max-w-[130px] gap-1 rounded-full px-2 sm:mx-0 sm:h-[38px] sm:max-w-[150px] sm:gap-1.5 sm:px-3 md:h-[40px] md:max-w-[165px]"
            priceClassName="text-caption sm:text-xs md:text-label lg:text-sm"
            oldPriceClassName="text-[9px] sm:text-micro md:text-caption lg:text-xs"
          />
        </div>
      </article>
    </Link>
  );
}
