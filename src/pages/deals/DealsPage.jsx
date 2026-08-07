import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BadgePercent } from "lucide-react";
import Seo from "../../components/common/Seo";
import {
  Breadcrumbs,
  CollectionToolbar,
  OptionFilter,
  ProductResultsLayout,
  CheckboxListFilter,
  PriceRangeFilter,
  RatingFilter,
} from "../../components/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { getPublicDealProducts } from "../../api/deals";
import {
  applyImageFallback,
  buildRatingCountMap,
  isProductInStock
} from "../../utils/ecommerce";
import bannerImage from "/image/png/ShoppingBanner.png";

const SORT_OPTIONS = [
  { value: "ending_soon", label: "Ending Soon" },
  { value: "discount", label: "Biggest Discount" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Deals" },
];

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

const unwrapProducts = (response = {}) => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  return data?.items || data?.products || data?.list || [];
};

const getPagination = (response = {}, fallback = {}) =>
  response?.meta?.pagination ||
  response?.pagination ||
  response?.meta ||
  fallback;

const getResponseFacets = (response = {}) => {
  const data = response?.data ?? response;
  return (
    data?.filters ||
    data?.facets ||
    data?.aggregations ||
    response?.filters ||
    response?.facets ||
    response?.meta?.filters ||
    response?.meta?.facets ||
    {}
  );
};

const getFacetList = (facets = {}, keys = []) => {
  for (const key of keys) {
    const value = facets?.[key];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.options)) return value.options;
    if (value && typeof value === "object") {
      return Object.entries(value).map(([entryKey, entryValue]) => ({
        value: entryKey,
        label: entryKey,
        count:
          typeof entryValue === "number"
            ? entryValue
            : entryValue?.count || entryValue?.doc_count,
      }));
    }
  }
  return [];
};

const normalizeFacetOption = (option = {}) => {
  const value =
    option.value ??
    option.id ??
    option._id ??
    option.key ??
    option.slug ??
    option.categoryKey ??
    option.category_id ??
    option.brand_id ??
    option.name ??
    option.title;
  const label =
    option.label ??
    option.name ??
    option.title ??
    option.brandName ??
    option.categoryName ??
    option.category_name ??
    option.brand_name ??
    value;

  return value
    ? {
        value: String(value),
        label: String(label),
        count: option.count ?? option.doc_count ?? option.total,
      }
    : null;
};

