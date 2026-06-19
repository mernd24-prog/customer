import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigationType, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, X } from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import ActiveFilterChips from "../../components/common/ActiveFilterChips";
import FilterDrawer from "../../components/common/overlay/Drawer";
import PageHeader from "../../components/common/PageHeader";
import BrandButton from "../../components/ui/BrandButton";
import {
  CollectionToolbar,
  OptionFilter,
  Pagination,
  PriceRangeFilter,
  ProductGrid,
  ProductFilterSidebar,
  RatingFilter,
} from "../../components/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import {
  clearSearch,
  clearSuggestions,
  searchCatalog,
} from "../../features/search/searchSlice";
import { sanitizeSearchQuery } from "../../validations";

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Top Rated" },
];

function flattenCategoryList(data) {
  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.list)
        ? data.list
        : Array.isArray(data?.categories)
          ? data.categories
          : [];

  return source.flatMap((category) => [
    category,
    ...flattenCategoryList(category?.children || category?.subCategories || []),
  ]);
}

export default function SearchPage() {
  const dispatch = useDispatch();
  const navigationType = useNavigationType();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKey = searchParams.toString();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initialSearch = useRef(searchKey);
  const resetInitialSearch = useRef(navigationType === "POP");
  const skipInitialSearch = useRef(
    resetInitialSearch.current && Boolean(initialSearch.current),
  );
  const [queryInput, setQueryInput] = useState(
    resetInitialSearch.current ? "" : searchParams.get("q") || "",
  );

  const searchState = useSelector((s) => s.search);
  const categoriesRaw = useSelector((s) => s.catalog.list || []);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();

  const hits = useMemo(
    () => (Array.isArray(searchState.hits) ? searchState.hits : []),
    [searchState.hits],
  );
  const categories = useMemo(
    () => flattenCategoryList(categoriesRaw),
    [categoriesRaw],
  );

  const facets = searchState.facets || {};
  const meta = searchState.meta || {};
  const totalPages = meta.totalPages || meta.pages || 1;
  const currentPage = Number(searchParams.get("page") || 1);
  const q = sanitizeSearchQuery(searchParams.get("q") || "");
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const minRating = searchParams.get("minRating") || "";
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort") || "";
  const limit = Number(searchParams.get("limit") || 20);
  const categoryValue =
    searchParams.get("categoryId") ||
    searchParams.get("category") ||
    searchParams.get("categorySlug") ||
    "";
  const hasLegacyCategoryParams =
    searchParams.has("category") || searchParams.has("categorySlug");
  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) =>
          category?.categoryId === categoryValue ||
          category?.categoryKey === categoryValue ||
          category?.key === categoryValue ||
          category?.id === categoryValue ||
          category?._id === categoryValue ||
          category?.slug === categoryValue,
      ),
    [categories, categoryValue],
  );
  const categoryLabel =
    searchParams.get("categoryName") ||
    selectedCategory?.title ||
    selectedCategory?.name ||
    selectedCategory?.label ||
    categoryValue;

  const params = useMemo(
    () => ({
      q,
      categoryId: categoryValue || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minRating: minRating || undefined,
      inStock: inStock ? "true" : undefined,
      sort: sort || undefined,
      page: currentPage,
      limit,
    }),
    [
      categoryValue,
      currentPage,
      inStock,
      limit,
      maxPrice,
      minPrice,
      minRating,
      q,
      sort,
    ],
  );

  useEffect(() => {
    if (!resetInitialSearch.current) return;

    dispatch(clearSearch());
    dispatch(clearSuggestions());

    if (initialSearch.current) {
      setSearchParams({}, { replace: true });
    }
  }, [dispatch, setSearchParams]);

  useEffect(() => {
    if (skipInitialSearch.current) {
      if (searchKey === initialSearch.current) return;
      skipInitialSearch.current = false;
    }

    if (hasLegacyCategoryParams) return;

    if (!params.q && !params.categoryId) {
      dispatch(clearSearch());
      return;
    }

    dispatch(
      searchCatalog({
        params,
        cacheKey: `search-list-${JSON.stringify(params)}`,
      }),
    ).catch(() => {});
  }, [dispatch, hasLegacyCategoryParams, params, searchKey]);

  useEffect(() => {
    if (skipInitialSearch.current && searchKey === initialSearch.current) {
      return;
    }

    if (!categoryValue) return;
    if (
      searchParams.get("categoryId") === categoryValue &&
      !hasLegacyCategoryParams
    ) {
      return;
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("categoryId", categoryValue);
        next.delete("category");
        next.delete("categorySlug");
        return next;
      },
      { replace: true },
    );
  }, [
    categoryValue,
    hasLegacyCategoryParams,
    searchKey,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    if (skipInitialSearch.current && searchKey === initialSearch.current) {
      return;
    }

    const currentQ = sanitizeSearchQuery(searchParams.get("q") || "");
    setQueryInput((previousQuery) =>
      previousQuery === currentQ ? previousQuery : currentQ,
    );
  }, [searchKey, searchParams]);

  useEffect(
    () => () => {
      dispatch(clearSearch());
      dispatch(clearSuggestions());
    },
    [dispatch],
  );

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (value == null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }

      if (
        key === "category" ||
        key === "categoryId" ||
        key === "categorySlug"
      ) {
        if (value == null || value === "") {
          next.delete("categoryId");
          next.delete("categoryName");
        } else {
          next.set("categoryId", value);
        }
        next.delete("category");
        next.delete("categorySlug");
      }

      next.delete("page");
      return next;
    });
  };

  const handlePriceChange = ({ minPrice, maxPrice }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (minPrice) next.set("minPrice", minPrice);
      else next.delete("minPrice");

      if (maxPrice) next.set("maxPrice", maxPrice);
      else next.delete("maxPrice");

      next.delete("page");
      return next;
    });
  };

  const setPage = (p) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", p);
      return next;
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const query = sanitizeSearchQuery(queryInput);

    if (!query) return;

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("q", query);
      next.delete("page");
      return next;
    });

    setQueryInput(query);
  };

  const handleClearSearch = () => {
    setQueryInput("");
    setSearchParams({}, { replace: true });
    dispatch(clearSearch());
    dispatch(clearSuggestions());
  };

  const activeFilters = [
    categoryValue && {
      key: "categoryId",
      label: `Category: ${categoryLabel}`,
    },
    (minPrice || maxPrice) && {
      key: "price",
      label: `Price: ₹${minPrice || "0"} – ₹${maxPrice || "∞"}`,
    },
    minRating && {
      key: "minRating",
      label: `${minRating}★ & up`,
    },
    inStock && {
      key: "inStock",
      label: "In Stock Only",
    },
  ].filter(Boolean);

  const removeFilter = (key) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (key === "price") {
        next.delete("minPrice");
        next.delete("maxPrice");
      } else if (key === "categoryId" || key === "category") {
        next.delete("category");
        next.delete("categoryId");
        next.delete("categorySlug");
        next.delete("categoryName");
      } else {
        next.delete(key);
      }

      next.delete("page");
      return next;
    });
  };

  const facetCategories = (facets?.category || facets?.categories || [])
    .map((category) => ({
      value: category.key || category.value || category._id,
      label: category.label || category.title || category.key || category.value,
      count: category.count || category.doc_count || 0,
    }))
    .filter((category) => category.value && category.label);

  const filterSections = [
    facetCategories.length > 0 && {
      key: "category",
      title: "Category",
      content: (
        <OptionFilter
          name="categoryId"
          options={facetCategories}
          selected={searchParams.get("categoryId")}
          onChange={(value) => updateParam("categoryId", value)}
          emptyText="No categories"
        />
      ),
    },
    {
      key: "price",
      title: "Price Range",
      content: (
        <PriceRangeFilter
          min={minPrice}
          max={maxPrice}
          onChange={handlePriceChange}
        />
      ),
    },
    {
      key: "rating",
      title: "Min. Rating",
      content: (
        <RatingFilter
          selected={minRating}
          onChange={(value) => updateParam("minRating", value)}
        />
      ),
    },
    {
      key: "availability",
      title: "Availability",
      defaultOpen: false,
      content: (
        <label className="flex cursor-pointer items-center gap-2  text-sm text-ink">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) =>
              updateParam("inStock", event.target.checked ? "true" : undefined)
            }
            className="h-3.5 w-3.5 accent-gold"
          />
          In Stock Only
        </label>
      ),
    },
  ].filter(Boolean);

  return (
    <>
      <Seo
        title={q ? `Search: "${q}" | Sam Global` : "Search | Sam Global"}
        description="Search products at Sam Global"
      />

      <div className="w-container py-6 sm:py-8">
        <form
          onSubmit={handleSearch}
          className="mb-6 rounded-[14px]  p-3 sm:p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="group relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-all duration-300 ease-in-out group-focus-within:text-gold"
              />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => {
                  setQueryInput(e.target.value);
                  if (!e.target.value.trim()) dispatch(clearSuggestions());
                }}
                placeholder="Search products, brands, categories..."
                className="
    h-10 sm:h-11 lg:h-12
    w-full
    rounded-[10px]
    border
    border-border-strong
    bg-white
    pl-10 pr-10 sm:pl-11 sm:pr-11
    text-xs sm:text-sm
    text-ink
    placeholder:text-muted
    outline-none
    ring-0
    focus:outline-none
    focus:ring-0
    focus:border-gold
    focus:shadow-[0_0_0_3px_rgba(191,155,83,0.15)]
    hover:border-gold
    transition-all
    duration-300
    ease-in-out
  "
              />

              {queryInput ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-all duration-300 ease-in-out hover:bg-cream hover:text-ink"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>

            <BrandButton
              variant="primary"
              rounded
              label="Search"
              type="submit"
              className="h-12 px-7 text-sm font-semibold shadow-[0_8px_18px_rgba(206,159,45,0.25)] sm:min-w-[130px]"
            />
          </div>
        </form>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            {(q || categoryValue) && (
              <PageHeader
                title={
                  q
                    ? `Results for "${q}"`
                    : `Products in Category: "${categoryLabel}"`
                }
                className="mb-0"
              />
            )}

            {meta.total != null && (
              <p className=" text-sm text-muted">
                {meta.total.toLocaleString()} results
              </p>
            )}
          </div>

          <CollectionToolbar
            sortValue={sort}
            sortOptions={SORT_OPTIONS}
            onSortChange={(value) => updateParam("sort", value)}
            onOpenFilters={() => setSidebarOpen(true)}
          />
        </div>

        <ActiveFilterChips
          filters={activeFilters}
          onRemove={removeFilter}
          onClear={() =>
            setSearchParams((prev) => {
              const next = new URLSearchParams();
              const query = prev.get("q") || "";
              if (query) next.set("q", query);
              return next;
            })
          }
        />

        <div className="flex gap-6">
          <div className="hidden lg:block">
            <ProductFilterSidebar sections={filterSections} />
          </div>

          <FilterDrawer
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          >
            <ProductFilterSidebar sections={filterSections} />
          </FilterDrawer>

          <div className="min-w-0 flex-1">
            {!(q || categoryValue) ? (
              <div className="state-box flex flex-col items-center py-20 text-center">
                <Search size={48} className="mb-4 text-gray" />

                <p className=" text-[18px] font-semibold text-ink">
                  What are you looking for?
                </p>

                <p className="mt-2  text-sm text-muted">
                  Enter a search term above to find products.
                </p>
              </div>
            ) : (
              <ApiState
                loading={searchState.loading && !hits.length}
                error={searchState.error}
                empty={!hits.length && !searchState.loading}
                emptyTitle="No results found"
                emptyText={
                  q
                    ? `We couldn't find anything for "${q}". Try different keywords or remove some filters.`
                    : "We couldn't find any products in this category. Try selecting another category or removing some filters."
                }
              >
                <ProductGrid
                  products={hits}
                  onAddToCart={addToCart}
                  onWishlist={toggleWishlist}
                  isWishlisted={isWishlisted}
                />

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </ApiState>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
