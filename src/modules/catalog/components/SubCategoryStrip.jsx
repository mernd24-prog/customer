
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
    <section className="bg-white">
      <div className="my-6 w-full overflow-x-auto [scrollbar-width:none] md:my-10 [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-4 px-4 sm:px-0">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="w-[80px] shrink-0 text-center"
                >
                  <div className="h-[90px] w-[80px] animate-pulse rounded-[20px] border-b-[6px] border-[#2F4384]/30 bg-[#F0F1FA]" />
                  <div className="mx-auto mt-2 h-3 w-3/4 animate-pulse rounded bg-gray-100" />
                </div>
              ))
            : visibleCategories.map((category) => (
                <Link
                  key={category.key}
                  to={CUSTOMER_ROUTES.category(category.key)}
                  className="group w-[80px] shrink-0 text-center"
                >
                  <div className="relative flex h-[90px] w-[82px] items-center justify-center overflow-hidden rounded-[20px] border-b-[6px] border-[#d1b165] bg-[#F0F1FA] p-2 transition-colors duration-200 group-hover:bg-[#E7E9F8]">
                    {category.image ? (
                      <img
                        width="400"
                        height="400"
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain"
                        onError={(event) =>
                          applyImageFallback(event, category.name, "category")
                        }
                      />
                    ) : (
                      <Grid2X2
                        size={36}
                        strokeWidth={1.7}
                        className="text-[#2F4384]"
                      />
                    )}
                  </div>

                  <p className="mt-2 line-clamp-2 min-h-[32px] text-xs font-semibold leading-4 text-[var(--customer-ink)]">
                    {category.name}
                  </p>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
