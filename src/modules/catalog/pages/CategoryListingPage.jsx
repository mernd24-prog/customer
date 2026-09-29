import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ArrowRight, Grid2X2, Search, X } from "lucide-react";

import Seo from "../../../components/ui/Seo";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import { EmptyState } from "../../../components/ui/feedback";
import { PageContainer } from "../../../components/ui/layout";
import FilterDropdown from "../../../components/ui/FilterDropdown";
import { Pagination } from "../../../modules/products/components";

import CUSTOMER_ROUTES from "../../../constants/routes";
import { fetchCategories } from "../../../features/catalog/catalogSlice";

import {
  getCategoryListFromResponse,
  paginationFromPayload,
  normalizeCategory,
  getCategoryCount,
} from "../../../utils/pages/categoryUtils";

import { scrollToTop } from "../../../utils/common";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40];
const DEFAULT_PAGE_SIZE = 10;

const categoryGridClass =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5 xl:grid-cols-5";

function getRootCategoriesForListing(list = []) {
  const categories = getCategoryListFromResponse(list);

  if (!Array.isArray(categories)) return [];

  const seen = new Set();

  return categories
    .map((category) => normalizeCategory(category))
    .filter((category) => {
      if (!category.routeKey || !category.displayName) return false;

      const isRoot =
        category.parentKey === null ||
        category.parentKey === undefined ||
        category.parentKey === "" ||
        Number(category.level || 0) === 0;

      if (!isRoot) return false;

      if (seen.has(category.routeKey)) return false;

      seen.add(category.routeKey);

      return true;
    })
    .sort(
      (a, b) =>
        Number(a?.sortOrder ?? 0) - Number(b?.sortOrder ?? 0),
    );
}

function CategoryTile({ category }) {
  const count = getCategoryCount(category);

  const imageSrc =
    category.iconUrl ||
    category.displayImage ||
    category.imageUrl ||
    category.bannerUrl;

  return (
    <Link
      to={CUSTOMER_ROUTES.category(category.routeKey)}
      className="group block text-center"
    >
      <div
        className="
          mt-2 overflow-hidden rounded-[12px]
          border border-[#EEE8DA]
          bg-[#FAF8F3]
          p-1.5
          shadow-[0_2px_8px_rgba(0,0,0,0.04)]
          transition-all duration-300
          hover:-translate-y-0.5
          hover:border-[#E5D6B5]
          hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]
        "
      >
        <div
          className="
            flex h-[140px] w-full
            items-center justify-center
            overflow-hidden rounded-[9px]
            bg-white
            p-3
            transition-all duration-300
            sm:h-[150px]
            lg:h-[165px]
          "
        >
          {imageSrc ? (
            <img
              width="100"
              height="100"
              src={imageSrc}
              alt={category.displayName}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/image/png/favicon.png";
              }}
              className="
                h-[70px] w-[70px]
                object-contain
                transition-transform duration-300
                sm:h-[80px] sm:w-[80px]
                lg:h-[90px] lg:w-[90px]
                group-hover:scale-[1.04]
              "
            />
          ) : (
            <Grid2X2
              size={36}
              strokeWidth={1.4}
              className="text-[var(--customer-border-strong)]"
            />
          )}
        </div>
      </div>

      <h2 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-ink sm:text-base">
        {category.displayName}
      </h2>

      {count !== undefined &&
      count !== null &&
      count !== "" ? (
        <p className="mt-0.5 text-xs font-semibold text-muted">
          {Number(count).toLocaleString()} Products
        </p>
      ) : null}
    </Link>
  );
}

function CategoryGridSkeleton({ count = DEFAULT_PAGE_SIZE }) {
  return (
    <div className={categoryGridClass}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="mt-2 h-[140px] rounded-[12px] bg-surface-soft sm:h-[150px] lg:h-[165px]" />
          <div className="mx-auto mt-3 h-4 w-3/4 rounded bg-surface-soft" />
        </div>
      ))}
    </div>
  );
}