export default function DealsPage() {
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
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  const selectedBrands = useMemo(
    () => parseMultiValue(searchParams.get("brand")),
    [searchParams],
  );

  const selectedRatings = useMemo(
    () => parseMultiValue(searchParams.get("rating")),
    [searchParams],
  );

  const availabilityCounts = useMemo(
    () =>
      dealFacets?.availability && typeof dealFacets.availability === "object"
        ? {
            inStock: Number(
              dealFacets.availability.inStock ||
                dealFacets.availability.in_stock ||
                0,
            ),
            outOfStock: Number(
              dealFacets.availability.outOfStock ||
                dealFacets.availability.out_of_stock ||
                0,
            ),
          }
        : products.reduce(
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

  const categoryOptions = dealCategoryOptions.filter(
    (option) => Number(option.count || 0) > 0,
  );
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
      // q: searchParams.get("q") || undefined,
      category: searchParams.get("category") || undefined,
      brand: searchParams.get("brand") || undefined,
      sort: searchParams.get("sort") || "ending_soon",
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      rating: searchParams.get("rating") || undefined,
      inStock: searchParams.get("inStock") === "true" ? "true" : undefined,
      outOfStock:
        searchParams.get("outOfStock") === "true" ? "true" : undefined,
      // expressDelivery:
      //   searchParams.get("expressDelivery") === "true" ? "true" : undefined,
      // freeDelivery:
      //   searchParams.get("freeDelivery") === "true" ? "true" : undefined,
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
        const list = unwrapProducts(response);
        const pagination = getPagination(response, {
          page,
          limit: pageSize,
          total: list.length,
          totalPages: 1,
        });

        setProducts((current) => (append ? [...current, ...list] : list));
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
    [getParams, pageSize],
  );

  useEffect(() => {
    loadDeals({ page: Number(searchParams.get("page") || 1), append: false });
  }, [loadDeals, searchParams])

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

  const updateParam = (key, value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      return next;
    });
  };

  const updateParams = (entries) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      entries.forEach(([key, value]) => {
        if (value == null || value === "") next.delete(key);
        else next.set(key, value);
      });
      next.delete("page");
      return next;
    });
  };

  const handlePriceChange = ({ minPrice, maxPrice }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (minPrice) next.set("minPrice", minPrice);
      else next.delete("minPrice");
      if (maxPrice) next.set("maxPrice", maxPrice);
      else next.delete("maxPrice");
      next.delete("page");
      return next;
    });
  };

  const removeFilter = (key, filter) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
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
          if (serialized) next.set(filter.groupKey, serialized);
          else next.delete(filter.groupKey);
        }
      } else {
        next.delete(key);
      }
      next.delete("page");
      return next;
    });
  };

  const handleClearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const activeFilters = useMemo(
    () =>
      [
        searchParams.get("q") && {
          key: "q",
          label: `Search: "${searchParams.get("q")}"`,
        },
        searchParams.get("category") && {
          key: "category",
          label: `Category: ${categoryOptions.find((category) => category.value === searchParams.get("category"))?.label || searchParams.get("category")}`,
        },
        searchParams.get("brand") && {
          key: "brand",
          groupKey: "brand",
          label: `Brand: ${searchParams.get("brand").split(",").join(", ")}`,
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
          label: `Price: ₹${Number(searchParams.get("minPrice") || 0).toLocaleString("en-IN")} – ₹${Number(searchParams.get("maxPrice") || 150000).toLocaleString("en-IN")}`,
        },
      ].filter(Boolean),
    [searchParams, categoryOptions, selectedBrands, selectedRatings],
  );

  const clearFiltersAction = activeFilters.length > 1 ? handleClearFilters : undefined;

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
    (dealFacets.priceStats?.min ?? dealFacets.price?.min) != null &&
      (dealFacets.priceStats?.max ?? dealFacets.price?.max) != null &&
      (dealFacets.priceStats?.max ?? dealFacets.price?.max) > 0 &&
      (dealFacets.priceStats?.min ?? dealFacets.price?.min) < (dealFacets.priceStats?.max ?? dealFacets.price?.max) && {
      key: "price",
      title: "Price Range",
      content: (
        <PriceRangeFilter
          min={searchParams.get("minPrice")}
          max={searchParams.get("maxPrice")}
          minLimit={dealFacets.priceStats?.min ?? dealFacets.price?.min}
          maxLimit={dealFacets.priceStats?.max ?? dealFacets.price?.max}
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
          ].filter((option) => Number(option.count || 0) > 0)}
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
  ].filter(Boolean);

  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Deals" }];

  return (
    <>
      <Seo
        title="Deals | Sam Global"
        description="Shop active deal products with special prices, deal badges, and limited-time offers."
      />

      <div className="relative full-banner mt-4 overflow-hidden bg-[#1B1D60]">
        <div className="grid gap-0 h-[320px] sm:h-[380px] md:h-[371px] xl:h-[500px] lg:grid-cols-[52%_48%]">
          {/* Mobile & Tablet Banner */}
          <div className="relative lg:hidden h-full">
            <img
              src={bannerImage}
              alt="Deals"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(event) =>
                applyImageFallback(event, "Deals", "category")
              }
            />
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
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#9A6A00]">
                    <BadgePercent size={15} /> Live Deals
                  </div>
                  <h1 className="text-h1 font-bold leading-tight text-white capitalize">
                    Deal Products
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                    Products promoted by admin with special deal price, original
                    price, deal badge, and limited-time availability.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Content */}
          <div className="hidden items-center pl-6 pr-10 lg:flex xl:pl-[max(3rem,calc((100vw-1559px)/2))]">
            <div className="max-w-xl">
              <Breadcrumbs
                items={breadcrumbItems}
                linkClassName="!text-white"
                currentClassName="!text-[#CE9F2D]"
                separatorClassName="!text-white"
                className="mb-5"
              />
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#9A6A00]">
                <BadgePercent size={15} /> Live Deals
              </div>
              <h1 className="text-h1 font-bold leading-tight text-white capitalize">
                Deal Products
              </h1>
              <p className="mt-3 max-w-xl font-normal leading-relaxed text-p text-white/80">
                Products promoted by admin with special deal price, original
                price, deal badge, and limited-time availability.
              </p>
            </div>
          </div>

          {/* Desktop Image */}
          <div className="relative hidden lg:block overflow-hidden -ml-px">
            <img
              src={bannerImage}
              alt="Deals"
              className="h-full w-full object-cover object-right"
              onError={(event) =>
                applyImageFallback(event, "Deals", "category")
              }
            />
            <div className="absolute inset-y-0 -left-px right-0 bg-gradient-to-r from-[#1B1D60] via-[#1B1D60]/20 to-transparent" />
          </div>
        </div>
      </div>

      <div className="my-3 md:my-6">
        <div className=" flex flex-col gap-3 md:flex-row md:items-end md:justify-end">
    
          <CollectionToolbar
            countText={`${pageInfo.total} deals`}
            sortValue={searchParams.get("sort") || "ending_soon"}
            sortOptions={pageInfo.total <= 1 ? [] : SORT_OPTIONS}
            onSortChange={(value) => updateParam("sort", value)}
            onOpenFilters={() => setSidebarOpen(true)}
          />
        </div>

        <ProductResultsLayout
          totalResults={pageInfo.total}
          pageSize={pageSize}
          filterSections={filterSections}
          filters={activeFilters}
          onRemoveFilter={removeFilter}
          onClearFilters={clearFiltersAction}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          loading={loading && !products.length}
          error={error}
          empty={!products.length && !loading && firstLoadDone}
          emptyTitle="No active deals found"
          emptyText="Please check back later for new deal products."
          products={products}
          viewMode="grid"
          onAddToCart={addToCart}
          onWishlist={toggleWishlist}
          isWishlisted={isWishlisted}
          currentPage={currentPage}
          totalPages={totalPages}
          showPagination={false}
          loadingMore={loadingMore}
          sentinelRef={sentinelRef}
        />
      </div>
    </>
  );
}
