import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Grid2X2, List } from "lucide-react";
import Seo from "../../components/common/Seo";

import {
  CheckboxListFilter,
  CollectionToolbar,
  OptionFilter,
  PriceRangeFilter,
  ProductResultsLayout,
  RatingFilter,
} from "../../components/ecommerce";
import { useProductActions } from "../../hooks/useProductActions";
import { fetchProducts } from "../../features/product/productSlice";
import {
  fetchCategories,
  fetchBrands,
} from "../../features/catalog/catalogSlice";
import {
  buildFacetCountMap,
  buildRatingCountMap,
  getProductBrandName,
  isProductInStock,
} from "../../utils/ecommerce";

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "newest", label: "Latest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

function parseMultiValue(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function serializeMultiValue(values) {
  const uniqueValues = [
    ...new Set(
      (values || [])
        .map(String)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
  return uniqueValues.length ? uniqueValues.join(",") : undefined;
}

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brandList, setBrandList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const sentinelRef = useRef(null);

  const productState = useSelector((s) => s.product);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const selectedBrands = useMemo(
    () => parseMultiValue(searchParams.get("brand")),
    [searchParams],
  );
  const selectedRatings = useMemo(
    () => parseMultiValue(searchParams.get("rating")),
    [searchParams],
  );

  const products = items;
  const totalPages = pageInfo.totalPages || 1;
  const currentPage = pageInfo.page || 1;
  const pageSize = Number(searchParams.get("limit") || 12);
  const availabilityCounts = useMemo(
    () =>
      products.reduce(
        (counts, product) => {
          if (isProductInStock(product)) {
            counts.inStock += 1;
          } else {
            counts.outOfStock += 1;
          }
          return counts;
        },
        { inStock: 0, outOfStock: 0 },
      ),
    [products],
  );
  const brandCounts = useMemo(
    () =>
      buildFacetCountMap(products, (product) => getProductBrandName(product)),
    [products],
  );
  const ratingCounts = useMemo(() => buildRatingCountMap(products), [products]);

  const getParams = useCallback(
    (pageOverride) => ({
      category: searchParams.get("category") || undefined,
      brand: searchParams.get("brand") || undefined,
      q: searchParams.get("q") || undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      sort: searchParams.get("sort") || undefined,
      productFamilyCode:
        searchParams.get("productFamilyCode") ||
        searchParams.get("family") ||
        undefined,
      color: searchParams.get("color") || undefined,
      size: searchParams.get("size") || undefined,
      material: searchParams.get("material") || undefined,
      fit: searchParams.get("fit") || undefined,
      storage: searchParams.get("storage") || undefined,
      skinType: searchParams.get("skinType") || undefined,
      shade: searchParams.get("shade") || undefined,
      minRating: searchParams.get("rating") || undefined,
      inStock: searchParams.get("inStock") === "true" ? "true" : undefined,
      outOfStock:
        searchParams.get("outOfStock") === "true" ? "true" : undefined,
      expressDelivery:
        searchParams.get("expressDelivery") === "true" ? "true" : undefined,
      freeDelivery:
        searchParams.get("freeDelivery") === "true" ? "true" : undefined,
      page: pageOverride || 1,
      limit: Number(searchParams.get("limit") || 12),
    }),
    [searchParams],
  );

  const loadProducts = useCallback(
    async ({ page = 1, append = false } = {}) => {
      const params = getParams(page);
      if (append) setIsLoadingMore(true);
      const result = await dispatch(fetchProducts(params)).unwrap();

      const data = result?.data || {};
      const list =
        data.hits ||
        data.products ||
        data.results ||
        data.items ||
        data.list ||
        (Array.isArray(data) ? data : []);
      const meta =
        result?.meta?.pagination || result?.pagination || result?.meta || {};
      setPageInfo({
        page: Number(meta.page || meta.currentPage || params.page || 1),
        totalPages: Number(meta.totalPages || meta.pages || 1),
        total: Number(meta.total || meta.count || list.length || 0),
      });
      setItems((prev) => (append ? [...prev, ...list] : list));
      setFirstLoadDone(true);
      setIsLoadingMore(false);
      return list;
    },
    [dispatch, getParams],
  );

  useEffect(() => {
    const pageVal = Number(searchParams.get("page") || 1);
    loadProducts({ page: pageVal, append: false }).catch(() => {
      setFirstLoadDone(true);
      setIsLoadingMore(false);
    });
  }, [loadProducts, searchParams]);

  useEffect(() => {
    dispatch(fetchCategories())
      .then((action) => {
        const data = action?.payload?.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : data?.list || [];
        setCategoryList(list);
      })
      .catch(() => { });

    dispatch(fetchBrands({ limit: 100 }))
      .then((action) => {
        const data = action?.payload?.data;
        const list = Array.isArray(data)
          ? data
          : data?.items || data?.list || [];
        setBrandList(
          list
            .map((brand) => {
              const label =
                brand?.name || brand?.title || brand?.brandName || brand?.code;
              return label
                ? { value: String(label), label: String(label) }
                : null;
            })
            .filter(Boolean),
        );
      })
      .catch(() => { });
  }, [dispatch]);

  useEffect(() => {
    if (
      !sentinelRef.current ||
      !firstLoadDone ||
      productState.loading ||
      isLoadingMore
    )
      return undefined;
    if (currentPage >= totalPages) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        loadProducts({ page: currentPage + 1, append: true }).catch(() => { });
      },
      { threshold: 0.2, rootMargin: "0px 0px 300px 0px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [
    currentPage,
    totalPages,
    firstLoadDone,
    loadProducts,
    productState.loading,
    isLoadingMore,
  ]);

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      return next;
    });
  };

  const removeFilter = (key, filter) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (key === "price") {
        next.delete("minPrice");
        next.delete("maxPrice");
      } else if (filter?.groupKey) {
        const nextValues = parseMultiValue(next.get(filter.groupKey)).filter(
          (value) => value !== filter.value,
        );
        const serialized = serializeMultiValue(nextValues);
        if (serialized) next.set(filter.groupKey, serialized);
        else next.delete(filter.groupKey);
      } else next.delete(key);
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

  const activeFilters = [
    searchParams.get("category") && {
      key: "category",
      label: `Category: ${searchParams.get("category")}`,
    },
    ...selectedBrands.map((brand) => ({
      key: `brand:${brand}`,
      groupKey: "brand",
      value: brand,
      label: `Brand: ${brand}`,
    })),
    searchParams.get("productFamilyCode") && {
      key: "productFamilyCode",
      label: `Family: ${searchParams.get("productFamilyCode")}`,
    },
    ...selectedRatings.map((rating) => ({
      key: `rating:${rating}`,
      groupKey: "rating",
      value: rating,
      label: `Rating: ${rating}★ & up`,
    })),
    searchParams.get("inStock") === "true" && {
      key: "inStock",
      label: "In Stock Only",
    },
    searchParams.get("outOfStock") === "true" && {
      key: "outOfStock",
      label: "Out of Stock",
    },
    searchParams.get("expressDelivery") === "true" && {
      key: "expressDelivery",
      label: "Express Delivery",
    },
    searchParams.get("freeDelivery") === "true" && {
      key: "freeDelivery",
      label: "Free Delivery",
    },
    ["color", "size", "material", "fit", "storage", "skinType", "shade"]
      .map(
        (key) =>
          searchParams.get(key) && {
            key,
            label: `${key}: ${searchParams.get(key)}`,
          },
      )
      .filter(Boolean),
    (searchParams.get("minPrice") || searchParams.get("maxPrice")) && {
      key: "price",
      label: `Price: ₹${Number(searchParams.get("minPrice") || 0).toLocaleString("en-IN")} – ₹${Number(searchParams.get("maxPrice") || 150000).toLocaleString("en-IN")}`,
    },
    searchParams.get("q") && {
      key: "q",
      label: `Search: "${searchParams.get("q")}"`,
    },
  ]
    .flat()
    .filter(Boolean);

  const isSearchMode = Boolean(searchParams.get("q"));
  const pageTitle = isSearchMode
    ? `Search: "${searchParams.get("q")}"`
    : searchParams.get("category")
      ? `${searchParams.get("category")} Products`
      : "All Products";

  const filterSections = [
    categoryList.length > 0 && {
      key: "category",
      title: "Category",
      content: (
        <OptionFilter
          name="category"
          options={categoryList.map((cat) => ({
            value: cat.categoryKey || cat.id || cat._id,
            label: cat.title || cat.name,
          }))}
          selected={searchParams.get("category")}
          onChange={(value) => updateParam("category", value)}
        />
      ),
    },
    brandList.length > 0 && {
      key: "brand",
      title: "Brand",
      content: (
        <OptionFilter
          name="brand"
          options={brandList.map((brand) => ({
            ...brand,
            count: brandCounts[String(brand.value)] || 0,
          }))}
          selected={selectedBrands}
          multiple
          onChange={(values) =>
            updateParam("brand", serializeMultiValue(values))
          }
        />
      ),
    },
    {
      key: "price",
      title: "Price Range",
      content: (
        <PriceRangeFilter
          min={searchParams.get("minPrice")}
          max={searchParams.get("maxPrice")}
          onChange={handlePriceChange}
        />
      ),
    },
    {
      key: "rating",
      title: "Rating",
      content: (
        <RatingFilter
          selected={selectedRatings}
          multiple
          counts={ratingCounts}
          onChange={(values) =>
            updateParam("rating", serializeMultiValue(values))
          }
        />
      ),
    },
    {
      key: "delivery",
      title: "Delivery",
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
            updateParam(
              "expressDelivery",
              selectedValues.has("expressDelivery") ? "true" : undefined,
            );
            updateParam(
              "freeDelivery",
              selectedValues.has("freeDelivery") ? "true" : undefined,
            );
          }}
        />
      ),
    },
    {
      key: "inStock",
      title: "Availability",
      content: (
        <CheckboxListFilter
          name="availability"
          options={[
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
          ]}
          selected={["inStock", "outOfStock"].filter(
            (value) => searchParams.get(value) === "true",
          )}
          onChange={(values) => {
            const selectedValues = new Set(values);
            updateParam(
              "inStock",
              selectedValues.has("inStock") ? "true" : undefined,
            );
            updateParam(
              "outOfStock",
              selectedValues.has("outOfStock") ? "true" : undefined,
            );
          }}
        />
      ),
    },
  ].filter(Boolean);

  return (
    <>
      <Seo
        title={`${pageTitle} | Sam Global`}
        description="Browse products with filters, sort, and pagination."
      />

      <div className="my-8 md:my-16 ">
        <div className="mb-4  flex flex-wrap items-end justify-end gap-3">
          <CollectionToolbar
            sortValue={searchParams.get("sort") || ""}
            sortOptions={SORT_OPTIONS}
            onSortChange={(value) => updateParam("sort", value)}
            onOpenFilters={() => setSidebarOpen(true)}
          // viewControls={
          //   <div className="hidden  items-center gap-0.5 rounded-[6px] border border-border-strong bg-white p-1 sm:flex">
          //     <button
          //       type="button"
          //       onClick={() => setViewMode("grid")}
          //       className={`rounded p-1.5  transition-all duration-300 ease-in-out ${viewMode === "grid" ? "bg-gold text-white" : "text-gray hover:text-ink"}`}
          //     >
          //       <Grid2X2 size={15} />
          //     </button>
          //     <button
          //       type="button"
          //       onClick={() => setViewMode("list")}
          //       className={`rounded p-1.5  transition-all duration-300 ease-in-out ${viewMode === "list" ? "bg-gold text-white" : "text-gray hover:text-ink"}`}
          //     >
          //       <List size={15} />
          //     </button>
          //   </div>
          // }
          />
        </div>
        <ProductResultsLayout
          totalResults={pageInfo.total}
          pageSize={pageSize}
          filterSections={filterSections}
          filters={activeFilters}
          onRemoveFilter={removeFilter}
          onClearFilters={() => setSearchParams(new URLSearchParams())}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          loading={
            (productState.loading && !products.length) ||
            (!firstLoadDone && !products.length)
          }
          error={productState.error}
          empty={!products.length && !productState.loading && firstLoadDone}
          emptyTitle={isSearchMode ? "No results found" : "No products found"}
          emptyText={
            isSearchMode
              ? "Try different keywords or remove filters."
              : "Try adjusting your filters or browse other categories."
          }
          products={products}
          viewMode={viewMode}
          onAddToCart={addToCart}
          onWishlist={toggleWishlist}
          isWishlisted={isWishlisted}
          currentPage={currentPage}
          totalPages={totalPages}
          showPagination={false}
          loadingMore={isLoadingMore}
          sentinelRef={sentinelRef}
        />
      </div>
    </>
  );
}
