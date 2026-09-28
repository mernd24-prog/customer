import { useNavigate } from "react-router-dom";
import ApiState from "../../../components/ui/ApiState";
import ActiveFilterChips from "../../../components/ui/ActiveFilterChips";
import FilterDrawer from "../../../components/ui/overlay/Drawer";
import ProductFilterSidebar from "./ProductFilterSidebar";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";
import Loader from "../../../components/ui/Loader";

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
  emptyActionLabel,
  onEmptyAction,
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
  onLoadMore,
  sentinelRef,
  sidebarTopContent,
  toolbar,
  children,
}) {
  const navigate = useNavigate();

  const resolvedEmptyActionLabel =
    emptyActionLabel !== undefined
      ? emptyActionLabel
      : "Continue Shopping";

  const resolvedOnEmptyAction =
    onEmptyAction || (() => navigate("/products"));

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

  /*
   * If the request finishes without products, show EmptyState
   * instead of the API error state.
   *
   * This also handles cases where the API returns:
   * - Network Error
   * - Empty response
   * - No product data
   * - Invalid/empty product payload
   */
  const shouldShowEmpty =
    !loading &&
    !refreshing &&
    productCount === 0 &&
    (empty || Boolean(error));

  const resolvedError = shouldShowEmpty ? null : error;

  return (
    <>
      <ActiveFilterChips
        filters={filters}
        onRemove={onRemoveFilter}
      />

      <div className="flex items-start gap-8 w-full mt-8">
        {(!shouldShowEmpty ||
          filterSections?.length > 0 ||
          loading) && (
          <div className="hidden lg:block lg:sticky lg:top-[calc(var(--customer-header-height,95px)+62px)] lg:self-start">
            <ProductFilterSidebar
              sections={filterSections}
              onClearAll={onClearFilters}
              topContent={sidebarTopContent}
              loading={
                loading && filterSections?.length === 0
              }
            />
          </div>
        )}

        <FilterDrawer
          open={sidebarOpen}
          onClose={onCloseSidebar}
        >
          <ProductFilterSidebar
            sections={filterSections}
            onClearAll={onClearFilters}
            topContent={sidebarTopContent}
            loading={
              loading && filterSections.length === 0
            }
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
                error={resolvedError}
                empty={shouldShowEmpty}
                emptyTitle={emptyTitle}
                emptyText={emptyText}
                emptyActionLabel={resolvedEmptyActionLabel}
                onEmptyAction={resolvedOnEmptyAction}
              >
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h4 className="text-m md:text-[20px] m-0">
                    Showing {rangeStart}-{rangeEnd} of {totalCount} Results
                  </h4>

                  {toolbar}
                </div>

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

                {currentPage < totalPages && (
                  <div className="mt-8 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (onLoadMore) {
                          onLoadMore();
                        }
                      }}
                      disabled={loadingMore}
                      className="inline-flex h-[42px] px-6 items-center justify-center gap-2 rounded-[10px] border border-[#3E4093] bg-transparent text-sm lg:text-base font-semibold text-[#3E4093] transition-all duration-300 hover:bg-[#3E4093] hover:text-white hover:border-[#3E4093] hover:shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <span>Load More</span>
                      )}
                    </button>
                  </div>
                )}

                {!showPagination &&
                  loadingMore &&
                  !onLoadMore && (
                    <div className="mt-8 flex items-center justify-center text-sm text-muted">
                      <Loader size="lg" />
                    </div>
                  )}

                {sentinelRef && (
                  <div
                    ref={sentinelRef}
                    className="h-8 w-full"
                  />
                )}
              </ApiState>
            ))}
        </div>
      </div>
    </>
  );
}