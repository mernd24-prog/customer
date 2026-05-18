import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Grid2X2, List, SlidersHorizontal, X } from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import PageHeader from "../../components/common/PageHeader";
import ProductCard from "../../components/product/ProductCard";
import {
  OptionFilter,
  Pagination,
  PriceRangeFilter,
  ProductFilterSidebar,
} from "../../components/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { fetchProducts, searchProducts } from "../../features/product/productSlice";
import { fetchCategories, fetchBrands } from "../../features/catalog/catalogSlice";
import { getProductId } from "../../utils/ecommerce";

const SORT_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Top Rated" },
];
const PAGE_SIZES = [12, 24, 48];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brandList, setBrandList] = useState([]);
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const sentinelRef = useRef(null);

  const productState = useSelector((s) => s.product);
  const catalogState = useSelector((s) => s.catalog);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  const categories = useMemo(() => (Array.isArray(catalogState.list) ? catalogState.list : []), [catalogState.list]);
  const products = items;
  const totalPages = pageInfo.totalPages || 1;
  const currentPage = pageInfo.page || 1;

  const getParams = useCallback((pageOverride) => ({
    category: searchParams.get("category") || undefined,
    brand: searchParams.get("brand") || undefined,
    q: searchParams.get("q") || undefined,
    minPrice: searchParams.get("minPrice") || undefined,
    maxPrice: searchParams.get("maxPrice") || undefined,
    sort: searchParams.get("sort") || undefined,
    page: pageOverride || 1,
    limit: Number(searchParams.get("limit") || 12),
  }), [searchParams]);

  const loadProducts = useCallback(async ({ page = 1, append = false } = {}) => {
    const params = getParams(page);
    const thunk = params.q ? searchProducts : fetchProducts;
    if (append) setIsLoadingMore(true);
    const result = await dispatch(thunk(params)).unwrap();

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
    return list;
  }, [dispatch, getParams]);

  useEffect(() => {
    loadProducts({ page: 1, append: false }).catch(() => {
      setFirstLoadDone(true);
      setIsLoadingMore(false);
    });
  }, [loadProducts]);

  useEffect(() => {
    dispatch(fetchCategories({ limit: 50 }));
    dispatch(fetchBrands({ limit: 50 }))
      .then((action) => {
        const data = action?.payload?.data;
        const list = Array.isArray(data) ? data : data?.items || data?.list || [];
        const normalized = list
          .map((brand) => {
            const label = brand?.name || brand?.title || brand?.brandName || brand?.code;
            return label ? { value: String(label), label: String(label) } : null;
          })
          .filter(Boolean);
        setBrandList(normalized);
      })
      .catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (!sentinelRef.current || !firstLoadDone || productState.loading || isLoadingMore) return undefined;
    if (currentPage >= totalPages) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) return;
      loadProducts({ page: currentPage + 1, append: true }).catch(() => {});
    }, { threshold: 0.2, rootMargin: "0px 0px 300px 0px" });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [currentPage, totalPages, firstLoadDone, loadProducts, productState.loading, isLoadingMore]);

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value == null || value === "") next.delete(key); else next.set(key, value);
      next.delete("page");
      return next;
    });
  };

  const removeFilter = (key) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (key === "price") { next.delete("minPrice"); next.delete("maxPrice"); } else next.delete(key);
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
    searchParams.get("category") && { key: "category", label: `Category: ${searchParams.get("category")}` },
    searchParams.get("brand") && { key: "brand", label: `Brand: ${searchParams.get("brand")}` },
    (searchParams.get("minPrice") || searchParams.get("maxPrice")) && { key: "price", label: `Price: ₹${searchParams.get("minPrice") || "0"} – ₹${searchParams.get("maxPrice") || "∞"}` },
    searchParams.get("q") && { key: "q", label: `Search: "${searchParams.get("q")}"` },
  ].filter(Boolean);

  const isSearchMode = Boolean(searchParams.get("q"));
  const pageTitle = isSearchMode
    ? `Search: "${searchParams.get("q")}"`
    : searchParams.get("category")
    ? `${searchParams.get("category")} Products`
    : "All Products";

  const filterSections = [
    categories.length > 0 && {
      key: "category",
      title: "Category",
      content: (
        <OptionFilter
          name="category"
          options={categories.map((category) => ({
            value: category.categoryKey || category.id || category._id,
            label: category.title || category.name,
          }))}
          selected={searchParams.get("category")}
          onChange={(value) => updateParam("category", value)}
        />
      ),
    },
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
  ].filter(Boolean);

  return (
    <>
      <Seo title={`${pageTitle} | Sam Global`} description="Browse products with filters, sort, and pagination." />

      <div className="w-container py-6 sm:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <PageHeader title={pageTitle} className="mb-0" />
            <p className="mt-0.5 font-montserrat text-sm text-[#787878]">{(pageInfo.total || products.length).toLocaleString()} products</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={searchParams.get("sort") || ""} onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded-[6px] border border-[#cfc6b8] bg-white px-3 py-2 font-montserrat text-sm">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={searchParams.get("limit") || "12"} onChange={(e) => updateParam("limit", e.target.value)}
              className="rounded-[6px] border border-[#cfc6b8] bg-white px-3 py-2 font-montserrat text-sm">
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} per page</option>)}
            </select>
            <div className="hidden items-center gap-0.5 rounded-[6px] border border-[#cfc6b8] bg-white p-1 sm:flex">
              <button type="button" onClick={() => setViewMode("grid")}
                className={`rounded p-1.5 transition ${viewMode === "grid" ? "bg-[#CE9F2D] text-white" : "text-[#A6A6A6] hover:text-[#2E2E2E]"}`}>
                <Grid2X2 size={15} />
              </button>
              <button type="button" onClick={() => setViewMode("list")}
                className={`rounded p-1.5 transition ${viewMode === "list" ? "bg-[#CE9F2D] text-white" : "text-[#A6A6A6] hover:text-[#2E2E2E]"}`}>
                <List size={15} />
              </button>
            </div>
            <button type="button" onClick={() => setSidebarOpen(true)}
              className="button secondary flex items-center gap-1.5 px-3 py-2 text-sm lg:hidden">
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <button key={f.key} type="button" onClick={() => removeFilter(f.key)}
                className="chip inline-flex items-center gap-1.5 text-xs font-medium">
                {f.label} <X size={10} />
              </button>
            ))}
            <button type="button"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="font-montserrat text-xs text-red-500 underline-offset-2 hover:underline">
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
                  <button type="button" onClick={() => setSidebarOpen(false)} className="icon-button"><X size={16} /></button>
                </div>
                <ProductFilterSidebar sections={filterSections} />
              </div>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <ApiState
              loading={(productState.loading && !products.length) || (!firstLoadDone && !products.length)}
              error={productState.error}
              empty={!products.length && !productState.loading && firstLoadDone}
              emptyTitle={isSearchMode ? "No results found" : "No products found"}
              emptyText={isSearchMode ? "Try different keywords or remove filters." : "Try adjusting your filters or browse other categories."}
              onRetry={() => loadProducts({ page: 1, append: false })}
            >
              <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid gap-4"}>
                {products.map((product) => (
                  <ProductCard key={getProductId(product)} product={product} onAddToCart={addToCart} onWishlist={toggleWishlist} isWishlisted={isWishlisted(product)} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />

              {isLoadingMore && (
                <div className="mt-6 text-center font-montserrat text-sm text-[#787878]">Loading more products...</div>
              )}
              <div ref={sentinelRef} className="h-8 w-full" />
            </ApiState>
          </div>
        </div>
      </div>
    </>
  );
}
