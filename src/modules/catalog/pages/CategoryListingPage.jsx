import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Grid2X2, ArrowRight, Search, X } from "lucide-react";

import Seo from "../../../components/ui/Seo";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import { EmptyState } from "../../../components/ui/feedback";
import CUSTOMER_ROUTES from "../../../constants/routes";
import { fetchCategories } from "../../../features/catalog/catalogSlice";
import { fetchProducts } from "../../../modules/products/slices/productSlice";
import FilterDropdown from "../../../components/ui/FilterDropdown";
import { Pagination } from "../../../modules/products/components";
import { PageContainer } from "../../../components/ui/layout";
import { getImageUrlFromValue } from "../../../utils/ecommerce";
import { scrollToTop } from "../../../utils/common";

import {
  getCategoryListFromResponse,
  getCategoryCount,
} from "../../../utils/pages/categoryUtils";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40];
const DEFAULT_PAGE_SIZE = 10;

const categoryGridClass =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:gap-5 xl:grid-cols-5";

function getCountFromMap(category, countsMap = {}) {
  const direct = getCategoryCount(category);
  if (direct > 0) return direct;

  const key1 = String(category.categoryKey || "").toLowerCase();
  const key2 = String(category.routeKey || category.slug || "").toLowerCase();
  const key3 = String(
    category.displayName || category.title || category.name || "",
  ).toLowerCase();
  const key4 = key3.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  if (key1 && countsMap[key1] != null) return countsMap[key1];
  if (key2 && countsMap[key2] != null) return countsMap[key2];
  if (key4 && countsMap[key4] != null) return countsMap[key4];

  for (const [mapKey, val] of Object.entries(countsMap)) {
    const normMapKey = mapKey.toLowerCase();
    if (
      (key1 &&
        (key1 === normMapKey ||
          normMapKey.endsWith(key1) ||
          key1.endsWith(normMapKey))) ||
      (key2 &&
        (key2 === normMapKey ||
          normMapKey.endsWith(key2) ||
          key2.endsWith(normMapKey)))
    ) {
      return val;
    }
  }

  return 0;
}

