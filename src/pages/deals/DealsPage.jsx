import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BadgePercent, Clock3 } from "lucide-react";
import Seo from "../../components/common/Seo";
import {
  CollectionToolbar,
  ProductResultsLayout,
} from "../../components/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { getPublicDealProducts } from "../../api/deals";

const SORT_OPTIONS = [
  { value: "ending_soon", label: "Ending Soon" },
  { value: "discount", label: "Biggest Discount" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Deals" },
];

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
  const sentinelRef = useRef(null);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  const pageSize = Number(searchParams.get("limit") || 12);
  const currentPage = Number(pageInfo.page || 1);
  const totalPages = Number(pageInfo.totalPages || 1);

  const getParams = useCallback(
    (pageOverride) => ({
      page: pageOverride || 1,
      limit: pageSize,
      q: searchParams.get("q") || undefined,
      category: searchParams.get("category") || undefined,
      brand: searchParams.get("brand") || undefined,
      sort: searchParams.get("sort") || "ending_soon",
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
  }, [loadDeals, searchParams]);

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

  const filters = useMemo(
    () =>
      [
        searchParams.get("q") && {
          key: "q",
          label: `Search: "${searchParams.get("q")}"`,
        },
        searchParams.get("category") && {
          key: "category",
          label: `Category: ${searchParams.get("category")}`,
        },
        searchParams.get("brand") && {
          key: "brand",
          label: `Brand: ${searchParams.get("brand")}`,
        },
      ].filter(Boolean),
    [searchParams],
  );

  const removeFilter = (key) => updateParam(key, "");

  return (
    <>
      <Seo
        title="Deals | Sam Global"
        description="Shop active deal products with special prices, deal badges, and limited-time offers."
      />

      <div className="my-8 md:my-16">
        <section className="mb-8 overflow-hidden rounded-[24px] border border-[#CE9F2D40] bg-[#FFF8E8] px-5 py-6 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#9A6A00]">
                <BadgePercent size={15} /> Live Deals
              </div>
              <h1 className="text-2xl font-bold text-[#1B1D60] md:text-4xl">
                Deal Products
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#5F5F75] md:text-base">
                Products promoted by admin with special deal price, original price, deal badge, and limited-time availability.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1B1D60]">
              <Clock3 size={16} /> Prices restore after deal expiry
            </div>
          </div>
        </section>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-md">
            <label className="mb-1 block text-xs font-semibold uppercase text-[#777]">
              Search Deals
            </label>
            <input
              value={searchParams.get("q") || ""}
              onChange={(event) => updateParam("q", event.target.value)}
              placeholder="Search deal products..."
              className="w-full rounded-lg border border-[#DDD5C1] bg-white px-4 py-2 text-sm outline-none focus:border-[#CE9F2D]"
            />
          </div>
          <CollectionToolbar
            sortValue={searchParams.get("sort") || "ending_soon"}
            sortOptions={SORT_OPTIONS}
            onSortChange={(value) => updateParam("sort", value)}
          />
        </div>

        <ProductResultsLayout
          totalResults={pageInfo.total}
          pageSize={pageSize}
          filterSections={[]}
          filters={filters}
          onRemoveFilter={removeFilter}
          onClearFilters={() => setSearchParams(new URLSearchParams())}
          sidebarOpen={false}
          onCloseSidebar={() => {}}
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