export default function CategoryListingPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const page = Math.max(
    1,
    Number(searchParams.get("page") || 1),
  );

  const requestedLimit = Number(
    searchParams.get("limit") || DEFAULT_PAGE_SIZE,
  );

  const limit = PAGE_SIZE_OPTIONS.includes(requestedLimit)
    ? requestedLimit
    : DEFAULT_PAGE_SIZE;

  const search = searchParams.get("q") || "";

  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      setLoading(true);
      setError("");

      try {
        const action = await dispatch(
          fetchCategories({
            tree: true,
            active: true,
            maxDepth: 3,
            page,
            limit,
            q: search,
            sort: "sortOrder",
          }),
        );

        if (!active) return;

        if (action?.error) {
          throw new Error(
            action?.payload ||
              action?.error?.message ||
              "Failed to load categories.",
          );
        }

        const payload = action?.payload;

        /*
         * IMPORTANT:
         * Do NOT use getRootCategories() here.
         *
         * getRootCategories() intentionally filters:
         *
         *   productCount >= 1
         *
         * But the category API response does not provide
         * productCount on the root categories.
         *
         * Therefore it would turn valid categories into
         * an empty list.
         */
        const rawList = getCategoryListFromResponse(payload);

        const roots = getRootCategoriesForListing(rawList);

        setCategoryList(roots);

        const backendPagination =
          payload?.pagination ||
          payload?.meta?.pagination ||
          payload?.meta ||
          {};

        const fallbackTotal = roots.length;

        const nextPagination = paginationFromPayload(
          payload,
          fallbackTotal,
          page,
          limit,
        );

        setPagination({
          page:
            Number(backendPagination.page) ||
            nextPagination.page ||
            page,

          limit:
            Number(backendPagination.limit) ||
            limit,

          total:
            Number(backendPagination.total) ||
            Number(nextPagination.total) ||
            fallbackTotal,

          totalPages:
            Number(backendPagination.totalPages) ||
            Number(nextPagination.totalPages) ||
            Math.max(
              1,
              Math.ceil(
                fallbackTotal / limit,
              ),
            ),
        });
      } catch (err) {
        if (!active) return;

        setCategoryList([]);

        setPagination({
          page: 1,
          limit,
          total: 0,
          totalPages: 1,
        });

        setError(
          err?.message ||
            "Failed to load categories.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, [dispatch, page, limit, search]);

  const categories = useMemo(
    () => (Array.isArray(categoryList) ? categoryList : []),
    [categoryList],
  );

  const totalPages = Math.max(
    1,
    Number(pagination.totalPages) || 1,
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const updateParam = (key, value) => {
    scrollToTop(() => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);

        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }

        /*
         * Search and per-page changes always start
         * from page 1.
         */
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

  const handleLimitChange = (value) => {
    const nextLimit = Number(value);

    if (!PAGE_SIZE_OPTIONS.includes(nextLimit)) {
      return;
    }

    updateParam("limit", nextLimit);
  };

  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Categories",
      href: "/categories",
    },
  ];

  return (
    <>
      <Seo
        title="Categories | Sam Global"
        description="Browse Sam Global categories and collections."
      />

      <PageContainer>
        <Breadcrumbs
          items={breadcrumbItems}
          className="mb-2 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
          heading={null}
        />

        <div className="flex flex-col gap-5 sm:gap-6 lg:mt-4 lg:gap-7">
          <section className="min-w-0 rounded-xl bg-white">
            <div className="mb-6 flex flex-col gap-3">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                {/* Search */}
                <label className="relative block w-full sm:max-w-[640px]">
                  <Search
                    size={16}
                    className="
                      pointer-events-none
                      absolute left-4 top-1/2
                      -translate-y-1/2
                      text-[#9E886A]
                    "
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      handleSearchChange(
                        event.target.value,
                      )
                    }
                    placeholder="Search categories"
                    className="
                      h-11 w-full
                      rounded-lg
                      border border-[#E4DDCF]
                      bg-[#FAF6EE]/40
                      pl-11 pr-11
                      text-sm font-medium
                      text-[#1F2430]
                      placeholder-[#6F7480]
                      outline-none
                      transition-all
                      focus:border-[#E4DDCF]
                      focus:bg-white
                      focus:ring-3
                      focus:ring-[#D6A323]/15
                      shadow-2xs
                    "
                  />

                  {Boolean(search) && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSearchChange("")
                      }
                      aria-label="Clear search"
                      className="
                        absolute right-4 top-1/2
                        flex -translate-y-1/2
                        items-center justify-center
                        text-[#6F7480]
                        transition
                        hover:text-[#1F2430]
                      "
                    >
                      <X size={16} />
                    </button>
                  )}
                </label>

                {/* Per page */}
                <FilterDropdown
                  options={PAGE_SIZE_OPTIONS.map(
                    (size) => ({
                      value: size,
                      label: `${size} per page`,
                    }),
                  )}
                  value={limit}
                  onChange={handleLimitChange}
                  placeholder="Per page"
                  className="w-full sm:w-[150px]"
                />
              </div>
            </div>

            {loading ? (
              <CategoryGridSkeleton count={limit} />
            ) : error ? (
              <EmptyState
                imageSrc="/image/png/NoProductFound.png"
                title="Unable to Load Categories"
                description={error}
              >
                <Link
                  to="/products"
                  className="
                    inline-flex h-11
                    items-center justify-center
                    gap-2 rounded-full
                    bg-gradient-to-r
                    from-[#B8891F] to-[#CE9F2D]
                    px-6
                    text-sm font-bold
                    text-white
                    shadow-sm
                    transition-all duration-200
                    hover:from-[#3E4093]
                    hover:to-[#1B1D60]
                    hover:shadow-md
                  "
                >
                  <span>Explore Products</span>
                  <ArrowRight size={16} />
                </Link>
              </EmptyState>
            ) : categories.length ? (
              <>
                <div className={categoryGridClass}>
                  {categories.map((category) => (
                    <CategoryTile
                      key={
                        category.id ||
                        category.routeKey
                      }
                      category={category}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <EmptyState
                imageSrc="/image/png/NoProductFound.png"
                title="No Categories Found"
                description={
                  search
                    ? `We couldn't find any categories matching "${search}". Please try another search.`
                    : "We couldn't find any categories available at the moment. Please check back later or explore our products."
                }
              >
                <div className="flex flex-wrap items-center justify-center gap-3.5">
                  <Link
                    to="/products"
                    className="
                      inline-flex h-11
                      items-center justify-center
                      gap-2 rounded-full
                      bg-gradient-to-r
                      from-[#B8891F] to-[#CE9F2D]
                      px-6
                      text-sm font-bold
                      text-white
                      shadow-sm
                      transition-all duration-200
                      hover:from-[#3E4093]
                      hover:to-[#1B1D60]
                      hover:shadow-md
                    "
                  >
                    <span>Explore Products</span>
                    <ArrowRight size={16} />
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
