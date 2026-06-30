import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Store } from "lucide-react";
import Seo from "../../components/common/Seo";
import {
  BrandProductPage,
  CheckboxListFilter,
  PriceRangeFilter,
  RatingFilter,
} from "../../components/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { fetchProducts } from "../../features/product/productSlice";
import { fetchBrands } from "../../features/catalog/catalogSlice";
import {
  buildRatingCountMap,
  getImageUrlFromValue,
  isProductInStock,
} from "../../utils/ecommerce";
import {
  brandToSlug,
  parseMultiValue,
  serializeMultiValue,
  slugToBrandName,
} from "../../utils/ecommerce/brand";
import LoadingSkeleton from "../../components/ecommerce/BrandLoadingSkeleton";
import { useSearchParamHelper } from "../../hooks/useSearchParamsHelper";
import { PAGE_SIZES, SORT_OPTIONS } from "../../data/constant";

export default function BrandPage() {
  const { brandSlug } = useParams();
  const decodedBrandSlug = decodeURIComponent(brandSlug || "");
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [brand, setBrand] = useState(null);
  const [brandLoading, setBrandLoading] = useState(true);
  const [brandError, setBrandError] = useState(null);
  // const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
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
    () =>
      items.reduce(
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
    [items],
  );
  const ratingCounts = useMemo(() => buildRatingCountMap(items), [items]);

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
            setBrandError("Brand coming soon");
          }
        }
        setBrandLoading(false);
      })
      .catch(() => {
        setBrandError("Failed to load brand");
        setBrandLoading(false);
      });
  }, [decodedBrandSlug, dispatch]);

  const brandName =
    brand?.name ||
    brand?.brandName ||
    brand?.title ||
    slugToBrandName(brandSlug);

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
      expressDelivery:
        searchParams.get("expressDelivery") === "true" ? "true" : undefined,
      freeDelivery:
        searchParams.get("freeDelivery") === "true" ? "true" : undefined,
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
      const list =
        data.hits ||
        data.products ||
        data.results ||
        data.items ||
        data.list ||
        (Array.isArray(data) ? data : []);
      const meta =
        result?.meta?.pagination || result?.pagination || result?.meta || {};
      setPageInfo({
        page: Number(meta.page || meta.currentPage || params.page || 1),
        totalPages: Number(meta.totalPages || meta.pages || 1),
        total: Number(meta.total || meta.count || list.length || 0),
      });
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
      ([entry]) => {
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

  const updateParam = (key, value) => {
    updateSearchParams((next) => {
      if (value == null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
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
  };

  const handlePriceChange = ({ minPrice, maxPrice }) => {
    updateSearchParams((next) => {
      if (minPrice) next.set("minPrice", minPrice);
      else next.delete("minPrice");

      if (maxPrice) next.set("maxPrice", maxPrice);
      else next.delete("maxPrice");
    });
  };

  const removeFilter = (key, filter) => {
    updateSearchParams((next) => {
      if (key === "price") {
        next.delete("minPrice");
        next.delete("maxPrice");
      } else if (filter?.groupKey) {
        const nextValues = parseMultiValue(next.get(filter.groupKey)).filter(
          (value) => value !== filter.value,
        );
        const serialized = serializeMultiValue(nextValues);
        if (serialized) {
          next.set(filter.groupKey, serialized);
        } else {
          next.delete(filter.groupKey);
        }
      } else {
        next.delete(key);
      }
    });
  };

  const setPage = (p) => {
    updateSearchParams((next) => {
      next.set("page", p);
    }, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilters = [
    searchParams.get("sort") && {
      key: "sort",
      label: `Sort: ${SORT_OPTIONS.find((o) => o.value === searchParams.get("sort"))?.label || searchParams.get("sort")}`,
    },
    ...selectedRatings.map((rating) => ({
      key: `rating:${rating}`,
      groupKey: "rating",
      value: rating,
      label: `Rating: ${rating}★ & up`,
    })),
    searchParams.get("inStock") === "true" && {
      key: "inStock",
      label: "In Stock Only",
    },
    searchParams.get("outOfStock") === "true" && {
      key: "outOfStock",
      label: "Out of Stock",
    },
    searchParams.get("expressDelivery") === "true" && {
      key: "expressDelivery",
      label: "Express Delivery",
    },
    searchParams.get("freeDelivery") === "true" && {
      key: "freeDelivery",
      label: "Free Delivery",
    },
    (searchParams.get("minPrice") || searchParams.get("maxPrice")) && {
      key: "price",
      label: `Price: ₹${Number(searchParams.get("minPrice") || 0).toLocaleString("en-IN")} – ₹${Number(searchParams.get("maxPrice") || 150000).toLocaleString("en-IN")}`,
    },
  ].filter(Boolean);

  const filterSections = [
    {
      key: "price",
      title: "Price Range",
      content: (
        <PriceRangeFilter
          min={searchParams.get("minPrice")}
          max={searchParams.get("maxPrice")}
          onChange={handlePriceChange}
        />
      ),
    },
    {
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
    {
      key: "delivery",
      title: "Delivery",
      content: (
        <CheckboxListFilter
          name="delivery"
          options={[
            { value: "expressDelivery", label: "Express Delivery" },
            { value: "freeDelivery", label: "Free Delivery" },
          ]}
          selected={["expressDelivery", "freeDelivery"].filter(
            (value) => searchParams.get(value) === "true",
          )}
          onChange={(values) => {
            const selectedValues = new Set(values);
            updateParams([
              [
                "expressDelivery",
                selectedValues.has("expressDelivery") ? "true" : undefined,
              ],
              [
                "freeDelivery",
                selectedValues.has("freeDelivery") ? "true" : undefined,
              ],
            ]);
          }}
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
          ]}
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
  ];

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
        <h2 className=" text-2xl font-bold text-ink">Brand coming soon</h2>
        <p className="mt-2  text-sm text-muted">
          This brand page is being prepared and will be available soon.
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

  const brandImage =
    getImageUrlFromValue(brand?.thumbnails) ||
    getImageUrlFromValue(brand?.thumbnail) ||
    getImageUrlFromValue(brand?.imageUrl) ||
    getImageUrlFromValue(brand?.image) ||
    getImageUrlFromValue(brand?.logoUrl) ||
    getImageUrlFromValue(brand?.logo);
  const brandDescription = brand?.description || brand?.about;

  return (
    <>
      <Seo
        title={`${brandName} Products | Sam Global`}
        description={
          brandDescription || `Shop ${brandName} products at Sam Global`
        }
      />

      <BrandProductPage
        brandName={brandName}
        brandDescription={brandDescription}
        brandImage={brandImage}
        breadcrumbs={breadcrumbItems}
        total={pageInfo.total}
        shown={items.length}
        sortValue={searchParams.get("sort") || ""}
        sortOptions={SORT_OPTIONS}
        onSortChange={(value) => updateParam("sort", value)}
        pageSizeValue={searchParams.get("limit") || "20"}
        pageSizes={PAGE_SIZES}
        onPageSizeChange={(value) => updateParam("limit", value)}
        onOpenFilters={() => setSidebarOpen(true)}
        resultsProps={{
          filterSections,
          filters: activeFilters,
          onRemoveFilter: removeFilter,
          onClearFilters: () => setSearchParams(new URLSearchParams()),
          sidebarOpen,
          onCloseSidebar: () => setSidebarOpen(false),
          loading:
            (productState.loading && !items.length) ||
            (!firstLoadDone && !items.length && !!brand),
          error: productState.error,
          empty: !items.length && !productState.loading && firstLoadDone,
          emptyTitle: `No products from ${brandName}`,
          emptyText: "Try adjusting your filters or check back later.",
          products: items,
          onAddToCart: addToCart,
          onWishlist: toggleWishlist,
          isWishlisted,
          currentPage,
          totalPages,
          onPageChange: setPage,
          loadingMore: isLoadingMore,
          sentinelRef,
        }}
      />
    </>
  );
}
