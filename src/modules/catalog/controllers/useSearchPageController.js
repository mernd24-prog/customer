import { useEffect, useMemo, useState, useRef } from "react";
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
import { getRootCategories } from "../../../utils/pages/categoryUtils";

export default function useSearchPageController() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKey = searchParams.toString();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const searchState = useSelector((s) => s.search);
  const categoriesRaw = useSelector((s) => s.catalog.list) || [];
  const facets = searchState.facets || {};
  const sort = searchParams.get("sort") || "";

  const hits = useMemo(() => {
    const rawHits = Array.isArray(searchState.hits) ? searchState.hits : [];
    return sortProducts(rawHits, sort);
  }, [searchState.hits, sort]);

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

  const meta = searchState.meta || {};
  const totalPages = meta.totalPages || meta.pages || 1;
  const currentPage = Number(searchParams.get("page") || 1);
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

  const limit = Number(searchParams.get("limit") || 20);
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
      page: currentPage,
      limit,
    };
    searchParams.forEach((value, key) => {
      if (key.startsWith("attr_") && value) next[key] = value;
    });
    return next;
  }, [
    categoryValue,
    currentPage,
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

    dispatch(
      searchCatalog({
        params,
        cacheKey: `search-list-${JSON.stringify(params)}`,
      })
    ).catch(() => { });
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

  const catalogCategoryList = useSelector((state) => state.catalog?.list || state.catalog?.globalCategories) || [];

  const categoryOptions = useMemo(() => {
    return getFacetList(facets, ["categories", "category"])
      .map(normalizeFacetOption)
      .filter((option) => option.value && option.label && option.count > 0);
  }, [facets]);

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
      categoryOptions: [],
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

  return {
    q,
    categoryValue,
    categoryLabel,
    meta,
    limit,
    sort,
    hits,
    currentPage,
    totalPages,
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
  };
}
