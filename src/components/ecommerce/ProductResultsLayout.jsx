import ApiState from "../ui/ApiState";
import ActiveFilterChips from "../ui/ActiveFilterChips";
import FilterDrawer from "../ui/overlay/Drawer";
import ProductFilterSidebar from "./ProductFilterSidebar";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";
import Loader from "../ui/Loader";

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

      <div className="flex  items-start gap-8 w-full ">
        {(!empty || filterSections?.length > 0 || loading) && (
          <div className="hidden lg:block ">
            <ProductFilterSidebar
              sections={filterSections}
              onClearAll={onClearFilters}
              topContent={sidebarTopContent}
              loading={loading && filterSections?.length === 0}
            />
          </div>
        )}

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
                <h4 className="text-m md:text-[20px] my-4">
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
