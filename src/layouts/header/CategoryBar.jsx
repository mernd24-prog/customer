import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingBag } from "lucide-react";

import moreImage from "/image/png/MoreImage.png";
import ImageSkeleton from "../../components/ui/Image";
import { CategoryMoreButton } from "../../components/ui/button/static";
import CategoryMegaMenu from "../../modules/catalog/components/CategoryMegaMenu";
import { getCmsPayload, useCmsRecord } from "../../hooks/useCmsRecord";
import { fetchCategories } from "../../features/catalog/catalogSlice";
import { asArray, keyOr, textOr } from "../../utils/content";

import {
  CATEGORY_MENU_OPEN_DELAY_MS,
  CATEGORY_MENU_CLOSE_DELAY_MS,
  HEADER_HEIGHT_VAR,
  DEFAULT_FASHION_MENU,
} from "../../constants/header.constant";
import {
  buildCategorySlug,
  buildCategoryTree,
  getCategoryKey,
  getCategoryListFromResponse,
  getHeaderHeight,
} from "./categoryHelpers";
import { CompactCategoryBar } from "./CompactCategoryBar";
import { StickyNavStrip } from "./StickyNavStrip";

export const CategoryBar = ({ headerData, compact = false, loading = false }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const catalogLoading = useSelector(
    (state) => state.catalog?.loading || state.catalog?.discoveryNavigationLoading,
  );
  const catalogCategoryList =
    useSelector(
      (state) => state.catalog.globalCategories || state.catalog.list,
    ) || [];
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
    setActiveMenu(item);
  };

  const handleCategoryMouseLeave = () => {
    if (window.innerWidth < 1024) return;
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
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
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!categoryBarRef.current) {
            ticking = false;
            return;
          }
          const headerOffset = getHeaderHeight(HEADER_HEIGHT_VAR);
          const { bottom } = categoryBarRef.current.getBoundingClientRect();
          const nextPinned = isPinnedRef.current
            ? bottom <= headerOffset + 16
            : bottom <= headerOffset - 8;

          if (nextPinned !== isPinnedRef.current) {
            isPinnedRef.current = nextPinned;
            setIsPinned(nextPinned);
          }
          ticking = false;
        });
        ticking = true;
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
    let result = [];
    const headerCategories = getCategoryListFromResponse(headerData);
    if (headerCategories.length) {
      result = buildCategoryTree(headerCategories);
    } else if (catalogTree.length) {
      result = catalogTree.map((cat) => ({
        ...cat,
        name: textOr(cat?.name, textOr(cat?.title, "Category")),
        img: cat?.imageUrl || cat?.image || cat?.img,
        slug: keyOr(cat?.slug, getCategoryKey(cat)),
        categoryKey: getCategoryKey(cat),
        children: asArray(cat?.children),
      }));
    }

    return result;
  }, [catalogTree, headerData]);

  const visibleCategories = useMemo(
    () => asArray(categories).slice(0, 11),
    [categories],
  );

  const isLoading =
    loading ||
    (!categories.length && (catalogLoading || !headerData));

  if (isLoading || !categories.length) {
    if (compact) {
      return (
        <nav
          aria-label="Category Navigation Loading"
          style={{ top: `var(${HEADER_HEIGHT_VAR}, 0px)` }}
          className="fixed left-0 z-40 w-full bg-white border-b border-[var(--customer-border)]"
        >
          <div className="customer-container mx-auto w-full relative">
            <div className="w-full overflow-x-auto hide-scrollbar">
              <div className="mx-auto flex h-[44px] w-max items-center gap-5 whitespace-nowrap px-4 sm:gap-7 sm:px-6 lg:h-[46px] animate-pulse">
                {[64, 52, 58, 80, 48, 70, 46, 88, 68, 56].map((w, i) => (
                  <div
                    key={`compact-cat-skel-${i}`}
                    className="h-3.5 sm:h-4 bg-slate-200/80 rounded-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </nav>
      );
    }

    return (
      <header
        className="relative left-1/2 mb-8 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[#FFF8ED] border-b border-[#EAD8B5] flex items-stretch min-h-[85px] sm:min-h-[112px] lg:min-h-[150px]"
      >
        <div className="customer-container mx-auto w-full relative z-20 flex items-stretch px-2 sm:px-4">
          <div className="w-full overflow-x-auto hide-scrollbar flex items-stretch">
            <div className="mx-auto flex w-full min-w-max xl:min-w-0 items-stretch justify-between gap-1 sm:gap-1.5 lg:gap-2.5 py-3 sm:pt-4 sm:pb-2.5 lg:pt-4.5 lg:pb-3">
              {[54, 46, 50, 68, 42, 58, 38, 72, 62, 58].map((w, index) => (
                <div
                  key={`category-skeleton-${index}`}
                  className="flex-1 flex flex-col items-center justify-center px-1 sm:px-2 lg:px-3 min-w-[62px] sm:min-w-[88px] lg:min-w-[105px] animate-pulse"
                >
                  <div className="h-[28px] w-[32px] sm:h-[42px] sm:w-[46px] lg:h-[46px] lg:w-[52px] rounded-lg bg-[#EAD8B5]/60 flex items-center justify-center" />
                  <div
                    className="mt-3 sm:mt-4 lg:mt-4.5 h-2.5 sm:h-3 lg:h-3.5 rounded-full bg-[#EAD8B5]/75"
                    style={{ width: `${w}px`, maxWidth: "85%" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>
    );
  }

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

  return (
    <header
      ref={categoryBarRef}
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[#FFF8ED] border-b border-[#EAD8B5] flex items-stretch min-h-[85px] sm:min-h-[112px] lg:min-h-[150px]"
    >
      <div className="customer-container mx-auto w-full relative z-20 flex items-stretch px-2 sm:px-4">
        <div className="w-full overflow-x-auto hide-scrollbar flex items-stretch">
          <div className="mx-auto flex w-full min-w-max xl:min-w-0 items-stretch justify-between gap-1 sm:gap-1.5 lg:gap-2.5">
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

              const rawName = textOr(item?.name, "Category");
              const categoryTitle = /^beauty/i.test(rawName)
                ? "Beauty"
                : /^food/i.test(rawName)
                  ? "Food"
                  : rawName;

              return (
                <div
                  key={keyOr(item?.name, `category-${index}`)}
                  className="relative flex-1 flex items-stretch h-full min-w-[62px] sm:min-w-[88px] lg:min-w-[105px]"
                  onMouseEnter={() => handleCategoryMouseEnter(item)}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  <Link
                    to={categoryHref}
                    className={`group relative flex w-full h-full flex-col items-center justify-center px-1 sm:px-2 lg:px-3 pt-3 sm:pt-4 lg:pt-4.5 pb-2 sm:pb-2.5 lg:pb-3 transition-all duration-200 ease-in-out ${
                      isActive
                        ? "bg-[linear-gradient(180deg,rgba(206,159,45,0)_0%,rgba(206,159,45,0.4)_100%)]"
                        : "hover:bg-[linear-gradient(180deg,rgba(206,159,45,0)_0%,rgba(206,159,45,0.4)_100%)]"
                    }`}
                  >
                    <div className="flex h-[28px] w-[32px] sm:h-[42px] sm:w-[46px] lg:h-[46px] lg:w-[52px] items-center justify-center transition-transform duration-200 group-hover:scale-105">
                      {item?.img ? (
                        <ImageSkeleton
                          src={item?.img}
                          alt={categoryTitle}
                          imageClassName="object-contain max-h-full max-w-full"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#2D347D]">
                          <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`mt-3 sm:mt-4 lg:mt-4.5 text-center text-[11px] sm:text-[13px] md:text-[14px] lg:text-[15px] whitespace-normal 2xl:whitespace-nowrap leading-tight transition-colors duration-200 ${
                        isActive
                          ? "font-bold text-[#1E204A]"
                          : "font-semibold text-[#2D2D2D] group-hover:text-[#1E204A]"
                      }`}
                    >
                      {categoryTitle}
                    </span>

                    {/* Active bottom line indicator touching bottom edge */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] sm:h-[4px] bg-[#2D347D]" />
                    )}
                  </Link>
                </div>
              );
            })}

            {categories.length > 10 && (
              <CategoryMoreButton
                to="/categories"
                active={location.pathname === "/categories"}
                icon={moreImage}
              />
            )}
          </div>
        </div>
      </div>
      <nav
        aria-label="Sticky Category Navigation"
        style={{ top: `var(${HEADER_HEIGHT_VAR}, 0px)` }}
        className={`fixed left-0 z-40 w-full
    border-0
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
