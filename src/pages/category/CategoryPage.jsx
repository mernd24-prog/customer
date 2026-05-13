import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Grid2X2,
  List,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import ProductCard from "../../components/product/ProductCard";
import { useProductActions } from "../../hooks/useProductActions";
import { fetchProducts } from "../../features/product/productSlice";
import { fetchCategoryByKey, fetchBrands } from "../../features/catalog/catalogSlice";
import { getProductId, formatMoney } from "../../utils/ecommerce";

const SORT_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Top Rated" },
];

const PAGE_SIZES = [12, 24, 48];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-100 py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-semibold text-slate-900"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function PriceRangeFilter({ min, max, onChange }) {
  const [localMin, setLocalMin] = useState(min || "");
  const [localMax, setLocalMax] = useState(max || "");

  const apply = () => onChange({ minPrice: localMin || undefined, maxPrice: localMax || undefined });

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Min (₹)</label>
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full rounded border border-stone-200 px-2.5 py-1.5 text-sm outline-none focus:border-slate-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Max (₹)</label>
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            placeholder="Any"
            min="0"
            className="w-full rounded border border-stone-200 px-2.5 py-1.5 text-sm outline-none focus:border-slate-950"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={apply}
        className="rounded bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
      >
        Apply price filter
      </button>
      {(min || max) && (
        <button
          type="button"
          onClick={() => { setLocalMin(""); setLocalMax(""); onChange({ minPrice: undefined, maxPrice: undefined }); }}
          className="text-xs text-red-600 underline-offset-4 hover:underline"
        >
          Clear price filter
        </button>
      )}
    </div>
  );
}

function CheckboxFilter({ options, selected, onChange, labelKey = "name", valueKey = "id" }) {
  if (!options?.length) return <p className="text-xs text-slate-400">Loading…</p>;
  return (
    <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
      {options.map((opt) => {
        const val = opt[valueKey] || opt._id || opt.id;
        const label = opt[labelKey] || opt.title || val;
        const checked = selected === val;
        return (
          <label key={val} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name={valueKey}
              value={val}
              checked={checked}
              onChange={() => onChange(checked ? undefined : val)}
              className="h-3.5 w-3.5 accent-slate-950"
            />
            <span className="truncate">{label}</span>
          </label>
        );
      })}
    </div>
  );
}

