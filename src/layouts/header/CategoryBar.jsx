/**
 * CategoryBar.jsx
 * State & logic owner for the category navigation area.
 *
 * - Owns: categoriesList, activeMenu, isPinned, all refs & useEffects
 * - Renders: <CompactCategoryBar> (non-homepage) or full visual bar (homepage)
 * - Both branches share hover state, mega-menu, and sticky overlay
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingBag } from "lucide-react";

import moreImage from "/image/png/MoreImage.png";
import ImageSkeleton from "../../components/ui/Image";
import { CategoryMoreButton } from "../../components/dynamicComponent/button/static";
import { CategoryMegaMenu } from "../../components/ecommerce";
import { getCmsPayload, useCmsRecord } from "../../hooks/useCmsRecord";
import { fetchCategories } from "../../features/catalog/catalogSlice";
import { asArray, keyOr, textOr } from "../../utils/content";

import {
  CATEGORY_MENU_OPEN_DELAY_MS,
  CATEGORY_MENU_CLOSE_DELAY_MS,
  HEADER_HEIGHT_VAR,
  DEFAULT_FASHION_MENU,
} from "./constants";
import {
  buildCategorySlug,
  buildCategoryTree,
  getCategoryKey,
  getCategoryListFromResponse,
  getHeaderHeight,
} from "./categoryHelpers";
import { CompactCategoryBar } from "./CompactCategoryBar";
import { StickyNavStrip } from "./StickyNavStrip";

export const CategoryBar = ({ headerData, compact = false }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const catalogCategoryList = useSelector((state) => state.catalog.globalCategories || state.catalog.list || []);
  const [categoriesList, setCategoriesList] = useState([]);

  // Sync with Redux list when it contains actual category items
  useEffect(() => {
    const list = getCategoryListFromResponse(catalogCategoryList);
    const actualCategories = list.filter(
      (item) => item && (item.categoryKey || item.parentKey),
    );
    if (actualCategories.length > 0) {
      setCategoriesList(actualCategories);
    }
  }, [catalogCategoryList]);

  // Fetch if we don't have categories yet
  useEffect(() => {
    if (categoriesList.length === 0) {
      dispatch(fetchCategories())
        .unwrap()
        .then((result) => {
          const data = result?.data || result;
          const list = getCategoryListFromResponse(data);
          const actualCategories = list.filter(
            (item) => item && (item.categoryKey || item.parentKey),
          );
          if (actualCategories.length > 0) {
            setCategoriesList(actualCategories);
          }
        })
        .catch(() => {});
    }
  }, [dispatch, categoriesList.length]);

  const catalogCategories = useMemo(() => categoriesList, [categoriesList]);

  const { page: megaMenuPage } = useCmsRecord("header-mega-menu");
  const megaMenuData = getCmsPayload(megaMenuPage, DEFAULT_FASHION_MENU);

  const [activeMenu, setActiveMenu] = useState(null);
  const [isPinned, setIsPinned] = useState(false);

  const categoryBarRef = useRef(null);
  const isPinnedRef = useRef(false);
  const openTimeoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // ── Mouse interaction handlers ──────────────────────────────────────────
  const handleCategoryMouseEnter = (item) => {
    if (window.innerWidth < 1024) return;
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    openTimeoutRef.current = setTimeout(() => {
      setActiveMenu(item);
    }, CATEGORY_MENU_OPEN_DELAY_MS);
  };

  const handleCategoryMouseLeave = () => {
    if (window.innerWidth < 1024) return;
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, CATEGORY_MENU_CLOSE_DELAY_MS);
  };

  const keepCategoryMenuOpen = () => {
    if (window.innerWidth < 1024) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  // Close menu on route change
  useEffect(() => {
    setActiveMenu(null);
  }, [location.pathname]);

  // Close menu on outside click / Escape
  useEffect(() => {
    if (!activeMenu) return undefined;

    const handlePointerDown = (event) => {
      if (!categoryBarRef.current?.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setActiveMenu(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMenu]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Sticky pin logic (only relevant in full mode)
  useEffect(() => {
    const handleScroll = () => {
      if (!categoryBarRef.current) return;
      const headerOffset = getHeaderHeight(HEADER_HEIGHT_VAR);
      const { bottom } = categoryBarRef.current.getBoundingClientRect();
      const nextPinned = isPinnedRef.current
        ? bottom <= headerOffset + 16
        : bottom <= headerOffset - 8;

      if (nextPinned !== isPinnedRef.current) {
        isPinnedRef.current = nextPinned;
        setIsPinned(nextPinned);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────
  const catalogTree = useMemo(
    () => buildCategoryTree(catalogCategories),
    [catalogCategories],
  );

  const categories = useMemo(() => {
    const headerCategories = getCategoryListFromResponse(headerData);
    if (headerCategories.length) return buildCategoryTree(headerCategories);
    if (!catalogTree.length) return [];

    return catalogTree.map((cat) => ({
      ...cat,
      name: textOr(cat?.name, textOr(cat?.title, "Category")),
      img: cat?.imageUrl || cat?.image || cat?.img,
      slug: keyOr(cat?.slug, getCategoryKey(cat)),
      categoryKey: getCategoryKey(cat),
      children: asArray(cat?.children),
    }));
  }, [catalogTree, headerData]);

  const visibleCategories = useMemo(
    () => asArray(categories).slice(0, 11),
    [categories]
  );

  if (!categories.length) return null;

  // ── Compact mode: fixed text-only bar ──────────────────────────────────
  if (compact) {
    return (
      <CompactCategoryBar
        categoryBarRef={categoryBarRef}
        visibleCategories={visibleCategories}
        activeMenu={activeMenu}
        megaMenuData={megaMenuData}
        onCategoryEnter={handleCategoryMouseEnter}
        onCategoryLeave={handleCategoryMouseLeave}
        onMegaMenuEnter={keepCategoryMenuOpen}
      />
    );
  }

  // ── Full mode: visual icon bar (homepage) ───────────────────────────────
  return (
    <header
      ref={categoryBarRef}
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen h-[130px] sm:h-[150px] lg:h-[167px] flex items-center"
    >
      {/* Split background images */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/image/jpg/cat1.png')" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/2 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/image/jpg/cat.jpg')" }}
      />

      {/* Golden overlay */}
      <div className="absolute inset-0 bg-[#CE9F2D33] z-10" />

      {/* Category icon grid */}
      <div className="w-full relative z-20">
        <div
          className="hide-scrollbar flex justify-start gap-4 overflow-x-auto px-2 py-3 sm:gap-5 lg:gap-5 lg:justify-center"
          style={{ justifyContent: "safe center" }}
        >
          {visibleCategories.map((item, index) => {
            const categoryHref = `/categories/${
              item?.categoryKey ||
              keyOr(
                item?.slug,
                buildCategorySlug(textOr(item?.name, "category")),
              )
            }`;
            const isActive =
              activeMenu?.categoryKey === item?.categoryKey ||
              location.pathname === categoryHref ||
              location.pathname.startsWith(categoryHref + "/");

            return (
              <div
                key={keyOr(item?.name, `category-${index}`)}
                className="relative"
                onMouseEnter={() => handleCategoryMouseEnter(item)}
                onMouseLeave={handleCategoryMouseLeave}
              >
                <Link
                  to={categoryHref}
                  aria-expanded={isActive}
                  aria-controls="category-mega-menu"
                  className="group flex min-w-[80px] sm:min-w-[100px] lg:min-w-[140px] flex-col items-center rounded-md outline-none transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-[var(--customer-gold)]/40 focus-visible:ring-offset-2"
                >
                  <div className="mx-auto flex h-[50px] w-[50px] sm:h-[65px] sm:w-[65px] lg:h-[75px] lg:w-[75px] items-center justify-center overflow-hidden rounded-full bg-[#FBCC39] p-1.5 sm:p-2 shadow-sm transition-transform duration-300 ease-in-out group-hover:-translate-y-0.5 will-change-transform">
                    {item?.img ? (
                      <ImageSkeleton
                        src={item?.img}
                        alt={textOr(item?.name, "Category")}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#f6efde] text-[var(--customer-navy)]">
                        <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`mt-1 lg:mt-2 line-clamp-1 w-full max-w-[80px] sm:max-w-[100px] lg:max-w-[140px] text-center text-[11px] sm:text-[13px] lg:text-[20px] font-medium leading-none tracking-[0.2px] text-[#2E2E2E]`}
                  >
                    {textOr(item?.name, "Category")}
                  </span>
                </Link>
              </div>
            );
          })}

          <CategoryMoreButton
            to="/categories"
            active={location.pathname === "/categories"}
            icon={moreImage}
          />
        </div>

        {/* Mega menu panel */}
        {activeMenu && (
          <div
            id="category-mega-menu"
            className="absolute left-0 top-[calc(100%-2px)] z-[9999] w-full"
            onMouseEnter={keepCategoryMenuOpen}
            onMouseLeave={handleCategoryMouseLeave}
          >
            <CategoryMegaMenu data={megaMenuData} activeCategory={activeMenu} />
          </div>
        )}
      </div>

      {/* Sticky overlay nav (pins to top when scrolled past) */}
      <nav
        aria-label="Sticky category navigation"
        style={{ top: `var(${HEADER_HEIGHT_VAR}, 0px)` }}
        className={`fixed left-0 z-40 w-full
    border-0 border-b border-gray-200
    bg-white
    shadow-none
    transition-all duration-300 ease-out
    will-change-transform
    !block
    ${
      isPinned
        ? "pointer-events-auto translate-y-0 opacity-100"
        : "pointer-events-none -translate-y-full opacity-0"
    }`}
      >
        <div className="relative w-full">
          <div className="customer-container hide-scrollbar flex h-[44px] items-center justify-start gap-5 overflow-x-auto whitespace-nowrap sm:gap-7 lg:h-[46px]">
            <StickyNavStrip
              categories={visibleCategories}
              activeMenuKey={activeMenu?.categoryKey ?? null}
              pathname={location.pathname}
              onEnter={handleCategoryMouseEnter}
              onLeave={handleCategoryMouseLeave}
            />
          </div>

          {activeMenu && isPinned && (
            <div
              id="sticky-category-mega-menu"
              className="absolute left-0 top-full z-[9999] w-full"
              onMouseEnter={keepCategoryMenuOpen}
              onMouseLeave={handleCategoryMouseLeave}
            >
              <CategoryMegaMenu
                data={megaMenuData}
                activeCategory={activeMenu}
              />
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
