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
      <article className="group relative flex gap-3 border-b border-[#e7dfd1] p-3 transition-colors hover:bg-[#FAF6EE]">
        <Link
          to={`/products/${id}`}
          className="h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border border-[#e7dfd1]"
          aria-label={`View ${title}`}
        >
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center font-montserrat text-xs text-[#A6A6A6]">
              No image
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col justify-between pr-5">
          <div>
            <h4 className="line-clamp-2 font-montserrat text-[13px] font-semibold text-[#2E2E2E] transition-colors group-hover:text-[#CE9F2D]">
              <Link to={`/products/${id}`}>{title}</Link>
            </h4>
            <p className="mt-1 font-montserrat text-[12px] font-bold text-[#2E2E2E]">{price}</p>
          </div>

          <Link
            to={`/products/${id}`}
            className="mt-1 font-montserrat text-[11px] font-medium text-[#CE9F2D] hover:underline"
          >
            View item
          </Link>
        </div>

        <button
          type="button"
          className="absolute right-2 top-2 rounded-full p-1 text-[#A6A6A6] transition-colors hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-[#CE9F2D]/30"
          onClick={() => onRemove?.(product)}
          aria-label={`Remove ${title} from watchlist`}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </article>
    );
  }

  return (
    <article className="rounded-[12px] border border-[#e7dfd1] bg-white p-4 transition-shadow hover:shadow-sm sm:p-5">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-5 sm:flex-row">
          <div className="flex h-[180px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#FAF6EE] sm:h-[220px] sm:w-[220px]">
            {image ? (
              <img src={image} alt={title} className="h-full w-full object-contain" />
            ) : (
              <span className="font-montserrat text-sm text-[#A6A6A6]">No image</span>
            )}
          </div>

          <div className="flex flex-1 flex-col">
            <Link
              to={`/products/${id}`}
              className="font-montserrat text-[22px] font-semibold leading-8 text-[#2E2E2E] hover:text-[#CE9F2D] sm:text-[24px] sm:leading-[34px]"
            >
              {title}
            </Link>

            <p className="mt-1 font-montserrat text-[15px] text-[#787878]">
              {product?.subtitle || product?.category || ""}
            </p>

            <div className="mt-3">
              <p className="font-montserrat text-[28px] font-bold text-[#CE9F2D] sm:text-[32px]">
                {price}
              </p>
              {product?.seller && (
                <p className="mt-1 font-montserrat text-sm text-[#787878]">
                  Sold by <span className="font-semibold text-[#2E2E2E]">{product.seller}</span>
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
            className="h-[48px] text-[15px] font-medium"
            onClick={() => onRemove?.(product)}
          />
        </div>
      </div>
    </article>
  );
}
