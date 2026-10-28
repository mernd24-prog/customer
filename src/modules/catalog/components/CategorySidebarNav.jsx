import { Link } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";
import CUSTOMER_ROUTES from "../../../constants/routes";
import {
  getCategoryKey,
  getCategoryLabel,
} from "../../../utils/pages/categoryUtils";

function CategoryCheckbox({ checked }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[3px] border transition-all duration-200 ${
        checked ? "border-[#3E4093] bg-[#3E4093]" : "border-[#B8BBC5] bg-white"
      }`}
    >
      {checked && <Check size={11} strokeWidth={3} className="text-white" />}
    </span>
  );
}

export function CategorySidebarNav({
  categoryTitle,
  categoryKey: parentCategoryKey = null,
  categories = [],
  activeKey = "",
}) {
  const visibleCategories = categories
    .map((category) => ({
      key: getCategoryKey(category),
      name: getCategoryLabel(category),
    }))
    .filter((category) => category.key && category.name);

  if (!visibleCategories.length) return null;

  return (
    <div className="border-b border-[#EEDFB9] px-4 py-5 min-[375px]:px-5 sm:px-6">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-[#111827]">
        Categories
      </h3>

      <div className="space-y-3">
        {parentCategoryKey && activeKey !== parentCategoryKey ? (
          <Link
            to={CUSTOMER_ROUTES.category(parentCategoryKey)}
            className="flex items-center gap-1.5 text-base font-bold text-[#111827] transition-colors hover:text-[var(--customer-gold)]"
          >
            <ChevronRight size={15} className="rotate-90 text-[#111827]" />
            <span className="line-clamp-2">{categoryTitle}</span>
          </Link>
        ) : (
          <p className="flex items-center gap-1.5 text-base font-bold text-[#111827]">
            <ChevronRight size={15} className="rotate-90 text-[#111827]" />
            <span className="line-clamp-2">{categoryTitle}</span>
          </p>
        )}

        <div className="space-y-3 pl-6">
          {visibleCategories.map((category) => {
            const isActive = category.key === activeKey;

            return (
              <Link
                key={category.key}
                to={CUSTOMER_ROUTES.category(category.key)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-start gap-2 text-sm font-medium leading-5 transition-colors hover:text-[var(--customer-gold)] ${
                  isActive
                    ? "font-bold text-[var(--customer-gold)]"
                    : "text-[#111827]"
                }`}
              >
                {/* <CategoryCheckbox checked={isActive} /> */}

                <span className="min-w-0">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
