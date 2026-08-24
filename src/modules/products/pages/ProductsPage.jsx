import Seo from "../../../components/ui/Seo";
import ProductListingLayout from "../components/ProductListingLayout";
import {
  CollectionToolbar,
  ProductResultsLayout,
  CheckboxListFilter,
  OptionFilter,
  PriceRangeFilter,
  RatingFilter,
} from "../components";
import { useProductsPageController } from "../controllers";

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "newest", label: "Latest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function ProductsPage() {
  const { searchParams, setSearchParams, viewMode, sidebarOpen, setSidebarOpen, products, availabilityCounts, attributeFacets, collectionOptions, absolutePriceLimits, categoryOptions, brandOptions, effectiveRatingCounts, handleFilterChange, handlePriceFilterChange, clearAllFilters, handleSortChange, productState, isLoadingMore, totalPages, currentPage, pageSize, sentinelRef, addToCart, isWishlisted, toggleWishlist, sidebarContent, pageTitle } = useProductsPageController();

  return (
    <ProductListingLayout
      pageTitle={pageTitle}
      seoDescription="Browse products with filters, sort, and pagination."
      totalResults={pageInfo.total}
      pageSize={pageSize}
      sortValue={searchParams.get("sort") || ""}
      sortOptions={pageInfo.total <= 1 ? [] : SORT_OPTIONS}
      onSortChange={(value) => updateParam("sort", value)}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      filterSections={filterSections}
      activeFilters={activeFilters}
      onRemoveFilter={removeFilter}
      onClearFilters={clearFiltersAction}
      loading={
        (productState.loading && !products.length) ||
        (!firstLoadDone && !products.length)
      }
      refreshing={productState.loading && products.length > 0 && !isLoadingMore}
      error={products.length === 0 ? productState.error : null}
      empty={!products.length && !productState.loading && firstLoadDone}
      emptyTitle={isSearchMode ? "No results found" : "No Products Found"}
      emptyText={
        isSearchMode
          ? "Try different keywords or remove filters."
          : "Try adjusting your filters or browse other categories."
      }
      products={products}
      viewMode={viewMode}
      onAddToCart={addToCart}
      onWishlist={toggleWishlist}
      isWishlisted={isWishlisted}
      currentPage={currentPage}
      totalPages={totalPages}
      loadingMore={isLoadingMore}
      sentinelRef={sentinelRef}
    />
  );
}
