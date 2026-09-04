import Seo from "../../../components/ui/Seo";
import PageHeader from "../../../components/ui/PageHeader";
import { ProductListingLayout } from "../../../modules/products/components";
import { useCartActions, useWishlistActions } from "../../../modules/products/controllers/actions";
import useSearchPageController from "../controllers/useSearchPageController";

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Top Rated" },
];

export default function SearchPage() {
  const addToCart = useCartActions();
  const { isWishlisted, toggleWishlist } = useWishlistActions();

  const {
    q,
    categoryLabel,
    categoryValue,
    meta,
    limit,
    sort,
    hits,
    currentPage,
    totalPages,
    searchState,
    sidebarOpen,
    setSidebarOpen,
    updateParam,
    setPage,
    removeFilter,
    clearFiltersAction,
    activeFilters,
    filterSections,
  } = useSearchPageController();

  const topContent = (
    <div>
      {(q || categoryValue) && (
        <PageHeader
          title={
            q
              ? `Results for "${q}"`
              : `Products in Category: "${categoryLabel}"`
          }
          className="mb-0"
        />
      )}

      {meta.total != null && (
        <p className=" text-sm text-muted">
          {meta.total.toLocaleString()} Results
        </p>
      )}
    </div>
  );

  return (
    <ProductListingLayout
      pageTitle={q ? `Search: "${q}"` : "Search"}
      seoDescription="Search Products at Sam Global"
      topContent={topContent}
      totalResults={meta.total}
      pageSize={limit}
      sortValue={sort}
      sortOptions={meta.total <= 1 ? [] : SORT_OPTIONS}
      onSortChange={(value) => updateParam("sort", value)}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      filterSections={filterSections}
      activeFilters={activeFilters}
      onRemoveFilter={removeFilter}
      onClearFilters={clearFiltersAction}
      loading={searchState.loading && !hits.length}
      error={searchState.error}
      empty={!hits.length && !searchState.loading}
      emptyTitle="No results found"
      emptyText={
        q
          ? `We couldn't find anything for "${q}". Try different keywords or remove some filters.`
          : "We couldn't find any products in this category. Try selecting another category or removing some filters."
      }
      products={hits}
      viewMode="grid"
      onAddToCart={addToCart}
      onWishlist={toggleWishlist}
      isWishlisted={isWishlisted}
      currentPage={currentPage}
      totalPages={totalPages}
      loadingMore={false}
    >
      {!(q || categoryValue) ? (
        <div className="state-box flex flex-col items-center py-20 text-center">
          <Search size={48} className="mb-4 text-gray" />

          <p className=" text-[18px] font-semibold text-ink">
            What Are You Looking for?
          </p>

          <p className="mt-2  text-sm text-muted">
            Enter a Search Term Above to Find Products.
          </p>
        </div>
      ) : null}
    </ProductListingLayout>
  );
}
