import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import { ProductListingLayout } from "../../../modules/products/components";
import {
  useCartActions,
  useWishlistActions,
} from "../../../modules/products/controllers/actions";
import useDealsPageController from "../controllers/useDealsPageController";
import { useCmsRecord } from "../../../hooks/useCmsRecord";

const SORT_OPTIONS = [
  { value: "ending_soon", label: "Ending Soon" },
  { value: "discount", label: "Biggest Discount" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Deals" },
];

const FALLBACK_DEAL_TITLE = "Deal Products";

const FALLBACK_DEAL_DESCRIPTION =
  "Products promoted by admin with special deal price, original price, deal badge, and limited-time availability.";

export default function DealsPage() {
  const navigate = useNavigate();
  const addToCart = useCartActions();
  const { isWishlisted, toggleWishlist } = useWishlistActions();

  // CMS data
  const {
    page: cmsPage,
    loading: cmsLoading,
    error: cmsError,
  } = useCmsRecord("deal-products");

  const {
    products,
    pageInfo,
    loading,
    loadingMore,
    error,
    firstLoadDone,
    sidebarOpen,
    setSidebarOpen,
    sentinelRef,
    pageSize,
    currentPage,
    totalPages,
    updateParam,
    removeFilter,
    clearFiltersAction,
    activeFilters,
    filterSections,
    searchParams,
  } = useDealsPageController();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Deals" },
  ];

  
  const dealTitle =
    cmsPage?.title ||
    cmsPage?.metadata?.data?.title ||
    FALLBACK_DEAL_TITLE;

  const dealDescription =
    cmsPage?.description ||
    cmsPage?.metadata?.data?.description ||
    cmsPage?.excerpt ||
    FALLBACK_DEAL_DESCRIPTION;

  const pageError = error || cmsError;

  return (
    <ProductListingLayout
      pageTitle={dealTitle}
      seoDescription={dealDescription}
      topContent={
        <div className="relative full-banner mt-4 overflow-hidden bg-[#1B1D60]">
          <div className="h-[320px]">
            <div className="relative flex h-full items-center">
              <div className="customer-container w-full">
                <div className="max-w-xl">
                  <Breadcrumbs
                    items={breadcrumbItems}
                    linkClassName="!text-white"
                    currentClassName="!text-[#CE9F2D]"
                    separatorClassName="!text-white"
                    className="mb-5"
                  />

                  <h1 className="text-h1 font-bold leading-tight text-white capitalize">
                    {dealTitle}
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                    {dealDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      totalResults={pageInfo.total}
      pageSize={pageSize}
      sortValue={searchParams.get("sort") || "ending_soon"}
      sortOptions={pageInfo.total <= 1 ? [] : SORT_OPTIONS}
      onSortChange={(value) => updateParam("sort", value)}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      filterSections={filterSections}
      activeFilters={activeFilters}
      onRemoveFilter={removeFilter}
      onClearFilters={clearFiltersAction}
      loading={
        cmsLoading ||
        (loading && !products.length) ||
        (!firstLoadDone && !products.length)
      }
      error={pageError}
      empty={!products.length && !loading && firstLoadDone}
      emptyTitle="No active deals found"
      emptyText="Please check back later for new deal products."
      emptyActionLabel="Continue Shopping"
      onEmptyAction={() => navigate("/products")}
      products={products}
      viewMode="grid"
      onAddToCart={addToCart}
      onWishlist={toggleWishlist}
      isWishlisted={isWishlisted}
      currentPage={currentPage}
      totalPages={totalPages}
      loadingMore={loadingMore}
      sentinelRef={sentinelRef}
    />
  );
}
