import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPublicDealProducts } from "../../../api/deals";
import {
  buildRatingCountMap,
  getAvailabilityCounts,
  sortProducts,
} from "../../../utils/ecommerce";
import {
  parseMultiValue,
  unwrapProducts,
  getPagination,
  getResponseFacets,
  getFacetList,
  normalizeFacetOption,
  formatCategoryOptionsForTree,
} from "../../../utils/filterUtils";
import { getFilterSections } from "../../../modules/products/controllers/getFilterSections";
import { useCatalogFilters } from "../../../modules/products/controllers/useCatalogFilters";
import { getRootCategories } from "../../../utils/pages/categoryUtils";

export default function useDealsPageController() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dealFacets, setDealFacets] = useState({});

  const sentinelRef = useRef(null);

  const selectedBrands = useMemo(
    () => parseMultiValue(searchParams.get("brand")),
    [searchParams],
  );

  const selectedRatings = useMemo(
    () => parseMultiValue(searchParams.get("rating")),
    [searchParams],
  );

  const availabilityCounts = useMemo(
    () => getAvailabilityCounts(products, dealFacets),
    [dealFacets, products],
  );

  const ratingCounts = useMemo(() => buildRatingCountMap(products), [products]);

  const dealCategoryOptions = useMemo(
    () =>
      getFacetList(dealFacets, ["categories", "category"])
        .map(normalizeFacetOption)
        .filter(Boolean),
    [dealFacets],
  );

  const dealBrandOptions = useMemo(
    () =>
      getFacetList(dealFacets, ["brands", "brand"])
        .map(normalizeFacetOption)
        .filter(Boolean),
    [dealFacets],
  );

  const dealRatingCounts = useMemo(() => {
    const ratings = getFacetList(dealFacets, ["ratings", "rating"]);
    return ratings.reduce((counts, option) => {
      const value =
        option.value ?? option.rating ?? option.stars ?? option.key ?? "";
      if (value) counts[String(value)] = option.count ?? option.doc_count ?? 0;
      return counts;
    }, {});
  }, [dealFacets]);

  const catalogCategoryList = useSelector((state) => state.catalog?.list || state.catalog?.globalCategories) || [];

  const categoryOptions = useMemo(() => {
    return dealCategoryOptions.filter(
      (option) => Number(option.count || 0) > 0,
    );
  }, [dealCategoryOptions]);

  const brandOptions = dealBrandOptions.filter(
    (option) => Number(option.count || 0) > 0,
  );

  const effectiveRatingCounts = Object.keys(dealRatingCounts).length
    ? dealRatingCounts
    : ratingCounts;

  const pageSize = Number(searchParams.get("limit") || 12);
  const currentPage = Number(pageInfo.page || 1);
  const totalPages = Number(pageInfo.totalPages || 1);

  const getParams = useCallback(
    (pageOverride) => ({
      page: pageOverride || 1,
      limit: pageSize,
      category: searchParams.get("category") || undefined,
      brand: searchParams.get("brand") || undefined,
      sort: searchParams.get("sort") || "ending_soon",
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      rating: searchParams.get("rating") || undefined,
      inStock: searchParams.get("inStock") === "true" ? "true" : undefined,
      outOfStock:
        searchParams.get("outOfStock") === "true" ? "true" : undefined,
    }),
    [pageSize, searchParams],
  );

  const loadDeals = useCallback(
    async ({ page = 1, append = false } = {}) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError("");

      try {
        const params = getParams(page);
        const response = await getPublicDealProducts(params);
        const rawList = unwrapProducts(response);
        const sortKey = params.sort || searchParams.get("sort") || "";
        const list = sortProducts(rawList, sortKey);
        const pagination = getPagination(response, {
          page,
          limit: pageSize,
          total: list.length,
          totalPages: 1,
        });

        setProducts((current) =>
          append ? sortProducts([...current, ...list], sortKey) : list,
        );
        setDealFacets(getResponseFacets(response));
        setPageInfo({
          page: Number(pagination.page || page),
          totalPages: Number(pagination.totalPages || pagination.pages || 1),
          total: Number(pagination.total || list.length || 0),
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load deal products",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setFirstLoadDone(true);
      }
    },
    [getParams, pageSize, searchParams],
  );

  useEffect(() => {
    loadDeals({ page: Number(searchParams.get("page") || 1), append: false });
  }, [loadDeals, searchParams]);

  useEffect(() => {
    if (
      !sentinelRef.current ||
      !firstLoadDone ||
      loading ||
      loadingMore ||
      currentPage >= totalPages
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadDeals({ page: currentPage + 1, append: true });
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px 300px 0px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [currentPage, firstLoadDone, loadDeals, loading, loadingMore, totalPages]);

  const {
    updateParam,
    updateParams,
    handlePriceChange,
    removeFilter,
    clearFiltersAction,
    activeFilters,
  } = useCatalogFilters({
    attributeFacets: [],
    absolutePriceLimits: {
      min: dealFacets.priceStats?.min ?? dealFacets.price?.min ?? 0,
      max: dealFacets.priceStats?.max ?? dealFacets.price?.max ?? 150000,
    },
    clearExceptions: [],
  });

  const filterSections = useMemo(() => {
    return getFilterSections({
      categoryOptions,
      brandOptions,
      collectionOptions: [],
      productFacets: dealFacets,
      attributeFacets: [],
      availabilityCounts,
      absolutePriceLimits: {
        min: dealFacets.priceStats?.min ?? dealFacets.price?.min,
        max: dealFacets.priceStats?.max ?? dealFacets.price?.max,
      },
      effectiveRatingCounts,
      searchParams,
      updateParam,
      updateParams,
      handlePriceChange,
    });
  }, [
    categoryOptions,
    brandOptions,
    dealFacets,
    availabilityCounts,
    effectiveRatingCounts,
    searchParams,
    updateParam,
    updateParams,
    handlePriceChange,
  ]);

  return {
    products,
    pageInfo,
    loading,
    loadingMore,
    error,
    firstLoadDone,
    sidebarOpen,
    setSidebarOpen,
    sentinelRef,
    pageSize,
    currentPage,
    totalPages,
    updateParam,
    removeFilter,
    clearFiltersAction,
    activeFilters,
    filterSections,
    searchParams,
  };
}
