import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Grid2X2 } from "lucide-react";

import Seo from "../../components/common/Seo";
import ProductFilterSidebar from "../../components/ecommerce/ProductFilterSidebar";
import CUSTOMER_ROUTES from "../../constants/routes";
import { fetchCategories } from "../../features/catalog/catalogSlice";
import {
  applyImageFallback,
  getImageUrlFromValue,
} from "../../utils/ecommerce";
import Loader from "../../components/common/Loader";

const PAGE_SIZE = 20;

function getCategoryListFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.categories)) return data.categories;
  if (data?.category && typeof data.category === "object")
    return [data.category];
  if (data?.data) return getCategoryListFromResponse(data.data);
  if (data?.categoryKey || data?.title) return [data];
  return [];
}

function paginationFromPayload(payload, fallbackCount = 0, currentPage = 1) {
  const data = payload?.data ?? payload;
  const meta =
    payload?.meta?.pagination || payload?.meta || data?.pagination || {};
  const total = Number(
    meta.total ||
      meta.totalItems ||
      meta.count ||
      data?.total ||
      data?.count ||
      fallbackCount,
  );
  const totalPages = Number(
    meta.totalPages ||
      meta.pages ||
      data?.totalPages ||
      data?.pages ||
      Math.max(1, Math.ceil(total / PAGE_SIZE)),
  );
  const page = Number(
    meta.page || meta.currentPage || data?.page || currentPage,
  );

  return {
    page,
    totalPages,
    total,
    hasMore: page < totalPages,
  };
}

function getCategoryLabel(category = {}) {
  return (
    category.title ||
    category.name ||
    category.label ||
    category.categoryKey ||
    category.key ||
    ""
  );
}

function slugifyCategory(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryKey(category = {}) {
  return (
    category.categoryKey ||
    category.key ||
    category.slug ||
    slugifyCategory(getCategoryLabel(category))
  );
}

function getCategoryImage(category = {}) {
  return (
    getImageUrlFromValue(category.imageUrl) ||
    getImageUrlFromValue(category.image) ||
    getImageUrlFromValue(category.thumbnailUrl) ||
    getImageUrlFromValue(category.thumbnail) ||
    getImageUrlFromValue(category.iconUrl) ||
    getImageUrlFromValue(category.icon) ||
    getImageUrlFromValue(category.bannerUrl) ||
    getImageUrlFromValue(category.coverImage)
  );
}

function getCategoryCount(category = {}) {
  return (
    category.productCount ??
    category.productsCount ??
    category.totalProducts ??
    category.count
  );
}

function normalizeCategory(category = {}) {
  const routeKey = getCategoryKey(category);
  const displayName = getCategoryLabel(category);
  const imageUrl = getImageUrlFromValue(category.imageUrl);
  const bannerUrl = getImageUrlFromValue(category.bannerUrl);
  const iconUrl = getImageUrlFromValue(category.iconUrl);

  return {
    id: category._id || category.id || routeKey,
    categoryKey: category.categoryKey || routeKey,
    displayName,
    imageUrl,
    bannerUrl,
    iconUrl,
    displayImage:
      imageUrl || bannerUrl || iconUrl || getCategoryImage(category),
    routeKey,
    parentKey: category.parentKey,
    level: category.level,
    active: category.active,
    sortOrder: category.sortOrder,
    productCount: getCategoryCount(category),
  };
}

function getRootCategories(list = []) {
  const categories = getCategoryListFromResponse(list);
  const byKey = new Map();
  const sortByOrder = (a, b) =>
    Number(a?.sortOrder ?? 0) - Number(b?.sortOrder ?? 0);

  categories.forEach((category) => {
    const normalized = normalizeCategory(category);
    if (!normalized.routeKey || !normalized.displayName) return;
    byKey.set(normalized.routeKey, normalized);
  });

  return Array.from(byKey.values())
    .filter(
      (category) =>
        category.parentKey === null ||
        category.parentKey === undefined ||
        !byKey.has(category.parentKey) ||
        Number(category.level || 0) === 0,
    )
    .sort(sortByOrder);
}

function CategoryLinkList({ items }) {
  return (
    <nav className="custom-scrollbar grid max-h-[calc(100vh-11rem)] gap-1 overflow-y-auto overflow-x-hidden pr-2">
      {items.map((item) => (
        <Link
          key={item.key}
          to={CUSTOMER_ROUTES.category(item.key)}
          className="rounded-lg px-2 py-2 text-sm font-medium leading-snug text-[var(--customer-ink)] transition-colors duration-200 hover:bg-[var(--customer-gold-soft)] hover:text-[var(--customer-gold-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--customer-gold)]"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function CategoryTile({ category }) {
  const count = getCategoryCount(category);
  const imageSrc = category.imageUrl || category.displayImage;

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
            onError={(event) =>
              applyImageFallback(event, category.displayName, "category")
            }
            className="h-full w-full object-cover transition-all duration-300 ease-in-out group-hover:scale-[1.03]"
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
          {Number(count).toLocaleString()} products
        </p>
      ) : null}
    </Link>
  );
}

function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5 xl:grid-cols-5">
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

  const categories = useMemo(() => categoryList, [categoryList]);

  const sidebarCategories = useMemo(
    () =>
      categories.map((category) => ({
        label: category.displayName,
        key: category.routeKey,
      })),
    [categories],
  );

  const sidebarSections = useMemo(
    () => [
      {
        key: "categories",
        title: "Shop by category",
        content: <CategoryLinkList items={sidebarCategories} />,
      },
    ],
    [sidebarCategories],
  );

  return (
    <>
      <Seo
        title="Categories | Sam Global"
        description="Browse Sam Global categories and collections."
      />

      <main className="bg-white text-ink">
        <div className="customer-container grid w-full grid-cols-1 gap-6 py-5 sm:py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[392px_minmax(0,1fr)] xl:gap-10">
          <ProductFilterSidebar
            sections={sidebarSections}
            className="hidden lg:block lg:w-full"
          />

          <div className="min-w-0 w-full">
            {sidebarCategories.length > 0 && (
              <div className="mb-6 grid gap-2 lg:hidden">
                <h2 className="text-sm font-bold sm:text-base">
                  Shop by category
                </h2>

                <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                  {sidebarCategories.map((category) => (
                    <Link
                      key={category.key}
                      to={CUSTOMER_ROUTES.category(category.key)}
                      className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <section className="pb-7">
              <h1 className="mb-4 text-[20px] font-bold leading-tight text-ink sm:mb-6 sm:text-[26px] lg:mb-7 lg:text-[28px]">
                Shop all categories
              </h1>

              {loading && !categories.length ? (
                <CategoryGridSkeleton />
              ) : categories.length ? (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5 xl:grid-cols-5">
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
                    No categories available right now.
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
