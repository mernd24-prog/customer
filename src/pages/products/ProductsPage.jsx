import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Seo from "../../components/ui/Seo";
import ProductListingLayout from "../../components/ecommerce/ProductListingLayout";
import {
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
  buildRatingCountMap,
  isProductInStock,
  getProductPrice,
  getAvailabilityCounts,
  calculateAbsolutePriceLimits,
} from "../../utils/ecommerce";
import {
  parseMultiValue,
  serializeMultiValue,
  getFacetList,
  normalizeFacetOption,
} from "../../utils/filterUtils";
import { capitalizeFirst } from "../../utils/stringUtils";

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "newest", label: "Latest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [productFacets, setProductFacets] = useState({});
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [facetsContextKey, setFacetsContextKey] = useState("");
  const sentinelRef = useRef(null);
  const requestSequenceRef = useRef(0);
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

  const totalPages = pageInfo.totalPages || 1;
  const currentPage = pageInfo.page || 1;
  const pageSize = Number(searchParams.get("limit") || 12);
  const availabilityCounts = useMemo(
    () => getAvailabilityCounts(products, productFacets),
    [productFacets, products],
  );
  const ratingCounts = useMemo(() => buildRatingCountMap(products), [products]);
  const facetCategoryOptions = useMemo(
    () =>
      getFacetList(productFacets, ["categories", "category"])
        .map(normalizeFacetOption)
        .filter(Boolean),
    [productFacets],
  );
  const facetBrandOptions = useMemo(
    () =>
      getFacetList(productFacets, ["brands", "brand"])
        .map(normalizeFacetOption)
        .filter(Boolean),
    [productFacets],
  );
  const facetRatingCounts = useMemo(() => {
    const ratings = getFacetList(productFacets, ["ratings", "rating"]);
    return ratings.reduce((counts, option) => {
      const value =
        option.value ?? option.rating ?? option.stars ?? option.key ?? "";
      if (value) counts[String(value)] = option.count ?? option.doc_count ?? 0;
      return counts;
    }, {});
  }, [productFacets]);
  const effectiveRatingCounts = Object.keys(facetRatingCounts).length
    ? facetRatingCounts
    : ratingCounts;

  const attributeFacets = useMemo(
    () =>
      (productFacets.attributes || [])
        .filter((attribute) => attribute.variant === true) // Only variant attributes
        .map((attribute) => ({
          key: String(attribute.key || ""),
          label: attribute.label || attribute.key,
          values: (attribute.values || []).filter(
            (option) => option.value && Number(option.count || 0) > 0,
          ),
        }))
        .filter((attribute) => attribute.key && attribute.values.length),
    [productFacets.attributes],
  );

  const collectionOptions = useMemo(
    () =>
      (productFacets.collections || []).filter(
        (option) => option.value && Number(option.count || 0) > 0,
      ),
    [productFacets.collections],
  );

  const currentContextKey = useMemo(() => {
    const p = new URLSearchParams(searchParams);
    p.delete("minPrice");
    p.delete("maxPrice");
    p.delete("page");
    return p.toString();
  }, [searchParams]);

  const [absolutePriceLimits, setAbsolutePriceLimits] = useState({
    min: null,
    max: null,
    key: "",
  });

  useEffect(() => {
    if (currentContextKey !== facetsContextKey) return;

    const { min: currentMin, max: currentMax } = calculateAbsolutePriceLimits(
      productFacets,
      products,
    );

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
  const categoryOptions = facetCategoryOptions.filter(
    (option) => Number(option.count || 0) > 0,
  );
  const brandContextKey = useMemo(() => {
    const p = new URLSearchParams(searchParams);
    p.delete("brand");
    p.delete("page");
    return p.toString();
  }, [searchParams]);

  const brandOptionsRef = useRef({ context: "", options: [] });
  const brandOptions = useMemo(() => {
    const currentSelected = parseMultiValue(searchParams.get("brand"));
    const rawOptions = facetBrandOptions.filter(
      (option) => Number(option.count || 0) > 0,
    );

    if (brandContextKey !== brandOptionsRef.current.context) {
      brandOptionsRef.current = {
        context: brandContextKey,
        options: rawOptions,
      };
    } else if (currentSelected.length === 0) {
      brandOptionsRef.current = {
        context: brandContextKey,
        options: rawOptions,
      };
    }

    if (
      currentSelected.length > 0 &&
      brandOptionsRef.current.options.length > 0
    ) {
      const mergedMap = new Map();
      brandOptionsRef.current.options.forEach((opt) =>
        mergedMap.set(opt.value, { ...opt }),
      );
      rawOptions.forEach((opt) => mergedMap.set(opt.value, opt));
      return Array.from(mergedMap.values());
    }

    return brandOptionsRef.current.options;
  }, [facetBrandOptions, searchParams, brandContextKey]);

  const getParams = useCallback(
    (pageOverride) => {
      const parseMultiParam = (val) => val || undefined;
      const params = {
        category: searchParams.get("category") || undefined,
        brand: parseMultiParam(searchParams.get("brand")),
        q: searchParams.get("q") || undefined,
        minPrice: searchParams.get("minPrice") || undefined,
        maxPrice: searchParams.get("maxPrice") || undefined,
        sort: searchParams.get("sort") || undefined,
        productFamilyCode:
          searchParams.get("productFamilyCode") ||
          searchParams.get("family") ||
          undefined,
        color: parseMultiParam(searchParams.get("color")),
        size: parseMultiParam(searchParams.get("size")),
        material: parseMultiParam(searchParams.get("material")),
        fit: parseMultiParam(searchParams.get("fit")),
        storage: parseMultiParam(searchParams.get("storage")),
        skinType: parseMultiParam(searchParams.get("skinType")),
        shade: parseMultiParam(searchParams.get("shade")),
        rating: parseMultiParam(searchParams.get("rating")),
        tags: parseMultiParam(searchParams.get("tags")),
        collectionIds: parseMultiParam(searchParams.get("collectionIds")),
        featured: searchParams.get("featured") || undefined,
        bestSeller: searchParams.get("bestSeller") || undefined,
        newArrival: searchParams.get("newArrival") || undefined,
        inStock: searchParams.get("inStock") === "true" ? "true" : undefined,
        outOfStock:
          searchParams.get("outOfStock") === "true" ? "true" : undefined,

        page: pageOverride || 1,
        limit: Number(searchParams.get("limit") || 12),
      };
      searchParams.forEach((value, key) => {
        if (key.startsWith("attr_") && value) params[key] = value;
      });
      return params;
    },
    [searchParams],
  );

  const loadProducts = useCallback(
    async ({ page = 1, append = false } = {}) => {
      const params = getParams(page);
      const requestSequence = append
        ? requestSequenceRef.current
        : ++requestSequenceRef.current;
      if (append) setIsLoadingMore(true);
      const result = await dispatch(fetchProducts(params)).unwrap();
      if (requestSequence !== requestSequenceRef.current) return [];

      const data = result?.data || {};
      let list =
        data.hits ||
        data.products ||
        data.results ||
        data.items ||
        data.list ||
        (Array.isArray(data) ? data : []);

      const p = new URLSearchParams(searchParams);
      p.delete("minPrice");
      p.delete("maxPrice");
      p.delete("page");
      const ctxKey = p.toString();

      const meta =
        result?.meta?.pagination || result?.pagination || result?.meta || {};
      setPageInfo({
        page: Number(meta.page || meta.currentPage || params.page || 1),
        totalPages: Number(meta.totalPages || meta.pages || 1),
        total: Number(meta.total || meta.count || list.length || 0),
      });
      setProductFacets(result?.meta?.facets || result?.meta?.filters || {});
      setFacetsContextKey(ctxKey);
      setItems((prev) => (append ? [...prev, ...list] : list));
      setFirstLoadDone(true);
      setIsLoadingMore(false);
      return list;
    },
    [dispatch, getParams],
  );

  useEffect(() => {
    const pageVal = Number(searchParams.get("page") || 1);
    loadProducts({ page: pageVal, append: false }).catch(() => {
      setFirstLoadDone(true);
      setIsLoadingMore(false);
    });
  }, [loadProducts, searchParams]);

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
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
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

  const scrollToTop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const updateParam = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value == null || value === "") next.delete(key);
        else next.set(key, value);
        next.delete("page");
        return next;
      });
      scrollToTop();
    },
    [scrollToTop, setSearchParams],
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
      scrollToTop();
    },
    [scrollToTop, setSearchParams],
  );

  const removeFilter = useCallback(
    (key, filter) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (key === "price") {
          next.delete("minPrice");
          next.delete("maxPrice");
        } else if (filter?.groupKey) {
          if (filter.value === undefined) {
            next.delete(filter.groupKey);
          } else {
            const nextValues = parseMultiValue(
              next.get(filter.groupKey),
            ).filter((value) => value !== filter.value);
            const serialized = serializeMultiValue(nextValues);
            if (serialized) next.set(filter.groupKey, serialized);
            else next.delete(filter.groupKey);
          }
        } else next.delete(key);
        next.delete("page");
        return next;
      });
      scrollToTop();
    },
    [scrollToTop, setSearchParams],
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
      scrollToTop();
    },
    [scrollToTop, setSearchParams],
  );

  const handleClearFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      if (prev.has("category")) next.set("category", prev.get("category"));
      if (prev.has("q")) next.set("q", prev.get("q"));
      if (prev.has("collectionIds"))
        next.set("collectionIds", prev.get("collectionIds"));
      return next;
    });
    scrollToTop();
  }, [scrollToTop, setSearchParams]);

  const activeFilters = [
    searchParams.get("category") && {
      key: "category",
      label: `Category: ${searchParams.get("category")}`,
    },
    searchParams.get("brand") && {
      key: "brand",
      groupKey: "brand",
      label: `Brand: ${searchParams.get("brand").split(",").join(", ")}`,
    },
    searchParams.get("productFamilyCode") && {
      key: "productFamilyCode",
      label: `Family: ${searchParams.get("productFamilyCode")}`,
    },
    searchParams.get("rating") && {
      key: "rating",
      groupKey: "rating",
      label: `Rating: ${searchParams.get("rating").split(",").join(", ")}★ & up`,
    },
    searchParams.get("inStock") === "true" && {
      key: "inStock",
      label: "In Stock Only",
    },
    searchParams.get("outOfStock") === "true" && {
      key: "outOfStock",
      label: "Out of Stock",
    },
    /*
searchParams.get("expressDelivery") === "true" && {
key: "expressDelivery",
label: "Express Delivery",
},
searchParams.get("freeDelivery") === "true" && {
key: "freeDelivery",
label: "Free Delivery",
},
*/
    ...Array.from(searchParams.entries())
      .filter(([key, value]) => key.startsWith("attr_") && value)
      .map(([key, value]) => {
        const attributeKey = key.replace(/^attr_/, "");
        const label =
          attributeFacets?.find((a) => a.key === attributeKey)?.label ||
          capitalizeFirst(attributeKey);
        return {
          key,
          groupKey: key,
          label: `${label}: ${value.split(",").join(", ")}`,
        };
      }),
    (searchParams.get("minPrice") || searchParams.get("maxPrice")) && {
      key: "price",
      label: `Price: ₹${Number(searchParams.get("minPrice") || 0).toLocaleString("en-IN")} – ₹${Number(searchParams.get("maxPrice") || 150000).toLocaleString("en-IN")}`,
    },
    searchParams.get("q") && {
      key: "q",
      label: `Search: "${searchParams.get("q")}"`,
    },
  ]
    .flat()
    .filter(Boolean);

  const clearFiltersAction =
    activeFilters.length > 1 ? handleClearFilters : undefined;

  const isSearchMode = Boolean(searchParams.get("q"));
  const pageTitle = isSearchMode
    ? `Search: "${searchParams.get("q")}"`
    : searchParams.get("category")
      ? `${searchParams.get("category")} Products`
      : "All Products";

  const filterSections = [
    categoryOptions.length > 0 && {
      key: "category",
      title: "Category",
      content: (
        <OptionFilter
          name="category"
          options={categoryOptions}
          selected={parseMultiValue(searchParams.get("category"))}
          multiple
          onChange={(values) =>
            updateParam("category", serializeMultiValue(values))
          }
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
          selected={selectedBrands}
          multiple
          onChange={(values) =>
            updateParam("brand", serializeMultiValue(values))
          }
        />
      ),
    },
    collectionOptions.length > 0 && {
      key: "collectionIds",
      title: "Collections",
      content: (
        <OptionFilter
          name="collectionIds"
          options={collectionOptions}
          selected={parseMultiValue(searchParams.get("collectionIds"))}
          multiple
          onChange={(values) =>
            updateParam("collectionIds", serializeMultiValue(values))
          }
        />
      ),
    },
    // tagOptions.length > 0 && {
    // key: "tags",
    // title: "Tags",
    // content: (
    // <OptionFilter
    // name="tags"
    // options={tagOptions}
    // selected={parseMultiValue(searchParams.get("tags"))}
    // multiple
    // onChange={(values) =>
    // updateParam("tags", serializeMultiValue(values))
    // }
    // />
    // ),
    // },
    Object.values(productFacets.merchandising || {}).some(
      (count) => Number(count) > 0,
    ) && {
      key: "merchandising",
      title: "Discover",
      content: (
        <CheckboxListFilter
          name="merchandising"
          options={[
            {
              value: "featured",
              label: "Featured",
              count: productFacets.merchandising?.featured,
            },
            {
              value: "bestSeller",
              label: "Best Seller",
              count: productFacets.merchandising?.bestSeller,
            },
            {
              value: "newArrival",
              label: "New Arrival",
              count: productFacets.merchandising?.newArrival,
            },
          ].filter((option) => Number(option.count || 0) > 0)}
          selected={["featured", "bestSeller", "newArrival"].filter(
            (value) => searchParams.get(value) === "true",
          )}
          onChange={(values) => {
            const selectedValues = new Set(values);
            updateParams([
              ["featured", selectedValues.has("featured") ? "true" : undefined],
              [
                "bestSeller",
                selectedValues.has("bestSeller") ? "true" : undefined,
              ],
              [
                "newArrival",
                selectedValues.has("newArrival") ? "true" : undefined,
              ],
            ]);
          }}
        />
      ),
    },
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
            minLimit={absolutePriceLimits.min}
            maxLimit={absolutePriceLimits.max}
            onChange={handlePriceChange}
          />
        ),
      },
    Object.values(effectiveRatingCounts).some((count) => Number(count) > 0) && {
      key: "rating",
      title: "Rating",
      content: (
        <RatingFilter
          selected={selectedRatings}
          multiple
          counts={effectiveRatingCounts}
          onChange={(values) =>
            updateParam("rating", serializeMultiValue(values))
          }
        />
      ),
    },
    ...attributeFacets.map((attribute) => ({
      key: `attr_${attribute.key}`,
      title: attribute.label,
      content: (
        <OptionFilter
          name={`attr_${attribute.key}`}
          options={attribute.values}
          selected={parseMultiValue(searchParams.get(`attr_${attribute.key}`))}
          multiple
          onChange={(values) =>
            updateParam(`attr_${attribute.key}`, serializeMultiValue(values))
          }
        />
      ),
    })),

    availabilityCounts.inStock > 0 || availabilityCounts.outOfStock > 0
      ? {
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
              ].filter((option) => Number(option.count || 0) > 0)}
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
        }
      : false,
  ].filter(Boolean);

  return (
    <ProductListingLayout
      pageTitle={pageTitle}
      seoDescription="Browse products with filters, sort, and pagination."
      totalResults={pageInfo.total}
      pageSize={pageSize}
      sortValue={searchParams.get("sort") || ""}
      sortOptions={pageInfo.total <= 1 ? [] : SORT_OPTIONS}
      onSortChange={(value) => updateParam("sort", value)}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      filterSections={filterSections}
      activeFilters={activeFilters}
      onRemoveFilter={removeFilter}
      onClearFilters={clearFiltersAction}
      loading={
        (productState.loading && !products.length) ||
        (!firstLoadDone && !products.length)
      }
      refreshing={productState.loading && products.length > 0 && !isLoadingMore}
      error={products.length === 0 ? productState.error : null}
      empty={!products.length && !productState.loading && firstLoadDone}
      emptyTitle={isSearchMode ? "No results found" : "No Products Found"}
      emptyText={
        isSearchMode
          ? "Try different keywords or remove filters."
          : "Try adjusting your filters or browse other categories."
      }
      products={products}
      viewMode={viewMode}
      onAddToCart={addToCart}
      onWishlist={toggleWishlist}
      isWishlisted={isWishlisted}
      currentPage={currentPage}
      totalPages={totalPages}
      loadingMore={isLoadingMore}
      sentinelRef={sentinelRef}
    />
  );
}