function CategoryTile({ category }) {
  const count = getCategoryCount(category);

  const imageSrc =
    getImageUrlFromValue(category.iconUrl) ||
    category.displayImage ||
    getImageUrlFromValue(category.imageUrl);

  return (
    <Link
      to={CUSTOMER_ROUTES.category(category.routeKey || category.categoryKey || category.slug)}
      className="group block text-center"
    >
      <div className="mt-2 overflow-hidden rounded-[12px] border border-[#EEE8DA] bg-[#FAF8F3] p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E5D6B5] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
        <div className="flex h-[140px] w-full items-center justify-center overflow-hidden rounded-[9px] bg-white p-3 sm:h-[150px]">
          {imageSrc ? (
            <img
              width="100"
              height="100"
              src={imageSrc}
              alt={category.displayName || category.title || category.name}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/image/png/favicon.png";
              }}
              className="h-[70px] w-[70px] object-contain transition-transform duration-300"
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
        {category.displayName || category.title || category.name}
      </h2>

      {count !== undefined && count !== null && count !== "" && Number(count) >= 1 ? (
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
          <div className="aspect-square rounded-[14px] bg-surface-soft" />
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
  const [productCountsMap, setProductCountsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const page = Math.max(1, Number(searchParams.get("page") || 1));

  const requestedLimit = Number(
    searchParams.get("limit") || DEFAULT_PAGE_SIZE,
  );

  const limit = PAGE_SIZE_OPTIONS.includes(requestedLimit)
    ? requestedLimit
    : DEFAULT_PAGE_SIZE;

  const search = searchParams.get("q") || "";

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    Promise.allSettled([
      dispatch(
        fetchCategories({
          tree: false,
          active: true,
          limit: 500,
        }),
      ).unwrap(),
      dispatch(
        fetchProducts({
          page: 1,
          limit: 1,
          view: "facets",
        }),
      ).unwrap(),
    ])
      .then(([catRes, prodRes]) => {
        if (!active) return;

        if (catRes.status === "fulfilled") {
          const list = getCategoryListFromResponse(catRes.value);
          setCategoryList(Array.isArray(list) ? list : []);
        } else {
          setError(catRes.reason?.message || "Failed to load categories.");
        }

        if (prodRes.status === "fulfilled") {
          const facets =
            prodRes.value?.meta?.facets ||
            prodRes.value?.data?.facets ||
            prodRes.value?.meta?.filters ||
            {};
          const catFacets = facets.categories || facets.category || [];
          const countsMap = {};
          catFacets.forEach((item) => {
            const key = String(
              item.categoryKey || item.key || item.value || "",
            ).toLowerCase();
            const count = Number(item.count || item.productCount || 0);
            if (key) {
              countsMap[key] = count;
            }
          });
          setProductCountsMap(countsMap);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dispatch]);

  const filteredCategories = useMemo(() => {
    const list = Array.isArray(categoryList) ? categoryList : [];

    /*
     * ONLY show categories that have at least 1 product (productCount >= 1) when count is known.
     * Hide categories where product count is explicitly 0.
     * Keep categories visible if count is unspecified on the record.
     */
    const enrichedList = [];

    for (const category of list) {
      const count = getCountFromMap(category, productCountsMap);

      if (count !== undefined && count !== null) {
        if (Number(count) < 1) continue;
        enrichedList.push({
          ...category,
          productCount: count,
          count,
        });
      } else {
        enrichedList.push(category);
      }
    }

    let result = enrichedList;

    // Search categories
    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter((category) =>
        String(
          category.displayName ||
            category.title ||
            category.name ||
            category.label ||
            "",
        )
          .toLowerCase()
          .includes(query),
      );
    }

    return result;
  }, [categoryList, productCountsMap, search]);

  const totalCategories = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalCategories / limit));
  const currentPage = Math.min(page, totalPages);

  const displayedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    return filteredCategories.slice(startIndex, startIndex + limit);
  }, [filteredCategories, currentPage, limit]);

  const updateParam = (key, value) => {
    scrollToTop(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (value == null || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }

        // Reset to page 1 when search or page-size changes.
        if (key !== "page") {
          next.delete("page");
        }

        return next;
      });
    });
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
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
          <section className="min-w-0 rounded-xl bg-white pb-7">
            <div className="mb-6 flex flex-col gap-3">
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <label className="relative block w-full sm:max-w-[640px]">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9E886A]"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      updateParam("q", event.target.value)
                    }
                    placeholder="Search categories"
                    className="h-11 w-full rounded-lg border border-[#E4DDCF] bg-[#FAF6EE]/40 pl-11 pr-11 text-sm font-medium text-[#1F2430] placeholder-[#6F7480] outline-none shadow-2xs transition-all focus:bg-white focus:ring-3 focus:ring-[#D6A323]/15"
                  />

                  {Boolean(search) && (
                    <button
                      type="button"
                      onClick={() => updateParam("q", "")}
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
              <CategoryGridSkeleton count={limit} />
            ) : error ? (
              <div className="rounded-[12px] border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              </div>
            ) : displayedCategories.length ? (
              <>
                <div className={categoryGridClass}>
                  {displayedCategories.map((category) => (
                    <CategoryTile
                      key={
                        category.id ||
                        category._id ||
                        category.routeKey ||
                        category.categoryKey
                      }
                      category={category}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(newPage) =>
                    updateParam("page", newPage)
                  }
                />
              </>
            ) : (
              <EmptyState
                imageSrc="/image/png/NoProductFound.png"
                title="No Categories Found"
                description="We couldn't find any categories available at the moment. Please check back later or explore our products."
              >
                <div className="flex flex-wrap items-center justify-center gap-3.5">
                  <Link
                    to="/products"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#B8891F] to-[#CE9F2D] px-6 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:from-[#3E4093] hover:to-[#1B1D60] hover:shadow-md"
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
  