import { useEffect, useMemo, useState } from "react";

import { useSearchParams ,useNavigate} from "react-router-dom";
import { useDispatch } from "react-redux";

import Seo from "../../../components/ui/Seo";
import SearchBar from "../../../components/ui/inputs/SearchBar";
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
  filterCategoryList,
} from "../../../utils/pages/categoryUtils";

import { scrollToTop } from "../../../utils/common";
import CatalogTile from "../../../components/ui/CatalogTile";
const PAGE_SIZE_OPTIONS = [10, 20, 30, 40];
const DEFAULT_PAGE_SIZE = 10;

const categoryGridClass =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-5"

function getRootCategoriesForListing(list = []) {
  const categories = getCategoryListFromResponse(list);

  if (!Array.isArray(categories)) return [];

  const seen = new Set();

  return categories
    .map((category) => normalizeCategory(category))
    .filter((category) => {
      if (!category.routeKey || !category.displayName) return false;

      const explicitCount = category.productCount;
      if (!Number.isFinite(explicitCount) || explicitCount < 1) return false;

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
const navigate = useNavigate();
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

        // The public API includes aggregate productCount values and applies
        // hasProducts=true, but keep the client-side check as a final guard.
        const rawList = getCategoryListFromResponse(payload);

        const roots = filterCategoryList(
          getRootCategoriesForListing(rawList),
          search,
        );

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
        heading={null}
      />

      <div className="flex flex-col gap-5 sm:gap-6 lg:mt-4 lg:gap-7">
        <section className="min-w-0 rounded-lg bg-white">
          <div className="mb-6 flex flex-col gap-3">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <SearchBar
                value={search}
                onChange={(event) =>
                  handleSearchChange(event.target.value)
                }
                placeholder="Search categories"
                className="w-full sm:max-w-[640px]"
                showButton={false}
              />

              <FilterDropdown
                options={PAGE_SIZE_OPTIONS.map((size) => ({
                  value: size,
                  label: `${size} per page`,
                }))}
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
              actionLabel="Explore Products"
              onAction={() => navigate("/products")}
            />
          ) : categories.length > 0 ? (
            <>
              <div className={categoryGridClass}>
                {categories.map((category) => (
                  <CatalogTile
                    key={category.id || category.routeKey}
                    to={CUSTOMER_ROUTES.category(category.routeKey)}
                    title={category.displayName}
                    image={
                      category.iconUrl ||
                      category.displayImage ||
                      category.imageUrl ||
                      category.bannerUrl
                    }
                    imageAlt={category.displayName}
                    meta={
                      getCategoryCount(category) !== undefined &&
                      getCategoryCount(category) !== null &&
                      getCategoryCount(category) !== ""
                        ? `${Number(
                            getCategoryCount(category)
                          ).toLocaleString()} Products`
                        : undefined
                    }
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
              actionLabel="Explore Products"
              onAction={() => navigate("/products")}
            />
          )}
        </section>
      </div>
    </PageContainer>
  </>
);

}
