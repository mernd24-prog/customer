import { Link } from "react-router-dom";
import { X } from "lucide-react";

import BrandButton from "../ui/BrandButton";
import {
  formatMoney,
  getProductId,
  getProductImage,
  getProductTitle,
} from "../../utils/ecommerce";

export function WatchlistItemCard({
  product,
  compact = false,
  onAddToCart,
  onRemove,
}) {
  const id = getProductId(product);
  const title = getProductTitle(product);
  const image = getProductImage(product);
  const price = formatMoney(product?.price, product?.currency);

  if (compact) {
    return (
      <article className="group relative flex gap-3 border-b border-border p-3 transition-all duration-300 ease-in-out hover:bg-cream">
        <Link
          to={`/products/${id}`}
          className="h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border border-border"
          aria-label={`View ${title}`}
        >
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center font-montserrat text-xs text-gray">
              No image
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col justify-between pr-5">
          <div>
            <h4 className="line-clamp-2 font-montserrat text-[13px] font-semibold text-ink transition-all duration-300 ease-in-out group-hover:text-gold">
              <Link to={`/products/${id}`}>{title}</Link>
            </h4>
            <p className="mt-1 font-montserrat text-[12px] font-bold text-ink">
              {price}
            </p>
          </div>

          <Link
            to={`/products/${id}`}
            className="mt-1 font-montserrat text-[11px] font-medium text-gold hover:underline"
          >
            View item
          </Link>
        </div>

        <button
          type="button"
          className="absolute right-2 top-2  rounded-full p-1 text-gray transition-all duration-300 ease-in-out hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
          onClick={() => onRemove?.(product)}
          aria-label={`Remove ${title} from watchlist`}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </article>
    );
  }

  return (
    <article className="rounded-[12px] border border-border bg-white p-4 transition-all duration-300 ease-in-out hover:shadow-sm sm:p-5">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-5 sm:flex-row">
          <div className="flex h-[180px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-cream sm:h-[220px] sm:w-[220px]">
            {image ? (
              <img
                src={image}
                alt={title}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="font-montserrat text-sm text-gray">
                No image
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col">
            <Link
              to={`/products/${id}`}
              className="font-montserrat text-[22px] font-semibold leading-8 text-ink hover:text-gold sm:text-[24px] sm:leading-[34px]"
            >
              {title}
            </Link>

            <p className="mt-1 font-montserrat text-[15px] text-muted">
              {product?.subtitle || product?.category || ""}
            </p>

            <div className="mt-3">
              <p className="font-montserrat text-[28px] font-bold text-gold sm:text-[32px]">
                {price}
              </p>
              {product?.seller && (
                <p className="mt-1 font-montserrat text-sm text-muted">
                  Sold by{" "}
                  <span className="font-semibold text-ink">
                    {product.seller}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-[240px]">
          <BrandButton
            variant="primary"
            rounded
            label="Add to Cart"
            className="h-[48px] text-[15px] font-bold"
            onClick={() => onAddToCart?.(product)}
          />
          <BrandButton
            variant="secondary"
            rounded
            label="Remove from Watchlist"
            className="h-[48px] text-[15px] font-medium "
            onClick={() => onRemove?.(product)}
          />
        </div>
      </div>
    </article>
  );
}
