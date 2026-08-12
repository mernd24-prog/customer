
import { Link } from "react-router-dom";
import { keyOr, textOr } from "../../utils/content";
import { buildCategorySlug } from "./categoryHelpers";

/**
 * @param {Object[]} categories - visible category items
 * @param {string|null} activeMenuKey - currently hovered category key
 * @param {string} pathname - current route pathname (from useLocation)
 * @param {Function} onEnter - called on mouseEnter with the category item
 * @param {Function} onLeave - called on mouseLeave
 */
export function StickyNavStrip({
  categories = [],
  activeMenuKey = null,
  pathname = "",
  onEnter,
  onLeave,
}) {
  return (
    <>
      {categories.map((item, index) => {
        const categoryHref = `/categories/${
          item?.categoryKey ||
          keyOr(item?.slug, buildCategorySlug(textOr(item?.name, "category")))
        }`;

        const isActive =
          activeMenuKey === item?.categoryKey ||
          pathname === categoryHref ||
          pathname.startsWith(categoryHref + "/");

        return (
          <Link
            key={keyOr(item?.name, `nav-category-${index}`)}
            to={categoryHref}
            onMouseEnter={() => onEnter?.(item)}
            onMouseLeave={onLeave}
            className={`relative flex h-full shrink-0 items-center text-[13px] font-semibold transition-all duration-200 ease-in-out hover:text-[#03014D] sm:text-[14px] ${
              isActive ? "text-[#03014D]" : "text-[#2E2E2E]"
            }`}
          >
            <span>{textOr(item?.name, "Category")}</span>
            <span
              className={`absolute bottom-0 left-0 h-[3px] rounded-full bg-[#CE9F2D] transition-all duration-300 ${
                isActive ? "w-full opacity-100" : "w-0 opacity-0"
              }`}
            />
          </Link>
        );
      })}

      {/* "More" link always at the end
      <Link
        to="/categories"
        className={`relative flex h-full shrink-0 items-center text-[13px] font-semibold transition-all duration-200 ease-in-out hover:text-[#03014D] sm:text-[14px] ${
          pathname === "/categories" ? "text-[#03014D]" : "text-[#2E2E2E]"
        }`}
      >
        More
        <span
          className={`absolute bottom-0 left-0 h-[3px] rounded-full bg-[#CE9F2D] transition-all duration-300 ${
            pathname === "/categories" ? "w-full opacity-100" : "w-0 opacity-0"
          }`}
        />
      </Link> */}
    </>
  );
}
