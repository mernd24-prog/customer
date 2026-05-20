import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { applyImageFallback } from "../../utils/ecommerce";

const slugifyKey = (value = "") => String(value).trim().toLowerCase().replace(/\s+/g, "-");

const sortByOrder = (a, b) => Number(a?.sortOrder ?? 0) - Number(b?.sortOrder ?? 0);

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

export default function MegaMenu({ data, activeCategory }) {
  const root = useMemo(() => toNode(activeCategory), [activeCategory]);
  const subCategories = useMemo(() => root.children || [], [root]);

  const [activeSubCategoryKey, setActiveSubCategoryKey] = useState("");
  const [mobileExpanded, setMobileExpanded] = useState("");
  const [activeLeafParentKey, setActiveLeafParentKey] = useState("");

  useEffect(() => {
    const firstKey = subCategories?.[0]?.categoryKey || "";
    setActiveSubCategoryKey(firstKey);
    setMobileExpanded(firstKey);
  }, [subCategories]);

  const activeSubCategory = useMemo(
    () =>
      subCategories.find((item) => item?.categoryKey === activeSubCategoryKey) ||
      subCategories[0] ||
      null,
    [activeSubCategoryKey, subCategories],
  );

  const subSubCategories = useMemo(
    () => (Array.isArray(activeSubCategory?.children) ? activeSubCategory.children : []),
    [activeSubCategory],
  );

  useEffect(() => {
    setActiveLeafParentKey(subSubCategories?.[0]?.categoryKey || "");
  }, [subSubCategories]);

  const activeSubSubCategory = useMemo(
    () =>
      subSubCategories.find((item) => item?.categoryKey === activeLeafParentKey) ||
      subSubCategories[0] ||
      null,
    [activeLeafParentKey, subSubCategories],
  );

  const deeperCategories = useMemo(
    () => (Array.isArray(activeSubSubCategory?.children) ? activeSubSubCategory.children : []),
    [activeSubSubCategory],
  );
  const hasDeeperCategories = useMemo(
    () => subSubCategories.some((item) => Array.isArray(item?.children) && item.children.length > 0),
    [subSubCategories],
  );
  const quickLinks = Array.isArray(data?.leftSections?.[1]?.items) ? data.leftSections[1].items : [];

  const handleToggle = (itemKey) => {
    setActiveSubCategoryKey(itemKey);
    setMobileExpanded((prev) => (prev === itemKey ? "" : itemKey));
  };

  return (
    <div className="relative z-50 w-full max-h-[85vh] overflow-y-auto rounded-b-2xl border-t border-gray-100 bg-white/95 shadow-[0_30px_100px_rgba(0,0,0,0.2)] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 hide-scrollbar">
      <div className="w-container mx-auto flex flex-col xl:flex-row">
        {/* Panel 1 – Sub-categories (hover to reveal panel 2) */}
        <div className="w-full border-b border-gray-100 bg-gray-50/40 p-5 xl:w-[24%] xl:border-b-0 xl:border-r xl:p-7">
          <div className="mb-5 flex items-center gap-2 border-b border-blue-100 pb-3">
            <Sparkles size={15} className="text-blue-500" />
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-600">
              {root.title || data?.leftSections?.[0]?.title}
            </h3>
          </div>

          <div className="flex flex-col gap-1.5">
            {subCategories.map((item) => {
              const isActive = activeSubCategory?.categoryKey === item?.categoryKey;
              return (
                <div key={item?.categoryKey} className="relative">
                  <div
                    className={`group flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-left text-[14px] transition-all duration-200 ${
                      isActive
                        ? "translate-x-1 bg-white font-bold text-blue-600 shadow-[0_10px_25px_rgba(59,130,246,0.1)]"
                        : "text-gray-600 hover:translate-x-0.5 hover:bg-white/80 hover:text-blue-500"
                    }`}
                    onMouseEnter={() => setActiveSubCategoryKey(item?.categoryKey)}
                    onClick={() => handleToggle(item?.categoryKey)}
                  >
                    <Link
                      to={`/categories/${item?.categoryKey}`}
                      className="flex-1 line-clamp-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item?.title}
                    </Link>
                    <ChevronRight
                      size={14}
                      className={`hidden xl:block transition-all duration-200 ${isActive ? "opacity-100" : "-rotate-90 opacity-0"}`}
                    />
                    <ChevronDown
                      size={16}
                      className={`block xl:hidden transition-transform duration-200 ${mobileExpanded === item?.categoryKey ? "rotate-180" : ""}`}
                    />
                  </div>

                  {mobileExpanded === item?.categoryKey && (
                    <div className="mt-1 rounded-xl bg-white/40 py-3 pl-4 pr-2 xl:hidden">
                      <div className="grid grid-cols-1 gap-2">
                        {(Array.isArray(item?.children) ? item.children : []).map((leaf) => (
                          <div key={leaf?.categoryKey}>
                            <Link
                              to={`/categories/${leaf?.categoryKey}`}
                              className="block rounded px-2 py-1 text-[13px] text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              {leaf?.title}
                            </Link>
                            {Array.isArray(leaf?.children) && leaf.children.length > 0 && (
                              <div className="mt-1 grid gap-1 pl-3">
                                {leaf.children.map((child) => (
                                  <Link
                                    key={child?.categoryKey}
                                    to={`/categories/${child?.categoryKey}`}
                                    className="block rounded px-2 py-1 text-[12px] text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    {child?.title}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2 – Sub-sub-categories */}
        <div className="w-full border-b border-gray-100 p-5 xl:w-[24%] xl:border-b-0 xl:border-r xl:p-7">
          <h3 className="mb-5 border-b border-gray-100 pb-3 text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">
            {activeSubCategory?.title || "Sub-sub categories"}
          </h3>
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
            {subSubCategories.length ? (
              subSubCategories.map((item) => {
                const isActive = activeSubSubCategory?.categoryKey === item?.categoryKey;
                return (
                  <div
                    key={item?.categoryKey}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] transition cursor-pointer ${
                      isActive
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                    onMouseEnter={() => setActiveLeafParentKey(item?.categoryKey)}
                    onClick={() => setActiveLeafParentKey(item?.categoryKey)}
                  >
                    <Link
                      to={`/categories/${item?.categoryKey}`}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item?.title}
                    </Link>
                    {hasDeeperCategories && Array.isArray(item?.children) && item.children.length > 0 && (
                      <ChevronRight size={12} className="hidden xl:block opacity-40 group-hover:opacity-100" />
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400">No subcategories</p>
            )}
          </div>
        </div>

        {/* Panel 3 – Deeper categories, only when sub-sub categories have children */}
        {hasDeeperCategories && (
          <div className="w-full border-b border-gray-100 p-5 xl:w-[18%] xl:border-b-0 xl:border-r xl:p-7">
            <h3 className="mb-5 border-b border-gray-100 pb-3 text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">
              {activeSubSubCategory?.title || "Items"}
            </h3>
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
              {deeperCategories.length ? (
                deeperCategories.map((item) => (
                  <Link
                    key={item?.categoryKey}
                    to={`/categories/${item?.categoryKey}`}
                    className="rounded-xl px-3 py-2.5 text-[13px] text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    {item?.title}
                  </Link>
                ))
              ) : quickLinks.length ? (
                quickLinks.map((item) => (
                  <Link
                    key={item?.name}
                    to={item?.link || "#"}
                    className="rounded-xl px-3 py-2.5 text-[13px] text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    {item?.name}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-400">No items available</p>
              )}
            </div>
          </div>
        )}

        {/* Panel 4 – Promo image */}
        <div className={`w-full p-5 xl:p-7 ${hasDeeperCategories ? "xl:w-[34%]" : "xl:w-[52%]"}`}>
          <div className="group relative h-[220px] w-full overflow-hidden rounded-[1.5rem] shadow-2xl xl:h-full">
            <div className="absolute inset-0">
              <img
                src={root.image || data?.promo?.image}
                alt={root.title || data?.promo?.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(event) => applyImageFallback(event, root.title || data?.promo?.title, "category")}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/30 to-transparent" />
            </div>
            <div className="relative z-10 flex h-full flex-col items-start justify-center px-8 xl:px-10">
              <h2 className="text-2xl font-black leading-tight tracking-tight text-white xl:text-4xl">
                {root.title || data?.promo?.title}
                {data?.promo?.highlight ? (
                  <>
                    <br />
                    <span className="bg-gradient-to-r from-blue-300 via-teal-300 to-white bg-clip-text text-transparent">
                      {data.promo.highlight}
                    </span>
                  </>
                ) : null}
              </h2>

              <Link
                to={data?.promo?.link || `/categories/${root.categoryKey}`}
                className="mt-6 inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-6 py-3 text-[14px] font-bold text-gray-900 shadow-[0_20px_40px_rgba(255,255,255,0.2)] transition-all hover:shadow-white/40 active:scale-95"
              >
                <span>{data?.promo?.buttonText || "Explore Now"}</span>
                <ChevronRight size={18} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
