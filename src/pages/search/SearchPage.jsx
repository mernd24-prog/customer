import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, Star, X } from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import ProductCard from "../../components/product/ProductCard";
import { useProductActions } from "../../hooks/useProductActions";
import { searchElastic } from "../../features/search/searchSlice";
import { getProductId, formatMoney } from "../../utils/ecommerce";

const SORT_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Top Rated" },
];

function StarRatingFilter({ selected, onChange }) {
  return (
    <div className="grid gap-2">
      {[4, 3, 2, 1].map((stars) => (
        <label key={stars} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name="rating"
            value={stars}
            checked={selected === String(stars)}
            onChange={() => onChange(selected === String(stars) ? undefined : String(stars))}
            className="h-3.5 w-3.5 accent-slate-950"
          />
          <span className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={12}
                className={i < stars ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"}
              />
            ))}
            <span className="ml-1 text-slate-500">& up</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function FacetCategoryList({ facets, selected, onChange }) {
  const cats = facets?.category || [];
  if (!cats.length) return <p className="text-xs text-slate-400">No categories</p>;
  return (
    <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
      {cats.map((cat) => {
        const val = cat.key || cat.value || cat._id;
        const label = cat.label || cat.title || val;
        const count = cat.count || cat.doc_count || 0;
        const checked = selected === val;
        return (
          <label key={val} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="category"
              value={val}
              checked={checked}
              onChange={() => onChange(checked ? undefined : val)}
              className="h-3.5 w-3.5 accent-slate-950"
            />
            <span className="flex-1 truncate">{label}</span>
            <span className="text-xs text-slate-400">({count})</span>
          </label>
        );
      })}
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
        Apply
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
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function SearchPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queryInput, setQueryInput] = useState(searchParams.get("q") || "");

  const searchState = useSelector((s) => s.search);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  const hits = useMemo(
    () => (Array.isArray(searchState.hits) ? searchState.hits : []),
    [searchState.hits],
  );
  const facets = searchState.facets || {};
  const meta = searchState.meta || {};
  const totalPages = meta.totalPages || meta.pages || 1;
  const currentPage = Number(searchParams.get("page") || 1);

  const getParams = useCallback(() => ({
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || undefined,
    minPrice: searchParams.get("minPrice") || undefined,
    maxPrice: searchParams.get("maxPrice") || undefined,
    minRating: searchParams.get("minRating") || undefined,
    seller: searchParams.get("seller") || undefined,
    inStock: searchParams.get("inStock") || undefined,
    sort: searchParams.get("sort") || undefined,
    page: currentPage,
    limit: Number(searchParams.get("limit") || 12),
  }), [searchParams, currentPage]);

  useEffect(() => {
    const p = getParams();
    if (p.q) dispatch(searchElastic(p));
  }, [dispatch, searchParams, getParams]);

  useEffect(() => {
    setQueryInput(searchParams.get("q") || "");
  }, [searchParams]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("q", queryInput.trim());
      next.delete("page");
      return next;
    });
  };

  const activeFilters = [];
  if (searchParams.get("category")) activeFilters.push({ key: "category", label: `Category: ${searchParams.get("category")}` });
  if (searchParams.get("minPrice") || searchParams.get("maxPrice")) {
    activeFilters.push({ key: "price", label: `Price: ₹${searchParams.get("minPrice") || "0"} – ₹${searchParams.get("maxPrice") || "∞"}` });
  }
  if (searchParams.get("minRating")) activeFilters.push({ key: "minRating", label: `Rating: ${searchParams.get("minRating")}★+` });
  if (searchParams.get("inStock")) activeFilters.push({ key: "inStock", label: "In Stock Only" });

  const removeFilter = (key) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (key === "price") { next.delete("minPrice"); next.delete("maxPrice"); }
      else next.delete(key);
      next.delete("page");
      return next;
    });
  };

  const q = searchParams.get("q") || "";

  const Sidebar = () => (
    <aside className="w-full space-y-0 lg:w-60 lg:shrink-0">
      <div className="rounded-lg border border-stone-200 bg-white px-4 py-2">
        {Object.keys(facets).length > 0 && (
          <FilterSection title="Category">
            <FacetCategoryList
              facets={facets}
              selected={searchParams.get("category")}
              onChange={(v) => updateParam("category", v)}
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

        <FilterSection title="Min. Rating">
          <StarRatingFilter
            selected={searchParams.get("minRating")}
            onChange={(v) => updateParam("minRating", v)}
          />
        </FilterSection>

        <FilterSection title="Availability" defaultOpen={false}>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={searchParams.get("inStock") === "true"}
              onChange={(e) => updateParam("inStock", e.target.checked ? "true" : undefined)}
              className="h-3.5 w-3.5 accent-slate-950"
            />
            In Stock Only
          </label>
        </FilterSection>
      </div>
    </aside>
  );

  return (
    <>
      <Seo
        title={q ? `Search: "${q}" | Sam Global` : "Search | Sam Global"}
        description="Search products at Sam Global"
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-slate-950"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Search
          </button>
        </form>

        {/* Header row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            {q && <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Results for "{q}"</h1>}
            {meta.total != null && (
              <p className="mt-0.5 text-sm text-slate-500">{meta.total.toLocaleString()} results</p>
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
            <button
              type="button"
              onClick={() => setSearchParams((prev) => { const next = new URLSearchParams(); next.set("q", prev.get("q") || ""); return next; })}
              className="text-xs text-red-600 underline-offset-4 hover:underline"
            >
              Clear all filters
            </button>
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

          {/* Results */}
          <div className="min-w-0 flex-1">
            {!q ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Search size={48} className="mb-4 text-stone-300" />
                <p className="text-lg font-semibold text-slate-700">What are you looking for?</p>
                <p className="mt-1 text-sm text-slate-400">Enter a search term above to find products.</p>
              </div>
            ) : (
              <ApiState
                loading={searchState.loading && !hits.length}
                error={searchState.error}
                empty={!hits.length && !searchState.loading}
                emptyTitle="No results found"
                emptyText={`We couldn't find anything for "${q}". Try different keywords or remove some filters.`}
                onRetry={() => dispatch(searchElastic(getParams()))}
              >
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {hits.map((product) => (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}
