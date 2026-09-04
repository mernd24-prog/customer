import { Store } from "lucide-react";
import Seo from "../../../components/ui/Seo";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import { ProductListingLayout } from "../../../modules/products/components";
import {
  useCartActions,
  useWishlistActions,
} from "../../../modules/products/controllers/actions";
import {
  getImageUrlFromValue,
  getProductPrice,
  isProductInStock,
} from "../../../utils/ecommerce";
import { getBrandLogo } from "../../../utils/pages/brandUtils";
import { scrollToTop } from "../../../utils/common";
import LoadingSkeleton from "../components/BrandLoadingSkeleton";
import { PAGE_SIZES, SORT_OPTIONS } from "../../../constants/data.constant";
import useBrandPageController from "../controllers/useBrandPageController";

export default function BrandPage() {
  const addToCart = useCartActions();
  const { isWishlisted, toggleWishlist } = useWishlistActions();

  const {
    brandSlug,
    decodedBrandSlug,
    brand,
    brandLoading,
    brandError,
    brandName,
    items,
    pageInfo,
    productState,
    firstLoadDone,
    isLoadingMore,
    sidebarOpen,
    setSidebarOpen,
    sentinelRef,
    currentPage,
    totalPages,
    updateParam,
    removeFilter,
    clearFiltersAction,
    activeFilters,
    filterSections,
    searchParams,
  } = useBrandPageController();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Brand Outlet", href: "/brand-outlet" },
    { label: brandName },
  ];

  if (brandLoading) {
    return (
      <div className="w-container py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (brandError) {
    return (
      <div className="w-container py-16 text-center">
        <Store size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className=" text-2xl font-bold text-ink">Brand Coming Soon</h2>
        <p className="mt-2  text-sm text-muted">
          This Brand Page Is Being Prepared and Will Be Available Soon.
        </p>
        <Link
          to="/brand-outlet"
          className="button primary mt-6 inline-block px-6 py-2"
        >
          Browse Brand Outlet
        </Link>
      </div>
    );
  }

  const brandImage = getBrandLogo(brand);
  const brandDescription = brand?.description || brand?.about;
  const showPageSizeSelector = Number(pageInfo.total || 0) >= 12;

  return (
    <ProductListingLayout
      pageTitle={`${brandName} Products`}
      seoDescription={
        brandDescription || `Shop ${brandName} products at Sam Global`
      }
      topContent={
        <div className="relative full-banner mt-4 overflow-hidden bg-[#1B1D60]">
          <div className="grid  gap-0 h-[320px] sm:h-[380px] md:h-[371px] xl:h-[500px] lg:grid-cols-[52%_48%]">
            <div className="relative lg:hidden h-full">
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-center">
                <div className="customer-container">
                  <div className="max-w-xl">
                    <Breadcrumbs
                      linkClassName="!text-white"
                      currentClassName="!text-[#CE9F2D]"
                      separatorClassName="!text-gold"
                      items={breadcrumbItems}
                      className="mb-5"
                    />
                    <h1 className="text-h1 font-bold leading-tight text-white capitalize">
                      {brandName}
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                      {brandDescription ||
                        `Shop ${brandName} products at Sam Global`}
                    </p>
                    <p className="mt-3 text-sm text-white">
                      {Number(pageInfo.total || 0).toLocaleString()} Products
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden items-center pl-6 pr-10 lg:flex xl:pl-[max(3rem,calc((100vw-1559px)/2))]">
              <div className="max-w-xl">
                <Breadcrumbs
                  items={breadcrumbItems}
                  linkClassName="!text-white"
                  currentClassName="!text-[#CE9F2D]"
                  separatorClassName="!text-white"
                  className="mb-5"
                />
                <h1 className="text-h1 font-bold leading-tight text-white capitalize">
                  {brandName}
                </h1>
                <p className="mt-3 max-w-xl font-normal leading-relaxed text-p text-white/80">
                  {brandDescription ||
                    `Shop ${brandName} products at Sam Global`}
                </p>
                <p className="mt-3 text-sm text-white">
                  {Number(pageInfo.total || 0).toLocaleString()} Products
                </p>
              </div>
            </div>
          </div>
        </div>
      }
      totalResults={pageInfo.total}
      pageSize={searchParams.get("limit") || 20}
      sortValue={searchParams.get("sort") || ""}
      sortOptions={pageInfo.total <= 1 ? [] : SORT_OPTIONS}
      onSortChange={(value) => updateParam("sort", value)}
      countText={`Showing ${Number(items.length || 0).toLocaleString()} of ${Number(pageInfo.total || 0).toLocaleString()} products`}
      pageSizeValue={searchParams.get("limit") || "20"}
      pageSizes={showPageSizeSelector ? PAGE_SIZES : []}
      onPageSizeChange={(value) => updateParam("limit", value)}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      filterSections={filterSections}
      activeFilters={activeFilters}
      onRemoveFilter={removeFilter}
      onClearFilters={clearFiltersAction}
      loading={
        (productState.loading && !items.length) ||
        (!firstLoadDone && !items.length && !!brand)
      }
      refreshing={productState.loading && items.length > 0 && !isLoadingMore}
      error={productState.error}
      empty={!items.length && !productState.loading && firstLoadDone}
      emptyTitle={`No Products from ${brandName}`}
      emptyText="Try adjusting your filters or check back later."
      products={items}
      viewMode="grid"
      onAddToCart={addToCart}
      onWishlist={toggleWishlist}
      isWishlisted={isWishlisted}
      currentPage={currentPage}
      totalPages={pageInfo.totalPages || 1}
      loadingMore={isLoadingMore}
      sentinelRef={sentinelRef}
    />
  );
}