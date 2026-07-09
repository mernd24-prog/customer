import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, LayoutGrid } from "lucide-react";
import Seo from "../../components/common/Seo";
import CUSTOMER_ROUTES from "../../constants/routes";
import {
  Breadcrumbs,
  CheckboxListFilter,
  CollectionToolbar,
  OptionFilter,
  PriceRangeFilter,
  ProductResultsLayout,
  RatingFilter,
} from "../../components/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { fetchProducts } from "../../features/product/productSlice";
import {
  fetchCategoryByKey,
  fetchCategories,
  fetchBrands,
} from "../../features/catalog/catalogSlice";
import {
  applyImageFallback,
  buildFacetCountMap,
  buildRatingCountMap,
  getProductBrandName,
  isProductInStock,
} from "../../utils/ecommerce";
import { isNotFoundApiError } from "../../utils/apiErrors";
import categoryBannerImage from "/image/png/CategoryBanner.png";
import { SORT_OPTIONS } from "../../data/constant";

function parseMultiValue(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function serializeMultiValue(values) {
  const uniqueValues = [
    ...new Set(
      (values || [])
        .map(String)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
  return uniqueValues.length ? uniqueValues.join(",") : undefined;
}

function getAttributeValues(product, key) {
  const directValue = product?.[key];
  if (Array.isArray(directValue)) return directValue;
  if (directValue != null && directValue !== "") return [directValue];

  const attributeSources = [
    product?.attributes,
    product?.specifications,
    product?.attributeValues,
  ].filter(Boolean);

  for (const source of attributeSources) {
    if (Array.isArray(source)) {
      const matching = source.filter(
        (item) =>
          item?.key === key || item?.name === key || item?.attributeKey === key,
      );
      const values = matching.flatMap((item) =>
        Array.isArray(item?.value) ? item.value : [item?.value ?? item?.label],
      );
      if (values.length) return values;
    }

    if (typeof source === "object") {
      const sourceValue = source[key];
      if (Array.isArray(sourceValue)) return sourceValue;
      if (sourceValue != null && sourceValue !== "") return [sourceValue];
    }
  }

  return [];
}

// ── Sub-category card in top strip ──────────────────────────────────────────
function SubCategoryCard({ sub, isActive, onClick }) {
  const key = sub?.categoryKey || sub?.key || "";
  const name = sub?.title || sub?.name || key.replace(/-/g, " ");
  const image = sub?.imageUrl || sub?.image || sub?.iconUrl || "";
  const childCount = (sub?.children || []).length;

  return (
    <Link
      to={CUSTOMER_ROUTES.category(key)}
      onClick={onClick}
      className={`group relative flex min-h-[112px] min-w-[108px] max-w-[126px] flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border p-3 text-center transition-all duration-300 ${
        isActive
          ? " border-[var(--customer-gold)] bg-[var(--customer-navy)]  text-white  "
          : "border-[var(--customer-border)] bg-white/90 "
      }`}
    >
      <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--customer-gold)] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-105 ${
          isActive
            ? "bg-white/15 ring-1 ring-white/20"
            : "bg-gradient-to-br from-[var(--customer-gold-soft)] to-[var(--customer-cream)] ring-1 ring-[var(--customer-gold)]/10"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => applyImageFallback(e, name, "category")}
          />
        ) : (
          <LayoutGrid
            size={20}
            strokeWidth={1.7}
            className={
              isActive ? "text-white" : "text-[var(--customer-gold-dark)]"
            }
          />
        )}
      </div>
      <span
        className={`line-clamp-2 text-xs font-bold leading-snug sm:text-[13px] ${
          isActive ? "text-white" : "text-[var(--customer-ink)]"
        }`}
      >
        {name}
      </span>
      {childCount > 0 && (
        <span
          className={`text-[10px] font-medium ${
            isActive ? "text-white/80" : "text-[var(--customer-muted)]"
          }`}
        >
          {childCount} sub-types
        </span>
      )}
    </Link>
  );
}

