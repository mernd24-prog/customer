import Seo from "../ui/Seo";
import { CollectionToolbar, ProductResultsLayout } from "./index";

export default function ProductListingLayout({
  // SEO
  pageTitle,
  seoDescription,

  topContent,

  // Toolbar
  totalResults,
  pageSize,
  sortValue,
  sortOptions,
  onSortChange,
  sidebarOpen,
  setSidebarOpen,
  filterSections,
  activeFilters,
  onRemoveFilter,
  onClearFilters,

  loading,
  refreshing,
  error,
  empty,
  emptyTitle,
  emptyText,
  products,
  viewMode,

  onAddToCart,
  onWishlist,
  isWishlisted,

  currentPage,
  totalPages,
  loadingMore,
  sentinelRef,
}) {
  return (
    <>
      <Seo title={`${pageTitle} | Sam Global`} description={seoDescription} />

      {topContent}

      <div className="my-3 md:my-6">
        <ProductResultsLayout
          totalResults={totalResults}
          pageSize={pageSize}
          filterSections={filterSections}
          filters={activeFilters}
          onRemoveFilter={onRemoveFilter}
          onClearFilters={onClearFilters}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          loading={loading}
          refreshing={refreshing}
          error={error}
          empty={empty}
          emptyTitle={emptyTitle}
          emptyText={emptyText}
          products={products}
          viewMode={viewMode}
          onAddToCart={onAddToCart}
          onWishlist={onWishlist}
          isWishlisted={isWishlisted}
          currentPage={currentPage}
          totalPages={totalPages}
          showPagination={false}
          loadingMore={loadingMore}
          sentinelRef={sentinelRef}
          toolbar={
            <CollectionToolbar
              sortValue={sortValue}
              sortOptions={sortOptions}
              onSortChange={onSortChange}
              onOpenFilters={() => setSidebarOpen(true)}
            />
          }
        />
      </div>
    </>
  );
}
