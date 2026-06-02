import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Store } from "lucide-react";
import Seo from "../../components/common/Seo";
import {
  BrandProductPage,
  PriceRangeFilter,
  RatingFilter,
} from "../../components/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { fetchProducts } from "../../features/product/productSlice";
import { fetchBrands } from "../../features/catalog/catalogSlice";
import { getImageUrlFromValue } from "../../utils/ecommerce";

const SORT_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "newest", label: "Latest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const PAGE_SIZES = [12, 24, 48];

function slugToBrandName(slug = "") {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function brandToSlug(name = "") {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-44 w-full rounded-[var(--customer-radius)] bg-gray-200" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-72 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

export default function BrandPage() {
  const { brandSlug } = useParams();
  const decodedBrandSlug = decodeURIComponent(brandSlug || "");
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [brand, setBrand] = useState(null);
  const [brandLoading, setBrandLoading] = useState(true);
  const [brandError, setBrandError] = useState(null);

  const [items, setItems] = useState([]);
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

  const totalPages = pageInfo.totalPages || 1;
  const currentPage = pageInfo.page || 1;

  // Fetch brand info by matching slug against all brands
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
            setBrandError("Brand not found");
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
      rating: searchParams.get("rating") || undefined,
      inStock: searchParams.get("inStock") || undefined,
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
      const data = result?.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.list)
            ? data.list
            : [];
      const meta = result?.meta || {};
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
    loadProducts({ page: 1, append: false }).catch(() => {
      setFirstLoadDone(true);
      setIsLoadingMore(false);
    });
  }, [brand, loadProducts]);

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
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
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

  const removeFilter = (key) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (key === "price") {
        next.delete("minPrice");
        next.delete("maxPrice");
      } else next.delete(key);
      next.delete("page");
      return next;
    });
  };

  const setPage = (p) => {
    loadProducts({ page: p, append: false }).catch(() => {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilters = [
    searchParams.get("sort") && {
      key: "sort",
      label: `Sort: ${SORT_OPTIONS.find((o) => o.value === searchParams.get("sort"))?.label || searchParams.get("sort")}`,
    },
    searchParams.get("rating") && {
      key: "rating",
      label: `Rating: ${searchParams.get("rating")}★ & up`,
    },
    searchParams.get("inStock") && { key: "inStock", label: "In Stock Only" },
    (searchParams.get("minPrice") || searchParams.get("maxPrice")) && {
      key: "price",
      label: `Price: ₹${searchParams.get("minPrice") || "0"} – ₹${searchParams.get("maxPrice") || "∞"}`,
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
          selected={searchParams.get("rating")}
          onChange={(v) => updateParam("rating", v)}
        />
      ),
    },
    {
      key: "inStock",
      title: "Availability",
      content: (
        <label className="flex cursor-pointer items-center gap-2  text-sm text-ink">
          <input
            type="checkbox"
            checked={searchParams.get("inStock") === "true"}
            onChange={(e) =>
              updateParam("inStock", e.target.checked ? "true" : undefined)
            }
            className="h-3.5 w-3.5 accent-gold"
          />
          In Stock Only
        </label>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Brands", href: "/brands" },
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
        <h2 className=" text-2xl font-bold text-ink">Brand Not Found</h2>
        <p className="mt-2  text-sm text-muted">
          The brand you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Link
          to="/brands"
          className="button primary mt-6 inline-block px-6 py-2"
        >
          Browse All Brands
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
          onRetry: () => loadProducts({ page: 1, append: false }),
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
