import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useCartActions, useWishlistActions } from "./actions";
import { fetchProducts } from "../slices/productSlice";
import {
  buildRatingCountMap,
  getAvailabilityCounts,
  calculateAbsolutePriceLimits,
  getProductListFromResponse,
  sortProducts,
} from "../../../utils/ecommerce";
import {
  parseMultiValue,
  serializeMultiValue,
  getFacetList,
  normalizeFacetOption,
  formatCategoryOptionsForTree,
  getPagination,
} from "../../../utils/filterUtils";
import { capitalizeFirst } from "../../../utils/stringUtils";
import { getFilterSections } from "./getFilterSections";
import { decodeProductFilterToken } from "../utils/productFilterToken";
import { useCatalogFilters } from "./useCatalogFilters";
import { getRootCategories } from "../../../utils/pages/categoryUtils";

export function useProductsPageController() {
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
  const [globalPriceLimits, setGlobalPriceLimits] = useState({
    min: 0,
    max: 0,
  });
  const sentinelRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const productState = useSelector((s) => s.product);
  const addToCart = useCartActions();
  const { isWishlisted, toggleWishlist } = useWishlistActions();
  const catalogCategoryList =
    useSelector(
      (state) => state.catalog?.list || state.catalog?.globalCategories,
    ) || [];
  const hiddenParams = useMemo(
    () => decodeProductFilterToken(searchParams.get("f")),
    [searchParams],
  );

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
  const effectiveSort = searchParams.get("sort") || hiddenParams.sort || "";
  const pageSize = Number(
    searchParams.get("limit") || hiddenParams.limit || 12,
  );

  const availabilityCounts = useMemo(
    () => getAvailabilityCounts(products, productFacets),
    [products, productFacets],
  );

  const ratingCounts = useMemo(() => buildRatingCountMap(products), [products]);

  const facetCategoryOptions = useMemo(
    () =>
      getFacetList(productFacets, ["category", "categories"]).map(
        normalizeFacetOption,
      ),
    [productFacets],
  );

  const facetBrandOptions = useMemo(
    () =>
      getFacetList(productFacets, ["brand", "brands"]).map(
        normalizeFacetOption,
      ),
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
        .filter((attribute) => attribute.variant === true)
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
    const p = new URLSearchParams();
    if (searchParams.has("category"))
      p.set("category", searchParams.get("category"));
    if (searchParams.has("q")) p.set("q", searchParams.get("q"));
    if (searchParams.has("collectionIds"))
      p.set("collectionIds", searchParams.get("collectionIds"));
    return p.toString();
  }, [searchParams]);

  const absolutePriceLimits = useMemo(() => {
    if (
      productFacets?.price_range?.min !== undefined &&
      productFacets?.price_range?.max !== undefined
    ) {
      return {
        min: productFacets.price_range.min,
        max: productFacets.price_range.max,
      };
    }
    return globalPriceLimits.max > 0
      ? globalPriceLimits
      : calculateAbsolutePriceLimits(products);
  }, [productFacets?.price_range, globalPriceLimits, products]);

  const categoryOptions = useMemo(() => {
    if (facetCategoryOptions.length) return facetCategoryOptions;
    const seen = new Set();
    return products
      .map((p) => p.category)
      .filter((cat) => cat && !seen.has(cat) && seen.add(cat))
      .map((cat) => ({
        value: cat,
        label: capitalizeFirst(cat.replace(/-/g, " ")),
        count: undefined,
      }));
  }, [facetCategoryOptions, products]);

  const brandOptions = useMemo(() => {
    if (facetBrandOptions.length) return facetBrandOptions;
    const seen = new Set();
    return products
      .map((p) => p.brand)
      .filter((b) => b && !seen.has(b) && seen.add(b))
      .map((brand) => ({
        value: brand,
        label: capitalizeFirst(brand),
        count: undefined,
      }));
  }, [facetBrandOptions, products]);

  const getParams = useCallback(() => {
    const params = { ...hiddenParams };
    for (const [key, value] of searchParams.entries()) {
      if (key === "f") continue;
      if (params[key]) {
        params[key] = [].concat(params[key], value);
      } else {
        params[key] = value;
      }
    }
    return params;
  }, [hiddenParams, searchParams]);

  const mergeUniqueProducts = useCallback(
    (currentItems = [], nextItems = []) => {
      const seen = new Set();
      return [...currentItems, ...nextItems].filter((product, index) => {
        const key =
          product?._id || product?.id || product?.slug || `product-${index}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    [],
  );

  const {
    updateParam,
    updateParams,
    handlePriceChange,
    removeFilter,
    handleClearFilters,
    activeFilters,
    clearFiltersAction,
  } = useCatalogFilters({
    attributeFacets,
    absolutePriceLimits,
    clearExceptions: ["q", "collectionIds", "f"],
  });

  const handleFilterChange = useCallback(
    (key, value) => updateParam(key, value),
    [updateParam],
  );

  const handlePriceFilterChange = useCallback(
    (min, max) => handlePriceChange(min, max),
    [handlePriceChange],
  );

  const handleSortChange = useCallback(
    (value) => updateParam("sort", value),
    [updateParam],
  );

  const clearAllFilters = useCallback(() => {
    handleClearFilters();
  }, [handleClearFilters]);

  // Fetch products whenever search params change
  useEffect(() => {
    const seq = ++requestSequenceRef.current;
    const params = { ...getParams(), page: 1, limit: pageSize };
    setIsLoadingMore(true);

    const timer = setTimeout(() => {
      dispatch(fetchProducts(params))
        .unwrap()
        .then((payload) => {
          if (seq !== requestSequenceRef.current) return;
          const list = getProductListFromResponse(payload);
          const sorted = sortProducts(list, params.sort);

          const newContextKey = currentContextKey;
          setItems(sorted);
          setIsLoadingMore(false);

          setGlobalPriceLimits((prev) => {
            if (prev.max === 0) return calculateAbsolutePriceLimits(sorted);
            return prev;
          });

          setFirstLoadDone(true);
          setPageInfo(getPagination(payload, sorted));

          if (newContextKey !== facetsContextKey) {
            const facets = payload?.data?.facets || payload?.facets || {};
            setProductFacets(facets);
            setFacetsContextKey(newContextKey);
          }
        })
        .catch(() => {
          if (seq !== requestSequenceRef.current) return;
          setIsLoadingMore(false);
          setFirstLoadDone(true);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, searchParams, getParams, currentContextKey, pageSize]);

  const loadNextPage = useCallback(() => {
    if (isLoadingMore || !firstLoadDone || currentPage >= totalPages) return;
    const seq = requestSequenceRef.current;
    const nextPage = currentPage + 1;
    const params = { ...getParams(), page: nextPage, limit: pageSize };
    setIsLoadingMore(true);

    dispatch(fetchProducts(params))
      .unwrap()
      .then((payload) => {
        if (seq !== requestSequenceRef.current) return;
        const list = getProductListFromResponse(payload);
        const sorted = sortProducts(list, params.sort);
        setItems((prev) => mergeUniqueProducts(prev, sorted));
        setPageInfo(getPagination(payload, sorted));
        setIsLoadingMore(false);
      })
      .catch(() => {
        if (seq !== requestSequenceRef.current) return;
        setIsLoadingMore(false);
      });
  }, [
    currentPage,
    dispatch,
    firstLoadDone,
    getParams,
    isLoadingMore,
    mergeUniqueProducts,
    pageSize,
    totalPages,
  ]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || currentPage >= totalPages) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadNextPage();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [currentPage, loadNextPage, totalPages]);

  const isSearchMode = Boolean(searchParams.get("q"));
  const pageTitle = isSearchMode
    ? 'Search: "' + searchParams.get("q") + '"'
    : searchParams.get("category")
      ? searchParams.get("category") + " Products"
      : "All Products";

  const filterSections = getFilterSections({
    categoryOptions,
    brandOptions,
    collectionOptions,
    productFacets,
    attributeFacets,
    availabilityCounts,
    absolutePriceLimits,
    effectiveRatingCounts,
    searchParams,
    updateParam,
    updateParams,
    handlePriceChange,
  });

  return {
    searchParams,
    setSearchParams,
    effectiveSort,
    viewMode,
    sidebarOpen,
    setSidebarOpen,
    products,
    availabilityCounts,
    attributeFacets,
    collectionOptions,
    absolutePriceLimits,
    categoryOptions,
    brandOptions,
    effectiveRatingCounts,
    handleFilterChange,
    handlePriceFilterChange,
    clearAllFilters,
    handleSortChange,
    productState,
    isLoadingMore,
    totalPages,
    currentPage,
    pageSize,
    sentinelRef,
    addToCart,
    isWishlisted,
    toggleWishlist,
    filterSections,
    activeFilters,
    removeFilter,
    clearFiltersAction,
    pageTitle,
  };
}
