import { BadgePercent } from "lucide-react";
import Seo from "../../../components/ui/Seo";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import { ProductListingLayout } from "../../../modules/products/components";
import {
  useCartActions,
  useWishlistActions,
} from "../../../modules/products/controllers/actions";
import { applyImageFallback } from "../../../utils/ecommerce";
import useDealsPageController from "../controllers/useDealsPageController";
import bannerImage from "/image/png/ShoppingBanner.png";

const SORT_OPTIONS = [
  { value: "ending_soon", label: "Ending Soon" },
  { value: "discount", label: "Biggest Discount" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Deals" },
];

export default function DealsPage() {
  const addToCart = useCartActions();
  const { isWishlisted, toggleWishlist } = useWishlistActions();

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

  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Deals" }];

  return (
    <ProductListingLayout
      pageTitle="Deals"
      seoDescription="Shop active deal products with special prices, deal badges, and limited-time offers."
      topContent={
        <div className="relative full-banner mt-4 overflow-hidden bg-[#1B1D60]">
          <div className="grid gap-0 h-[320px] sm:h-[380px] md:h-[371px] xl:h-[500px] lg:grid-cols-[52%_48%]">
            {/* Mobile & Tablet Banner */}
            <div className="relative lg:hidden h-full">
              <img
                loading="lazy"
                width="400"
                height="400"
                src={bannerImage}
                alt="Deals"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) =>
                  applyImageFallback(event, "Deals", "category")
                }
              />
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
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#9A6A00]">
                      <BadgePercent size={15} /> Live Deals
                    </div>
                    <h1 className="text-h1 font-bold leading-tight text-white capitalize">
                      Deal Products
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                      Products promoted by admin with special deal price,
                      original price, deal badge, and limited-time availability.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Content */}
            <div className="hidden items-center pl-6 pr-10 lg:flex xl:pl-[max(3rem,calc((100vw-1559px)/2))]">
              <div className="max-w-xl">
                <Breadcrumbs
                  items={breadcrumbItems}
                  linkClassName="!text-white"
                  currentClassName="!text-[#CE9F2D]"
                  separatorClassName="!text-white"
                  className="mb-5"
                />
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#9A6A00]">
                  <BadgePercent size={15} /> Live Deals
                </div>
                <h1 className="text-h1 font-bold leading-tight text-white capitalize">
                  Deal Products
                </h1>
                <p className="mt-3 max-w-xl font-normal leading-relaxed text-p text-white/80">
                  Products promoted by admin with special deal price, original
                  price, deal badge, and limited-time availability.
                </p>
              </div>
            </div>

            {/* Desktop Image */}
            <div className="relative hidden lg:block overflow-hidden -ml-px">
              <img
                loading="lazy"
                width="400"
                height="400"
                src={bannerImage}
                alt="Deals"
                className="h-full w-full object-cover object-right"
                onError={(event) =>
                  applyImageFallback(event, "Deals", "category")
                }
              />
              <div className="absolute inset-y-0 -left-px right-0 bg-gradient-to-r from-[#1B1D60] via-[#1B1D60]/20 to-transparent" />
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
      loading={loading && !products.length}
      error={error}
      empty={!products.length && !loading && firstLoadDone}
      emptyTitle="No active deals found"
      emptyText="Please check back later for new deal products."
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