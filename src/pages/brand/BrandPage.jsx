import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Store } from "lucide-react";
import Seo from "../../components/ui/Seo";
import {
  Breadcrumbs,
  ProductListingLayout,
  CheckboxListFilter,
  OptionFilter,
  PriceRangeFilter,
  RatingFilter,
} from "../../components/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { fetchProducts } from "../../features/product/productSlice";
import { fetchBrands } from "../../features/catalog/catalogSlice";
import {
  buildRatingCountMap,
  getImageUrlFromValue,
  getProductPrice,
  isProductInStock,
  getAvailabilityCounts,
  calculateAbsolutePriceLimits,
} from "../../utils/ecommerce";
import {
  brandToSlug,
  parseMultiValue,
  serializeMultiValue,
  slugToBrandName,
} from "../../utils/ecommerce/brand";
import { getBrandName, getBrandLogo } from "../../utils/pages/brandUtils";
import { capitalizeFirst } from "../../utils/stringUtils";
import LoadingSkeleton from "../../components/ecommerce/BrandLoadingSkeleton";
import { useSearchParamHelper } from "../../hooks/useSearchParamsHelper";
import { PAGE_SIZES, SORT_OPTIONS } from "../../constants/data.constant";

export default function BrandPage() {
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
  const { updateSearchParams } = useSearchParamHelper(setSearchParams);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const sentinelRef = useRef(null);
  const productState = useSelector((s) => s.product);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const selectedRatings = useMemo(
    () => parseMultiValue(searchParams.get("rating")),
    [searchParams],
  );

  const totalPages = pageInfo.totalPages || 1;
  const currentPage = pageInfo.page || 1;
  const availabilityCounts = useMemo(
    () => getAvailabilityCounts(items),
    [items]
  );
  const ratingCounts = useMemo(() => buildRatingCountMap(items), [items]);
  const hasRatingFilter = useMemo(
    () => Object.values(ratingCounts).some((count) => Number(count) > 0),
    [ratingCounts],
  );

  const attributeFacets = useMemo(
    () =>
      (productFacets?.attributes || [])
        .map((attribute) => ({
          ...attribute,
          values: (attribute.values || []).filter(
            (val) => val.value && Number(val.count || 0) > 0,
          ),
        }))
        .filter((attribute) => attribute.key && attribute.values.length > 1),
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

    const { min: currentMin, max: currentMax } = calculateAbsolutePriceLimits(productFacets, items);

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

    dispatch(fetchBrands({ limit: 500 }))
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
    (pageOverride) => ({
      brand: brandName,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      sort: searchParams.get("sort") || undefined,
      minRating: searchParams.get("rating") || undefined,
      inStock: searchParams.get("inStock") === "true" ? "true" : undefined,
      outOfStock:
        searchParams.get("outOfStock") === "true" ? "true" : undefined,
      page: pageOverride || 1,
      limit: Number(searchParams.get("limit") || 20),
    }),
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
    },
    [dispatch, getParams],
  );

  useEffect(() => {
    if (!brand) return;
    const pageVal = Number(searchParams.get("page") || 1);
    loadProducts({ page: pageVal, append: false }).catch(() => {
      setFirstLoadDone(true);
      setIsLoadingMore(false);
    });
  }, [brand, loadProducts, searchParams]);

  const scrollToTop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const updateParam = (key, value) => {
    updateSearchParams((next) => {
      if (value == null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    scrollToTop();
  };

  const updateParams = (entries) => {
    updateSearchParams((next) => {
      entries.forEach(([key, value]) => {
        if (value == null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
    });
    scrollToTop();
  };

  const handlePriceChange = ({ minPrice, maxPrice }) => {
    updateSearchParams((next) => {
      if (minPrice) next.set("minPrice", minPrice);
      else next.delete("minPrice");

      if (maxPrice) next.set("maxPrice", maxPrice);
      else next.delete("maxPrice");
    });
    scrollToTop();
  };

  const removeFilter = (key, filter) => {
    updateSearchParams((next) => {
      if (key === "price") {
        next.delete("minPrice");
        next.delete("maxPrice");
      } else if (filter?.groupKey) {
        if (filter.value === undefined) {
          next.delete(filter.groupKey);
        } else {
          const nextValues = parseMultiValue(next.get(filter.groupKey)).filter(
            (value) => value !== filter.value,
          );
          const serialized = serializeMultiValue(nextValues);
          if (serialized) {
            next.set(filter.groupKey, serialized);
          } else {
            next.delete(filter.groupKey);
          }
        }
      } else {
        next.delete(key);
      }
    });
    scrollToTop();
  };

  const setPage = (p) => {
    updateSearchParams((next) => {
      next.set("page", p);
    }, false);
    scrollToTop();
  };

  const handleClearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
    scrollToTop();
  }, [scrollToTop, setSearchParams]);

  const activeFilters = [
    searchParams.get("sort") && {
      key: "sort",
      label: `Sort: ${SORT_OPTIONS.find((o) => o.value === searchParams.get("sort"))?.label || searchParams.get("sort")}`,
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

    (searchParams.get("minPrice") || searchParams.get("maxPrice")) && {
      key: "price",
      label: `Price: ₹${Number(searchParams.get("minPrice") || absolutePriceLimits.min || 0).toLocaleString("en-IN")} – ₹${Number(searchParams.get("maxPrice") || absolutePriceLimits.max || 150000).toLocaleString("en-IN")}`,
    },
    ...Array.from(searchParams.entries())
      .filter(([key, value]) => key.startsWith("attr_") && value)
      .map(([key, value]) => {
        const attributeKey = key.replace(/^attr_/, "");
        const label = attributeFacets?.find((a) => a.key === attributeKey)?.label || capitalizeFirst(attributeKey);
        return {
          key,
          groupKey: key,
          label: `${label}: ${value.split(",").join(", ")}`,
        };
      }),
  ].filter(Boolean);

  const clearFiltersAction =
    activeFilters.length > 1 ? handleClearFilters : undefined;

  const filterSections = [
    ((pageInfo.total || items.length) > 1 ||
      searchParams.get("minPrice") ||
      searchParams.get("maxPrice")) &&
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
    hasRatingFilter && {
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
    ...attributeFacets.map((attribute) => ({
      key: `attr_${attribute.key}`,
      title: attribute.label,
      searchable: attribute.searchable && attribute.values.length > 6,
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

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Brand Outlet", href: "/brand-outlet" },
    { label: brandName },
  ];

  if (brandLoading) {
    return (
      <div className="w-container py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (brandError) {
    return (
      <div className="w-container py-16 text-center">
        <Store size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className=" text-2xl font-bold text-ink">Brand Coming Soon</h2>
        <p className="mt-2  text-sm text-muted">
          This Brand Page Is Being Prepared and Will Be Available Soon.
        </p>
        <Link
          to="/brand-outlet"
          className="button primary mt-6 inline-block px-6 py-2"
        >
          Browse Brand Outlet
        </Link>
      </div>
    );
  }

  const brandImage = getBrandLogo(brand);
  const brandDescription = brand?.description || brand?.about;
  const showPageSizeSelector = Number(pageInfo.total || 0) >= 12;

  return (
    <ProductListingLayout
      pageTitle={`${brandName} Products`}
      seoDescription={
        brandDescription || `Shop ${brandName} products at Sam Global`
      }
      topContent={
        <div className="relative full-banner mt-4 overflow-hidden bg-[#1B1D60]">
          <div className="grid  gap-0 h-[320px] sm:h-[380px] md:h-[371px] xl:h-[500px] lg:grid-cols-[52%_48%]">
            <div className="relative lg:hidden h-full">
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
                      {brandName}
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                      {brandDescription ||
                        `Shop ${brandName} products at Sam Global`}
                    </p>
                    <p className="mt-3 text-sm text-white">
                      {Number(pageInfo.total || 0).toLocaleString()} Products
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
                  {brandName}
                </h1>
                <p className="mt-3 max-w-xl font-normal leading-relaxed text-p text-white/80">
                  {brandDescription || `Shop ${brandName} products at Sam Global`}
                </p>
                <p className="mt-3 text-sm text-white">
                  {Number(pageInfo.total || 0).toLocaleString()} Products
                </p>
              </div>
            </div>
          </div>
        </div>
      }
      totalResults={pageInfo.total}
      pageSize={searchParams.get("limit") || 20}
      sortValue={searchParams.get("sort") || ""}
      sortOptions={pageInfo.total <= 1 ? [] : SORT_OPTIONS}
      onSortChange={(value) => updateParam("sort", value)}
      countText={`Showing ${Number(items.length || 0).toLocaleString()} of ${Number(pageInfo.total || 0).toLocaleString()} products`}
      pageSizeValue={searchParams.get("limit") || "20"}
      pageSizes={showPageSizeSelector ? PAGE_SIZES : []}
      onPageSizeChange={(value) => updateParam("limit", value)}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      filterSections={filterSections}
      activeFilters={activeFilters}
      onRemoveFilter={removeFilter}
      onClearFilters={clearFiltersAction}
      loading={
        (productState.loading && !items.length) ||
        (!firstLoadDone && !items.length && !!brand)
      }
      refreshing={productState.loading && items.length > 0 && !isLoadingMore}
      error={productState.error}
      empty={!items.length && !productState.loading && firstLoadDone}
      emptyTitle={`No Products from ${brandName}`}
      emptyText="Try adjusting your filters or check back later."
      products={items}
      viewMode="grid"
      onAddToCart={addToCart}
      onWishlist={toggleWishlist}
      isWishlisted={isWishlisted}
      currentPage={currentPage}
      totalPages={pageInfo.totalPages || 1}
      loadingMore={isLoadingMore}
      sentinelRef={sentinelRef}
    />
  );
}
