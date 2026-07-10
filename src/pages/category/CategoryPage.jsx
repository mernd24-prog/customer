import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useParams,
  useSearchParams,
  Link,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Grid2X2 } from "lucide-react";
import Seo from "../../components/common/Seo";
import CUSTOMER_ROUTES from "../../constants/routes";
import {
  CheckboxListFilter,
  CollectionToolbar,
  OptionFilter,
  PriceRangeFilter,
  ProductResultsLayout,
} from "../../components/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { fetchProducts } from "../../features/product/productSlice";
import {
  fetchCategoryByKey,
  fetchCategories,
} from "../../features/catalog/catalogSlice";
import {
  applyImageFallback,
  buildFacetCountMap,
  getImageUrlFromValue,
  isProductInStock,
} from "../../utils/ecommerce";
import { isNotFoundApiError } from "../../utils/apiErrors";
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

function getCategoryAttributeSchema(category = {}) {
  return Array.isArray(category?.attributeSchema) ? category.attributeSchema : [];
}

function isSchemaAttributeFilterable(attribute = {}) {
  return attribute.filterable === true || attribute.isFilterable === true;
}

function getSchemaAttributeKey(attribute = {}) {
  return attribute.key || attribute.attributeKey || attribute.name || "";
}

function getSchemaAttributeOptions(attribute = {}) {
  const options = Array.isArray(attribute.options) ? attribute.options : [];
  return options
    .map((option) =>
      typeof option === "object"
        ? option.value ?? option.name ?? option.label ?? option.code
        : option,
    )
    .filter((option) => option !== undefined && option !== null && option !== "")
    .map(String);
}

