import { memo, useCallback, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Tag,
  Flame,
  ShoppingBag,
} from "lucide-react";
import { applyImageFallback } from "../../utils/ecommerce";

const slugifyKey = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, "-");
const sortByOrder = (a, b) =>
  Number(a?.sortOrder ?? 0) - Number(b?.sortOrder ?? 0);
const EMPTY_ITEMS = [];
const DEFAULT_LABELS = {
  shopAll: "Shop All Category",
  noSubcategories: "No subcategories",
  noItems: "No item lists",
  trending: "Trending Now",
  directItem: (title) => `Shop directly in ${title}`,
  childTitle: "Categories",
  innerTitle: "More",
  promoTitle: "Explore Store",
  promoButton: "Explore Now",
};

const defaultGetItemHref = (item) => `/categories/${item.categoryKey}`;
const defaultGetQuickLinkHref = (item) => item?.link || "#";
const defaultImageErrorHandler = (event, title, fallbackType) => {
  applyImageFallback(event, title, fallbackType);
};
const isActiveHref = (pathname, href) =>
  href && href !== "#" && pathname === href;

const mergeLabels = (labels) => ({ ...DEFAULT_LABELS, ...labels });

function getChildren(item = {}) {
  if (Array.isArray(item?.children)) return item.children;
  if (Array.isArray(item?.subCategories)) return item.subCategories;
  if (Array.isArray(item?.categories)) return item.categories;
  if (Array.isArray(item?.items)) return item.items;
  return [];
}

function toNode(item = {}, parentKey = "") {
  const categoryKey =
    item?.categoryKey ||
    item?.key ||
    item?.slug ||
    slugifyKey(item?.title || item?.name || "category");
  const title = item?.title || item?.name || item?.label || "Category";

  return {
    ...item,
    categoryKey,
    key: item?.key || categoryKey,
    parentKey: item?.parentKey ?? parentKey,
    title,
    name: item?.name || title,
    image: item?.img || item?.imageUrl || item?.image || item?.iconUrl || "",
    children: getChildren(item)
      .map((child) => toNode(child, categoryKey))
      .sort(sortByOrder),
  };
}

// ==========================================
// SUBCOMPONENTS (Clean & Modular Architecture)
// ==========================================

/**
 * Component for Column 1: Subcategories
 */
