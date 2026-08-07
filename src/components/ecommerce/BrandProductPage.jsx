import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";
import CollectionToolbar from "./CollectionToolbar";
import ProductResultsLayout from "./ProductResultsLayout";

export default function BrandProductPage({
  brandName,
  brandDescription,
  breadcrumbs = [],
  total = 0,
  shown = 0,
  sortValue = "",
  sortOptions = [],
  onSortChange,
  pageSizeValue,
  pageSizes = [],
  onPageSizeChange,
  onOpenFilters,
  resultsProps,
}) {
  if (!brandName) {
    return (
      <div className="w-container py-16 text-center">
        <Store size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className=" text-2xl font-bold text-ink">Brand Coming Soon</h2>
        <p className="mt-2  text-sm text-muted">
          This Brand Page Is Being Prepared and Will Be Available Soon.
        </p>
        <Link
          to="/products"
          className="button primary mt-6 inline-block px-6 py-2"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="relative full-banner mt-4 overflow-hidden bg-[#1B1D60]">
        <div className="grid  gap-0 h-[320px] sm:h-[380px] md:h-[371px] xl:h-[500px] lg:grid-cols-[52%_48%]">
          {/* Mobile & Tablet Banner */}
          <div className="relative lg:hidden h-full">
            {/* <img
              src={brandImage || bannerImage}
              alt={brandName}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(event) => applyImageFallback(event, brandName, "brand")}
            /> */}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center">
              <div className="customer-container">
                <div className="max-w-xl">
                  <Breadcrumbs
                    linkClassName="!text-white"
                    currentClassName="!text-[#CE9F2D]"
                    separatorClassName="!text-gold"
                    items={breadcrumbs}
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
                    {Number(total || 0).toLocaleString()} Products
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Content */}
          <div className="hidden items-center pl-6 pr-10 lg:flex xl:pl-[max(3rem,calc((100vw-1559px)/2))]">
            <div className="max-w-xl">
              <Breadcrumbs
                items={breadcrumbs}
                linkClassName="!text-white"
                currentClassName="!text-[#CE9F2D]"
                separatorClassName="!text-white"
                className="mb-5"
              />
              <h1 className="text-h1 font-bold leading-tight text-white capitalize">
                {brandName}
              </h1>
              <p className="mt-3 max-w-xl font-normal leading-relaxed text-p text-white/80">
                {brandDescription || `Shop ${brandName} products at Sam Global`}
              </p>
              <p className="mt-3 text-sm text-white">
                {Number(total || 0).toLocaleString()} Products
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className=" py-6 sm:py-8">
        <CollectionToolbar
          countText={`Showing ${Number(shown || 0).toLocaleString()} of ${Number(total || 0).toLocaleString()} products`}
          sortValue={sortValue}
          sortOptions={sortOptions}
          onSortChange={onSortChange}
          pageSizeValue={pageSizeValue}
          pageSizes={pageSizes}
          onPageSizeChange={onPageSizeChange}
          onOpenFilters={onOpenFilters}
        />
        <ProductResultsLayout {...resultsProps} />
      </div>
    </>
  );
}
