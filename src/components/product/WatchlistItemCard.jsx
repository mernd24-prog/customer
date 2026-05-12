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
      <article className="group relative flex gap-3 border-b border-gray-100 p-3 transition-colors hover:bg-gray-50">
        <Link
          to={`/products/${id}`}
          className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-200"
          aria-label={`View ${title}`}
        >
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-gray-500">
              No image
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col justify-between pr-5">
          <div>
            <h4 className="line-clamp-2 text-[13px] font-semibold text-black transition-colors group-hover:text-blue-600">
              <Link to={`/products/${id}`}>{title}</Link>
            </h4>
            <p className="mt-1 text-[12px] font-bold text-black">{price}</p>
          </div>

          <Link
            to={`/products/${id}`}
            className="mt-1 text-[11px] font-medium text-blue hover:underline"
          >
            View item
          </Link>
        </div>

        <button
          type="button"
          className="absolute right-2 top-2 rounded-full p-1 text-gray-400 transition-colors hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => onRemove?.(product)}
          aria-label={`Remove ${title} from watchlist`}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </article>
    );
  }

  return (
    <article className="p-4 transition-shadow hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-5 sm:flex-row">
          <div className="flex h-[180px] w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f7f7f7] sm:h-[220px] sm:w-[220px]">
            {image ? (
              <img src={image} alt={title} className="h-full w-full object-contain" />
            ) : (
              <span className="text-sm text-gray-500">No image</span>
            )}
          </div>

          <div className="flex flex-1 flex-col">
            <Link
              to={`/products/${id}`}
              className="max-w-[700px] text-[22px] font-medium leading-8 text-[#111820] hover:text-blue-600 sm:text-[24px] sm:leading-[34px]"
            >
              {title}
            </Link>

            <p className="mt-1 text-[16px] text-gray-600">
              {product?.subtitle || product?.category || "Pre-owned - Good"}
            </p>

            <div className="mt-3">
              <p className="text-[32px] font-bold text-black sm:text-[36px]">
                {price}
              </p>
              <p className="text-[17px] text-gray-700">Or buy it now</p>
              <p className="text-[17px] text-gray-700">Free shipping</p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-[16px]">
              <span className="font-medium text-black underline">
                {product?.seller || "brandstreet.tokyo"}
              </span>
              <span className="font-medium text-black underline">
                {product?.sellerRating || "99.50% (42627)"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-[280px]">
          <BrandButton
            variant="gradient"
            rounded
            label="Buy it now"
            className="h-[52px] text-[17px] font-bold"
            onClick={() => onAddToCart?.(product)}
          />
          <BrandButton
            variant="secondary"
            rounded
            label="View seller's other items"
            className="h-[52px] border-2 border-blue-600 bg-white text-[17px] font-medium text-blue-600 hover:bg-blue-50"
          />
          <BrandButton
            variant="secondary"
            rounded
            label="Remove"
            className="h-[52px] border-2 border-blue-600 bg-white text-[17px] font-medium text-blue-600 hover:bg-blue-50"
            onClick={() => onRemove?.(product)}
          />
        </div>
      </div>
    </article>
  );
}
