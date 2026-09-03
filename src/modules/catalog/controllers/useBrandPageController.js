import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../../modules/products/slices/productSlice";
import { fetchBrands } from "../../../features/catalog/catalogSlice";
import {
  buildRatingCountMap,
  getAvailabilityCounts,
  calculateAbsolutePriceLimits,
} from "../../../utils/ecommerce";
import {
  brandToSlug,
  parseMultiValue,
  slugToBrandName,
} from "../../../utils/ecommerce/brand";
import { getNormalizedAttributeFacets, getPagination } from "../../../utils/filterUtils";
import { getBrandName } from "../../../utils/pages/brandUtils";
import { getFilterSections } from "../../../modules/products/controllers/getFilterSections";
import { useCatalogFilters } from "../../../modules/products/controllers/useCatalogFilters";

export default function useBrandPageController() {
  const { brandSlug } = useParams();
  const decodedBrandSlug = decodeURIComponent(brandSlug || "");
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [brand, setBrand] = useState(null);
  const [brandLoading, setBrandLoading] = useState(true);
  const [brandError, setBrandError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [productFacets, setProductFacets] = useState({});
  const [facetsContextKey, setFacetsContextKey] = useState("");
  
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const sentinelRef = useRef(null);
  const productState = useSelector((s) => s.product);

  const selectedRatings = useMemo(
    () => parseMultiValue(searchParams.get("rating")),
    [searchParams],
  );

  const totalPages = pageInfo.totalPages || 1;
  const currentPage = pageInfo.page || 1;
  const availabilityCounts = useMemo(
    () => getAvailabilityCounts(items, productFacets),
    [items, productFacets],
  );
  const ratingCounts = useMemo(() => buildRatingCountMap(items), [items]);

  const attributeFacets = useMemo(
    () => getNormalizedAttributeFacets(productFacets?.attributes, true),
    [productFacets?.attributes],
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
      items,
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
  }, [productFacets?.price, items, currentContextKey, facetsContextKey]);

  useEffect(() => {
    setBrandLoading(true);
    setBrandError(null);
    setBrand(null);
    setItems([]);
    setFirstLoadDone(false);

    dispatch(fetchBrands({ limit: 100 }))
      .then((action) => {
        const data = action?.payload?.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.list)
              ? data.list
              : [];

        const matched = list.find((b) => {
          const name = b?.name || b?.brandName || b?.title || "";
          return (
            brandToSlug(name) === brandToSlug(decodedBrandSlug) ||
            name.toLowerCase() === decodedBrandSlug.toLowerCase()
          );
        });

        if (matched) {
          setBrand(matched);
        } else {
          // Fallback: fuzzy match by approximate name
          const nameGuess = slugToBrandName(decodedBrandSlug);
          const fuzzy = list.find(
            (b) =>
              (b?.name || b?.brandName || b?.title || "").toLowerCase() ===
              nameGuess.toLowerCase(),
          );
          if (fuzzy) {
            setBrand(fuzzy);
          } else {
            setBrandError("Brand Coming Soon");
          }
        }
        setBrandLoading(false);
      })
      .catch(() => {
        setBrandError("Failed to load brand");
        setBrandLoading(false);
      });
  }, [decodedBrandSlug, dispatch]);

  const brandName = getBrandName(brand) || slugToBrandName(brandSlug);

  const getParams = useCallback(
    (pageOverride) => {
      const params = {
        brand: brandName,
        minPrice: searchParams.get("minPrice") || undefined,
        maxPrice: searchParams.get("maxPrice") || undefined,
        sort: searchParams.get("sort") || undefined,
        inStock: searchParams.get("inStock") === "true" ? "true" : undefined,
        outOfStock:
          searchParams.get("outOfStock") === "true" ? "true" : undefined,
        page: pageOverride || 1,
        limit: Number(searchParams.get("limit") || 20),
      };
      searchParams.forEach((value, key) => {
        if (!key.startsWith("attr_") || !value) return;
        params[key] = value;
      });
      return params;
    },
    [searchParams, brandName],
  );

  const loadProducts = useCallback(
    async ({ page = 1, append = false } = {}) => {
      const params = getParams(page);
      if (append) setIsLoadingMore(true);
      const result = await dispatch(fetchProducts(params)).unwrap();
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

      const meta = getPagination(result, {
        page: params.page || 1,
        totalPages: 1,
        total: list.length || 0,
      });
      setPageInfo({
        page: Number(meta.page || meta.currentPage || 1),
        totalPages: Number(meta.totalPages || meta.pages || 1),
        total: Number(meta.total || meta.count || 0),
      });
      setProductFacets(result?.meta?.facets || result?.meta?.filters || {});
      setFacetsContextKey(ctxKey);
      setItems((prev) => (append ? [...prev, ...list] : list));
      setFirstLoadDone(true);
      setIsLoadingMore(false);
    },
    [dispatch, getParams, searchParams],
  );

  useEffect(() => {
    if (!brandName || brandLoading) return;
    loadProducts({ page: Number(searchParams.get("page") || 1) });
  }, [brandName, brandLoading, loadProducts, searchParams]);

  useEffect(() => {
    if (
      !sentinelRef.current ||
      !firstLoadDone ||
      productState.loading ||
      isLoadingMore ||
      currentPage >= totalPages
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadProducts({ page: currentPage + 1, append: true });
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px 300px 0px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [
    currentPage,
    firstLoadDone,
    isLoadingMore,
    loadProducts,
    productState.loading,
    totalPages,
  ]);

  const {
    updateParam,
    updateParams,
    handlePriceChange,
    removeFilter,
    clearFiltersAction,
    activeFilters,
  } = useCatalogFilters({
    attributeFacets,
    absolutePriceLimits,
    clearExceptions: ["brand"],
  });

  const filterSections = useMemo(() => {
    return getFilterSections({
      categoryOptions: [],
      brandOptions: [],
      collectionOptions: [],
      productFacets: productFacets || {},
      attributeFacets,
      availabilityCounts,
      absolutePriceLimits,
      effectiveRatingCounts: {},
      searchParams,
      updateParam,
      updateParams,
      handlePriceChange,
    });
  }, [
    productFacets,
    attributeFacets,
    availabilityCounts,
    absolutePriceLimits,
    searchParams,
    updateParam,
    updateParams,
    handlePriceChange,
  ]);

  return {
    brandSlug,
    decodedBrandSlug,
    brand,
    brandLoading,
    brandError,
    brandName,
    items,
    pageInfo,
    productState,
    firstLoadDone,
    isLoadingMore,
    sidebarOpen,
    setSidebarOpen,
    sentinelRef,
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
