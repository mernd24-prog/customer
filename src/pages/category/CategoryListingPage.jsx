import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Grid2X2 } from "lucide-react";

import Seo from "../../components/common/Seo";
import ProductFilterSidebar from "../../components/ecommerce/ProductFilterSidebar";
import CUSTOMER_ROUTES from "../../constants/routes";
import { fetchCategories } from "../../features/catalog/catalogSlice";
import { applyImageFallback, getImageUrlFromValue } from "../../utils/ecommerce";

const PAGE_SIZE = 20;

function listFromPayload(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.categories)) return data.categories;
  return [];
}

function paginationFromPayload(payload, fallbackCount = 0, currentPage = 1) {
  const data = payload?.data ?? payload;
  const meta = payload?.meta?.pagination || payload?.meta || data?.pagination || {};
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
  const page = Number(meta.page || meta.currentPage || data?.page || currentPage);

  return {
    page,
    totalPages,
    total,
    hasMore: page < totalPages || fallbackCount >= PAGE_SIZE,
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

function CategoryLinkList({ items }) {
  return (
    <nav className="grid max-h-64 gap-2 overflow-y-auto pr-1">
      {items.map((item) => (
        <Link
          key={item.key}
          to={CUSTOMER_ROUTES.category(encodeURIComponent(item.key))}
          className="block truncate text-sm text-ink"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function CategoryTile({ category }) {
  const title = category.displayName;
  const count = getCategoryCount(category);

  return (
    <Link
      to={CUSTOMER_ROUTES.category(encodeURIComponent(category.routeKey))}
      className="group block text-center"
    >
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[14px] bg-surface-soft p-4 transition-all duration-300 ease-in-out group-hover:bg-[var(--customer-gold-soft)]">
        {category.displayImage ? (
          <img
            src={category.displayImage}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={(event) => applyImageFallback(event, title, "category")}
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
        {title}
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
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  });
  const sentinelRef = useRef(null);

  const loadCategories = useCallback(async ({ page = 1, append = false } = {}) => {
    if (append) setIsLoadingMore(true);
    else setLoading(true);

    const action = await dispatch(fetchCategories({ limit: PAGE_SIZE, page }));
    const list = listFromPayload(action?.payload);
    const nextPageInfo = paginationFromPayload(action?.payload, list.length, page);

    setPageInfo(nextPageInfo);
    setCategoryList((prev) => {
      if (!append) return list;
      const seen = new Set(
        prev.map((category) => category._id || category.id || getCategoryKey(category)),
      );
      const nextItems = list.filter((category) => {
        const key = category._id || category.id || getCategoryKey(category);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return [...prev, ...nextItems];
    });
    setFirstLoadDone(true);
    setIsLoadingMore(false);
    setLoading(false);
    return list;
  }, [dispatch]);

  useEffect(() => {
    loadCategories({ page: 1, append: false }).catch(() => {
      setCategoryList([]);
      setPageInfo({ page: 1, totalPages: 1, total: 0, hasMore: false });
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
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        loadCategories({ page: pageInfo.page + 1, append: true }).catch(() => {
          setIsLoadingMore(false);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px 300px 0px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [
    firstLoadDone,
    isLoadingMore,
    loadCategories,
    loading,
    pageInfo.hasMore,
    pageInfo.page,
  ]);

  const categories = useMemo(
    () =>
      categoryList
        .map((category) => ({
          ...category,
          displayName: getCategoryLabel(category),
          displayImage: getCategoryImage(category),
          routeKey: getCategoryKey(category),
        }))
        .filter((category) => category.displayName && category.routeKey),
    [categoryList],
  );

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
        <div className="mx-auto grid w-full max-w-[1470px] grid-cols-1 gap-6 px-3 py-5 sm:px-5 sm:py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-10 lg:px-8">
            <ProductFilterSidebar sections={sidebarSections} />

          <div className="min-w-0">
            {sidebarCategories.length > 0 && (
              <div className="mb-6 grid gap-2 lg:hidden">
                <h2 className="text-sm font-bold sm:text-base">
                  Shop by category
                </h2>
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                  {sidebarCategories.map((category) => (
                    <Link
                      key={category.key}
                      to={CUSTOMER_ROUTES.category(
                        encodeURIComponent(category.key),
                      )}
                      className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <section className="pb-7">
              <h1 className="mb-2 text-[20px] font-bold leading-tight text-ink sm:text-[26px] lg:text-[28px]">
                Shop categories available now
              </h1>
              <p className="mb-5 max-w-2xl text-sm text-muted sm:mb-7">
                Explore Sam Global collections by category.
              </p>

              {loading ? (
                <CategoryGridSkeleton />
              ) : categories.length ? (
                <>
                  <div className="mb-5 text-sm font-semibold text-muted">
                    {(pageInfo.total || categories.length).toLocaleString()} categories
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5 xl:grid-cols-5">
                    {categories.map((category) => (
                      <CategoryTile
                        key={category._id || category.id || category.routeKey}
                        category={category}
                      />
                    ))}
                  </div>
                  <div ref={sentinelRef} className="h-10" aria-hidden="true" />
                  {isLoadingMore && (
                    <div className="mt-6 flex justify-center">
                      <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--customer-border)] border-t-[var(--customer-gold)]" />
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
