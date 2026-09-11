import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Seo from "../../../components/ui/Seo";
import BrandCard from "../components/BrandCard";
import { EmptyState } from "../../../components/ui/feedback";
import {
  CollectionToolbar,
  Pagination,
} from "../../../modules/products/components";
import CUSTOMER_ROUTES from "../../../constants/routes";
import { fetchBrands } from "../../../features/catalog/catalogSlice";
import { getImageUrlFromValue } from "../../../utils/ecommerce";

import {
  listFromPayload,
  getBrandName,
  getBrandRouteKey,
  getBrandLogo,
  getBrandProductCount,
} from "../../../utils/pages/brandUtils";
import { scrollToTop } from "../../../utils/common";

const PAGE_SIZE_OPTIONS = [12, 20, 36, 48];

export default function BrandOutletPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [brandList, setBrandList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode] = useState("grid");

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.max(1, Number(searchParams.get("limit") || 12));
  const sort = searchParams.get("sort") || "name-asc";
  const search = searchParams.get("q") || "";

  useEffect(() => {
    dispatch(fetchBrands({ limit: 500 }))
      .unwrap()
      .then((res) => {
        setBrandList(listFromPayload(res));
      })
      .catch((err) => {
        setError(err?.message || "Failed to load brands.");
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  const brands = useMemo(() => {
    let list = Array.isArray(brandList) ? [...brandList] : [];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => getBrandName(b).toLowerCase().includes(q));
    }

    if (sort === "name-asc") {
      list.sort((a, b) => getBrandName(a).localeCompare(getBrandName(b)));
    } else if (sort === "name-desc") {
      list.sort((a, b) => getBrandName(b).localeCompare(getBrandName(a)));
    } else if (sort === "products-desc") {
      list.sort((a, b) => getBrandProductCount(b) - getBrandProductCount(a));
    }

    return list;
  }, [brandList, search, sort]);

  const totalBrands = brands.length;
  const totalPages = Math.max(1, Math.ceil(totalBrands / limit));
  const currentPage = Math.min(page, totalPages);

  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return brands.slice(start, start + limit);
  }, [brands, currentPage, limit]);

  const updateParam = (key, value) => {
    scrollToTop(() => {
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
    });
  };

  const handlePageChange = (newPage) => {
    updateParam("page", newPage);
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
                <h1 className="text-[20px] font-bold leading-tight text-blue sm:text-[26px] lg:text-[28px]">
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
                  {Array.from({ length: limit > 20 ? 20 : limit }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="h-[190px] animate-pulse rounded-[14px] bg-[var(--customer-surface-soft)] sm:h-[215px] lg:h-[235px]"
                      />
                    ),
                  )}
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
                        className="
                        min-h-0 items-center
                        rounded-[12px]
                        border border-[#EEE8DA]
                        bg-[#FAF8F3]
                        p-1.5
                        text-center
                        shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                        transition-all duration-300 ease-out
                        hover:-translate-y-0.5
                        hover:border-[#E5D6B5]
                        hover:bg-[#F9F5EC]
                        hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]

                        [&>div:first-child]:h-[150px]
                        [&>div:first-child]:w-full
                        [&>div:first-child]:rounded-[9px]
                        [&>div:first-child]:border-0
                        [&>div:first-child]:bg-white
                        [&>div:first-child]:p-4

                        [&>div:first-child_img]:max-h-[90px]
                        [&>div:first-child_img]:max-w-[120px]
                        [&>div:first-child_img]:object-contain
                        [&>div:first-child_img]:transition-transform
                        [&>div:first-child_img]:duration-300
                        group-hover:[&>div:first-child_img]:scale-[1.04]

                        [&>div:nth-child(2)]:mt-2.5
                        [&>div:nth-child(2)]:flex-none
                        [&>div:nth-child(2)_p]:hidden

                        sm:[&>div:first-child]:h-[165px]
                        sm:[&>div:first-child_img]:max-h-[100px]
                        sm:[&>div:first-child_img]:max-w-[135px]

                        lg:[&>div:first-child]:h-[180px]
                        lg:[&>div:first-child_img]:max-h-[115px]
                        lg:[&>div:first-child_img]:max-w-[150px]
                      "
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
                <EmptyState
                  imageSrc="/image/png/NoProductFound.png"
                  title="No Brands Found"
                  description="We couldn't find any brands available at the moment. Please check back later or explore our products."
                >
                  <div className="flex flex-wrap items-center justify-center gap-3.5">
                    <Link
                      to="/products"
                      className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-gradient-to-r from-[#B8891F] to-[#CE9F2D] text-white font-bold text-sm shadow-sm hover:from-[#3E4093] hover:to-[#1B1D60] hover:shadow-md transition-all duration-200"
                    >
                      <span>Explore Products</span>
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      to="/categories"
                      className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-[#CE9F2D] text-[#1B1D60] font-bold text-sm hover:bg-[#FAF8F3] hover:border-[#B8891F] transition-all duration-200"
                    >
                      <span>Browse Categories</span>
                    </Link>
                  </div>
                </EmptyState>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
