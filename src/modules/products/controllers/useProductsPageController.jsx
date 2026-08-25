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
} from "../../../utils/filterUtils";
import { capitalizeFirst } from "../../../utils/stringUtils";
import { getFilterSections } from "./getFilterSections";
import { getActiveFilters } from "./getActiveFilters";
import { decodeProductFilterToken } from "../utils/productFilterToken";

export function useProductsPageController() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [productFacets, setProductFacets] = useState({});
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [facetsContextKey, setFacetsContextKey] = useState("");
  const sentinelRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const productState = useSelector((s) => s.product);
  const addToCart = useCartActions();
  const { isWishlisted, toggleWishlist } = useWishlistActions();
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
  const pageSize = Number(searchParams.get("limit") || hiddenParams.limit || 12);

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
      getFacetList(productFacets, ["brand", "brands"]).map(normalizeFacetOption),
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
    const p = new URLSearchParams(searchParams);
    p.delete("minPrice");
    p.delete("maxPrice");
    p.delete("page");
    return p.toString();
  }, [searchParams]);

  const absolutePriceLimits = useMemo(
    () => calculateAbsolutePriceLimits(products),
    [products],
  );

  const categoryOptions = useMemo(() => {
    if (facetCategoryOptions.length) return facetCategoryOptions;
    const seen = new Set();
    return products
      .map((p) => p.category)
      .filter((cat) => cat && !seen.has(cat) && seen.add(cat))
      .map((cat) => ({
        value: cat,
        label: capitalizeFirst(cat.replace(/-/g, " ")),
        count: products.filter((p) => p.category === cat).length,
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
        count: products.filter((p) => p.brand === brand).length,
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

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const updateParam = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

  const handlePriceChange = useCallback(
    (min, max) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (min != null) next.set("minPrice", String(min));
        else next.delete("minPrice");
        if (max != null) next.set("maxPrice", String(max));
        else next.delete("maxPrice");
        next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

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

  // Fetch products whenever search params change
  useEffect(() => {
    const seq = ++requestSequenceRef.current;
    const params = getParams();
    setIsLoadingMore(true);

    dispatch(fetchProducts(params))
      .unwrap()
      .then((payload) => {
        if (seq !== requestSequenceRef.current) return;
        const list = getProductListFromResponse(payload);
        const sorted = sortProducts(list, params.sort);

        const newContextKey = currentContextKey;
        setItems(sorted);
        setIsLoadingMore(false);
        setFirstLoadDone(true);

        const meta =
          payload?.data?.meta ||
          payload?.data?.pagination ||
          payload?.meta ||
          payload?.pagination ||
          {};
        setPageInfo({
          page: meta.page ?? meta.currentPage ?? 1,
          totalPages: meta.totalPages ?? meta.pages ?? 1,
          total: meta.total ?? meta.count ?? sorted.length,
        });

        if (newContextKey !== facetsContextKey) {
          const facets =
            payload?.data?.facets || payload?.facets || {};
          setProductFacets(facets);
          setFacetsContextKey(newContextKey);
        }
      })
      .catch(() => {
        if (seq !== requestSequenceRef.current) return;
        setIsLoadingMore(false);
      });
  }, [dispatch, searchParams, getParams, currentContextKey]);

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

  const activeFilters = getActiveFilters(searchParams, attributeFacets);

  const clearFiltersAction =
    activeFilters.length > 1 ? handleClearFilters : undefined;

  const isSearchMode = Boolean(searchParams.get("q"));
  const pageTitle = isSearchMode
    ? "Search: \"" + searchParams.get("q") + "\""
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
    clearFiltersAction,
    pageTitle,
  };
}
