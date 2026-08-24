import { Link } from "react-router-dom";
import { Grid2X2 } from "lucide-react";
import CUSTOMER_ROUTES from "../../../constants/routes";
import { applyImageFallback } from "../../../utils/ecommerce";
import {
  getCategoryKey,
  getCategoryLabel,
  getCategoryImage,
  getCategoryCount,
} from "../../../utils/pages/categoryUtils";

export function SubCategoryStrip({ categories = [], loading }) {
  const visibleCategories = categories
    .map((category) => ({
      key: getCategoryKey(category),
      name: getCategoryLabel(category),
      image: getCategoryImage(category),
      count: getCategoryCount(category),
    }))
    .filter((category) => category.key && category.name);

  if (!loading && !visibleCategories.length) return null;

  return (
    <section className=" bg-white">
      <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden my-6 md:mt-8">
        <div className="flex w-max gap-4 px-4 sm:px-0">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="group w-[92px] shrink-0 text-center sm:w-[104px]"
                >
                  <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[10px] bg-black/5 animate-pulse p-2" />
                  <div className="mx-auto mt-3 h-3 w-3/4 rounded bg-black/5 animate-pulse" />
                </div>
              ))
            : visibleCategories.map((category) => (
                <Link
                  key={category.key}
                  to={CUSTOMER_ROUTES.category(category.key)}
                  className="group w-[92px] shrink-0 text-center sm:w-[104px]"
                >
                  <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[10px] bg-[var(--customer-surface-soft)] p-2 transition-colors group-hover:bg-[var(--customer-gold-soft)]">
                    {category.image ? (
                      <img width="400" height="400"
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                        onError={(event) =>
                          applyImageFallback(event, category.name, "category")
                        }
                      />
                    ) : (
                      <Grid2X2
                        size={32}
                        strokeWidth={1.5}
                        className="text-[var(--customer-border-strong)]"
                      />
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-[32px] text-xs font-semibold leading-4 text-[var(--customer-ink)]">
                    {category.name}
                  </p>
                  {category.count !== undefined &&
                  category.count !== null &&
                  category.count !== "" ? (
                    <span className="mt-1 inline-flex rounded bg-cyan-100 px-1.5 py-0.5 text-[10px] font-bold text-cyan-700">
                      {Number(category.count).toLocaleString()}
                    </span>
                  ) : null}
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
