import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Seo from "../../../components/ui/Seo";
import SearchBar from "../../../components/ui/inputs/SearchBar";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import CatalogTile from "../../../components/ui/CatalogTile";
import { EmptyState } from "../../../components/ui";
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
  filterBrandList,
} from "../../../utils/pages/brandUtils";
import { scrollToTop } from "../../../utils/common";


import DynamicButton from "../../../components/ui/button/button.jsx";
const PAGE_SIZE_OPTIONS = [10, 20, 30, 40];
const DEFAULT_PAGE_SIZE = 10;

export default function BrandOutletPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [brandList, setBrandList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const page = Math.max(1, Number(searchParams.get("page") || 1));

  const requestedLimit = Number(
    searchParams.get("limit") || DEFAULT_PAGE_SIZE
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

    dispatch(
      fetchBrands({
        page,
        limit,
        q: search,
        sort,
        hasProducts: true,
      })
    )
      .unwrap()
      .then((res) => {
        if (!active) return;

        const rawList = listFromPayload(res);
        const list = filterBrandList(rawList, search);

        setBrandList(list);

        // Backend pagination
        const backendPagination =
          res?.pagination ||
          res?.meta?.pagination ||
          res?.meta || {
            page, 
            limit,
            total: list.length,
            totalPages: Math.max(1, Math.ceil(list.length / limit)),
          };

        setPagination({
          page: Number(backendPagination.page) || page,
          limit: Number(backendPagination.limit) || limit,
          total: Number(backendPagination.total) || 0,
          totalPages:
            Number(backendPagination.totalPages) ||
            Math.max(
              1,
              Math.ceil(
                Number(backendPagination.total) || list.length / limit
              )
            ),
        });
      })
      .catch((err) => {
        if (!active) return;

        setBrandList([]);
        setPagination({
          page: 1,
          limit,
          total: 0,
          totalPages: 1,
        });
        setError(err?.message || "Failed to load brands.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dispatch, page, limit, search, sort]);

  const allValidBrands = Array.isArray(brandList) ? brandList : [];

  const totalPages = Math.max(
    1,
    Number(pagination.totalPages) || 1
  );

  const currentPage = Math.min(page, totalPages);

  // API already returns only the requested page.
  const brands = allValidBrands;

  const updateParam = (key, value) => {
    scrollToTop(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (value == null || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
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

  const handleSearchChange = (value) => {
    updateParam("q", value);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Brand Outlet", href: "/brand-outlet" },
  ];

  const brandGridClass =
    "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-5";

  return (
    <>
      <Seo
        title="Brand Outlet | Sam Global"
        description="Shop Brand Outlet brands at Sam Global."
      />

      <PageContainer>
        <Breadcrumbs
          items={breadcrumbItems}
          heading={null}
        />

        <div className="flex flex-col gap-5 sm:gap-6 lg:gap-7 lg:mt-4">
          <section className="min-w-0 rounded-lg bg-white">
            <div className="mb-6 flex flex-col gap-3">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <SearchBar
                  value={search}
                  onChange={(event) =>
                    handleSearchChange(event.target.value)
                  }
                  placeholder="Search brands"
                  className="w-full sm:max-w-[640px]"
                  showButton={false}
                />

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
            ) : brands.length ? (
              <>
                <div className={brandGridClass}>
                  {brands.map((brand) => (
                    <CatalogTile
                      key={getBrandRouteKey(brand)}
                      to={CUSTOMER_ROUTES.brand(getBrandRouteKey(brand))}
                      title={getBrandName(brand)}
                      image={getBrandLogo(brand)}
                      imageAlt={getBrandName(brand)}
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
               
                title="No Brands Found"
                description={
                  search
                    ? `We couldn't find any brands matching "${search}". Please try another search or explore our products.`
                    : "We couldn't find any brands available at the moment. Please check back later or explore our products."
                }
              >
                <div className="flex flex-wrap items-center justify-center gap-3.5">
                  <Link
                    to="/products"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#B8891F] to-[#CE9F2D] px-6 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:from-[#3E4093] hover:to-[#1B1D60] hover:shadow-md"
                  >
                    <span>Explore Products</span>
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    to="/categories"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#CE9F2D] px-6 text-sm font-bold text-[#1B1D60] transition-all duration-200 hover:border-[#B8891F] hover:bg-[#FAF8F3]"
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
