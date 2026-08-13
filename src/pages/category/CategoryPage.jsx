import Seo from "../../components/ui/Seo";
import { CollectionToolbar, ProductResultsLayout } from "../../components/ecommerce";
import { isNotFoundApiError } from "../../utils/apiErrors";
import { SORT_OPTIONS } from "../../constants/data.constant";
import useCategory from "./hooks/useCategory";
import { SubCategoryStrip } from "./components/SubCategoryStrip";
import { CategorySidebarNav } from "./components/CategorySidebarNav";

export default function CategoryPage() {
  const {
    categoryKey,
    searchParams,
    viewMode,
    sidebarOpen,
    setSidebarOpen,
    productState,
    products,
    pageInfo,
    isLoadingMore,
    firstLoadDone,
    categoryError,
    addToCart,
    isWishlisted,
    toggleWishlist,
    sentinelRef,
    categoryTitle,
    sidebarCategoryTitle,
    categoryDesc,
    visibleSubCategories,
    isInitialLoading,
    showSubCategoryStrip,
    showCategorySidebar,
    filterSections,
    activeFilters,
    removeFilter,
    clearFiltersAction,
    currentPage,
    totalPages,
    updateParam,
  } = useCategory();

  return (
    <>
      <Seo
        title={`${categoryTitle.replace(/\b\w/g, (c) => c.toUpperCase())} | Sam Global`}
        description={
          categoryDesc ||
          `Shop ${categoryTitle} products at best prices. Free delivery & easy returns.`
        }
      />

      {categoryError && !isNotFoundApiError(categoryError) && (
        <div className="mt-4 rounded-[var(--customer-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Category details could not be loaded right now. Product results and
          filters are still available below.
        </div>
      )}

      {/* ── Product listing with sidebar filters ────────────────────────── */}
      <div className="py-5 sm:py-7">
        {showSubCategoryStrip && (
          <SubCategoryStrip categories={visibleSubCategories} loading={isInitialLoading} />
        )}

        <CollectionToolbar
          countText={firstLoadDone ? `${(pageInfo.total || products.length).toLocaleString()} products` : ""}
          sortValue={searchParams.get("sort") || ""}
          sortOptions={firstLoadDone && (pageInfo.total || products.length) <= 1 ? [] : SORT_OPTIONS}
          onSortChange={(value) => updateParam("sort", value)}
          onOpenFilters={() => setSidebarOpen(true)}
        />

        <ProductResultsLayout
          filterSections={filterSections}
          sidebarTopContent={
            showCategorySidebar ? (
              <CategorySidebarNav
                categoryTitle={sidebarCategoryTitle}
                categories={visibleSubCategories}
                activeKey={categoryKey}
              />
            ) : null
          }
          filters={activeFilters}
          onRemoveFilter={removeFilter}
          onClearFilters={clearFiltersAction}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          loading={
            (productState.loading && !products.length) ||
            (!firstLoadDone && !products.length)
          }
          refreshing={
            productState.loading && products.length > 0 && !isLoadingMore
          }
          error={products.length === 0 ? productState.error : null}
          empty={!products.length && !productState.loading && firstLoadDone}
          emptyTitle="No Products Found"
          emptyText="Try adjusting your filters or browse other categories."
          products={products}
          viewMode={viewMode}
          onAddToCart={addToCart}
          onWishlist={toggleWishlist}
          isWishlisted={isWishlisted}
          currentPage={currentPage}
          totalPages={totalPages}
          showPagination={false}
          loadingMore={isLoadingMore}
          sentinelRef={sentinelRef}
        />
      </div>
    </>
  );
}