export default function CategoryPage() {
  const { categoryKey } = useParams();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brandList, setBrandList] = useState([]);
  const [categoryData, setCategoryData] = useState(null);

  const productState = useSelector((s) => s.product);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  const products = useMemo(
    () => (Array.isArray(productState.list) ? productState.list : []),
    [productState.list],
  );
  const meta = productState.meta;
  const totalPages = meta?.totalPages || meta?.pages || 1;
  const currentPage = Number(searchParams.get("page") || 1);

  const getParams = useCallback(() => ({
    category: categoryKey,
    brand: searchParams.get("brand") || undefined,
    minPrice: searchParams.get("minPrice") || undefined,
    maxPrice: searchParams.get("maxPrice") || undefined,
    sort: searchParams.get("sort") || undefined,
    page: currentPage,
    limit: Number(searchParams.get("limit") || 12),
  }), [searchParams, currentPage, categoryKey]);

  useEffect(() => {
    dispatch(fetchProducts(getParams()));
  }, [dispatch, searchParams, getParams, categoryKey]);

  useEffect(() => {
    dispatch(fetchCategoryByKey({ categoryKey }))
      .then((action) => {
        const data = action?.payload?.data || action?.payload;
        if (data) setCategoryData(data);
      })
      .catch(() => {});

    dispatch(fetchBrands({ limit: 50 }))
      .then((action) => {
        const list = action?.payload?.data;
        setBrandList(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, [dispatch, categoryKey]);

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      return next;
    });
  };

  const removeFilter = (key) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (key === "price") { next.delete("minPrice"); next.delete("maxPrice"); }
      else next.delete(key);
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
    setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set("page", p); return next; });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categoryTitle = categoryData?.title || categoryData?.name || categoryKey;
  const categoryDesc = categoryData?.description;
  const categoryImage = categoryData?.imageUrl || categoryData?.bannerUrl;

  const activeFilters = [];
  if (searchParams.get("brand")) activeFilters.push({ key: "brand", label: `Brand: ${searchParams.get("brand")}` });
  if (searchParams.get("minPrice") || searchParams.get("maxPrice")) {
    activeFilters.push({ key: "price", label: `Price: ₹${searchParams.get("minPrice") || "0"} – ₹${searchParams.get("maxPrice") || "∞"}` });
  }

  const Sidebar = () => (
    <aside className="w-full space-y-0 lg:w-60 lg:shrink-0">
      <div className="rounded-lg border border-stone-200 bg-white px-4 py-2">
        {brandList.length > 0 && (
          <FilterSection title="Brand">
            <CheckboxFilter
              options={brandList}
              selected={searchParams.get("brand")}
              onChange={(v) => updateParam("brand", v)}
              labelKey="name"
              valueKey="id"
            />
          </FilterSection>
        )}

        <FilterSection title="Price Range">
          <PriceRangeFilter
            min={searchParams.get("minPrice")}
            max={searchParams.get("maxPrice")}
            onChange={handlePriceChange}
          />
        </FilterSection>
      </div>
    </aside>
  );

  return (
    <>
      <Seo
        title={`${categoryTitle} | Sam Global`}
        description={categoryDesc || `Shop ${categoryTitle} products at Sam Global`}
      />

      {/* Category hero */}
      {categoryImage ? (
        <div className="relative h-40 w-full overflow-hidden sm:h-52">
          <img src={categoryImage} alt={categoryTitle} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-end px-6 pb-6">
            <div>
              <nav className="mb-1 flex items-center gap-1.5 text-xs text-white/70">
                <Link to="/" className="hover:text-white">Home</Link>
                <span>/</span>
                <Link to="/products" className="hover:text-white">Products</Link>
                <span>/</span>
                <span className="text-white">{categoryTitle}</span>
              </nav>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{categoryTitle}</h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-stone-50 border-b border-stone-200 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <nav className="mb-2 flex items-center gap-1.5 text-xs text-slate-400">
              <Link to="/" className="hover:text-slate-700">Home</Link>
              <span>/</span>
              <Link to="/products" className="hover:text-slate-700">Products</Link>
              <span>/</span>
              <span className="text-slate-700">{categoryTitle}</span>
            </nav>
            <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">{categoryTitle}</h1>
            {categoryDesc && <p className="mt-1 text-sm text-slate-500 max-w-2xl">{categoryDesc}</p>}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Controls row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            {meta?.total != null && (
              <p className="text-sm text-slate-500">{meta.total.toLocaleString()} products</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={searchParams.get("sort") || ""}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-950"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <select
              value={searchParams.get("limit") || "12"}
              onChange={(e) => updateParam("limit", e.target.value)}
              className="rounded border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-950"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s} per page</option>
              ))}
            </select>

            <div className="hidden items-center gap-1 rounded border border-stone-200 bg-white p-1 sm:flex">
              <button type="button" onClick={() => setViewMode("grid")} className={`rounded p-1 ${viewMode === "grid" ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-900"}`}>
                <Grid2X2 size={16} />
              </button>
              <button type="button" onClick={() => setViewMode("list")} className={`rounded p-1 ${viewMode === "list" ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-900"}`}>
                <List size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-1.5 rounded border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 transition lg:hidden"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
          </div>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => removeFilter(f.key)}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-stone-100 transition"
              >
                {f.label} <X size={11} />
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Filters</span>
                  <button type="button" onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-slate-900">
                    <X size={18} />
                  </button>
                </div>
                <Sidebar />
              </div>
            </div>
          )}

          {/* Products grid */}
          <div className="min-w-0 flex-1">
            <ApiState
              loading={productState.loading && !products.length}
              error={productState.error}
              empty={!products.length && !productState.loading}
              emptyTitle="No products found"
              emptyText="Try adjusting your filters or browse other categories."
              onRetry={() => dispatch(fetchProducts(getParams()))}
            >
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                  : "grid gap-4"
              }>
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

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="rounded border border-stone-200 p-2 text-slate-600 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setPage(page)}
                        className={`h-9 min-w-[36px] rounded border px-2.5 text-sm font-medium transition ${
                          currentPage === page
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-stone-200 text-slate-700 hover:bg-stone-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {totalPages > 7 && <span className="text-slate-400">…</span>}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className="rounded border border-stone-200 p-2 text-slate-600 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </ApiState>
          </div>
        </div>
      </div>
    </>
  );
}
