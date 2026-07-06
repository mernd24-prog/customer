import { useLocation } from "react-router-dom";
import { CategoryMegaMenu } from "../../components/ecommerce";
import { HEADER_HEIGHT_VAR } from "./constants";
import { StickyNavStrip } from "./StickyNavStrip";

export function CompactCategoryBar({
  categoryBarRef,
  visibleCategories,
  activeMenu,
  megaMenuData,
  onCategoryEnter,
  onCategoryLeave,
  onMegaMenuEnter,
}) {
  const location = useLocation();

  return (
    <nav
      ref={categoryBarRef}
      aria-label="Category navigation"
      style={{ top: `var(${HEADER_HEIGHT_VAR}, 0px)` }}
      className="fixed left-0 z-40 w-full bg-white/95 shadow-[0_2px_8px_rgba(17,24,39,0.06)] backdrop-blur !block"
    >
      <div className="relative w-full">
        <div className="customer-container hide-scrollbar flex h-[44px] items-center justify-start gap-5 overflow-x-auto whitespace-nowrap sm:gap-7 lg:h-[46px]">
          <StickyNavStrip
            categories={visibleCategories}
            activeMenuKey={activeMenu?.categoryKey ?? null}
            pathname={location.pathname}
            onEnter={onCategoryEnter}
            onLeave={onCategoryLeave}
          />
        </div>

        {activeMenu && (
          <div
            id="compact-category-mega-menu"
            className="absolute left-0 top-full z-[9999] w-full"
            onMouseEnter={onMegaMenuEnter}
            onMouseLeave={onCategoryLeave}
          >
            <CategoryMegaMenu data={megaMenuData} activeCategory={activeMenu} />
          </div>
        )}
      </div>
    </nav>
  );
}
