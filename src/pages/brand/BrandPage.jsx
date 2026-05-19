import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SlidersHorizontal, X, Store } from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import ProductCard from "../../components/product/ProductCard";
import {
  Breadcrumbs,
  OptionFilter,
  Pagination,
  PriceRangeFilter,
  ProductFilterSidebar,
  RatingFilter,
} from "../../components/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { fetchProducts } from "../../features/product/productSlice";
import { fetchBrands } from "../../features/catalog/catalogSlice";
import { applyImageFallback, getProductId } from "../../utils/ecommerce";

const SORT_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "newest", label: "Latest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const PAGE_SIZES = [12, 24, 48];

function slugToBrandName(slug = "") {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function brandToSlug(name = "") {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-44 w-full rounded-2xl bg-gray-200" />
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
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [brand, setBrand] = useState(null);
  const [brandLoading, setBrandLoading] = useState(true);
  const [brandError, setBrandError] = useState(null);

  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });
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

    dispatch(fetchBrands({ limit: 200 }))
      .then((action) => {
        const data = action?.payload?.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.list)
              ? data.list
              : [];

        const matched = list.find(
          (b) => brandToSlug(b?.name || b?.brandName || b?.title || "") === brandSlug,
        );

        if (matched) {
          setBrand(matched);
        } else {
          // Fallback: fuzzy match by approximate name
          const nameGuess = slugToBrandName(brandSlug);
          const fuzzy = list.find(
            (b) => (b?.name || b?.brandName || b?.title || "").toLowerCase() === nameGuess.toLowerCase(),
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
  }, [brandSlug, dispatch]);

  const brandName = brand?.name || brand?.brandName || brand?.title || slugToBrandName(brandSlug);

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
    if (!sentinelRef.current || !firstLoadDone || productState.loading || isLoadingMore) return undefined;
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
  }, [currentPage, totalPages, firstLoadDone, loadProducts, productState.loading, isLoadingMore]);

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
      if (minPrice) next.set("minPrice", minPrice); else next.delete("minPrice");
      if (maxPrice) next.set("maxPrice", maxPrice); else next.delete("maxPrice");
      next.delete("page");
      return next;
    });
  };

  const setPage = (p) => {
    loadProducts({ page: p, append: false }).catch(() => {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilters = [
    searchParams.get("sort") && { key: "sort", label: `Sort: ${SORT_OPTIONS.find((o) => o.value === searchParams.get("sort"))?.label || searchParams.get("sort")}` },
    searchParams.get("rating") && { key: "rating", label: `Rating: ${searchParams.get("rating")}★ & up` },
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
        <label className="flex cursor-pointer items-center gap-2 font-montserrat text-sm text-[#2E2E2E]">
          <input
            type="checkbox"
            checked={searchParams.get("inStock") === "true"}
            onChange={(e) => updateParam("inStock", e.target.checked ? "true" : undefined)}
            className="h-3.5 w-3.5 accent-[#CE9F2D]"
          />
          In Stock Only
        </label>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Brands", href: "/products" },
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
        <h2 className="font-montserrat text-2xl font-bold text-[#2E2E2E]">Brand Not Found</h2>
        <p className="mt-2 font-montserrat text-sm text-[#787878]">
          The brand you're looking for doesn't exist or may have been removed.
        </p>
        <Link to="/products" className="button primary mt-6 inline-block px-6 py-2">
          Browse All Products
        </Link>
      </div>
    );
  }

  const brandImage = brand?.imageUrl || brand?.image || brand?.logoUrl || brand?.logo;
  const brandDescription = brand?.description || brand?.about;

  return (
    <>
      <Seo
        title={`${brandName} Products | Sam Global`}
        description={brandDescription || `Shop ${brandName} products at Sam Global`}
      />

      {/* Brand Hero */}
      <div className="border-b border-[#e7dfd1] bg-gradient-to-br from-slate-50 to-[#FAF6EE] px-4 py-8 sm:px-6">
        <div className="w-container">
          <Breadcrumbs items={breadcrumbItems} className="mb-4 text-[#A6A6A6]" />
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {brandImage ? (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#e7dfd1] bg-white p-2 shadow-sm sm:h-28 sm:w-28">
                <img
                  src={brandImage}
                  alt={brandName}
                  className="h-full w-full object-contain"
                  onError={(event) => applyImageFallback(event, brandName, "brand")}
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-100 sm:h-28 sm:w-28">
                <Store size={32} className="text-slate-400" />
              </div>
            )}
            <div>
              <h1 className="font-montserrat text-3xl font-bold text-[#2E2E2E] sm:text-4xl">
                {brandName}
              </h1>
              {brandDescription && (
                <p className="mt-2 max-w-2xl font-montserrat text-sm leading-relaxed text-[#787878]">
                  {brandDescription}
                </p>
              )}
              <p className="mt-2 font-montserrat text-sm text-[#A6A6A6]">
                {pageInfo.total.toLocaleString()} products
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-container py-6 sm:py-8">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-montserrat text-sm text-[#787878]">
            Showing {items.length.toLocaleString()} of {pageInfo.total.toLocaleString()} products
          </p>
          <div className="flex items-center gap-3">
            <select
              value={searchParams.get("sort") || ""}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded-[6px] border border-[#cfc6b8] bg-white px-3 py-2 font-montserrat text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={searchParams.get("limit") || "20"}
              onChange={(e) => updateParam("limit", e.target.value)}
              className="rounded-[6px] border border-[#cfc6b8] bg-white px-3 py-2 font-montserrat text-sm"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s} per page</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="button secondary flex items-center gap-1.5 px-3 py-2 text-sm lg:hidden"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() =>
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    if (f.key === "price") { next.delete("minPrice"); next.delete("maxPrice"); }
                    else next.delete(f.key);
                    return next;
                  })
                }
                className="chip inline-flex items-center gap-1.5 text-xs font-medium"
              >
                {f.label} <X size={10} />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="font-montserrat text-xs text-red-500 underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <ProductFilterSidebar sections={filterSections} />
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-montserrat font-semibold text-[#2E2E2E]">Filters</span>
                  <button type="button" onClick={() => setSidebarOpen(false)} className="icon-button">
                    <X size={16} />
                  </button>
                </div>
                <ProductFilterSidebar sections={filterSections} />
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="min-w-0 flex-1">
            <ApiState
              loading={(productState.loading && !items.length) || (!firstLoadDone && !items.length && !!brand)}
              error={productState.error}
              empty={!items.length && !productState.loading && firstLoadDone}
              emptyTitle={`No products from ${brandName}`}
              emptyText="Try adjusting your filters or check back later."
              onRetry={() => loadProducts({ page: 1, append: false })}
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {items.map((product) => (
                  <ProductCard
                    key={getProductId(product)}
                    product={product}
                    onAddToCart={addToCart}
                    onWishlist={toggleWishlist}
                    isWishlisted={isWishlisted(product)}
                  />
                ))}
              </div>

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />

              {isLoadingMore && (
                <div className="mt-6 text-center font-montserrat text-sm text-[#787878]">
                  Loading more products...
                </div>
              )}
              <div ref={sentinelRef} className="h-8 w-full" />
            </ApiState>
          </div>
        </div>
      </div>
    </>
  );
}