function slugifyCategory(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryLabel(category = {}) {
  return (
    category.title ||
    category.name ||
    category.label ||
    category.categoryName ||
    category.categoryKey ||
    category.key ||
    ""
  );
}

function getCategoryKey(category = {}) {
  return (
    category.categoryKey ||
    category.key ||
    category.slug ||
    slugifyCategory(getCategoryLabel(category))
  );
}

function getCategoryImage(category = {}) {
  return (
    getImageUrlFromValue(category.iconUrl) ||
    getImageUrlFromValue(category.icon) ||
    getImageUrlFromValue(category.imageUrl) ||
    getImageUrlFromValue(category.image) ||
    getImageUrlFromValue(category.thumbnailUrl) ||
    getImageUrlFromValue(category.thumbnail) ||
    getImageUrlFromValue(category.bannerUrl) ||
    getImageUrlFromValue(category.coverImage)
  );
}

function getCategoryCount(category = {}) {
  return (
    category.productCount ??
    category.productsCount ??
    category.totalProducts ??
    category.count
  );
}

function SubCategoryStrip({ categories = [] }) {
  const visibleCategories = categories
    .map((category) => ({
      key: getCategoryKey(category),
      name: getCategoryLabel(category),
      image: getCategoryImage(category),
      count: getCategoryCount(category),
    }))
    .filter((category) => category.key && category.name);

  if (!visibleCategories.length) return null;

  return (
    <section className="mb-5 overflow-hidden bg-white pt-4">
      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleCategories.map((category) => (
          <Link
            key={category.key}
            to={CUSTOMER_ROUTES.category(category.key)}
            className="group w-[92px] shrink-0 text-center sm:w-[104px]"
          >
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[10px] bg-[var(--customer-surface-soft)] p-2 transition-colors group-hover:bg-[var(--customer-gold-soft)]">
              {category.image ? (
                <img
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
    </section>
  );
}

function CategorySidebarNav({ categoryTitle, categories = [], activeKey = "" }) {
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
        <p className="flex items-center gap-1.5 text-sm font-bold text-[#111827]">
          <ChevronRight size={15} className="rotate-90 text-[#111827]" />
          <span className="line-clamp-2">{categoryTitle}</span>
        </p>
        <div className="space-y-3 pl-6">
          {visibleCategories.map((category) => {
            const isActive = category.key === activeKey;
            return (
              <Link
                key={category.key}
                to={CUSTOMER_ROUTES.category(category.key)}
                className={`block text-sm font-medium leading-5 transition-colors hover:text-[var(--customer-gold)] ${
                  isActive
                    ? "font-bold text-[var(--customer-gold)]"
                    : "text-[#111827]"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
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
  const [categoryData, setCategoryData] = useState(null);
  const [sidebarCategory, setSidebarCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [productFacets, setProductFacets] = useState({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const sentinelRef = useRef(null);
  const productState = useSelector((s) => s.product);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
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
  const filterableAttributes = useMemo(
    () =>
      getCategoryAttributeSchema(categoryData)
        .filter(isSchemaAttributeFilterable)
        .map((attribute) => ({
          ...attribute,
          key: getSchemaAttributeKey(attribute),
          options: getSchemaAttributeOptions(attribute),
        }))
        .filter((attribute) => attribute.key && attribute.options.length),
    [categoryData],
  );
  const supportedAttributeKeys = useMemo(
    () => new Set(filterableAttributes.map((attribute) => attribute.key)),
    [filterableAttributes],
  );
  const attributeCountMaps = useMemo(() => {
    return filterableAttributes.reduce((maps, attribute) => {
      maps[attribute.key] = buildFacetCountMap(products, (product) =>
        getAttributeValues(product, attribute.key),
      );
      return maps;
    }, {});
  }, [filterableAttributes, products]);

  const meta = productState.meta;
  const totalPages = pageInfo.totalPages || meta?.totalPages || 1;
  const currentPage = pageInfo.page || Number(searchParams.get("page") || 1);

  // ── Build product fetch params ───────────────────────────────────────────
  const getParams = useCallback(
    (pageOverride) => {
      const params = {
        category: categoryKey,
        minPrice: searchParams.get("minPrice") || undefined,
        maxPrice: searchParams.get("maxPrice") || undefined,
        sort: searchParams.get("sort") || undefined,
        inStock: searchParams.get("inStock") || undefined,
        outOfStock: searchParams.get("outOfStock") || undefined,

        page: pageOverride || 1,
        limit: Number(searchParams.get("limit") || 20),
      };
      searchParams.forEach((value, key) => {
        if (!key.startsWith("attr_") || !value) return;
        const attributeKey = key.replace(/^attr_/, "");
        if (!supportedAttributeKeys.has(attributeKey)) return;
        params[key] = value;
        params[attributeKey] = value;
      });
      return params;
    },
    [searchParams, categoryKey, supportedAttributeKeys],
  );

  // ── Load products (append = infinite scroll page) ──────────────────────
  const loadProducts = useCallback(
    async ({ page = 1, append = false } = {}) => {
      const params = getParams(page);
      if (append) setIsLoadingMore(true);
      try {
        const result = await dispatch(fetchProducts(params)).unwrap();
        const data = result?.data;
        let list = Array.isArray(data) ? data : data?.items || data?.list || [];

        if (categoryKey) {
          const targetCat = String(categoryKey).toLowerCase().replace(/[^a-z0-9]/g, "");
          list = list.filter((p) => {
            const cat = p.categoryId || p.category;
            if (!cat) return false;
            const catStr = String(typeof cat === "object" ? cat.slug || cat.key || cat.id || cat.name : cat)
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");
            return catStr === targetCat || catStr.includes(targetCat) || targetCat.includes(catStr);
          });
        }

        const m = result?.meta || {};
        setPageInfo({
          page: Number(m.page || m.currentPage || params.page || 1),
          totalPages: Number(m.totalPages || m.pages || 1),
          total: Number(m.total || m.count || list.length || 0),
        });
        setProductFacets(m.facets || m.filters || {});
        setItems((prev) => (append ? [...prev, ...list] : list));
        setFirstLoadDone(true);
      } finally {
        if (append) setIsLoadingMore(false);
      }
    },
    [categoryKey, dispatch, getParams, location.state?.fallbackProducts],
  );

  useEffect(() => {
    loadProducts({ page: 1, append: false }).catch(() => {
      setFirstLoadDone(true);
      setIsLoadingMore(false);
    });
  }, [loadProducts]);

  useEffect(() => {
    if (!categoryData) return;
    const globalFilterKeys = new Set([
      "minPrice",
      "maxPrice",
      "inStock",
      "outOfStock",
      "sort",
      "limit",
    ]);
    let changed = false;

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Array.from(next.keys()).forEach((key) => {
        if (key === "page") {
          next.delete(key);
          changed = true;
          return;
        }

        if (globalFilterKeys.has(key)) return;

        if (key.startsWith("attr_")) {
          const attributeKey = key.replace(/^attr_/, "");
          if (supportedAttributeKeys.has(attributeKey)) return;
        }

        next.delete(key);
        changed = true;
      });

      return changed ? next : prev;
    });
  }, [categoryData, supportedAttributeKeys, setSearchParams]);

  // ── Load category meta + subcategories ──────────────────────────────────
  useEffect(() => {
    setItems([]);
    setFirstLoadDone(false);
    setCategoryData(null);
    setSidebarCategory(null);
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
            if (!subs.length && d?.parentKey) {
              dispatch(fetchCategoryByKey({ categoryKey: d.parentKey }))
                .unwrap()
                .then((parentResult) => {
                  const parent = parentResult?.data || parentResult;
                  setSidebarCategory(parent || d);
                  return dispatch(
                    fetchCategories({ parentKey: d.parentKey, limit: 200 }),
                  );
                })
                .then((siblingAction) => {
                  const siblingData = siblingAction?.payload?.data;
                  const siblings = Array.isArray(siblingData)
                    ? siblingData
                    : siblingData?.items || siblingData?.list || [];
                  setSubCategories(siblings);
                })
                .catch(() => {
                  setSidebarCategory(d);
                  setSubCategories([]);
                });
              return;
            }

            setSidebarCategory(d);
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
  const updateParam = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      return next;
    });
  }, [setSearchParams]);

  const updateParams = useCallback((entries) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      entries.forEach(([key, value]) => {
        if (value == null || value === "") next.delete(key);
        else next.set(key, value);
      });
      next.delete("page");
      return next;
    });
  }, [setSearchParams]);

  const handlePriceChange = useCallback(({ minPrice, maxPrice }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (minPrice) next.set("minPrice", minPrice);
      else next.delete("minPrice");
      if (maxPrice) next.set("maxPrice", maxPrice);
      else next.delete("maxPrice");
      next.delete("page");
      return next;
    });
  }, [setSearchParams]);

  const removeFilter = useCallback((key, filter) => {
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
  }, [setSearchParams]);

  // ── Derived data ─────────────────────────────────────────────────────────
  const categoryTitle =
    categoryData?.title ||
    categoryData?.name ||
    (categoryKey || "").replace(/-/g, " ");
  const sidebarCategoryTitle =
    sidebarCategory?.title || sidebarCategory?.name || categoryTitle;
  const categoryDesc = categoryData?.description;
  const isRootCategory =
    sidebarCategory?.parentKey === null ||
    sidebarCategory?.parentKey === undefined ||
    Number(sidebarCategory?.level || 0) === 0;
  const showSubCategoryStrip = isRootCategory && subCategories.length > 0;
  const showCategorySidebar = !isRootCategory && subCategories.length > 0;

  // ── Filter sections for sidebar ──────────────────────────────────────────
  const filterSections = useMemo(
    () => {
      const globalFilters = [
        {
          key: "price",
          title: "Price Range",
          content: (
            <PriceRangeFilter
              min={searchParams.get("minPrice")}
              max={searchParams.get("maxPrice")}
              minLimit={productFacets?.price?.min}
              maxLimit={productFacets?.price?.max}
              onChange={handlePriceChange}
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
      ];

      const categoryFilters = filterableAttributes.map((attribute) => ({
        key: `attr_${attribute.key}`,
        title: attribute.label || attribute.key,
        content: (
          <OptionFilter
            name={`attr_${attribute.key}`}
            options={attribute.options.map((option) => ({
              value: option,
              label: option,
              count: attributeCountMaps[attribute.key]?.[option] || 0,
            }))}
            selected={parseMultiValue(searchParams.get(`attr_${attribute.key}`))}
            multiple
            onChange={(values) =>
              updateParam(`attr_${attribute.key}`, serializeMultiValue(values))
            }
          />
        ),
      }));

      const finalFilters = [...globalFilters, ...categoryFilters];

      return finalFilters.flat().filter(Boolean);
    },
    [
      filterableAttributes,
      searchParams,
      availabilityCounts,
      attributeCountMaps,
      handlePriceChange,
      updateParam,
      updateParams,
      productFacets,
    ],
  );

  // ── Active filter chips ──────────────────────────────────────────────────
  const activeFilters = useMemo(() => {
    const attributeLabelByKey = new Map(
      filterableAttributes.map((attribute) => [
        attribute.key,
        attribute.label || attribute.key,
      ]),
    );

    return [
      searchParams.get("inStock") === "true" && {
        key: "inStock",
        label: "In Stock Only",
      },
      searchParams.get("outOfStock") === "true" && {
        key: "outOfStock",
        label: "Out of Stock",
      },
      ...Array.from(searchParams.entries())
        .filter(([key, value]) => {
          if (!key.startsWith("attr_") || !value) return false;
          const attributeKey = key.replace(/^attr_/, "");
          return supportedAttributeKeys.has(attributeKey);
        })
        .flatMap(([key, value]) => {
          const attributeKey = key.replace(/^attr_/, "");
          const label = attributeLabelByKey.get(attributeKey) || attributeKey;
          return parseMultiValue(value).map((item) => ({
            key: `${key}:${item}`,
            groupKey: key,
            value: item,
            label: `${label}: ${item}`,
          }));
        }),
      (searchParams.get("minPrice") || searchParams.get("maxPrice")) && {
        key: "price",
        label: `Price: ₹${Number(searchParams.get("minPrice") || productFacets?.price?.min || 0).toLocaleString("en-IN")} – ₹${Number(searchParams.get("maxPrice") || productFacets?.price?.max || 150000).toLocaleString("en-IN")}`,
      },
    ]
      .flat()
      .filter(Boolean);
  }, [filterableAttributes, searchParams, supportedAttributeKeys, productFacets]);

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

      {categoryError && !isNotFoundApiError(categoryError) && (
        <div className="mt-4 rounded-[var(--customer-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Category details could not be loaded right now. Product results and
          filters are still available below.
        </div>
      )}

      {/* ── Product listing with sidebar filters ────────────────────────── */}
      <div className="py-5 sm:py-7">
        {showSubCategoryStrip && <SubCategoryStrip categories={subCategories} />}

        <CollectionToolbar
          countText={`${(pageInfo.total || meta?.total || products.length).toLocaleString()} products`}
          sortValue={searchParams.get("sort") || ""}
          sortOptions={SORT_OPTIONS}
          onSortChange={(value) => updateParam("sort", value)}
          onOpenFilters={() => setSidebarOpen(true)}
        />

        <ProductResultsLayout
          filterSections={filterSections}
          sidebarTopContent={
            showCategorySidebar ? (
              <CategorySidebarNav
                categoryTitle={sidebarCategoryTitle}
                categories={subCategories}
                activeKey={categoryKey}
              />
            ) : null
          }
          filters={activeFilters}
          onRemoveFilter={removeFilter}
          onClearFilters={() => setSearchParams(new URLSearchParams())}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          loading={
            (productState.loading && !products.length) ||
            (!firstLoadDone && !products.length)
          }
          error={products.length === 0 ? productState.error : null}
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
