import { readSearchPage, appendSearchProducts } from "./searchPagination";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSearch,
  clearSuggestions,
  searchCatalog,
} from "../../../features/search/searchSlice";
import { sanitizeSearchQuery } from "../../../validations";
import { parseMultiValue, serializeMultiValue, flattenCategoryList, getClearFiltersAction, getFacetList, normalizeFacetOption, getNormalizedAttributeFacets, formatCategoryOptionsForTree } from "../../../utils/filterUtils";
import { capitalizeFirst } from "../../../utils/stringUtils";
import { buildRatingCountMap, getAvailabilityCounts, sortProducts } from "../../../utils/ecommerce";
import { scrollToTop } from "../../../utils/common";
import { getFilterSections } from "../../../modules/products/controllers/getFilterSections";
import { useCatalogFilters } from "../../../modules/products/controllers/useCatalogFilters";
import { useStickyFacet } from "../../../modules/products/controllers/useFacetCache";
import { fetchCategories } from "../../../features/catalog/catalogSlice";

export default function useSearchPageController() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKey = searchParams.toString();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const searchState = useSelector((s) => s.search);
  const [loadedProducts, setLoadedProducts] = useState([]);
  const [pageMeta, setPageMeta] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const requestRef = useRef(null);
  const generationRef = useRef(0);
  const autoPausedRef = useRef(false);
  const sentinelRef = useRef(null);
  const globalCategories = useSelector((state) => state.catalog?.globalCategories);
  const categoriesRaw = useMemo(
    () => (Array.isArray(globalCategories) ? globalCategories : []),
    [globalCategories],
  );
  useEffect(() => {
    if (!categoriesRaw.length) dispatch(fetchCategories());
  }, [categoriesRaw.length, dispatch]);
  const facets = searchState.facets || {};
  const sort = searchParams.get("sort") || "";

  const hits = useMemo(() => {
    return sortProducts(loadedProducts, sort);
  }, [loadedProducts, sort]);

  const availabilityCounts = useMemo(
    () => getAvailabilityCounts(hits, facets),
    [facets, hits]
  );

  const ratingCounts = useMemo(() => buildRatingCountMap(hits), [hits]);

  const ratingOptions = useMemo(() => {
    if (Array.isArray(facets.ratings)) {
      return facets.ratings
        .map((option) => ({
          value: String(option.value),
          label: option.label || `${option.value} & Above`,
          count: Number(option.count || 0),
        }))
        .filter((option) => option.value && option.count > 0);
    }
    return [5, 4, 3, 2, 1]
      .map((stars) => ({
        value: String(stars),
        label: stars === 5 ? "5" : `${stars} & Above`,
        count: ratingCounts[String(stars)] || 0,
      }))
      .filter((option) => option.count > 0);
  }, [facets.ratings, ratingCounts]);

  const availabilityOptions = useMemo(
    () =>
      [
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
      ].filter((option) => option.count > 0),
    [availabilityCounts]
  );

  const categories = useMemo(
    () => flattenCategoryList(categoriesRaw),
    [categoriesRaw]
  );

  const meta = pageMeta || {};
  const totalPages = meta.totalPages || meta.pages || 1;
  const initialPage = Math.max(1, Number(searchParams.get("page") || 1));
  const currentPage = pageMeta?.page || initialPage;
  const q = sanitizeSearchQuery(searchParams.get("q") || "");
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const minRating = searchParams.get("rating") || "";
  const selectedRatings = useMemo(
    () => parseMultiValue(minRating),
    [minRating]
  );
  const inStock = searchParams.get("inStock") === "true";
  const outOfStock = searchParams.get("outOfStock") === "true";

  const limit = Number(searchParams.get("limit") || 10);
  const categoryValue =
    searchParams.get("categoryId") ||
    searchParams.get("category") ||
    searchParams.get("categorySlug") ||
    "";
  const hasLegacyCategoryParams =
    searchParams.has("category") || searchParams.has("categorySlug");

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) =>
          category?.categoryId === categoryValue ||
          category?.categoryKey === categoryValue ||
          category?.key === categoryValue ||
          category?.id === categoryValue ||
          category?._id === categoryValue ||
          category?.slug === categoryValue
      ),
    [categories, categoryValue]
  );

  const categoryLabel =
    searchParams.get("categoryName") ||
    selectedCategory?.title ||
    selectedCategory?.name ||
    selectedCategory?.label ||
    categoryValue;

  const params = useMemo(() => {
    const next = {
      q,
      categoryId: categoryValue || undefined,
      brand: searchParams.get("brand") || undefined,
      tags: searchParams.get("tags") || undefined,
      collectionIds: searchParams.get("collectionIds") || undefined,
      featured: searchParams.get("featured") || undefined,
      bestSeller: searchParams.get("bestSeller") || undefined,
      newArrival: searchParams.get("newArrival") || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      rating: minRating || undefined,
      inStock: inStock ? "true" : undefined,
      outOfStock: outOfStock ? "true" : undefined,
      sort: sort || undefined,
      page: initialPage,
      limit,
    };
    searchParams.forEach((value, key) => {
      if (key.startsWith("attr_") && value) next[key] = value;
    });
    return next;
  }, [
    categoryValue,
    initialPage,
    inStock,
    limit,
    maxPrice,
    minPrice,
    minRating,
    outOfStock,
    q,
    searchKey,
    searchParams,
    sort,
  ]);

  useEffect(() => {
    if (hasLegacyCategoryParams) return;

    if (!params.q && !params.categoryId) {
      dispatch(clearSearch());
      navigate("/products", { replace: true });
      return;
    }

    const generation = ++generationRef.current;
    setLoadedProducts([]);
    setPageMeta(null);
    setExhausted(false);
    setIsLoadingMore(false);
    autoPausedRef.current = false;
    const request = dispatch(searchCatalog({ params, cacheKey: `search-list-${JSON.stringify(params)}` }));
    requestRef.current = request;
    request.unwrap().then(payload => {
      if (generationRef.current !== generation) return;
      const result = readSearchPage(payload, params);
      setLoadedProducts(result.items);
      setPageMeta(result.meta);
      setExhausted(!result.items.length || result.meta.page >= result.meta.totalPages);
    }).catch(() => {}).finally(() => {
      if (requestRef.current === request) requestRef.current = null;
    });
    return () => {
      generationRef.current++;
      requestRef.current?.abort?.();
      requestRef.current = null;
    };
  }, [dispatch, hasLegacyCategoryParams, params, searchKey]);

  useEffect(() => {
    if (!categoryValue) return;
    if (
      searchParams.get("categoryId") === categoryValue &&
      !hasLegacyCategoryParams
    ) {
      return;
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("categoryId", categoryValue);
        next.delete("category");
        next.delete("categorySlug");
        return next;
      },
      { replace: true }
    );
  }, [categoryValue, hasLegacyCategoryParams, searchKey, searchParams, setSearchParams]);

  useEffect(
    () => () => {
      dispatch(clearSearch());
      dispatch(clearSuggestions());
    },
    [dispatch]
  );

  const attributeFacets = useMemo(
    () => getNormalizedAttributeFacets(facets.attributes),
    [facets.attributes]
  );

  const {
    updateParam,
    updateParams,
    handlePriceChange,
    removeFilter: defaultRemoveFilter,
    handleClearFilters,
    activeFilters: defaultActiveFilters,
    clearFiltersAction,
  } = useCatalogFilters({
    attributeFacets,
    absolutePriceLimits: {
      min: facets.priceStats?.min ?? facets.price?.min ?? 0,
      max: facets.priceStats?.max ?? facets.price?.max ?? 150000,
    },
    clearExceptions: ["q", "categoryId", "categorySlug", "categoryName"],
  });

  const setPage = (page) => setSearchParams(prev => { const next = new URLSearchParams(prev); next.set("page", String(page)); return next; });

  const removeFilter = (key, filter) => {
    if (key === "categoryId" || key === "q") {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (key === "q") next.delete("q");
        if (key === "categoryId") {
          next.delete("categoryId");
          next.delete("categorySlug");
          next.delete("categoryName");
        }
        next.delete("page");
        return next;
      });
      scrollToTop();
      return;
    }
    defaultRemoveFilter(key, filter);
  };

  const catalogCategoryList = categoriesRaw;

  const categoryOptions = useMemo(() => {
    const options = getFacetList(facets, ["categories", "category"])
      .map(normalizeFacetOption)
      .filter((option) => option.value && option.label && option.count > 0);
    return formatCategoryOptionsForTree(options, catalogCategoryList);
  }, [catalogCategoryList, facets]);

  const brandContextKey = useMemo(() => {
    const p = new URLSearchParams(searchParams);
    p.delete("brand");
    p.delete("page");
    return p.toString();
  }, [searchParams]);

  const rawBrandOptions = useMemo(() => {
    return getFacetList(facets, ["brands", "brand"])
      .map(normalizeFacetOption)
      .filter((option) => option.value && option.label && option.count > 0);
  }, [facets]);

  const brandOptions = useStickyFacet(
    rawBrandOptions,
    parseMultiValue(searchParams.get("brand")),
    brandContextKey
  );

  const {
    updateParam,
    updateParams,
    handlePriceChange,
    removeFilter: defaultRemoveFilter,
    handleClearFilters,
    activeFilters: defaultActiveFilters,
    clearFiltersAction,
  } = useCatalogFilters({
    attributeFacets,
    brandOptions,
    categoryOptions,
    absolutePriceLimits: {
      min: facets.priceStats?.min ?? facets.price?.min ?? 0,
      max: facets.priceStats?.max ?? facets.price?.max ?? 150000,
    },
    clearExceptions: ["q", "categoryId", "categorySlug", "categoryName"],
  });

  const setPage = (p) => updateParam("page", p);

  const removeFilter = (key, filter) => {
    if (key === "categoryId" || key === "q") {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (key === "q") next.delete("q");
        if (key === "categoryId") {
          next.delete("categoryId");
          next.delete("categorySlug");
          next.delete("categoryName");
        }
        next.delete("page");
        return next;
      });
      scrollToTop();
      return;
    }
    defaultRemoveFilter(key, filter);
  };


  const collectionOptions = useMemo(
    () =>
      (facets.collections || []).filter(
        (option) => option.value && Number(option.count || 0) > 0
      ),
    [facets.collections]
  );
  const tagOptions = useMemo(
    () =>
      (facets.tags || []).filter(
        (option) => option.value && Number(option.count || 0) > 0
      ),
    [facets.tags]
  );

  useEffect(() => {
    if (!hits.length) return;
    const validRatings = new Set(ratingOptions.map((option) => option.value));
    const nextRatings = selectedRatings.filter((rating) =>
      validRatings.has(String(rating))
    );
    const shouldRemoveInStock = inStock && availabilityCounts.inStock <= 0;
    const shouldRemoveOutOfStock =
      outOfStock && availabilityCounts.outOfStock <= 0;

    if (
      nextRatings.length === selectedRatings.length &&
      !shouldRemoveInStock &&
      !shouldRemoveOutOfStock
    ) {
      return;
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const serializedRatings = serializeMultiValue(nextRatings);
        if (serializedRatings) next.set("rating", serializedRatings);
        else next.delete("rating");
        if (shouldRemoveInStock) next.delete("inStock");
        if (shouldRemoveOutOfStock) next.delete("outOfStock");
        next.delete("page");
        return next;
      },
      { replace: true }
    );
  }, [
    availabilityCounts.inStock,
    availabilityCounts.outOfStock,
    hits.length,
    inStock,
    outOfStock,
    ratingOptions,
    selectedRatings,
    setSearchParams,
  ]);

  const activeFilters = defaultActiveFilters;

  const filterSections = useMemo(() => {
    return getFilterSections({
      categoryOptions,
      brandOptions,
      collectionOptions,
      tagOptions,
      productFacets: facets,
      attributeFacets,
      availabilityCounts,
      absolutePriceLimits: {
        min: facets.priceStats?.min ?? facets.price?.min,
        max: facets.priceStats?.max ?? facets.price?.max,
      },
      effectiveRatingCounts: ratingCounts,
      searchParams,
      updateParam,
      updateParams,
      handlePriceChange,
    });
  }, [
    categoryOptions,
    brandOptions,
    collectionOptions,
    tagOptions,
    facets,
    attributeFacets,
    availabilityCounts,
    ratingCounts,
    searchParams,
    updateParam,
    updateParams,
    handlePriceChange,
  ]);

  const loadMore = useCallback((automatic = false) => {
    if (requestRef.current || searchState.loading || !pageMeta || exhausted || currentPage >= totalPages) return;
    if (automatic && autoPausedRef.current) return;
    autoPausedRef.current = false;
    const generation = generationRef.current;
    const nextParams = { ...params, page: currentPage + 1 };
    setIsLoadingMore(true);
    const request = dispatch(searchCatalog({ params: nextParams, cacheKey: `search-list-${JSON.stringify(nextParams)}` }));
    requestRef.current = request;
    request.unwrap().then(payload => {
      if (generationRef.current !== generation) return;
      const result = readSearchPage(payload, nextParams);
      const merged = appendSearchProducts(loadedProducts, result.items);
      setLoadedProducts(merged);
      setPageMeta(result.meta);
      setExhausted(merged.length === loadedProducts.length || !result.items.length || result.meta.page >= result.meta.totalPages);
    }).catch(() => {
      if (generationRef.current === generation) autoPausedRef.current = true;
    }).finally(() => {
      if (requestRef.current === request) requestRef.current = null;
      if (generationRef.current === generation) setIsLoadingMore(false);
    });
  }, [searchState.loading, pageMeta, exhausted, currentPage, totalPages, params, dispatch, loadedProducts]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !pageMeta || exhausted || isLoadingMore || searchState.loading || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) loadMore(true);
    }, { rootMargin: "400px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, pageMeta, exhausted, isLoadingMore, searchState.loading]);

  return {
    q,
    categoryValue,
    categoryLabel,
    meta,
    limit,
    sort,
    hits,
    currentPage,
    totalPages: exhausted ? currentPage : totalPages,
    searchState,
    sidebarOpen,
    setSidebarOpen,
    updateParam,
    updateParams,
    handlePriceChange,
    setPage,
    removeFilter,
    clearFiltersAction,
    activeFilters,
    filterSections,
    onLoadMore: () => loadMore(false),
    sentinelRef,
    loadingMore: isLoadingMore,
  };
}