function CategoryPageSkeleton() {
  return (
    <div className="animate-pulse py-5 sm:py-7">
      <div className="mt-4 rounded-[var(--customer-radius-lg)] border border-[var(--customer-border)] bg-[var(--customer-cream)] px-5 py-6">
        <div className="mb-3 h-3 w-48 rounded bg-[var(--customer-border)]" />
        <div className="h-8 w-64 max-w-full rounded bg-[var(--customer-border)]" />
        <div className="mt-3 h-4 w-full max-w-xl rounded bg-[var(--customer-border)]" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="h-8 w-40 rounded bg-[var(--customer-border)]" />
        <div className="h-8 w-28 rounded bg-[var(--customer-border)]" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[392px_minmax(0,1fr)]">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 rounded bg-[var(--customer-border)]"
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="aspect-[3/4] rounded-[14px] bg-[var(--customer-border)]" />
              <div className="h-4 rounded bg-[var(--customer-border)]" />
              <div className="h-4 w-2/3 rounded bg-[var(--customer-border)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { categoryKey } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brandList, setBrandList] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(true);

  // active sub-category key for the top strip highlight
  const activeSubKey = searchParams.get("sub") || "";

  const sentinelRef = useRef(null);
  const productState = useSelector((s) => s.product);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const selectedBrands = useMemo(
    () => parseMultiValue(searchParams.get("brand")),
    [searchParams],
  );
  const selectedRatings = useMemo(
    () => parseMultiValue(searchParams.get("rating")),
    [searchParams],
  );
  const products = items;
  const availabilityCounts = useMemo(
    () =>
      products.reduce(
        (counts, product) => {
          if (isProductInStock(product)) {
            counts.inStock += 1;
          } else {
            counts.outOfStock += 1;
          }
          return counts;
        },
        { inStock: 0, outOfStock: 0 },
      ),
    [products],
  );
  const brandCounts = useMemo(
    () =>
      buildFacetCountMap(products, (product) => getProductBrandName(product)),
    [products],
  );
  const ratingCounts = useMemo(() => buildRatingCountMap(products), [products]);
  const attributeCountMaps = useMemo(() => {
    const schema = Array.isArray(categoryData?.attributeSchema)
      ? categoryData.attributeSchema
      : [];

    return schema.reduce((maps, attribute) => {
      maps[attribute.key] = buildFacetCountMap(products, (product) =>
        getAttributeValues(product, attribute.key),
      );
      return maps;
    }, {});
  }, [categoryData?.attributeSchema, products]);

  const meta = productState.meta;
  const totalPages = pageInfo.totalPages || meta?.totalPages || 1;
  const currentPage = pageInfo.page || Number(searchParams.get("page") || 1);

  // ── Build product fetch params ───────────────────────────────────────────
  const getParams = useCallback(
    (pageOverride) => {
      const brandVal = searchParams.get("brand");
      const params = {
        category: categoryKey,
        brand: brandVal ? (brandVal.includes(",") ? brandVal.split(",") : brandVal) : undefined,
        minPrice: searchParams.get("minPrice") || undefined,
        maxPrice: searchParams.get("maxPrice") || undefined,
        sort: searchParams.get("sort") || undefined,
        productFamilyCode:
          searchParams.get("productFamilyCode") ||
          searchParams.get("family") ||
          undefined,
        rating: searchParams.get("rating") ? (searchParams.get("rating").includes(",") ? searchParams.get("rating").split(",") : searchParams.get("rating")) : undefined,
        inStock: searchParams.get("inStock") || undefined,
        outOfStock: searchParams.get("outOfStock") || undefined,
        expressDelivery: searchParams.get("expressDelivery") || undefined,
        freeDelivery: searchParams.get("freeDelivery") || undefined,
        page: pageOverride || 1,
        limit: Number(searchParams.get("limit") || 20),
      };
      searchParams.forEach((value, key) => {
        if (key.startsWith("attr_")) params[key] = value;
      });
      [
        "color",
        "size",
        "material",
        "fit",
        "storage",
        "skinType",
        "shade",
        "finish",
        "room",
        "sport",
        "concern",
      ].forEach((key) => {
        const value = searchParams.get(key);
        if (value) params[key] = value;
      });
      return params;
    },
    [searchParams, categoryKey],
  );

  // ── Load products (append = infinite scroll page) ──────────────────────
  const loadProducts = useCallback(
    async ({ page = 1, append = false } = {}) => {
      const params = getParams(page);
      if (append) setIsLoadingMore(true);
      try {
        const result = await dispatch(fetchProducts(params)).unwrap();
        const data = result?.data;
        let list = Array.isArray(data)
          ? data
          : data?.items || data?.list || [];
          
        if (list.length === 0 && location.state?.fallbackProducts && page === 1) {
          list = location.state.fallbackProducts;
        }

        const m = result?.meta || {};
        setPageInfo({
          page: Number(m.page || m.currentPage || params.page || 1),
          totalPages: Number(m.totalPages || m.pages || 1),
          total: Number(m.total || m.count || list.length || 0),
        });
        setItems((prev) => (append ? [...prev, ...list] : list));
        setFirstLoadDone(true);
      } finally {
        if (append) setIsLoadingMore(false);
      }
    },
    [dispatch, getParams],
  );

  useEffect(() => {
    loadProducts({ page: 1, append: false }).catch(() => {
      setFirstLoadDone(true);
      setIsLoadingMore(false);
    });
  }, [loadProducts]);

  // ── Load category meta + subcategories ──────────────────────────────────
  useEffect(() => {
    setItems([]);
    setFirstLoadDone(false);
    setCategoryData(null);
    setSubCategories([]);
    setCategoryError(null);
    setCategoryLoading(true);

    dispatch(fetchCategoryByKey({ categoryKey }))
      .unwrap()
      .then((result) => {
        const d = result?.data || result;
        if (!d) return;
        setCategoryData(d);
        // fetch direct subcategories
        dispatch(fetchCategories({ parentKey: categoryKey, limit: 200 }))
          .then((subAction) => {
            const subData = subAction?.payload?.data;
            const subs = Array.isArray(subData)
              ? subData
              : subData?.items || subData?.list || [];
            setSubCategories(subs);
            if (subs.length) {
              setCategoryData((prev) =>
                prev ? { ...prev, children: subs } : prev,
              );
            }
          })
          .catch(() => {});
      })
      .catch((error) => {
        setCategoryError(error);
      })
      .finally(() => {
        setCategoryLoading(false);
      });

    dispatch(fetchBrands({ limit: 100 }))
      .then((action) => {
        const data = action?.payload?.data;
        const list = Array.isArray(data)
          ? data
          : data?.items || data?.list || [];
        setBrandList(
          list
            .map((brand) => {
              const label =
                brand?.name || brand?.title || brand?.brandName || brand?.code;
              return label
                ? { value: String(label), label: String(label) }
                : null;
            })
            .filter(Boolean),
        );
      })
      .catch(() => {});
  }, [dispatch, categoryKey]);

  // ── Infinite scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    if (
      !sentinelRef.current ||
      !firstLoadDone ||
      productState.loading ||
      isLoadingMore
    )
      return undefined;
    if (currentPage >= totalPages) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        loadProducts({ page: currentPage + 1, append: true }).catch(() => {});
      },
      { threshold: 0.2, rootMargin: "0px 0px 300px 0px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [
    currentPage,
    totalPages,
    firstLoadDone,
    loadProducts,
    productState.loading,
    isLoadingMore,
  ]);

  // ── Param helpers ────────────────────────────────────────────────────────
  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      return next;
    });
  };

  const updateParams = (entries) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      entries.forEach(([key, value]) => {
        if (value == null || value === "") next.delete(key);
        else next.set(key, value);
      });
      next.delete("page");
      return next;
    });
  };

  const handlePriceChange = ({ minPrice, maxPrice }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (minPrice) next.set("minPrice", minPrice);
      else next.delete("minPrice");
      if (maxPrice) next.set("maxPrice", maxPrice);
      else next.delete("maxPrice");
      next.delete("page");
      return next;
    });
  };

  const removeFilter = (key, filter) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (key === "price") {
        next.delete("minPrice");
        next.delete("maxPrice");
      } else if (filter?.groupKey) {
        const nextValues = parseMultiValue(next.get(filter.groupKey)).filter(
          (value) => value !== filter.value,
        );
        const serialized = serializeMultiValue(nextValues);
        if (serialized) next.set(filter.groupKey, serialized);
        else next.delete(filter.groupKey);
      } else next.delete(key);
      next.delete("page");
      return next;
    });
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const categoryTitle =
    categoryData?.title ||
    categoryData?.name ||
    (categoryKey || "").replace(/-/g, " ");
  const categoryDesc = categoryData?.description;
  const categoryImage = categoryData?.imageUrl || categoryData?.bannerUrl;
  const bannerImage = categoryData?.bannerUrl || categoryBannerImage;

  // Active sub + its children
  const activeSubData = useMemo(
    () =>
      subCategories.find((s) => (s?.categoryKey || s?.key) === activeSubKey) ||
      null,
    [subCategories, activeSubKey],
  );
  const activeSubChildren = activeSubData?.children || [];

  // Breadcrumb
  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Categories", href: "/categories" },
      { label: categoryTitle.replace(/\b\w/g, (c) => c.toUpperCase()) },
    ],
    [categoryTitle],
  );

  // ── Filter sections for sidebar ──────────────────────────────────────────
  const filterSections = useMemo(
    () =>
      [
        subCategories.length > 0 && {
          key: "subcategories",
          title: "Sub-Categories",
          content: (
            <div className="flex flex-col gap-0.5">
              <Link
                to={CUSTOMER_ROUTES.category(categoryKey)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  !activeSubKey
                    ? "bg-[var(--customer-gold-soft)] font-semibold text-[var(--customer-gold)]"
                    : "text-[var(--customer-ink)] hover:bg-gray-50"
                }`}
              >
                <span>All in {categoryTitle}</span>
              </Link>
              {subCategories.map((sub) => {
                const k = sub?.categoryKey || sub?.key || "";
                const n = sub?.title || sub?.name || k.replace(/-/g, " ");
                const childCount = (sub?.children || []).length;
                const isAct = activeSubKey === k;
                return (
                  <Link
                    key={k}
                    to={CUSTOMER_ROUTES.category(k)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      isAct
                        ? "bg-[var(--customer-gold-soft)] font-semibold text-[var(--customer-gold)]"
                        : "text-[var(--customer-ink)] hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate">{n}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {childCount > 0 && (
                        <span className="text-[10px] text-[var(--customer-muted)]">
                          {childCount}
                        </span>
                      )}
                      <ChevronRight size={12} className="text-gray-300" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ),
        },
        // Dynamic attribute filters
        ...(Array.isArray(categoryData?.attributeSchema)
          ? categoryData.attributeSchema
              .filter(
                (a) =>
                  a?.isFilterable !== false &&
                  Array.isArray(a?.options) &&
                  a.options.length,
              )
              .map((attribute) => ({
                key: `attr_${attribute.key}`,
                title: attribute.label || attribute.key,
                content: (
                  <OptionFilter
                    name={`attr_${attribute.key}`}
                    options={attribute.options.map((o) => ({
                      value: String(o),
                      label: String(o),
                      count:
                        attributeCountMaps[attribute.key]?.[String(o)] || 0,
                    }))}
                    selected={parseMultiValue(
                      searchParams.get(`attr_${attribute.key}`),
                    )}
                    multiple
                    onChange={(values) =>
                      updateParam(
                        `attr_${attribute.key}`,
                        serializeMultiValue(values),
                      )
                    }
                  />
                ),
              }))
          : []),
        brandList.length > 0 && {
          key: "brand",
          title: "Brand",
          content: (
            <OptionFilter
              name="brand"
              options={brandList.map((brand) => ({
                ...brand,
                count: brandCounts[String(brand.value)] || 0,
              }))}
              selected={selectedBrands}
              multiple
              onChange={(values) =>
                updateParam("brand", serializeMultiValue(values))
              }
            />
          ),
        },
        {
          key: "price",
          title: "Price Range",
          content: (
            <PriceRangeFilter
              min={searchParams.get("minPrice")}
              max={searchParams.get("maxPrice")}
              onChange={handlePriceChange}
            />
          ),
        },
        {
          key: "rating",
          title: "Rating",
          content: (
            <RatingFilter
              selected={selectedRatings}
              multiple
              counts={ratingCounts}
              onChange={(values) =>
                updateParam("rating", serializeMultiValue(values))
              }
            />
          ),
        },
        {
          key: "delivery",
          title: "Delivery",
          content: (
            <CheckboxListFilter
              name="delivery"
              options={[
                { value: "expressDelivery", label: "Express Delivery" },
                { value: "freeDelivery", label: "Free Delivery" },
              ]}
              selected={["expressDelivery", "freeDelivery"].filter(
                (value) => searchParams.get(value) === "true",
              )}
              onChange={(values) => {
                const selectedValues = new Set(values);
                updateParams([
                  [
                    "expressDelivery",
                    selectedValues.has("expressDelivery") ? "true" : undefined,
                  ],
                  [
                    "freeDelivery",
                    selectedValues.has("freeDelivery") ? "true" : undefined,
                  ],
                ]);
              }}
            />
          ),
        },
        {
          key: "inStock",
          title: "Availability",
          content: (
            <CheckboxListFilter
              name="availability"
              options={[
                {
                  value: "inStock",
                  label: "In Stock",
                  count: availabilityCounts.inStock,
                },
                {
                  value: "outOfStock",
                  label: "Out of Stock",
                  count: availabilityCounts.outOfStock,
                },
              ]}
              selected={["inStock", "outOfStock"].filter(
                (value) => searchParams.get(value) === "true",
              )}
              onChange={(values) => {
                const selectedValues = new Set(values);
                updateParams([
                  [
                    "inStock",
                    selectedValues.has("inStock") ? "true" : undefined,
                  ],
                  [
                    "outOfStock",
                    selectedValues.has("outOfStock") ? "true" : undefined,
                  ],
                ]);
              }}
            />
          ),
        },
      ]
        .flat()
        .filter(Boolean),
    [
      subCategories,
      categoryKey,
      activeSubKey,
      categoryTitle,
      categoryData,
      brandList,
      searchParams,
      availabilityCounts,
      brandCounts,
      ratingCounts,
      attributeCountMaps,
      handlePriceChange,
      selectedBrands,
      selectedRatings,
      updateParam,
      updateParams,
    ],
  );

  // ── Active filter chips ──────────────────────────────────────────────────
  const activeFilters = [
    ...selectedBrands.map((brand) => ({
      key: `brand:${brand}`,
      groupKey: "brand",
      value: brand,
      label: `Brand: ${brand}`,
    })),
    ...selectedRatings.map((rating) => ({
      key: `rating:${rating}`,
      groupKey: "rating",
      value: rating,
      label: `Rating: ${rating}★ & up`,
    })),
    searchParams.get("inStock") && { key: "inStock", label: "In Stock Only" },
    searchParams.get("outOfStock") === "true" && {
      key: "outOfStock",
      label: "Out of Stock",
    },
    searchParams.get("expressDelivery") === "true" && {
      key: "expressDelivery",
      label: "Express Delivery",
    },
    searchParams.get("freeDelivery") === "true" && {
      key: "freeDelivery",
      label: "Free Delivery",
    },
    [
      "color",
      "size",
      "material",
      "fit",
      "storage",
      "skinType",
      "shade",
      "finish",
      "room",
      "sport",
      "concern",
    ]
      .map(
        (key) =>
          searchParams.get(key) && {
            key,
            label: `${key}: ${searchParams.get(key)}`,
          },
      )
      .filter(Boolean),
    ...Array.from(searchParams.entries())
      .filter(([key, value]) => key.startsWith("attr_") && value)
      .flatMap(([key, value]) =>
        parseMultiValue(value).map((item) => ({
          key: `${key}:${item}`,
          groupKey: key,
          value: item,
          label: `${key.replace(/^attr_/, "")}: ${item}`,
        })),
      ),
    (searchParams.get("minPrice") || searchParams.get("maxPrice")) && {
      key: "price",
      label: `Price: ₹${Number(searchParams.get("minPrice") || 0).toLocaleString("en-IN")} – ₹${Number(searchParams.get("maxPrice") || 150000).toLocaleString("en-IN")}`,
    },
  ]
    .flat()
    .filter(Boolean);

  if (categoryLoading && !categoryData && !firstLoadDone && !products.length) {
    return <CategoryPageSkeleton />;
  }

  return (
    <>
      <Seo
        title={`${categoryTitle.replace(/\b\w/g, (c) => c.toUpperCase())} | Sam Global`}
        description={
          categoryDesc ||
          `Shop ${categoryTitle} products at best prices. Free delivery & easy returns.`
        }
      />

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      {bannerImage ? (
        <div className="relative full-banner mt-4 overflow-hidden bg-[#1B1D60]">
          <div className="grid gap-0 h-[320px] sm:h-[380px] md:h-[371px] xl:h-[500px] lg:grid-cols-[52%_48%]">
            {/* Mobile & Tablet Banner */}
            <div className="relative lg:hidden h-full">
              <img
                src={bannerImage}
                alt={categoryTitle}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) =>
                  applyImageFallback(event, categoryTitle, "category")
                }
              />

              <div className="absolute inset-0 bg-black/30" />

              <div className="absolute inset-0 flex items-center">
                <div className="customer-container">
                  <div className="max-w-xl">
                    <Breadcrumbs
                      linkClassName="!text-white"
                      currentClassName="!text-[#CE9F2D]"
                      separatorClassName="!text-gold"
                      items={breadcrumbItems}
                      className="mb-5"
                    />

                    <h1 className="text-h1 font-bold leading-tight text-white capitalize">
                      {categoryTitle}
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                      {categoryDesc ||
                        `Explore our wide range of ${categoryTitle.toLowerCase()} with the latest features, premium quality, and the best offers available for every need.`}
                    </p>

                    {pageInfo.total > 0 && (
                      <p className="mt-3 text-sm text-white">
                        {pageInfo.total.toLocaleString()} Products
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Content */}
            <div className="hidden items-center pl-6 pr-10 lg:flex xl:pl-[max(3rem,calc((100vw-1559px)/2))]">
              <div className="max-w-xl">
                <Breadcrumbs
                  items={breadcrumbItems}
                  linkClassName="!text-white"
                  currentClassName="!text-[#CE9F2D]"
                  separatorClassName="!text-white"
                  className="mb-5"
                />

                <h1 className="text-h1 font-bold leading-tight text-white capitalize">
                  {categoryTitle}
                </h1>

                <p className="mt-3 max-w-xl font-normal leading-relaxed text-p text-white/80">
                  {categoryDesc ||
                    `Explore our wide range of woman's with the latest features, premium quality, and the best offers available for every need.`}
                </p>
              </div>
            </div>

            {/* Desktop Image */}
            <div className="relative hidden lg:block overflow-hidden -ml-px">
              <img
                src={bannerImage}
                alt={categoryTitle}
                className="h-full w-full object-cover object-right"
                onError={(event) =>
                  applyImageFallback(event, categoryTitle, "category")
                }
              />

              <div className="absolute inset-y-0 -left-px right-0 bg-gradient-to-r from-[#1B1D60] via-[#1B1D60]/20 to-transparent" />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-[var(--customer-radius-lg)] border border-[var(--customer-border)] bg-[var(--customer-cream)] px-5 py-5">
          <Breadcrumbs
            items={breadcrumbItems}
            className="mb-2 text-[var(--customer-muted)]"
          />
          <h1 className="text-2xl font-extrabold text-[var(--customer-ink)] capitalize sm:text-3xl">
            {categoryTitle}
          </h1>
          {pageInfo.total > 0 && (
            <p className="mt-1 text-sm text-[var(--customer-muted)]">
              {pageInfo.total.toLocaleString()} products
            </p>
          )}
          {categoryDesc && (
            <p className="mt-1 max-w-2xl text-sm text-[var(--customer-muted)]">
              {categoryDesc}
            </p>
          )}
        </div>
      )}

      {categoryError && !isNotFoundApiError(categoryError) && (
        <div className="mt-4 rounded-[var(--customer-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Category details could not be loaded right now. Product results and
          filters are still available below.
        </div>
      )}

      {/* ── Product listing with sidebar filters ────────────────────────── */}
      <div className="py-5 sm:py-7">
        <CollectionToolbar
          countText={`${(pageInfo.total || meta?.total || products.length).toLocaleString()} products`}
          sortValue={searchParams.get("sort") || ""}
          sortOptions={SORT_OPTIONS}
          onSortChange={(value) => updateParam("sort", value)}
          onOpenFilters={() => setSidebarOpen(true)}
        />

        <ProductResultsLayout
          filterSections={filterSections}
          filters={activeFilters}
          onRemoveFilter={removeFilter}
          onClearFilters={() => setSearchParams(new URLSearchParams())}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          loading={
            (productState.loading && !products.length) ||
            (!firstLoadDone && !products.length)
          }
          error={productState.error}
          empty={!products.length && !productState.loading && firstLoadDone}
          emptyTitle="No products found"
          emptyText="Try adjusting your filters or browse other categories."
          products={products}
          viewMode={viewMode}
          onAddToCart={addToCart}
          onWishlist={toggleWishlist}
          isWishlisted={isWishlisted}
          currentPage={currentPage}
          totalPages={totalPages}
          showPagination={false}
          loadingMore={isLoadingMore}
          sentinelRef={sentinelRef}
        />
      </div>
    </>
  );
}
