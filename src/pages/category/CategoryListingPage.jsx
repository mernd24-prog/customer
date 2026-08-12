import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Grid2X2 } from "lucide-react";

import Seo from "../../components/common/Seo";
import CUSTOMER_ROUTES from "../../constants/routes";
import { fetchCategories } from "../../features/catalog/catalogSlice";
import {
  getImageUrlFromValue,
} from "../../utils/ecommerce";
import Loader from "../../components/common/Loader";

const PAGE_SIZE = 20;
const categoryGridClass =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5 xl:grid-cols-5";

import {
  getCategoryListFromResponse,
  paginationFromPayload,
  getCategoryCount,
  getRootCategories
} from "./utils/categoryUtils";

function CategoryTile({ category }) {
  const count = getCategoryCount(category);
  const imageSrc = category.iconUrl || category.displayImage;

  return (
    <Link
      to={CUSTOMER_ROUTES.category(category.routeKey)}
      className="group block text-center"
    >
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[14px] bg-surface-soft p-4 transition-all duration-300 ease-in-out group-hover:bg-[var(--customer-gold-soft)]">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={category.displayName}
            loading="lazy"
            decoding="async"
            // onError={(event) =>
            //   applyImageFallback(event, category.displayName, "category")
            // }
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/image/png/favicon.png";
            }}
            className="h-20 md:h-1/2 w-full object-contain transition-all duration-300 ease-in-out group-hover:scale-[1.03]"
          />
        ) : (
          <Grid2X2
            size={46}
            strokeWidth={1.4}
            className="text-[var(--customer-border-strong)]"
          />
        )}
      </div>
      <h2 className="mt-3 line-clamp-2 text-sm font-bold leading-5 text-ink sm:text-base">
        {category.displayName}
      </h2>
      {count !== undefined && count !== null && count !== "" ? (
        <p className="mt-1 text-xs font-semibold text-muted">
          {Number(count).toLocaleString()} Products
        </p>
      ) : null}
    </Link>
  );
}

function CategoryGridSkeleton() {
  return (
    <div className={categoryGridClass}>
      {Array.from({ length: 10 }).map((_, index) => (
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
  const catalogState = useSelector((state) => state.catalog);
  const catalogListRef = useRef(catalogState.list);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const loadingMoreRef = useRef(false);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  });
  const sentinelRef = useRef(null);

  useEffect(() => {
    catalogListRef.current = catalogState.list;
  }, [catalogState.list]);

  const loadCategories = useCallback(
    async ({ page = 1, append = false } = {}) => {
      if (append) setIsLoadingMore(true);
      else setLoading(true);

      const action = await dispatch(
        fetchCategories({
          tree: true,
          active: true,
          maxDepth: 3,
          limit: PAGE_SIZE,
          page,
        }),
      );
      if (action?.error) {
        throw new Error(action.payload || action.error.message);
      }
      const list = getCategoryListFromResponse(action?.payload);
      const rootList = getRootCategories(list);
      const fallbackRootList =
        !append && !rootList.length
          ? getRootCategories(catalogListRef.current)
          : [];
      const nextRootList = fallbackRootList.length
        ? fallbackRootList
        : rootList;
      const nextPageInfo = paginationFromPayload(
        action?.payload,
        nextRootList.length,
        page,
      );

      setPageInfo(nextPageInfo);
      setCategoryList((prev) => {
        if (!append) return nextRootList;
        const seen = new Set(prev.map((category) => category.routeKey));
        const nextItems = nextRootList.filter((category) => {
          if (seen.has(category.routeKey)) return false;
          seen.add(category.routeKey);
          return true;
        });
        return [...prev, ...nextItems];
      });
      setFirstLoadDone(true);
      setIsLoadingMore(false);
      setLoading(false);
      return nextRootList;
    },
    [dispatch],
  );

  useEffect(() => {
    const existingRootCategories = getRootCategories(catalogState.list);
    if (existingRootCategories.length) {
      setCategoryList(existingRootCategories);
      setLoading(false);
    }

    loadCategories({ page: 1, append: false }).catch(() => {
      const fallbackList = getRootCategories(catalogState.list);
      setCategoryList(fallbackList);
      setPageInfo({
        page: 1,
        totalPages: 1,
        total: fallbackList.length,
        hasMore: false,
      });
      setFirstLoadDone(true);
      setIsLoadingMore(false);
      setLoading(false);
    });
  }, [loadCategories]);

  useEffect(() => {
    if (
      !sentinelRef.current ||
      !firstLoadDone ||
      loading ||
      isLoadingMore ||
      !pageInfo.hasMore
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        if (loadingMoreRef.current) return;

        loadingMoreRef.current = true;

        loadCategories({
          page: pageInfo.page + 1,
          append: true,
        })
          .catch(() => {})
          .finally(() => {
            loadingMoreRef.current = false;
            setIsLoadingMore(false);
          });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px 300px 0px",
      },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [
    firstLoadDone,
    loading,
    isLoadingMore,
    pageInfo.hasMore,
    pageInfo.page,
    loadCategories,
  ]);

  useEffect(() => {
    if (!catalogState.globalCategories || catalogState.globalCategories.length === 0) {
      import("../../features/product/productSlice").then(({ fetchProducts }) => {
        dispatch(fetchProducts({ limit: 1 })).catch(() => {});
      });
    }
  }, [dispatch, catalogState.globalCategories]);

  const categories = useMemo(() => {
    const available = getRootCategories(catalogState.globalCategories);
    
    // If the homepage already loaded globalCategories, use them to enrich the data
    if (available && available.length > 0) {
      const masterByKey = new Map(
        categoryList.map((category) => [category.routeKey, category]),
      );
      return available.map((category) => ({
        ...(masterByKey.get(category.routeKey) || {}),
        ...category,
        productCount: Number(category.productCount || 0),
      }));
    }

    // Otherwise, use the fallback list fetched by this page
    // (If you want it to only show items with products, wait for globalCategories to populate)
    return categoryList.filter((category) => {
      // If we somehow have productCount, use it
      if (category.productCount !== undefined && category.productCount !== null) {
        return Number(category.productCount) > 0;
      }
      return true; // Fallback to returning all if count is unknown
    });
  }, [catalogState.globalCategories, categoryList]);

  return (
    <>
      <Seo
        title="Categories | Sam Global"
        description="Browse Sam Global categories and collections."
      />

      <main className="bg-white text-ink  my-6 lg:mt-14">
        <div>
          <div className="min-w-0 w-full">
            <section className="pb-7">
              <h1 className="mb-4 text-[20px] font-bold leading-tight text-ink sm:mb-6 sm:text-[26px] lg:mb-7 lg:text-[28px]">
                Shop All Categories
              </h1>

              {loading && !categories.length ? (
                <CategoryGridSkeleton />
              ) : categories.length ? (
                <>
                  <div className={categoryGridClass}>
                    {categories.map((category) => (
                      <CategoryTile key={category.id} category={category} />
                    ))}
                  </div>

                  <div ref={sentinelRef} className="h-10" aria-hidden="true" />

                  {isLoadingMore && (
                    <div className="mt-6 flex items-center justify-center">
                      <Loader size="lg" />
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-[12px] border border-border bg-cream p-6 text-center">
                  <p className="text-sm font-semibold text-ink">
                    No Categories Available Right Now.
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
