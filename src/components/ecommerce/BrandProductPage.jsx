import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";
import CollectionToolbar from "./CollectionToolbar";
import ProductResultsLayout from "./ProductResultsLayout";
import { applyImageFallback } from "../../utils/ecommerce";

export default function BrandProductPage({
  brandName,
  brandDescription,
  brandImage,
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
        <h2 className=" text-2xl font-bold text-ink">Brand Not Found</h2>
        <p className="mt-2  text-sm text-muted">
          The brand you&apos;re looking for doesn&apos;t exist or may have been
          removed.
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
      <div className="border-b border-border bg-gradient-to-br from-slate-50 to-cream px-4 py-8 sm:px-6">
        <div className="w-container">
          <Breadcrumbs items={breadcrumbs} className="mb-4 text-gray" />
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {brandImage ? (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[var(--customer-radius)] border border-border bg-white p-2 shadow-sm sm:h-28 sm:w-28">
                <img
                  src={brandImage}
                  alt={brandName}
                  className="h-full w-full object-contain"
                  onError={(event) =>
                    applyImageFallback(event, brandName, "brand")
                  }
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--customer-radius)] bg-slate-100 sm:h-28 sm:w-28">
                <Store size={32} className="text-slate-400" />
              </div>
            )}
            <div>
              <h1 className=" text-3xl font-bold text-ink sm:text-4xl">
                {brandName}
              </h1>
              {brandDescription && (
                <p className="mt-2 max-w-2xl  text-sm leading-relaxed text-muted">
                  {brandDescription}
                </p>
              )}
              <p className="mt-2  text-sm text-gray">
                {Number(total || 0).toLocaleString()} products
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-container py-6 sm:py-8">
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
