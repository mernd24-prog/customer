import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
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
import {
  fetchCategoryByKey,
  fetchBrands,
} from "../../features/catalog/catalogSlice";
import { applyImageFallback, getProductId } from "../../utils/ecommerce";

const SORT_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "newest", label: "Latest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];
const PAGE_SIZES = [12, 24, 48];

export default function CategoryPage() {
  const { categoryKey } = useParams();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brandList, setBrandList] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const sentinelRef = useRef(null);

  const productState = useSelector((s) => s.product);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  const products = items;
  const meta = productState.meta;
  const totalPages = pageInfo.totalPages || meta?.totalPages || meta?.pages || 1;
  const currentPage = pageInfo.page || Number(searchParams.get("page") || 1);

  const getParams = useCallback(
    (pageOverride) => {
      const params = {
        category: categoryKey,
        brand: searchParams.get("brand") || undefined,
        minPrice: searchParams.get("minPrice") || undefined,
        maxPrice: searchParams.get("maxPrice") || undefined,
        sort: searchParams.get("sort") || undefined,
        productFamilyCode: searchParams.get("productFamilyCode") || searchParams.get("family") || undefined,
        rating: searchParams.get("rating") || undefined,
        inStock: searchParams.get("inStock") || undefined,
        page: pageOverride || 1,
        limit: Number(searchParams.get("limit") || 20),
      };

      searchParams.forEach((value, key) => {
        if (key.startsWith("attr_")) params[key] = value;
      });
      ["color", "size", "material", "fit", "storage", "skinType", "shade", "finish", "room", "sport", "concern"].forEach((key) => {
        const value = searchParams.get(key);
        if (value) params[key] = value;
      });
      return params;
    },
    [searchParams, categoryKey],
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
      const nextPage = Number(meta.page || meta.currentPage || params.page || 1);
      const nextTotalPages = Number(meta.totalPages || meta.pages || 1);
      const nextTotal = Number(meta.total || meta.count || list.length || 0);
      setPageInfo({ page: nextPage, totalPages: nextTotalPages, total: nextTotal });
      setItems((prev) => (append ? [...prev, ...list] : list));
      setFirstLoadDone(true);
      setIsLoadingMore(false);
    },
    [dispatch, getParams],
  );

  useEffect(() => {
    loadProducts({ page: 1, append: false }).catch(() => {
      setFirstLoadDone(true);
      setIsLoadingMore(false);
    });
  }, [loadProducts]);

  useEffect(() => {
    setCategoryData(null);
    dispatch(fetchCategoryByKey({ categoryKey }))
      .then((action) => {
        const d = action?.payload?.data || action?.payload;
        if (d) setCategoryData(d);
      })
      .catch(() => {});

    dispatch(fetchBrands({ limit: 100 }))
      .then((action) => {
        const data = action?.payload?.data;
        const list = Array.isArray(data)
          ? data
          : data?.items || data?.list || [];
        setBrandList(
          list
            .map((brand) => {
              const label = brand?.name || brand?.title || brand?.brandName || brand?.code;
              return label ? { value: String(label), label: String(label) } : null;
            })
            .filter(Boolean),
        );
      })
      .catch(() => {});
  }, [dispatch, categoryKey]);

  useEffect(() => {
    if (!sentinelRef.current || !firstLoadDone || productState.loading || isLoadingMore) return undefined;
    if (currentPage >= totalPages) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
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
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", p);
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categoryTitle = categoryData?.title || categoryData?.name || categoryKey;
  const categoryDesc = categoryData?.description;
  const categoryImage = categoryData?.imageUrl || categoryData?.bannerUrl;

  // Sub-categories and sub-sub-categories from category data
  const subCategories = Array.isArray(categoryData?.children) ? categoryData.children : [];

  const activeFilters = [
    searchParams.get("brand") && { key: "brand", label: `Brand: ${searchParams.get("brand")}` },
    searchParams.get("productFamilyCode") && { key: "productFamilyCode", label: `Family: ${searchParams.get("productFamilyCode")}` },
    searchParams.get("rating") && { key: "rating", label: `Rating: ${searchParams.get("rating")}★ & up` },
    searchParams.get("inStock") && { key: "inStock", label: "In Stock Only" },
    ["color", "size", "material", "fit", "storage", "skinType", "shade", "finish", "room", "sport", "concern"]
      .map((key) => searchParams.get(key) && { key, label: `${key}: ${searchParams.get(key)}` })
      .filter(Boolean),
    ...Array.from(searchParams.entries())
      .filter(([key, value]) => key.startsWith("attr_") && value)
      .map(([key, value]) => ({ key, label: `${key.replace(/^attr_/, "")}: ${value}` })),
    (searchParams.get("minPrice") || searchParams.get("maxPrice")) && {
      key: "price",
      label: `Price: ₹${searchParams.get("minPrice") || "0"} – ₹${searchParams.get("maxPrice") || "∞"}`,
    },
  ].flat().filter(Boolean);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: categoryTitle },
  ];

  const filterSections = [
    // Sub-categories as navigation links (not a filter param, just navigation)
    subCategories.length > 0 && {
      key: "subcategories",
      title: "Sub-Categories",
      content: (
        <div className="grid gap-1">
          {subCategories.map((sub) => (
            <Link
              key={sub?.categoryKey || sub?.key}
              to={`/categories/${sub?.categoryKey || sub?.key}`}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-[#2E2E2E] hover:bg-blue-50 hover:text-blue-600 transition"
            >
              <span className="truncate">{sub?.title || sub?.name}</span>
              <ChevronRight size={12} className="shrink-0 text-gray-400" />
            </Link>
          ))}
        </div>
      ),
    },
    // Dynamic attribute filters from category schema
    Array.isArray(categoryData?.attributeSchema) &&
      categoryData.attributeSchema
        .filter((attribute) => attribute?.isFilterable !== false && Array.isArray(attribute?.options) && attribute.options.length)
        .map((attribute) => ({
          key: `attr_${attribute.key}`,
          title: attribute.label || attribute.key,
          content: (
            <OptionFilter
              name={`attr_${attribute.key}`}
              options={attribute.options.map((option) => ({ value: String(option), label: String(option) }))}
              selected={searchParams.get(attribute.key) || searchParams.get(`attr_${attribute.key}`)}
              onChange={(value) => updateParam(attribute.key, value)}
            />
          ),
        })),
    // Brand filter
    brandList.length > 0 && {
      key: "brand",
      title: "Brand",
      content: (
        <OptionFilter
          name="brand"
          options={brandList}
          selected={searchParams.get("brand")}
          onChange={(value) => updateParam("brand", value)}
        />
      ),
    },
    // Price filter
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
    // Rating filter
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
    // Availability filter
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
  ].flat().filter(Boolean);

  return (
    <>
      <Seo
        title={`${categoryTitle} | Sam Global`}
        description={categoryDesc || `Shop ${categoryTitle} products at Sam Global`}
      />

      {categoryImage ? (
        <div className="relative h-44 w-full overflow-hidden sm:h-56">
          <img
            src={categoryImage}
            alt={categoryTitle}
            className="h-full w-full object-cover"
            onError={(event) => applyImageFallback(event, categoryTitle, "category")}
          />
          <div className="absolute inset-0 flex items-end bg-black/40 px-6 pb-6">
            <div>
              <Breadcrumbs items={breadcrumbItems} className="mb-1 text-white/70" />
              <h1 className="font-montserrat text-[26px] font-bold text-white sm:text-[32px]">
                {categoryTitle}
              </h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-[#e7dfd1] bg-[#FAF6EE] px-4 py-6 sm:px-6">
          <div className="w-container">
            <Breadcrumbs items={breadcrumbItems} className="mb-2 text-[#A6A6A6]" />
            <h1 className="font-montserrat text-[26px] font-bold text-[#2E2E2E] sm:text-[32px]">
              {categoryTitle}
            </h1>
            {categoryDesc && (
              <p className="mt-1 max-w-2xl font-montserrat text-sm text-[#787878]">{categoryDesc}</p>
            )}
          </div>
        </div>
      )}

      <div className="w-container py-6 sm:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-montserrat text-sm text-[#787878]">
            {(pageInfo.total || meta?.total || products.length).toLocaleString()} products
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
                    next.delete("page");
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
          <div className="hidden lg:block">
            <ProductFilterSidebar sections={filterSections} />
          </div>

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

          <div className="min-w-0 flex-1">
            <ApiState
              loading={
                (productState.loading && !products.length) ||
                (!firstLoadDone && !products.length)
              }
              error={productState.error}
              empty={!products.length && !productState.loading && firstLoadDone}
              emptyTitle="No products found"
              emptyText="Try adjusting your filters or browse other categories."
              onRetry={() => loadProducts({ page: 1, append: false })}
            >
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid gap-4"
                }
              >
                {products.map((product) => (
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
