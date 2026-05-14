import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  List,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import ProductCard from "../../components/product/ProductCard";
import BrandButton from "../../components/ui/BrandButton";
import SectionContainer from "../../components/ui/SectionContainer";
import { useProductActions } from "../../hooks/useProductActions";
import { fetchProducts } from "../../features/product/productSlice";
import {
  fetchCategoryByKey,
  fetchBrands,
} from "../../features/catalog/catalogSlice";
import { getProductId } from "../../utils/ecommerce";

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
    <div className="border-b border-[#e7dfd1] py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between font-montserrat text-sm font-semibold text-[#2E2E2E]"
      >
        {title}
        <span className="text-[#A6A6A6]">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function PriceRangeFilter({ min, max, onChange }) {
  const [localMin, setLocalMin] = useState(min || "");
  const [localMax, setLocalMax] = useState(max || "");
  const apply = () =>
    onChange({
      minPrice: localMin || undefined,
      maxPrice: localMax || undefined,
    });
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block font-montserrat text-xs text-[#A6A6A6]">
            Min (₹)
          </label>
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full rounded-[6px] border border-[#cfc6b8] px-2.5 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block font-montserrat text-xs text-[#A6A6A6]">
            Max (₹)
          </label>
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            placeholder="Any"
            min="0"
            className="w-full rounded-[6px] border border-[#cfc6b8] px-2.5 py-1.5 text-sm"
          />
        </div>
      </div>
      <BrandButton
        variant="primary"
        rounded
        size="sm"
        label="Apply"
        className="h-8 text-xs"
        onClick={apply}
      />
      {(min || max) && (
        <button
          type="button"
          onClick={() => {
            setLocalMin("");
            setLocalMax("");
            onChange({ minPrice: undefined, maxPrice: undefined });
          }}
          className="font-montserrat text-xs text-red-500 underline-offset-2 hover:underline"
        >
          Clear price filter
        </button>
      )}
    </div>
  );
}

function CheckboxFilter({
  options,
  selected,
  onChange,
  labelKey = "name",
  valueKey = "id",
}) {
  if (!options?.length)
    return <p className="font-montserrat text-xs text-[#A6A6A6]">Loading…</p>;
  return (
    <div className="grid max-h-48 gap-2 overflow-y-auto pr-1">
      {options.map((opt) => {
        const val = opt[valueKey] || opt._id || opt.id;
        const label = opt[labelKey] || opt.title || val;
        const checked = selected === val;
        return (
          <label
            key={val}
            className="flex cursor-pointer items-center gap-2 font-montserrat text-sm text-[#2E2E2E]"
          >
            <input
              type="radio"
              name={valueKey}
              value={val}
              checked={checked}
              onChange={() => onChange(checked ? undefined : val)}
              className="h-3.5 w-3.5 accent-[#CE9F2D]"
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

  const products = useMemo(
    () => (Array.isArray(productState.list) ? productState.list : []),
    [productState.list],
  );
  const meta = productState.meta;
  const totalPages = meta?.totalPages || meta?.pages || 1;
  const currentPage = Number(searchParams.get("page") || 1);

  const getParams = useCallback(
    (pageOverride) => ({
      category: categoryKey,
      brand: searchParams.get("brand") || undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      sort: searchParams.get("sort") || undefined,
      page: pageOverride || 1,
      limit: Number(searchParams.get("limit") || 12),
    }),
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
      const nextPage = Number(
        meta.page || meta.currentPage || params.page || 1,
      );
      const nextTotalPages = Number(meta.totalPages || meta.pages || 1);
      const nextTotal = Number(meta.total || meta.count || list.length || 0);
      setPageInfo({
        page: nextPage,
        totalPages: nextTotalPages,
        total: nextTotal,
      });
      setItems((prev) => (append ? [...prev, ...list] : list));
      setFirstLoadDone(true);
      setIsLoadingMore(false);
    },
    [dispatch, getParams],
  );

  useEffect(() => {
    dispatch(fetchProducts(getParams()));
  }, [dispatch, searchParams, getParams, categoryKey]);

  useEffect(() => {
    dispatch(fetchCategoryByKey({ categoryKey }))
      .then((action) => {
        const d = action?.payload?.data || action?.payload;
        if (d) setCategoryData(d);
      })
      .catch(() => {});
    dispatch(fetchBrands({ limit: 50 }))
      .then((action) => {
        const data = action?.payload?.data;
        const list = Array.isArray(data)
          ? data
          : data?.items || data?.list || [];
        setBrandList(
          list
            .map((brand) => {
              const label =
                brand?.name || brand?.title || brand?.brandName || brand?.code;
              return label
                ? { value: String(label), label: String(label) }
                : null;
            })
            .filter(Boolean),
        );
      })
      .catch(() => {});
  }, [dispatch, categoryKey]);

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
      (entries) => {
        const [entry] = entries;
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

  const setPage = (p) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", p);
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categoryTitle =
    categoryData?.title || categoryData?.name || categoryKey;
  const categoryDesc = categoryData?.description;
  const categoryImage = categoryData?.imageUrl || categoryData?.bannerUrl;

  const activeFilters = [
    searchParams.get("brand") && {
      key: "brand",
      label: `Brand: ${searchParams.get("brand")}`,
    },
    (searchParams.get("minPrice") || searchParams.get("maxPrice")) && {
      key: "price",
      label: `Price: ₹${searchParams.get("minPrice") || "0"} – ₹${searchParams.get("maxPrice") || "∞"}`,
    },
  ].filter(Boolean);

  const Sidebar = () => (
    <aside className="w-full lg:w-60 lg:shrink-0">
      <div className="card">
        {brandList.length > 0 && (
          <FilterSection title="Brand">
            <CheckboxFilter
              options={brandList}
              selected={searchParams.get("brand")}
              onChange={(v) => updateParam("brand", v)}
              labelKey="label"
              valueKey="value"
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
        description={
          categoryDesc || `Shop ${categoryTitle} products at Sam Global`
        }
      />

      {/* Category hero */}
      {categoryImage ? (
        <div className="relative h-44 w-full overflow-hidden sm:h-56">
          <img
            src={categoryImage}
            alt={categoryTitle}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-end bg-black/40 px-6 pb-6">
            <div>
              <nav className="mb-1 flex items-center gap-1 font-montserrat text-xs text-white/70">
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
                <span>/</span>
                <Link to="/products" className="hover:text-white">
                  Products
                </Link>
                <span>/</span>
                <span className="text-white">{categoryTitle}</span>
              </nav>
              <h1 className="font-montserrat text-[26px] font-bold text-white sm:text-[32px]">
                {categoryTitle}
              </h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-[#e7dfd1] bg-[#FAF6EE] px-4 py-6 sm:px-6">
          <div className="w-container">
            <nav className="mb-2 flex items-center gap-1 font-montserrat text-xs text-[#A6A6A6]">
              <Link to="/" className="hover:text-[#2E2E2E]">
                Home
              </Link>
              <span>/</span>
              <Link to="/products" className="hover:text-[#2E2E2E]">
                Products
              </Link>
              <span>/</span>
              <span className="text-[#2E2E2E]">{categoryTitle}</span>
            </nav>
            <h1 className="font-montserrat text-[26px] font-bold text-[#2E2E2E] sm:text-[32px]">
              {categoryTitle}
            </h1>
            {categoryDesc && (
              <p className="mt-1 max-w-2xl font-montserrat text-sm text-[#787878]">
                {categoryDesc}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="w-container py-6 sm:py-8">
        {/* Controls row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-montserrat text-sm text-[#787878]">
            {meta?.total != null
              ? `${meta.total.toLocaleString()} products`
              : ""}
          </p>
          <div className="flex  items-center gap-3">
            <select
              value={searchParams.get("sort") || ""}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded-[6px]  border border-[#cfc6b8] bg-white px-3 py-2 font-montserrat text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option className="d" key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={searchParams.get("limit") || "12"}
              onChange={(e) => updateParam("limit", e.target.value)}
              className="rounded-[6px] border  border-[#cfc6b8] bg-white px-3 py-2 font-montserrat text-sm"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} per page
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="button  secondary flex items-center gap-1.5 px-3 py-2 text-sm lg:hidden"
            >
              <SlidersHorizontal size={14} /> Filters
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
                onClick={() =>
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    if (f.key === "price") {
                      next.delete("minPrice");
                      next.delete("maxPrice");
                    } else next.delete(f.key);
                    next.delete("page");
                    return next;
                  })
                }
                className="chip inline-flex items-center gap-1.5 text-xs font-medium"
              >
                {f.label} <X size={10} />
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-6">
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-montserrat font-semibold text-[#2E2E2E]">
                    Filters
                  </span>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="icon-button"
                  >
                    <X size={16} />
                  </button>
                </div>
                <Sidebar />
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
              empty={!products.length && !productState.loading}
              emptyTitle="No products found"
              emptyText="Try adjusting your filters or browse other categories."
              onRetry={() => dispatch(fetchProducts(getParams()))}
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

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="icon-button secondary"
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
                        className={`h-9 min-w-[36px] rounded-[6px] border px-2.5 font-montserrat text-sm font-medium transition ${currentPage === page ? "border-[#CE9F2D] bg-[#CE9F2D] text-white" : "border-[#cfc6b8] text-[#2E2E2E] hover:bg-[#FAF6EE]"}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 7 && <span className="text-[#A6A6A6]">…</span>}
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className="icon-button secondary"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

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
