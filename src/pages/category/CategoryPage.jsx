import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
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
  getImageUrlFromValue,
  isProductInStock,
  getProductPrice,
} from "../../utils/ecommerce";
import { isNotFoundApiError } from "../../utils/apiErrors";
import { SORT_OPTIONS } from "../../data/constant";
import { buildCategoryTree } from "../../layouts/header/categoryHelpers";

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

function normalizeFacetValue(value = "") {
  return String(value).trim().toLowerCase();
}

function getFacetOptionCount(countMap = {}, option = "") {
  const directCount = countMap[option];
  if (directCount != null) return directCount;

  const normalizedOption = normalizeFacetValue(option);
  const matchingKey = Object.keys(countMap).find(
    (key) => normalizeFacetValue(key) === normalizedOption,
  );
  return matchingKey ? countMap[matchingKey] : 0;
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
    <section className="mb-5 bg-white pt-4">
      <div className="w-full overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-4 px-4 sm:px-0">
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
      </div>
    </section>
  );
}

function CategorySidebarNav({
  categoryTitle,
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
                className={`flex items-start gap-2 text-sm font-medium leading-5 transition-colors hover:text-[var(--customer-gold)] ${
                  isActive
                    ? "font-bold text-[var(--customer-gold)]"
                    : "text-[#111827]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                    isActive
                      ? "border-[#3E4093] bg-[#3E4093]"
                      : "border-[#3E4093] bg-transparent"
                  }`}
                >
                  <span
                    className={`h-[7px] w-[7px] rounded-[2px] bg-white transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </span>
                <span className="min-w-0">{category.name}</span>
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

function getMatchingCategoryKeys(targetCats, categoryTree) {
  const keys = new Set();

  const addNodeAndChildren = (node) => {
    if (!node) return;
    keys.add(
      String(node.categoryKey || node.key)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ""),
    );
    const children = [...(node.children || []), ...(node.subs || [])];
    children.forEach(addNodeAndChildren);
  };

  const findAndAdd = (nodes) => {
    if (!nodes) return;
    for (const node of nodes) {
      const nodeKey = String(node.categoryKey || node.key)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (
        targetCats.some(
          (tc) =>
            tc === nodeKey || nodeKey.includes(tc) || tc.includes(nodeKey),
        )
      ) {
        addNodeAndChildren(node);
      } else {
        const children = [...(node.children || []), ...(node.subs || [])];
        if (children.length > 0) {
          findAndAdd(children);
        }
      }
    }
  };

  findAndAdd(categoryTree);
  return keys;
}

export default function CategoryPage() {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
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
  const [facetsContextKey, setFacetsContextKey] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const sentinelRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const productState = useSelector((s) => s.product);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const catalogCategoryList =
    useSelector(
      (state) => state.catalog?.globalCategories || state.catalog?.list,
    ) || [];
  const categoryTree = useMemo(
    () => buildCategoryTree(catalogCategoryList),
    [catalogCategoryList],
  );

  const allBrands = useMemo(() => {
    return productFacets?.brands || [];
  }, [productFacets]);

  const products = useMemo(() => {
    if (!categoryKey) return items;
    const targetCats = [
      String(categoryKey)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ""),
    ];
    const validKeys = getMatchingCategoryKeys(targetCats, categoryTree);

    return items.filter((p) => {
      const cat = p.categoryId || p.category;
      if (!cat) return false;
      const catStr = String(
        typeof cat === "object"
          ? cat.slug || cat.key || cat.id || cat.name
          : cat,
      )
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      if (validKeys.size > 0 && validKeys.has(catStr)) {
        return true;
      }

      return targetCats.some(
        (targetCat) =>
          catStr === targetCat ||
          catStr.includes(targetCat) ||
          targetCat.includes(catStr),
      );
    });
  }, [items, categoryKey, categoryTree]);
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
      (productFacets.attributes || [])
        .filter((attribute) => attribute.variant === true)
        .map((attribute) => ({
          ...attribute,
          key: String(attribute.key || ""),
          label: attribute.label || attribute.key,
          searchable: attribute.searchable === true,
          options: (attribute.values || [])
            .filter((option) => Number(option.count || 0) > 0)
            .map((option) => String(option.value)),
        }))
        .filter((attribute) => attribute.key && attribute.options.length > 0),
    [productFacets.attributes],
  );
  const supportedAttributeKeys = useMemo(
    () => new Set(filterableAttributes.map((attribute) => attribute.key)),
    [filterableAttributes],
  );
  const attributeCountMaps = useMemo(() => {
    return filterableAttributes.reduce((maps, attribute) => {
      const facet = (productFacets.attributes || []).find(
        (item) => String(item.key) === String(attribute.key),
      );
      maps[attribute.key] = Object.fromEntries(
        (facet?.values || []).map((option) => [
          String(option.value),
          Number(option.count || 0),
        ]),
      );
      return maps;
    }, {});
  }, [filterableAttributes, productFacets.attributes]);

  const currentContextKey = useMemo(() => {
    const p = new URLSearchParams(searchParams);
    p.delete("minPrice");
    p.delete("maxPrice");
    p.delete("page");
    return `${categoryKey}_${p.toString()}`;
  }, [searchParams, categoryKey]);

  const [absolutePriceLimits, setAbsolutePriceLimits] = useState({
    min: null,
    max: null,
    key: "",
  });

  useEffect(() => {
    if (currentContextKey !== facetsContextKey) return;

    let backendMin = productFacets?.priceStats?.min ?? productFacets?.price?.min;
    let backendMax = productFacets?.priceStats?.max ?? productFacets?.price?.max;

    let currentMin = backendMin;
    let currentMax = backendMax;

    if (currentMin == null || currentMax == null || currentMin >= currentMax) {
      if (products.length > 0) {
        const prices = products
          .map((p) => Number(getProductPrice(p) || 0))
          .filter((price) => price > 0);

        if (prices.length > 0) {
          currentMin = Math.min(...prices);
          currentMax = Math.max(...prices);
        }
      }
    }

    if (currentMin != null && currentMax != null) {
      setAbsolutePriceLimits((prev) => {
        if (prev.key !== currentContextKey) {
          return { min: currentMin, max: currentMax, key: currentContextKey };
        }
        const newMin =
          prev.min == null ? currentMin : Math.min(prev.min, currentMin);
        const newMax =
          prev.max == null ? currentMax : Math.max(prev.max, currentMax);

        if (newMin !== prev.min || newMax !== prev.max) {
          return { min: newMin, max: newMax, key: currentContextKey };
        }
        return prev;
      });
    }
  }, [productFacets?.price, products, currentContextKey, facetsContextKey]);

  const priceLimits = useMemo(() => {
    return {
      min: absolutePriceLimits.min ?? 0,
      max: absolutePriceLimits.max ?? 150000,
    };
  }, [absolutePriceLimits]);

  const meta = productState.meta;
  const totalPages = pageInfo.totalPages || meta?.totalPages || 1;
  const currentPage = pageInfo.page || Number(searchParams.get("page") || 1);

  // ── Build product fetch params ───────────────────────────────────────────
  const getParams = useCallback(
    (pageOverride) => {
      const params = {
        category: categoryKey,
        brand: searchParams.get("brand") || undefined,
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
        params[key] = value;
      });
      return params;
    },
    [searchParams, categoryKey],
  );

  // ── Load products (append = infinite scroll page) ──────────────────────
  const loadProducts = useCallback(
    async ({ page = 1, append = false } = {}) => {
      const params = getParams(page);
      const requestSequence = append
        ? requestSequenceRef.current
        : ++requestSequenceRef.current;
      if (append) setIsLoadingMore(true);
      try {
        const result = await dispatch(fetchProducts(params)).unwrap();
        if (requestSequence !== requestSequenceRef.current) return [];
        const data = result?.data;
        let list = Array.isArray(data)
          ? data
          : data?.products || data?.items || data?.list || [];

        const p = new URLSearchParams(searchParams);
        p.delete("minPrice");
        p.delete("maxPrice");
        p.delete("page");
        const ctxKey = `${categoryKey}_${p.toString()}`;

        const m = result?.meta || {};
        setPageInfo({
          page: Number(m.page || m.currentPage || params.page || 1),
          totalPages: Number(m.totalPages || m.pages || 1),
          total: Number(m.total || m.count || list.length || 0),
        });
        setProductFacets(m.facets || m.filters || {});
        setFacetsContextKey(ctxKey);

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

  useEffect(() => {
    if (!categoryData) return;
    const globalFilterKeys = new Set([
      "brand",
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
  const updateParam = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value == null || value === "") next.delete(key);
        else next.set(key, value);
        next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

  const updateParams = useCallback(
    (entries) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        entries.forEach(([key, value]) => {
          if (value == null || value === "") next.delete(key);
          else next.set(key, value);
        });
        next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

  const handlePriceChange = useCallback(
    ({ minPrice, maxPrice }) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (minPrice) next.set("minPrice", minPrice);
        else next.delete("minPrice");
        if (maxPrice) next.set("maxPrice", maxPrice);
        else next.delete("maxPrice");
        next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

  const removeFilter = useCallback(
    (key, filter) => {
      if (key === "category" && filter?.href) {
        navigate(filter.href);
        return;
      }

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
    },
    [navigate, setSearchParams],
  );

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
  const visibleCategoryKeys = new Set(
    (productFacets.categories || [])
      .filter((category) => Number(category.count || 0) > 0)
      .map((category) => String(category.value || category.key || "")),
  );
  const visibleSubCategories = subCategories.filter((category) =>
    visibleCategoryKeys.has(String(getCategoryKey(category))),
  );
  const showSubCategoryStrip =
    isRootCategory && visibleSubCategories.length > 0;
  const showCategorySidebar =
    !isRootCategory && visibleSubCategories.length > 0;
  const categoryFilter = useMemo(() => {
    if (!categoryData || isRootCategory) return null;
    const parentKey =
      sidebarCategory && getCategoryKey(sidebarCategory) !== categoryKey
        ? getCategoryKey(sidebarCategory)
        : categoryData.parentKey;

    return {
      key: "category",
      label: getCategoryLabel(categoryData) || categoryTitle,
      href: parentKey ? CUSTOMER_ROUTES.category(parentKey) : "/products",
    };
  }, [
    categoryData,
    categoryKey,
    categoryTitle,
    isRootCategory,
    sidebarCategory,
  ]);

  // ── Filter sections for sidebar ──────────────────────────────────────────
  const filterSections = useMemo(() => {
    const availabilityOptions = [
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
    ].filter((option) => option.count >= 1);

    const brandOptions = allBrands
      .map((brand) => ({
        value: String(brand.value),
        label: String(brand.value),
        count: Number(brand.count || 0),
      }))
      .filter((brand) => brand.count > 0);

    const globalFilters = [
      absolutePriceLimits.min != null &&
      absolutePriceLimits.max != null &&
      absolutePriceLimits.max > 0 &&
      absolutePriceLimits.min < absolutePriceLimits.max && {
        key: "price",
        title: "Price Range",
        content: (
          <PriceRangeFilter
            min={searchParams.get("minPrice")}
            max={searchParams.get("maxPrice")}
            minLimit={priceLimits.min}
            maxLimit={priceLimits.max}
            onChange={handlePriceChange}
          />
        ),
      },
      brandOptions.length > 0 && {
        key: "brand",
        title: "Brand",
        content: (
          <OptionFilter
            name="brand"
            options={brandOptions}
            selected={parseMultiValue(searchParams.get("brand"))}
            multiple
            onChange={(values) =>
              updateParam("brand", serializeMultiValue(values))
            }
          />
        ),
      },
      {
        key: "inStock",
        title: "Availability",
        content: (
          <CheckboxListFilter
            name="availability"
            options={availabilityOptions}
            selected={["inStock", "outOfStock"].filter(
              (value) => searchParams.get(value) === "true",
            )}
            onChange={(values) => {
              const selectedValues = new Set(values);
              updateParams([
                ["inStock", selectedValues.has("inStock") ? "true" : undefined],
                [
                  "outOfStock",
                  selectedValues.has("outOfStock") ? "true" : undefined,
                ],
              ]);
            }}
          />
        ),
      },
    ].filter(
      (filter) => filter.key !== "inStock" || availabilityOptions.length,
    );

    const categoryFilters = filterableAttributes
      .map((attribute) => {
        const options = attribute.options
          .map((option) => ({
            value: option,
            label: option,
            count: getFacetOptionCount(
              attributeCountMaps[attribute.key],
              option,
            ),
          }))
          .filter((option) => option.count >= 1);

        if (!options.length) return null;

        return {
          key: `attr_${attribute.key}`,
          title: attribute.label || attribute.key,
          searchable: attribute.searchable && options.length > 6,
          content: (
            <OptionFilter
              name={`attr_${attribute.key}`}
              options={options}
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
        };
      })
      .filter(Boolean);

    const finalFilters = [...globalFilters, ...categoryFilters];

    return finalFilters.flat().filter(Boolean);
  }, [
    filterableAttributes,
    searchParams,
    availabilityCounts,
    attributeCountMaps,
    handlePriceChange,
    updateParam,
    updateParams,
    priceLimits.min,
    priceLimits.max,
  ]);

  // ── Active filter chips ──────────────────────────────────────────────────
  const activeFilters = useMemo(() => {
    const attributeLabelByKey = new Map(
      filterableAttributes.map((attribute) => [
        attribute.key,
        attribute.label || attribute.key,
      ]),
    );

    return [
      categoryFilter,
      searchParams.get("inStock") === "true" && {
        key: "inStock",
        label: "In Stock Only",
      },
      searchParams.get("outOfStock") === "true" && {
        key: "outOfStock",
        label: "Out of Stock",
      },

      ...parseMultiValue(searchParams.get("brand")).map((brand) => ({
        key: `brand:${brand}`,
        groupKey: "brand",
        value: brand,
        label: `Brand: ${brand}`,
      })),

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
        label: `Price: ₹${Number(searchParams.get("minPrice") || priceLimits.min || 0).toLocaleString("en-IN")} – ₹${Number(searchParams.get("maxPrice") || priceLimits.max || 150000).toLocaleString("en-IN")}`,
      },
    ]
      .flat()
      .filter(Boolean);
  }, [
    categoryFilter,
    filterableAttributes,
    searchParams,
    supportedAttributeKeys,
    priceLimits.min,
    priceLimits.max,
  ]);

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
        {showSubCategoryStrip && (
          <SubCategoryStrip categories={visibleSubCategories} />
        )}

        <CollectionToolbar
          countText={`${(pageInfo.total || meta?.total || products.length).toLocaleString()} products`}
          sortValue={searchParams.get("sort") || ""}
          sortOptions={(pageInfo.total || meta?.total || products.length) <= 1 ? [] : SORT_OPTIONS}
          onSortChange={(value) => updateParam("sort", value)}
          onOpenFilters={() => setSidebarOpen(true)}
        />

        <ProductResultsLayout
          filterSections={filterSections}
          sidebarTopContent={
            showCategorySidebar ? (
              <CategorySidebarNav
                categoryTitle={sidebarCategoryTitle}
                categories={visibleSubCategories}
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
          refreshing={
            productState.loading && products.length > 0 && !isLoadingMore
          }
          error={products.length === 0 ? productState.error : null}
          empty={!products.length && !productState.loading && firstLoadDone}
          emptyTitle="No Products Found"
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
