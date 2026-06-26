import ApiState from "../common/ApiState";
import ActiveFilterChips from "../common/ActiveFilterChips";
import FilterDrawer from "../common/overlay/Drawer";
import ProductFilterSidebar from "./ProductFilterSidebar";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";
import Loader from "../common/Loader";

export default function ProductResultsLayout({
  filterSections = [],
  filters = [],
  onRemoveFilter,
  onClearFilters,
  sidebarOpen,
  onCloseSidebar,
  loading,
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
  children,
}) {
  return (
    <>
      <ActiveFilterChips
        filters={filters}
        onRemove={onRemoveFilter}
        onClear={onClearFilters}
      />

      <div className="flex  mt-8 items-start gap-8 lg:sticky lg:top-[calc(var(--customer-header-height,0px)+24px)]  lg:self-start lg:h-fit w-full ">
        <div className="hidden lg:block ">
          <ProductFilterSidebar
            sections={filterSections}
            onClearAll={onClearFilters}
          />
        </div>

        <FilterDrawer open={sidebarOpen} onClose={onCloseSidebar}>
          <ProductFilterSidebar
            sections={filterSections}
            onClearAll={onClearFilters}
          />
        </FilterDrawer>

        <div className="min-w-0 w-full flex-1">
          {children ||
            (loading ? (
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
              <h4 className="text-xl md:text-[24px] mb-6 lg:mb-12">
                Showing 1–30 of 85 results
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
              {sentinelRef && <div ref={sentinelRef} className="h-8 w-full" />}
            </ApiState>
            ))}
        </div>
      </div>
    </>
  );
}
