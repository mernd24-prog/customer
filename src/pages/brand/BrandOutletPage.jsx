import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Seo from "../../components/ui/Seo";
import {
  BrandCard,
  CollectionToolbar,
  Pagination,
} from "../../components/ecommerce";
import CUSTOMER_ROUTES from "../../constants/routes";
import { fetchBrands } from "../../features/catalog/catalogSlice";
import { getImageUrlFromValue } from "../../utils/ecommerce";

import {
  listFromPayload,
  getBrandName,
  getBrandRouteKey,
  getBrandLogo,
  getBrandProductCount
} from "../../utils/pages/brandUtils";

const PAGE_SIZE_OPTIONS = [12, 20, 36, 48];

export default function BrandOutletPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [brandList, setBrandList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Number(searchParams.get("limit") || 20);

  useEffect(() => {
    setLoading(true);
    setError("");

    dispatch(fetchBrands({ params: { limit: 500 } }))
      .then((result) => {
        const brands = listFromPayload(result?.payload);
        setBrandList(brands);
      })
      .catch((err) => {
        setError(String(err?.message || err || "Failed to load brands"));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  const brands = useMemo(() => {
    return brandList
      .map((brand) => {
        const brandName = getBrandName(brand);
        return {
          ...brand,
          displayName: brandName,
          routeKey: getBrandRouteKey(brand),
          displayLogo: getBrandLogo(brand),
          productCount: getBrandProductCount(brand),
        };
      })
      .filter(
        (brand) =>
          brand.displayName && brand.routeKey && brand.productCount > 0,
      )
      .sort((a, b) =>
        a.displayName.localeCompare(b.displayName, undefined, {
          sensitivity: "base",
        }),
      );
  }, [brandList]);

  const totalBrands = brands.length;
  const totalPages = Math.max(1, Math.ceil(totalBrands / limit));
  const currentPage = Math.min(page, totalPages);

  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return brands.slice(start, start + limit);
  }, [brands, currentPage, limit]);

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value == null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      if (key !== "page") {
        next.delete("page");
      }
      return next;
    });
  };

  const handlePageChange = (newPage) => {
    updateParam("page", newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startItem = totalBrands ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, totalBrands);
  const countText = totalBrands
    ? `Showing ${startItem}–${endItem} of ${totalBrands} Brands`
    : "No brands found";

  const brandGridClass =
    "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5 xl:grid-cols-5";
  const stateContainerClass = "rounded-[12px] p-6 text-center";

  return (
    <>
      <Seo
        title="Brand Outlet | Sam Global"
        description="Shop Brand Outlet brands at Sam Global."
      />

      <main className="bg-white text-[var(--customer-ink)]">
        <div className="w-full">
          <div className="mt-6 lg:mt-10">
            <section className="pb-7">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-[20px] font-bold leading-tight text-[var(--customer-ink)] sm:text-[26px] lg:text-[28px]">
                  Shop Brands Available Now
                </h1>
              </div>

              {!loading && !error && totalBrands > 0 && (
                <CollectionToolbar
                  className="mb-6"
                  countText={countText}
                  pageSizeValue={limit}
                  pageSizes={PAGE_SIZE_OPTIONS}
                  onPageSizeChange={(val) => updateParam("limit", val)}
                />
              )}

              {loading ? (
                <div className={brandGridClass}>
                  {Array.from({ length: limit > 20 ? 20 : limit }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[190px] animate-pulse rounded-[14px] bg-[var(--customer-surface-soft)] sm:h-[215px] lg:h-[235px]"
                    />
                  ))}
                </div>
              ) : error ? (
                <div
                  className={`${stateContainerClass} border border-red-200 bg-red-50`}
                >
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              ) : paginatedBrands.length ? (
                <>
                  <div className={brandGridClass}>
                    {paginatedBrands.map((brand) => (
                      <BrandCard
                        key={brand.routeKey}
                        name={brand.displayName}
                        image={brand.displayLogo}
                        subtitle=""
                        href={CUSTOMER_ROUTES.brand(brand.routeKey)}
                        className="min-h-0 items-center border-0 bg-transparent p-0 text-center shadow-none hover:translate-y-0 hover:border-transparent hover:shadow-none [&>div:first-child]:h-[150px] [&>div:first-child]:w-full [&>div:first-child]:rounded-[14px] [&>div:first-child]:border-0 [&>div:first-child]:bg-[var(--customer-surface-soft)] [&>div:first-child]:p-7 [&>div:first-child_img]:max-h-[90px] [&>div:first-child_img]:max-w-[120px] [&>div:nth-child(2)]:mt-3 [&>div:nth-child(2)]:flex-none [&>div:nth-child(2)_p]:hidden sm:[&>div:first-child]:h-[170px] sm:[&>div:first-child_img]:max-h-[110px] sm:[&>div:first-child_img]:max-w-[140px] lg:[&>div:first-child]:h-[190px] lg:[&>div:first-child_img]:max-h-[125px] lg:[&>div:first-child_img]:max-w-[155px]"
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                <div
                  className={`${stateContainerClass} border border-[var(--customer-border)] bg-[var(--customer-cream)]`}
                >
                  <p className="text-sm font-semibold text-[var(--customer-ink)]">
                    No Brands Available Right Now.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

