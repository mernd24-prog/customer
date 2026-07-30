import ApiState from "../common/ApiState";
import ActiveFilterChips from "../common/ActiveFilterChips";
import FilterDrawer from "../common/overlay/Drawer";
import ProductFilterSidebar from "./ProductFilterSidebar";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";
import Loader from "../common/Loader";

export default function ProductResultsLayout({
  totalResults = 0,
  pageSize = 12,
  filterSections = [],
  filters = [],
  onRemoveFilter,
  onClearFilters,
  sidebarOpen,
  onCloseSidebar,
  loading,
  refreshing = false,
  error,
  empty,
  emptyTitle,
  emptyText,
  products = [],
  viewMode = "grid",
  onAddToCart,
  onWishlist,
  isWishlisted,
  currentPage,
  totalPages,
  onPageChange,
  showPagination = true,
  loadingMore,
  sentinelRef,
  sidebarTopContent,
  children,
}) {
  const productCount = products.length;
  const totalCount = Number(totalResults) || productCount;
  const perPage = Number(pageSize) || productCount || 1;
  const page = Number(currentPage) || 1;
  const rangeStart = productCount
    ? showPagination
      ? (page - 1) * perPage + 1
      : 1
    : 0;
  const rangeEnd = productCount
    ? showPagination
      ? Math.min(rangeStart + productCount - 1, totalCount)
      : Math.min(productCount, totalCount)
    : 0;

  return (
    <>
      <ActiveFilterChips filters={filters} onRemove={onRemoveFilter} />

      <div className="flex  mt-8 items-start gap-8 lg:sticky lg:top-[calc(var(--customer-header-height,95px)+80px)]  lg:self-start lg:h-fit w-full ">
        <div className="hidden lg:block ">
          <ProductFilterSidebar
            sections={filterSections}
            onClearAll={onClearFilters}
            topContent={sidebarTopContent}
            loading={loading && filterSections.length === 0}
          />
        </div>

        <FilterDrawer open={sidebarOpen} onClose={onCloseSidebar}>
          <ProductFilterSidebar
            sections={filterSections}
            onClearAll={onClearFilters}
            topContent={sidebarTopContent}
            loading={loading && filterSections.length === 0}
          />
        </FilterDrawer>

        <div className="min-w-0 w-full flex-1">
          {children ||
            (loading || refreshing ? (
              <div className="flex min-h-[360px] w-full items-center justify-center">
                <Loader size="lg" />
              </div>
            ) : (
              <ApiState
                loading={false}
                error={error}
                empty={empty}
                emptyTitle={emptyTitle}
                emptyText={emptyText}
              >
                <h4 className="text-m md:text-[20px] lg:mb-8">
                  Showing {rangeStart}-{rangeEnd} Of {totalCount} Results
                </h4>
                <ProductGrid
                  products={products}
                  variant={viewMode}
                  onAddToCart={onAddToCart}
                  onWishlist={onWishlist}
                  isWishlisted={isWishlisted}
                />

                {showPagination && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                  />
                )}

                {loadingMore && (
                  <div className="mt-8 flex items-center justify-center   text-sm text-muted ">
                    <Loader size="lg" />
                  </div>
                )}
                {sentinelRef && (
                  <div ref={sentinelRef} className="h-8 w-full" />
                )}
              </ApiState>
            ))}
        </div>
      </div>
    </>
  );
}
