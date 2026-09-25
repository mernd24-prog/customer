import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";

import Seo from "../../../components/ui/Seo";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import BrandCard from "../components/BrandCard";
import { EmptyState } from "../../../components/ui/feedback";
import { Pagination } from "../../../modules/products/components";
import FilterDropdown from "../../../components/ui/FilterDropdown";
import CUSTOMER_ROUTES from "../../../constants/routes";
import { fetchBrands } from "../../../features/catalog/catalogSlice";
import { PageContainer } from "../../../components/ui/layout";

import {
  listFromPayload,
  getBrandName,
  getBrandRouteKey,
  getBrandLogo,
} from "../../../utils/pages/brandUtils";
import { scrollToTop } from "../../../utils/common";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40];
const DEFAULT_PAGE_SIZE = 10;

export default function BrandOutletPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [brandList, setBrandList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverTotal, setServerTotal] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const requestedLimit = Number(
    searchParams.get("limit") || DEFAULT_PAGE_SIZE,
  );
  const limit = PAGE_SIZE_OPTIONS.includes(requestedLimit)
    ? requestedLimit
    : DEFAULT_PAGE_SIZE;
  const search = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "name-asc";

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    dispatch(fetchBrands({ limit, page, q: search, sort }))
      .unwrap()
      .then((res) => {
        if (!active) return;

        const list = listFromPayload(res);
        setBrandList(Array.isArray(list) ? list : []);

        const meta = res?.meta || res?.data?.meta || {};
        const total = Number(
          meta?.total ?? meta?.totalItems ?? meta?.count ?? 0,
        );
        const pages = Number(
          meta?.totalPages ??
            meta?.pages ??
            (total > 0 ? Math.ceil(total / limit) : 1),
        );

        setServerTotal(total);
        setServerTotalPages(Math.max(1, pages));
      })
      .catch((err) => {
        if (!active) return;
        setBrandList([]);
        setServerTotal(0);
        setServerTotalPages(1);
        setError(err?.message || "Failed to load brands.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dispatch, limit, page, search, sort]);

  // Keep the API page intact. The server is responsible for search/sort,
  // while the UI renders every brand returned for the requested page size.
  const brands = Array.isArray(brandList) ? brandList : [];

  const totalBrands = serverTotal > 0 ? serverTotal : brands.length;
  const totalPages =
    serverTotalPages > 1
      ? serverTotalPages
      : Math.max(1, Math.ceil(totalBrands / limit));
  const currentPage = Math.min(page, totalPages);

  const updateParam = (key, value) => {
    scrollToTop(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (value == null || value === "") next.delete(key);
        else next.set(key, String(value));

        if (key !== "page") next.delete("page");

        return next;
      });
    });
  };

  const handlePageChange = (newPage) => updateParam("page", newPage);
  const handleSearchChange = (value) => updateParam("q", value);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Brand Outlet", href: "/brand-outlet" },
  ];

  const brandGridClass =
    "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5 xl:grid-cols-5";
  const stateContainerClass = "rounded-[12px] p-6 text-center";

  return (
    <>
      <Seo
        title="Brand Outlet | Sam Global"
        description="Shop Brand Outlet brands at Sam Global."
      />

      <PageContainer>
        <Breadcrumbs
          items={breadcrumbItems}
          className="mb-2 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
          heading={null}
        />

        <div className="flex flex-col gap-5 sm:gap-6 lg:gap-7 lg:mt-4">
          <section className="min-w-0 rounded-xl bg-white">
            <div className="mb-6 flex flex-col gap-3">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <label className="relative block w-full sm:max-w-[640px]">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9E886A]"
                  />
                  <input
                    value={search}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Search brands"
                    className="h-11 w-full rounded-lg border border-[#E4DDCF] bg-[#FAF6EE]/40 pl-11 pr-11 text-sm font-medium text-[#1F2430] placeholder-[#6F7480] outline-none transition-all focus:bg-white focus:ring-3 focus:ring-[#D6A323]/15 shadow-2xs"
                  />
                  {Boolean(search) && (
                    <button
                      type="button"
                      onClick={() => handleSearchChange("")}
                      aria-label="Clear search"
                      className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#6F7480] transition hover:text-[#1F2430]"
                    >
                      <X size={16} />
                    </button>
                  )}
                </label>

                <FilterDropdown
                  options={PAGE_SIZE_OPTIONS.map((size) => ({
                    value: size,
                    label: `${size} per page`,
                  }))}
                  value={limit}
                  onChange={(value) => {
                    const nextLimit = Number(value);
                    if (PAGE_SIZE_OPTIONS.includes(nextLimit)) {
                      updateParam("limit", nextLimit);
                    }
                  }}
                  placeholder="Per page"
                  className="w-full sm:w-[150px]"
                />
              </div>
            </div>

            {loading ? (
              <div className={brandGridClass}>
                {Array.from({ length: limit }).map((_, index) => (
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
            ) : brands.length ? (
              <>
                <div className={brandGridClass}>
                  {brands.map((brand) => (
                    <BrandCard
                      key={getBrandRouteKey(brand)}
                      name={getBrandName(brand)}
                      image={getBrandLogo(brand)}
                      subtitle=""
                      href={CUSTOMER_ROUTES.brand(getBrandRouteKey(brand))}
                      className="
                        min-h-0 items-center rounded-[12px]
                        border border-[#EEE8DA] bg-[#FAF8F3] p-1.5 text-center
                        shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out
                        hover:-translate-y-0.5 hover:border-[#E5D6B5]
                        hover:bg-[#F9F5EC] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]
                        [&>div:first-child]:h-[150px] [&>div:first-child]:w-full
                        [&>div:first-child]:rounded-[9px] [&>div:first-child]:border-0
                        [&>div:first-child]:bg-white [&>div:first-child]:p-4
                        [&>div:first-child_img]:max-h-[90px] [&>div:first-child_img]:max-w-[120px]
                        [&>div:first-child_img]:object-contain [&>div:first-child_img]:transition-transform
                        [&>div:first-child_img]:duration-300 group-hover:[&>div:first-child_img]:scale-[1.04]
                        [&>div:nth-child(2)]:mt-2.5 [&>div:nth-child(2)]:flex-none
                        [&>div:nth-child(2)_p]:hidden
                        sm:[&>div:first-child]:h-[165px]
                        sm:[&>div:first-child_img]:max-h-[100px] sm:[&>div:first-child_img]:max-w-[135px]
                        lg:[&>div:first-child]:h-[180px]
                        lg:[&>div:first-child_img]:max-h-[115px] lg:[&>div:first-child_img]:max-w-[150px]
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
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#B8891F] to-[#CE9F2D] px-6 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:from-[#3E4093] hover:to-[#1B1D60] hover:shadow-md"
                  >
                    <span>Explore Products</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/categories"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#CE9F2D] px-6 text-sm font-bold text-[#1B1D60] transition-all duration-200 hover:border-[#B8891F] hover:bg-[#FAF8F3]"
                  >
                    <span>Browse Categories</span>
                  </Link>
                </div>
              </EmptyState>
            )}
          </section>
        </div>
      </PageContainer>
    </>
  );
}
