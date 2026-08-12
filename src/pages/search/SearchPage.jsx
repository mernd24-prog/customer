import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import ActiveFilterChips from "../../components/common/ActiveFilterChips";
import FilterDrawer from "../../components/common/overlay/Drawer";
import PageHeader from "../../components/common/PageHeader";
import {
  CheckboxListFilter,
  CollectionToolbar,
  OptionFilter,
  Pagination,
  PriceRangeFilter,
  ProductGrid,
  ProductFilterSidebar,
  ProductListingLayout,
} from "../../components/ecommerce";
import { buildRatingCountMap, isProductInStock, getAvailabilityCounts } from "../../utils/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import {
  clearSearch,
  clearSuggestions,
  searchCatalog,
} from "../../features/search/searchSlice";
import { sanitizeSearchQuery } from "../../validations";
import { parseMultiValue, serializeMultiValue, flattenCategoryList } from "../../utils/filterUtils";
import { capitalizeFirst } from "../../utils/stringUtils";

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Top Rated" },
];



export default function SearchPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKey = searchParams.toString();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const searchState = useSelector((s) => s.search);
  const categoriesRaw = useSelector((s) => s.catalog.list) || [];
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const facets = searchState.facets || {};

  const hits = useMemo(
    () => (Array.isArray(searchState.hits) ? searchState.hits : []),
    [searchState.hits],
  );
  const availabilityCounts = useMemo(
    () => getAvailabilityCounts(hits, facets),
    [facets, hits]
  );
  const ratingCounts = useMemo(() => buildRatingCountMap(hits), [hits]);
  const ratingOptions = useMemo(() => {
    if (Array.isArray(facets.ratings)) {
      return facets.ratings
        .map((option) => ({
          value: String(option.value),
          label: option.label || `${option.value} & Above`,
          count: Number(option.count || 0),
        }))
        .filter((option) => option.value && option.count > 0);
    }
    return [5, 4, 3, 2, 1]
      .map((stars) => ({
        value: String(stars),
        label: stars === 5 ? "5" : `${stars} & Above`,
        count: ratingCounts[String(stars)] || 0,
      }))
      .filter((option) => option.count > 0);
  }, [facets.ratings, ratingCounts]);
  const availabilityOptions = useMemo(
    () =>
      [
        {
          value: "inStock",
          label: "In Stock",
          count: availabilityCounts.inStock,
        },
        {
          value: "outOfStock",
          label: "Out of Stock",
          count: availabilityCounts.outOfStock,
        },
      ].filter((option) => option.count > 0),
    [availabilityCounts],
  );
  const categories = useMemo(
    () => flattenCategoryList(categoriesRaw),
    [categoriesRaw],
  );

  const meta = searchState.meta || {};
  const totalPages = meta.totalPages || meta.pages || 1;
  const currentPage = Number(searchParams.get("page") || 1);
  const q = sanitizeSearchQuery(searchParams.get("q") || "");
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const minRating = searchParams.get("minRating") || "";
  const selectedRatings = useMemo(
    () => parseMultiValue(minRating),
    [minRating],
  );
  const inStock = searchParams.get("inStock") === "true";
  const outOfStock = searchParams.get("outOfStock") === "true";
  // const expressDelivery = searchParams.get("expressDelivery") === "true";
  // const freeDelivery = searchParams.get("freeDelivery") === "true";

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

  const params = useMemo(() => {
    const next = {
      q,
      categoryId: categoryValue || undefined,
      brand: searchParams.get("brand") || undefined,
      tags: searchParams.get("tags") || undefined,
      collectionIds: searchParams.get("collectionIds") || undefined,
      featured: searchParams.get("featured") || undefined,
      bestSeller: searchParams.get("bestSeller") || undefined,
      newArrival: searchParams.get("newArrival") || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minRating: minRating || undefined,
      inStock: inStock ? "true" : undefined,
      outOfStock: outOfStock ? "true" : undefined,
      sort: sort || undefined,
      page: currentPage,
      limit,
    };
    searchParams.forEach((value, key) => {
      if (key.startsWith("attr_") && value) next[key] = value;
    });
    return next;
  }, [
    categoryValue,
    currentPage,
    // expressDelivery,
    // freeDelivery,
    inStock,
    limit,
    maxPrice,
    minPrice,
    minRating,
    outOfStock,
    q,
    searchKey,
    searchParams,
    sort,
  ]);

  useEffect(() => {
    if (hasLegacyCategoryParams) return;

    if (!params.q && !params.categoryId) {
      dispatch(clearSearch());
      navigate("/products", { replace: true });
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

  /*
  useEffect(() => {
    if (skipInitialSearch.current && searchKey === initialSearch.current) {
      return;
    }

    const currentQ = sanitizeSearchQuery(searchParams.get("q") || "");
    setQueryInput((previousQuery) =>
      previousQuery === currentQ ? previousQuery : currentQ,
    );
  }, [searchKey, searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (skipInitialSearch.current) return;
      const sanitized = sanitizeSearchQuery(queryInput);
      if (sanitized !== q && queryInput !== (searchParams.get("q") || "")) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (sanitized) {
              next.set("q", sanitized);
            } else {
              next.delete("q");
            }
            next.delete("page");
            return next;
          },
          { replace: true },
        );
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [queryInput, q, searchParams, setSearchParams]);
  */

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

  const updateParams = (entries) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      entries.forEach(([key, value]) => {
        if (value == null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });

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

  /*
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
  */

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFilters = [
    q && {
      key: "q",
      label: `Search: "${q}"`,
    },
    categoryValue && {
      key: "categoryId",
      label: `Category: ${categoryLabel}`,
    },
    (minPrice || maxPrice) && {
      key: "price",
      label: `Price: ₹${Number(minPrice || 0).toLocaleString("en-IN")} – ₹${Number(maxPrice || 150000).toLocaleString("en-IN")}`,
    },
    ...selectedRatings.map((rating) => ({
      key: `minRating:${rating}`,
      groupKey: "minRating",
      value: rating,
      label: `${rating}★ & up`,
    })),
    inStock && {
      key: "inStock",
      label: "In Stock Only",
    },
    searchParams.get("outOfStock") === "true" && {
      key: "outOfStock",
      label: "Out of Stock",
    },
    searchParams.get("brand") && {
      key: "brand",
      groupKey: "brand",
      label: `Brand: ${searchParams.get("brand").split(",").join(", ")}`,
    },
    searchParams.get("collectionIds") && {
      key: "collectionIds",
      groupKey: "collectionIds",
      label: `Collection: ${searchParams.get("collectionIds").split(",").join(", ")}`,
    },
    searchParams.get("tags") && {
      key: "tags",
      groupKey: "tags",
      label: `Tag: ${searchParams.get("tags").split(",").join(", ")}`,
    },
    searchParams.get("featured") === "true" && {
      key: "featured",
      label: "Featured",
    },
    searchParams.get("bestSeller") === "true" && {
      key: "bestSeller",
      label: "Best Seller",
    },
    searchParams.get("newArrival") === "true" && {
      key: "newArrival",
      label: "New Arrival",
    },
    ...Array.from(searchParams.entries())
      .filter(([key, value]) => key.startsWith("attr_") && value)
      .map(([key, value]) => {
        const attributeKey = key.replace(/^attr_/, "");
        const label = attributeFacets?.find((a) => a.key === attributeKey)?.label || capitalizeFirst(attributeKey);
        return {
          key,
          groupKey: key,
          label: `${label}: ${value.split(",").join(", ")}`,
        };
      }),
  ]
    .flat()
    .filter(Boolean);

  const clearFiltersAction = activeFilters.length > 1 ? handleClearFilters : undefined;

  const removeFilter = (key, filter) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (key === "q") {
        next.delete("q");
        // setQueryInput("");
      } else if (key === "price") {
        next.delete("minPrice");
        next.delete("maxPrice");
      } else if (filter?.groupKey) {
        if (filter.value === undefined) {
          next.delete(filter.groupKey);
        } else {
          const nextValues = parseMultiValue(next.get(filter.groupKey)).filter(
            (value) => value !== filter.value,
          );
          const serialized = serializeMultiValue(nextValues);
          if (serialized) next.set(filter.groupKey, serialized);
          else next.delete(filter.groupKey);
        }
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

  const facetCategories = useMemo(() => {
    return (facets?.category || facets?.categories || [])
      .map((category) => ({
        value: category.key || category.value || category._id,
        label:
          category.label || category.title || category.key || category.value,
        count: category.count || category.doc_count || 0,
      }))
      .filter(
        (category) => category.value && category.label && category.count > 0,
      );
  }, [facets?.category, facets?.categories]);
  const categoryOptions = facetCategories;
  const brandContextKey = useMemo(() => {
    const p = new URLSearchParams(searchParams);
    p.delete("brand");
    p.delete("page");
    return p.toString();
  }, [searchParams]);

  const brandOptionsRef = useRef({ context: "", options: [] });
  const brandOptions = useMemo(() => {
    const currentSelected = parseMultiValue(searchParams.get("brand"));
    const rawOptions = (facets.brands || [])
      .map((option) => ({
        value: String(option.value || option.key || ""),
        label: option.label || option.value || option.key,
        count: Number(option.count || 0),
      }))
      .filter((option) => option.value && option.label && option.count > 0);

    if (brandContextKey !== brandOptionsRef.current.context) {
      brandOptionsRef.current = {
        context: brandContextKey,
        options: rawOptions,
      };
    } else if (currentSelected.length === 0) {
      brandOptionsRef.current = {
        context: brandContextKey,
        options: rawOptions,
      };
    }

    if (
      currentSelected.length > 0 &&
      brandOptionsRef.current.options.length > 0
    ) {
      const mergedMap = new Map();
      brandOptionsRef.current.options.forEach((opt) =>
        mergedMap.set(opt.value, { ...opt }),
      );
      rawOptions.forEach((opt) => mergedMap.set(opt.value, opt));
      return Array.from(mergedMap.values());
    }

    return brandOptionsRef.current.options;
  }, [facets.brands, searchParams, brandContextKey]);
  const attributeFacets = useMemo(
    () =>
      (facets.attributes || [])
        .map((attribute) => ({
          key: String(attribute.key || ""),
          label: attribute.label || attribute.key,
          searchable: attribute.searchable === true,
          values: (attribute.values || []).filter(
            (option) => option.value && Number(option.count || 0) > 0,
          ),
        }))
        .filter((attribute) => attribute.key && attribute.values.length > 1),
    [facets.attributes],
  );
  const collectionOptions = useMemo(
    () =>
      (facets.collections || []).filter(
        (option) => option.value && Number(option.count || 0) > 0,
      ),
    [facets.collections],
  );
  const tagOptions = useMemo(
    () =>
      (facets.tags || []).filter(
        (option) => option.value && Number(option.count || 0) > 0,
      ),
    [facets.tags],
  );

  useEffect(() => {
    if (!hits.length) return;
    const validRatings = new Set(ratingOptions.map((option) => option.value));
    const nextRatings = selectedRatings.filter((rating) =>
      validRatings.has(String(rating)),
    );
    const shouldRemoveInStock = inStock && availabilityCounts.inStock <= 0;
    const shouldRemoveOutOfStock =
      outOfStock && availabilityCounts.outOfStock <= 0;

    if (
      nextRatings.length === selectedRatings.length &&
      !shouldRemoveInStock &&
      !shouldRemoveOutOfStock
    ) {
      return;
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const serializedRatings = serializeMultiValue(nextRatings);
        if (serializedRatings) next.set("minRating", serializedRatings);
        else next.delete("minRating");
        if (shouldRemoveInStock) next.delete("inStock");
        if (shouldRemoveOutOfStock) next.delete("outOfStock");
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  }, [
    availabilityCounts.inStock,
    availabilityCounts.outOfStock,
    hits.length,
    inStock,
    outOfStock,
    ratingOptions,
    selectedRatings,
    setSearchParams,
  ]);

  const filterSections = [
    facetCategories.length > 0 && {
      key: "category",
      title: "Category",
      content: (
        <OptionFilter
          name="categoryId"
          options={categoryOptions}
          selected={parseMultiValue(searchParams.get("categoryId"))}
          multiple
          onChange={(values) =>
            updateParam("categoryId", serializeMultiValue(values))
          }
          emptyText="No categories"
        />
      ),
    },
    brandOptions.length > 0 && {
      key: "brand",
      title: "Brand",
      content: (
        <OptionFilter
          name="brand"
          options={brandOptions}
          selected={parseMultiValue(searchParams.get("brand"))}
          multiple
          onChange={(values) =>
            updateParam("brand", serializeMultiValue(values))
          }
        />
      ),
    },
    collectionOptions.length > 0 && {
      key: "collectionIds",
      title: "Collections",
      content: (
        <OptionFilter
          name="collectionIds"
          options={collectionOptions}
          selected={parseMultiValue(searchParams.get("collectionIds"))}
          multiple
          onChange={(values) =>
            updateParam("collectionIds", serializeMultiValue(values))
          }
        />
      ),
    },
    tagOptions.length > 0 && {
      key: "tags",
      title: "Tags",
      content: (
        <OptionFilter
          name="tags"
          options={tagOptions}
          selected={parseMultiValue(searchParams.get("tags"))}
          multiple
          onChange={(values) =>
            updateParam("tags", serializeMultiValue(values))
          }
        />
      ),
    },
    Object.values(facets.merchandising || {}).some(
      (count) => Number(count) > 0,
    ) && {
      key: "merchandising",
      title: "Discover",
      content: (
        <CheckboxListFilter
          name="merchandising"
          options={[
            {
              value: "featured",
              label: "Featured",
              count: facets.merchandising?.featured,
            },
            {
              value: "bestSeller",
              label: "Best Seller",
              count: facets.merchandising?.bestSeller,
            },
            {
              value: "newArrival",
              label: "New Arrival",
              count: facets.merchandising?.newArrival,
            },
          ].filter((option) => Number(option.count || 0) > 0)}
          selected={["featured", "bestSeller", "newArrival"].filter(
            (value) => searchParams.get(value) === "true",
          )}
          onChange={(values) => {
            const selectedValues = new Set(values);
            updateParams([
              ["featured", selectedValues.has("featured") ? "true" : undefined],
              [
                "bestSeller",
                selectedValues.has("bestSeller") ? "true" : undefined,
              ],
              [
                "newArrival",
                selectedValues.has("newArrival") ? "true" : undefined,
              ],
            ]);
          }}
        />
      ),
    },
    (facets.priceStats?.min ?? facets.price?.min) != null &&
      (facets.priceStats?.max ?? facets.price?.max) != null &&
      (facets.priceStats?.max ?? facets.price?.max) > 0 &&
      (facets.priceStats?.min ?? facets.price?.min) < (facets.priceStats?.max ?? facets.price?.max) && {
        key: "price",
        title: "Price Range",
        content: (
          <PriceRangeFilter
            min={searchParams.get("minPrice") ?? undefined}
            max={searchParams.get("maxPrice") ?? undefined}
            minLimit={facets.priceStats?.min ?? facets.price?.min}
            maxLimit={facets.priceStats?.max ?? facets.price?.max}
            onChange={handlePriceChange}
          />
        ),
      },
    ...attributeFacets.map((attribute) => ({
      key: `attr_${attribute.key}`,
      title: attribute.label,
      searchable: attribute.searchable && attribute.values.length > 6,
      content: (
        <OptionFilter
          name={`attr_${attribute.key}`}
          options={attribute.values}
          selected={parseMultiValue(searchParams.get(`attr_${attribute.key}`))}
          multiple
          onChange={(values) =>
            updateParam(`attr_${attribute.key}`, serializeMultiValue(values))
          }
        />
      ),
    })),
    ratingOptions.length > 0 && {
      key: "rating",
      title: "Min. Rating",
      content: (
        <OptionFilter
          name="minRating"
          options={ratingOptions}
          selected={selectedRatings}
          multiple
          onChange={(values) =>
            updateParam("minRating", serializeMultiValue(values))
          }
        />
      ),
    },
    /*
    {
      key: "delivery",
      title: "Delivery",
      defaultOpen: false,
      content: (
        <CheckboxListFilter
          name="delivery"
          options={[
            { value: "expressDelivery", label: "Express Delivery" },
            { value: "freeDelivery", label: "Free Delivery" },
          ]}
          selected={["expressDelivery", "freeDelivery"].filter(
            (value) => searchParams.get(value) === "true",
          )}
          onChange={(values) => {
            const selectedValues = new Set(values);
            updateParams([
              [
                "expressDelivery",
                selectedValues.has("expressDelivery") ? "true" : undefined,
              ],
              [
                "freeDelivery",
                selectedValues.has("freeDelivery") ? "true" : undefined,
              ],
            ]);
          }}
        />
      ),
    },
    */
    availabilityOptions.length > 0 && {
      key: "availability",
      title: "Availability",
      content: (
        <CheckboxListFilter
          name="availability"
          options={availabilityOptions}
          selected={["inStock", "outOfStock"].filter(
            (value) => searchParams.get(value) === "true",
          )}
          onChange={(values) => {
            const selectedValues = new Set(values);
            updateParams([
              ["inStock", selectedValues.has("inStock") ? "true" : undefined],
              [
                "outOfStock",
                selectedValues.has("outOfStock") ? "true" : undefined,
              ],
            ]);
          }}
        />
      ),
    },
  ].filter(Boolean);

  const topContent = (
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
          {meta.total.toLocaleString()} Results
        </p>
      )}
    </div>
  );

  return (
    <ProductListingLayout
      pageTitle={q ? `Search: "${q}"` : "Search"}
      seoDescription="Search Products at Sam Global"
      topContent={topContent}
      totalResults={meta.total}
      pageSize={limit}
      sortValue={sort}
      sortOptions={meta.total <= 1 ? [] : SORT_OPTIONS}
      onSortChange={(value) => updateParam("sort", value)}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      filterSections={filterSections}
      activeFilters={activeFilters}
      onRemoveFilter={removeFilter}
      onClearFilters={clearFiltersAction}
      loading={searchState.loading && !hits.length}
      error={searchState.error}
      empty={!hits.length && !searchState.loading}
      emptyTitle="No results found"
      emptyText={
        q
          ? `We couldn't find anything for "${q}". Try different keywords or remove some filters.`
          : "We couldn't find any products in this category. Try selecting another category or removing some filters."
      }
      products={hits}
      viewMode="grid"
      onAddToCart={addToCart}
      onWishlist={toggleWishlist}
      isWishlisted={isWishlisted}
      currentPage={currentPage}
      totalPages={totalPages}
      loadingMore={false}
    >
      {!(q || categoryValue) ? (
        <div className="state-box flex flex-col items-center py-20 text-center">
          <Search size={48} className="mb-4 text-gray" />

          <p className=" text-[18px] font-semibold text-ink">
            What Are You Looking for?
          </p>

          <p className="mt-2  text-sm text-muted">
            Enter a Search Term Above to Find Products.
          </p>
        </div>
      ) : null}
    </ProductListingLayout>
  );
}