const SubCategoryColumn = memo(function SubCategoryColumn({
  items,
  activeKey,
  onHover,
  title,
  rootHref,
  getItemHref,
  labels,
}) {
  const location = useLocation();
  return (
    <div className="flex flex-col h-full  bg-cream/40 border-r border-border p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <Sparkles size={15} className="text-gold" />
        <h3 className=" text-[11px] font-black uppercase tracking-normal text-ink">
          {title}
        </h3>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1 flex-1">
        {items.map((item) => {
          const isActive = activeKey === item.categoryKey;
          const itemHref = getItemHref(item);
          const isCurrentLink = isActiveHref(location.pathname, itemHref);
          return (
            <div
              key={item.categoryKey}
              className={`group flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm cursor-pointer transition-all duration-300 ease-in-out border-l-4 ${
                isActive
                  ? "bg-white shadow-[0_4px_12px_rgba(206,159,45,0.06)] border-gold text-gold font-semibold translate-x-1"
                  : "border-transparent text-ink/80 hover:bg-white/60 hover:text-gold hover:translate-x-0.5"
              }`}
              onMouseEnter={
                activeKey === item.categoryKey
                  ? undefined
                  : () => onHover(item.categoryKey)
              }
            >
              <Link
                to={itemHref}
                className={`flex-1 truncate ${isCurrentLink ? "font-bold text-gold" : ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                {item.title}
              </Link>
              <ChevronRight
                size={14}
                className={`transition-all duration-300 ease-in-out ${
                  isActive
                    ? "opacity-100 translate-x-0.5"
                    : "opacity-0 -translate-x-1 group-hover:opacity-60"
                }`}
              />
            </div>
          );
        })}
      </div>

      <Link
        to={rootHref}
        className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-cream py-2.5 text-xs font-semibold text-gold transition-all duration-300 ease-in-out hover:bg-gold/10"
      >
        <span>{labels.shopAll}</span>
        <ArrowRight size={12} />
      </Link>
    </div>
  );
});

/**
 * Component for Column 2: Child Categories
 */
const ChildCategoryColumn = memo(function ChildCategoryColumn({
  items,
  activeKey,
  onHover,
  title,
  showChevron,
  getItemHref,
  labels,
}) {
  const location = useLocation();
  return (
    <div className="flex flex-col h-full bg-white border-r border-border p-5">
      <h3 className="mb-4 border-b border-border pb-3  text-[11px] font-black uppercase tracking-normal text-gray">
        {title}
      </h3>

      <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1 flex-1">
        {items.length > 0 ? (
          items.map((item) => {
            const isActive = activeKey === item.categoryKey;
            const itemHref = getItemHref(item);
            const isCurrentLink = isActiveHref(location.pathname, itemHref);
            return (
              <div
                key={item.categoryKey}
                className={`group flex items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm cursor-pointer transition-all duration-300 ease-in-out ${
                  isActive
                    ? "bg-cream text-gold-dark font-semibold"
                    : "text-ink/70 hover:bg-cream/40 hover:text-gold"
                }`}
                onMouseEnter={
                  activeKey === item.categoryKey
                    ? undefined
                    : () => onHover(item.categoryKey)
                }
              >
                <Link
                  to={itemHref}
                  className={`flex-1 truncate ${isCurrentLink ? "font-bold text-gold" : ""}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.title}
                </Link>
                {showChevron &&
                  Array.isArray(item.children) &&
                  item.children.length > 0 && (
                    <ChevronRight
                      size={12}
                      className={`opacity-40 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-x-0.5 ${
                        isActive ? "opacity-100 text-gold-dark" : ""
                      }`}
                    />
                  )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-xs text-gray">
            <ShoppingBag size={20} className="mb-2 opacity-40" />
            <p>{labels.noSubcategories}</p>
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * Component for Column 3: Inner / Leaf Categories
 */
const InnerCategoryColumn = memo(function InnerCategoryColumn({
  items,
  title,
  quickLinks,
  getItemHref,
  getQuickLinkHref,
  labels,
}) {
  const location = useLocation();
  return (
    <div className="flex flex-col h-full bg-white p-5">
      <h3 className="mb-4 border-b border-border pb-3  text-[11px] font-black uppercase tracking-normal text-gray">
        {title}
      </h3>

      <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1 flex-1">
        {items.length > 0 ? (
          items.map((item) => {
            const itemHref = getItemHref(item);
            const isCurrentLink = isActiveHref(location.pathname, itemHref);

            return (
              <Link
                key={item.categoryKey}
                to={itemHref}
                className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm transition-all duration-300 ease-in-out hover:bg-cream/50 hover:text-gold hover:pl-5 ${
                  isCurrentLink ? "bg-cream font-bold text-gold" : "text-ink/70"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ease-in-out ${isCurrentLink ? "bg-gold" : "bg-border group-hover:bg-gold"}`}
                />
                <span className="flex-1 truncate">{item.title}</span>
              </Link>
            );
          })
        ) : quickLinks.length > 0 ? (
          <>
            <div className="mb-2 flex items-center gap-1.5 px-4 text-xs font-bold uppercase tracking-normal text-gold">
              <Flame size={12} />
              <span>{labels.trending}</span>
            </div>
            {quickLinks.map((item) => (
              <Link
                key={item.name}
                to={getQuickLinkHref(item)}
                className="group flex items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm text-ink/70 transition-all duration-300 ease-in-out hover:bg-cream/50 hover:text-gold hover:pl-5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-border group-hover:bg-gold transition-all duration-300 ease-in-out" />
                <span className="flex-1 truncate">{item.name}</span>
              </Link>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-xs text-gray">
            <Tag size={20} className="mb-2 opacity-40" />
            <p>{labels.noItems}</p>
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * Component for Right Promotional Card
 */
const PromotionBanner = memo(function PromotionBanner({
  promoData,
  rootData,
  getItemHref,
  imageFallbackType,
  labels,
  onImageError,
}) {
  const title = rootData.title || promoData?.title || labels.promoTitle;
  const image = promoData?.image || rootData.image || "";
  const highlight = promoData?.highlight || "";
  const link = promoData?.link || getItemHref(rootData);
  const buttonText = promoData?.buttonText || labels.promoButton;

  return (
    <div className="h-full bg-gradient-to-br from-cream/60 to-white p-5 flex flex-col justify-between border-l border-border">
      <div className="group relative h-full min-h-[220px] w-full overflow-hidden rounded-[var(--customer-radius)] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl">
        <div className="absolute inset-0">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-105"
            onError={(event) => onImageError(event, title, imageFallbackType)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-start justify-end p-6">
          <h2 className=" text-xl font-extrabold leading-tight text-white xl:text-2xl drop-shadow-sm">
            {title}
            {highlight && (
              <>
                <br />
                <span className="bg-gradient-to-r from-gold via-yellow-200 to-white bg-clip-text text-transparent">
                  {highlight}
                </span>
              </>
            )}
          </h2>

          <Link
            to={link}
            className="mt-4 inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-gold-dark to-gold px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:opacity-90 active:scale-95"
          >
            <span>{buttonText}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
});

/**
 * Mobile-first responsive accordion megamenu component
 */
const MobileAccordionMenu = memo(function MobileAccordionMenu({
  items,
  rootTitle,
  getItemHref,
  labels,
}) {
  const [expandedSubKey, setExpandedSubKey] = useState("");
  const [expandedChildKey, setExpandedChildKey] = useState("");

  const handleToggleSub = useCallback((key) => {
    setExpandedSubKey((prev) => (prev === key ? "" : key));
    setExpandedChildKey("");
  }, []);

  const handleToggleChild = useCallback((key) => {
    setExpandedChildKey((prev) => (prev === key ? "" : key));
  }, []);

  return (
    <div className="w-full bg-white border-t border-border p-4 flex flex-col gap-3 max-h-[75vh] overflow-y-auto">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Sparkles size={14} className="text-gold" />
        <span className=" text-[10px] font-black uppercase tracking-normal text-gold">
          {rootTitle}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {items.map((sub) => {
          const isSubExpanded = expandedSubKey === sub.categoryKey;
          return (
            <div
              key={sub.categoryKey}
              className="border border-border/60 rounded-xl overflow-hidden bg-cream/10"
            >
              <button
                type="button"
                onClick={() => handleToggleSub(sub.categoryKey)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-all duration-300 ease-in-out ${
                  isSubExpanded ? "bg-cream text-gold" : "text-ink"
                }`}
              >
                <span>{sub.title}</span>
                <ChevronDown
                  size={16}
                  className={`transition-all duration-300 ease-in-out ${isSubExpanded ? "rotate-180 text-gold" : "text-gray-400"}`}
                />
              </button>

              {isSubExpanded && (
                <div className="px-4 pb-3 pt-2 bg-white flex flex-col gap-1.5">
                  {Array.isArray(sub.children) && sub.children.length > 0 ? (
                    sub.children.map((child) => {
                      const isChildExpanded =
                        expandedChildKey === child.categoryKey;
                      const hasInner =
                        Array.isArray(child.children) &&
                        child.children.length > 0;
                      return (
                        <div
                          key={child.categoryKey}
                          className="flex flex-col border-b border-gray-50 pb-1.5 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between py-1">
                            <Link
                              to={getItemHref(child)}
                              className="text-xs font-semibold text-ink hover:text-gold flex-1 py-1"
                            >
                              {child.title}
                            </Link>
                            {hasInner && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleChild(child.categoryKey)
                                }
                                className="p-1 hover:bg-cream rounded animate-pulse"
                              >
                                <ChevronDown
                                  size={14}
                                  className={`transition-all duration-300 ease-in-out text-gray-400 ${isChildExpanded ? "rotate-180" : ""}`}
                                />
                              </button>
                            )}
                          </div>

                          {isChildExpanded && hasInner && (
                            <div className="pl-4 pt-1 pb-2 flex flex-col gap-1 border-l-2 border-cream mt-1 bg-gray-50/30 rounded-r-lg">
                              {child.children.map((inner) => (
                                <Link
                                  key={inner.categoryKey}
                                  to={getItemHref(inner)}
                                  className="block py-1 text-xs text-ink/70 hover:text-gold"
                                >
                                  {inner.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <Link
                      to={getItemHref(sub)}
                      className="text-xs text-gray-400 italic py-1 hover:text-gold"
                    >
                      {labels.directItem(sub.title)}
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ==========================================
// MAIN COMPONENT
// ==========================================
/**
 * Reusable responsive megamenu.
 *
 * Defaults preserve the ecommerce category behavior. Pass getItemHref, labels,
 * quickLinks, promo, and className props to reuse it for other menu trees.
 */
export default function CategoryMegaMenu({
  data,
  activeCategory,
  rootItem = activeCategory,
  quickLinks: quickLinksProp,
  promo,
  labels: labelsProp,
  getItemHref = defaultGetItemHref,
  getQuickLinkHref = defaultGetQuickLinkHref,
  onImageError = defaultImageErrorHandler,
  imageFallbackType = "category",
  className = "",
  desktopContainerClassName = "",
}) {
  const [activeSubCategoryKey, setActiveSubCategoryKey] = useState("");
  const [activeSubSubCategoryKey, setActiveSubSubCategoryKey] = useState("");

  const labels = useMemo(() => mergeLabels(labelsProp), [labelsProp]);
  const root = useMemo(() => (rootItem ? toNode(rootItem) : null), [rootItem]);
  const subCategories = root?.children || EMPTY_ITEMS;
  const promoData = promo || data?.promo;
  const rootTitle = root?.title || data?.leftSections?.[0]?.title;
  const rootHref = root ? getItemHref(root) : "#";

  const activeSubKey = useMemo(() => {
    if (!subCategories.length) return "";
    return subCategories.some(
      (item) => item.categoryKey === activeSubCategoryKey,
    )
      ? activeSubCategoryKey
      : subCategories[0].categoryKey;
  }, [activeSubCategoryKey, subCategories]);

  const handleSubCategoryHover = useCallback((key) => {
    setActiveSubSubCategoryKey((currentKey) => (currentKey ? "" : currentKey));
    setActiveSubCategoryKey((currentKey) =>
      currentKey === key ? currentKey : key,
    );
  }, []);

  const handleChildCategoryHover = useCallback((key) => {
    setActiveSubSubCategoryKey((currentKey) =>
      currentKey === key ? currentKey : key,
    );
  }, []);

  // Active subcategory object
  const activeSubCategory = useMemo(() => {
    return (
      subCategories.find((item) => item.categoryKey === activeSubKey) || null
    );
  }, [activeSubKey, subCategories]);

  // Level 2 children (Sub-subcategories)
  const subSubCategories = useMemo(() => {
    return activeSubCategory && Array.isArray(activeSubCategory.children)
      ? activeSubCategory.children
      : EMPTY_ITEMS;
  }, [activeSubCategory]);

  const activeChildKey = useMemo(() => {
    if (!subSubCategories.length) return "";
    return subSubCategories.some(
      (item) => item.categoryKey === activeSubSubCategoryKey,
    )
      ? activeSubSubCategoryKey
      : subSubCategories[0].categoryKey;
  }, [activeSubSubCategoryKey, subSubCategories]);

  // Active child category object (Level 2)
  const activeSubSubCategory = useMemo(() => {
    return (
      subSubCategories.find((item) => item.categoryKey === activeChildKey) ||
      null
    );
  }, [activeChildKey, subSubCategories]);

  // Level 3 children (Deeper/Inner categories)
  const deeperCategories = useMemo(() => {
    return activeSubSubCategory && Array.isArray(activeSubSubCategory.children)
      ? activeSubSubCategory.children
      : EMPTY_ITEMS;
  }, [activeSubSubCategory]);

  // Check if any sub-subcategory has deeper nested categories
  const hasDeeperCategories = useMemo(() => {
    return subSubCategories.some(
      (item) => Array.isArray(item.children) && item.children.length > 0,
    );
  }, [subSubCategories]);

  // Quick links fallback from data CMS
  const quickLinks = useMemo(() => {
    if (Array.isArray(quickLinksProp)) return quickLinksProp;
    return Array.isArray(data?.leftSections?.[1]?.items)
      ? data.leftSections[1].items
      : EMPTY_ITEMS;
  }, [data, quickLinksProp]);

  if (!root) return null;

  return (
    <div
      className={`w-full bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl animate-slide-fade-in border-b border-border ${className}`}
    >
      {/* Mobile view (< 1024px) */}
      <div className="block lg:hidden">
        <MobileAccordionMenu
          items={subCategories}
          rootTitle={rootTitle}
          getItemHref={getItemHref}
          labels={labels}
        />
      </div>

      {/* Desktop view (>= 1024px) */}
      <div
        className={`hidden lg:block w-container mx-auto ${desktopContainerClassName}`}
      >
        <div className="grid grid-cols-12 min-h-[380px] max-h-[500px]">
          {/* Column 1: Subcategories */}
          <div className="col-span-3">
            <SubCategoryColumn
              items={subCategories}
              activeKey={activeSubKey}
              onHover={handleSubCategoryHover}
              title={rootTitle}
              rootHref={rootHref}
              getItemHref={getItemHref}
              labels={labels}
            />
          </div>

          {/* Column 2: Child Categories */}
          <div className={hasDeeperCategories ? "col-span-3" : "col-span-4"}>
            <ChildCategoryColumn
              items={subSubCategories}
              activeKey={activeChildKey}
              onHover={handleChildCategoryHover}
              title={activeSubCategory?.title || labels.childTitle}
              showChevron={hasDeeperCategories}
              getItemHref={getItemHref}
              labels={labels}
            />
          </div>

          {/* Column 3: Inner Categories (Optional) */}
          {hasDeeperCategories && (
            <div className="col-span-3">
              <InnerCategoryColumn
                items={deeperCategories}
                title={activeSubSubCategory?.title || labels.innerTitle}
                quickLinks={quickLinks}
                getItemHref={getItemHref}
                getQuickLinkHref={getQuickLinkHref}
                labels={labels}
              />
            </div>
          )}

          {/* Column 4: Promo Banner */}
          <div className={hasDeeperCategories ? "col-span-3" : "col-span-5"}>
            <PromotionBanner
              promoData={promoData}
              rootData={root}
              getItemHref={getItemHref}
              imageFallbackType={imageFallbackType}
              labels={labels}
              onImageError={onImageError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { toNode as normalizeMegaMenuItem };
