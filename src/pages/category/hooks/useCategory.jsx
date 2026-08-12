import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CUSTOMER_ROUTES from "../../../constants/routes";
import { CheckboxListFilter, OptionFilter, PriceRangeFilter } from "../../../components/ecommerce";
import { useProductActions } from "../../../hooks/useProductActions";
import { fetchProducts } from "../../../features/product/productSlice";
import { fetchCategoryByKey, fetchCategories } from "../../../features/catalog/catalogSlice";
import {
  isProductInStock,
  getProductPrice,
  getAvailabilityCounts,
  calculateAbsolutePriceLimits,
} from "../../../utils/ecommerce";
import { buildCategoryTree } from "../../../layouts/header/categoryHelpers";
import {
  parseMultiValue,
  serializeMultiValue,
  getFacetOptionCount,
  getCategoryLabel,
  getCategoryKey,
  getMatchingCategoryKeys,
} from "../utils/categoryUtils";
import { capitalizeFirst } from "../../../utils/stringUtils";

export default function useCategory() {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryData, setCategoryData] = useState(null);
  const [sidebarCategory, setSidebarCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [productFacets, setProductFacets] = useState({});
  const [facetsContextKey, setFacetsContextKey] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  const sentinelRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const didInitialProductsLoadRef = useRef(false);
  const productLoadTimerRef = useRef(null);
  const inFlightProductLoadKeyRef = useRef("");
  const productState = useSelector((s) => s.product);
  const { addToCart, isWishlisted, toggleWishlist } = useProductActions();
  const catalogCategoryList =
    useSelector((state) => state.catalog?.globalCategories || state.catalog?.list) || [];
  const categoryTree = useMemo(() => buildCategoryTree(catalogCategoryList), [catalogCategoryList]);

  const brandContextKey = useMemo(() => {
    const p = new URLSearchParams(searchParams);
    p.delete("brand");
    p.delete("page");
    return `${categoryKey}_${p.toString()}`;
  }, [searchParams, categoryKey]);

  const brandOptionsRef = useRef({ context: "", options: [] });
  const allBrands = useMemo(() => {
    const rawBrands = productFacets?.brands || [];
    const currentSelected = parseMultiValue(searchParams.get("brand"));

    if (brandContextKey !== brandOptionsRef.current.context || currentSelected.length === 0) {
      brandOptionsRef.current = {
        context: brandContextKey,
        options: rawBrands,
      };
    }

    if (currentSelected.length > 0 && brandOptionsRef.current.options.length > 0) {
      const mergedMap = new Map();
      brandOptionsRef.current.options.forEach((opt) => mergedMap.set(opt.value, { ...opt }));
      rawBrands.forEach((opt) => mergedMap.set(opt.value, opt));
      return Array.from(mergedMap.values());
    }

    return brandOptionsRef.current.options;
  }, [productFacets?.brands, searchParams, brandContextKey]);

  const products = useMemo(() => {
    if (!categoryKey) return items;
    const targetCats = [String(categoryKey).toLowerCase().replace(/[^a-z0-9]/g, "")];
    const validKeys = getMatchingCategoryKeys(targetCats, categoryTree);

    return items.filter((p) => {
      const cat = p.categoryId || p.category;
      if (!cat) return false;
      const catStr = String(typeof cat === "object" ? cat.slug || cat.key || cat.id || cat.name : cat)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      if (validKeys.size > 0 && validKeys.has(catStr)) {
        return true;
      }

      return targetCats.some(
        (targetCat) => catStr === targetCat || catStr.includes(targetCat) || targetCat.includes(catStr),
      );
    });
  }, [items, categoryKey, categoryTree]);

  const availabilityCounts = useMemo(
    () => getAvailabilityCounts(products, productFacets),
    [products, productFacets]
  );

  const attributesContextKey = useMemo(() => {
    const p = new URLSearchParams(searchParams);
    Array.from(p.keys()).forEach((key) => {
      if (key.startsWith("attr_")) p.delete(key);
    });
    p.delete("page");
    return `${categoryKey}_${p.toString()}`;
  }, [searchParams, categoryKey]);

  const attributesOptionsRef = useRef({ context: "", attributes: [] });
  const allAttributes = useMemo(() => {
    const rawAttributes = productFacets?.attributes || [];
    const hasAnyAttrSelected = Array.from(searchParams.keys()).some((k) => k.startsWith("attr_"));

    if (attributesContextKey !== attributesOptionsRef.current.context || !hasAnyAttrSelected) {
      attributesOptionsRef.current = {
        context: attributesContextKey,
        attributes: rawAttributes,
      };
    }

    if (hasAnyAttrSelected && attributesOptionsRef.current.attributes.length > 0) {
      const mergedAttributes = attributesOptionsRef.current.attributes.map((cachedAttr) => {
        const rawAttr = rawAttributes.find((ra) => ra.key === cachedAttr.key);
        if (!rawAttr) return cachedAttr;
        const mergedValuesMap = new Map();
        (cachedAttr.values || []).forEach((v) => mergedValuesMap.set(v.value, { ...v }));
        (rawAttr.values || []).forEach((v) => mergedValuesMap.set(v.value, v));
        return {
          ...cachedAttr,
          values: Array.from(mergedValuesMap.values()),
        };
      });
      rawAttributes.forEach((rawAttr) => {
        if (!mergedAttributes.find((ma) => ma.key === rawAttr.key)) {
          mergedAttributes.push(rawAttr);
        }
      });
      return mergedAttributes;
    }

    return attributesOptionsRef.current.attributes;
  }, [productFacets?.attributes, searchParams, attributesContextKey]);

  const filterableAttributes = useMemo(
    () =>
      (allAttributes || [])
        .filter((attribute) => attribute.variant === true)
        .map((attribute) => ({
          ...attribute,
          key: String(attribute.key || ""),
          label: attribute.label || attribute.key,
          searchable: attribute.searchable === true,
          options: (attribute.values || [])
            .filter((option) => Number(option.count || 0) > 0)
            .map((option) => String(option.value)),
        }))
        .filter((attribute) => attribute.key && attribute.options.length > 0),
    [allAttributes],
  );

  const supportedAttributeKeys = useMemo(
    () => new Set(filterableAttributes.map((attribute) => attribute.key)),
    [filterableAttributes],
  );

  const attributeCountMaps = useMemo(() => {
    return filterableAttributes.reduce((maps, attribute) => {
      const facet = (allAttributes || []).find((item) => String(item.key) === String(attribute.key));
      maps[attribute.key] = Object.fromEntries(
        (facet?.values || []).map((option) => [String(option.value), Number(option.count || 0)]),
      );
      return maps;
    }, {});
  }, [filterableAttributes, allAttributes]);

  const currentContextKey = useMemo(() => {
    const p = new URLSearchParams(searchParams);
    p.delete("minPrice");
    p.delete("maxPrice");
    p.delete("page");
    return `${categoryKey}_${p.toString()}`;
  }, [searchParams, categoryKey]);

  const [absolutePriceLimits, setAbsolutePriceLimits] = useState({
    min: null,
    max: null,
    key: "",
  });

  useEffect(() => {
    if (currentContextKey !== facetsContextKey) return;

    const { min: currentMin, max: currentMax } = calculateAbsolutePriceLimits(productFacets, products);

    if (currentMin != null && currentMax != null) {
      setAbsolutePriceLimits((prev) => {
        if (prev.key !== currentContextKey) {
          return { min: currentMin, max: currentMax, key: currentContextKey };
        }
        const newMin = prev.min == null ? currentMin : Math.min(prev.min, currentMin);
        const newMax = prev.max == null ? currentMax : Math.max(prev.max, currentMax);

        if (newMin !== prev.min || newMax !== prev.max) {
          return { min: newMin, max: newMax, key: currentContextKey };
        }
        return prev;
      });
    }
  }, [productFacets?.price, products, currentContextKey, facetsContextKey]);

  const priceLimits = useMemo(() => {
    return {
      min: absolutePriceLimits.min ?? 0,
      max: absolutePriceLimits.max ?? 150000,
    };
  }, [absolutePriceLimits]);

  const meta = productState.meta;
  const totalPages = pageInfo.totalPages || meta?.totalPages || 1;
  const currentPage = pageInfo.page || Number(searchParams.get("page") || 1);

  const getParams = useCallback(
    (pageOverride) => {
      const params = {
        category: categoryKey,
        brand: searchParams.get("brand") || undefined,
        minPrice: searchParams.get("minPrice") || undefined,
        maxPrice: searchParams.get("maxPrice") || undefined,
        sort: searchParams.get("sort") || undefined,
        inStock: searchParams.get("inStock") || undefined,
        outOfStock: searchParams.get("outOfStock") || undefined,
        page: pageOverride || 1,
        limit: Number(searchParams.get("limit") || 20),
      };
      searchParams.forEach((value, key) => {
        if (!key.startsWith("attr_") || !value) return;
        params[key] = value;
      });
      return params;
    },
    [searchParams, categoryKey],
  );

  const loadProducts = useCallback(
    async ({ page = 1, append = false } = {}) => {
      const params = getParams(page);
      const loadKey = JSON.stringify({ params, append });
      if (!append && inFlightProductLoadKeyRef.current === loadKey) return [];
      if (!append) inFlightProductLoadKeyRef.current = loadKey;
      const requestSequence = append ? requestSequenceRef.current : ++requestSequenceRef.current;
      if (append) setIsLoadingMore(true);
      try {
        const result = await dispatch(fetchProducts(params)).unwrap();
        if (requestSequence !== requestSequenceRef.current) return [];
        const data = result?.data;
        let list = Array.isArray(data) ? data : data?.products || data?.items || data?.list || [];

        const p = new URLSearchParams(searchParams);
        p.delete("minPrice");
        p.delete("maxPrice");
        p.delete("page");
        const ctxKey = `${categoryKey}_${p.toString()}`;

        const m = result?.meta || {};
        setPageInfo({
          page: Number(m.page || m.currentPage || params.page || 1),
          totalPages: Number(m.totalPages || m.pages || 1),
          total: Number(m.total || m.count || list.length || 0),
        });
        setProductFacets(m.facets || m.filters || {});
        setFacetsContextKey(ctxKey);

        setItems((prev) => (append ? [...prev, ...list] : list));
        setFirstLoadDone(true);
        if (!append) didInitialProductsLoadRef.current = true;
      } finally {
        if (append) setIsLoadingMore(false);
        if (!append && inFlightProductLoadKeyRef.current === loadKey) {
          inFlightProductLoadKeyRef.current = "";
        }
      }
    },
    [dispatch, getParams, searchParams, categoryKey],
  );

  const scrollToResultsTop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    if (productLoadTimerRef.current) clearTimeout(productLoadTimerRef.current);
    const delay = didInitialProductsLoadRef.current ? 300 : 0;
    productLoadTimerRef.current = setTimeout(() => {
      loadProducts({ page: 1, append: false }).catch(() => {
        setFirstLoadDone(true);
        setIsLoadingMore(false);
      });
    }, delay);

    return () => {
      if (productLoadTimerRef.current) clearTimeout(productLoadTimerRef.current);
    };
  }, [loadProducts]);

  useEffect(() => {
    if (!categoryData) return;
    const globalFilterKeys = new Set(["brand", "minPrice", "maxPrice", "inStock", "outOfStock", "sort", "limit"]);
    let changed = false;

    const currentParams = new URLSearchParams(searchParams);
    Array.from(currentParams.keys()).forEach((key) => {
      if (key === "page") {
        currentParams.delete(key);
        changed = true;
        return;
      }

      if (globalFilterKeys.has(key)) return;

      if (key.startsWith("attr_")) {
        const attributeKey = key.replace(/^attr_/, "");
        if (supportedAttributeKeys.has(attributeKey)) return;
      }

      currentParams.delete(key);
      changed = true;
    });

    if (changed) {
      setSearchParams(currentParams, { replace: true });
    }
  }, [categoryData, supportedAttributeKeys, searchParams, setSearchParams]);

  useEffect(() => {
    setItems([]);
    setFirstLoadDone(false);
    setCategoryData(null);
    setSidebarCategory(null);
    setSubCategories([]);
    setCategoryError(null);
    didInitialProductsLoadRef.current = false;
    inFlightProductLoadKeyRef.current = "";

    dispatch(fetchCategoryByKey({ categoryKey }))
      .unwrap()
      .then((result) => {
        const d = result?.data || result;
        if (!d) return;
        setCategoryData(d);
        dispatch(fetchCategories({ parentKey: categoryKey, limit: 200 }))
          .then((subAction) => {
            const subData = subAction?.payload?.data;
            const subs = Array.isArray(subData) ? subData : subData?.items || subData?.list || [];
            if (!subs.length && d?.parentKey) {
              dispatch(fetchCategoryByKey({ categoryKey: d.parentKey }))
                .unwrap()
                .then((parentResult) => {
                  const parent = parentResult?.data || parentResult;
                  setSidebarCategory(parent || d);
                  return dispatch(fetchCategories({ parentKey: d.parentKey, limit: 200 }));
                })
                .then((siblingAction) => {
                  const siblingData = siblingAction?.payload?.data;
                  const siblings = Array.isArray(siblingData)
                    ? siblingData
                    : siblingData?.items || siblingData?.list || [];
                  setSubCategories(siblings);
                })
                .catch(() => {
                  setSidebarCategory(d);
                  setSubCategories([]);
                });
              return;
            }

            setSidebarCategory(d);
            setSubCategories(subs);
            if (subs.length) {
              setCategoryData((prev) => (prev ? { ...prev, children: subs } : prev));
            }
          })
          .catch(() => {});
      })
      .catch((error) => {
        setCategoryError(error);
      });
  }, [dispatch, categoryKey]);

  useEffect(() => {
    if (!sentinelRef.current || !firstLoadDone || productState.loading || isLoadingMore) return undefined;
    if (currentPage >= totalPages) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        loadProducts({ page: currentPage + 1, append: true }).catch(() => {});
      },
      { threshold: 0.2, rootMargin: "0px 0px 300px 0px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [currentPage, totalPages, firstLoadDone, loadProducts, productState.loading, isLoadingMore]);

  const updateParam = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value == null || value === "") next.delete(key);
        else next.set(key, value);
        next.delete("page");
        return next;
      });
      scrollToResultsTop();
    },
    [scrollToResultsTop, setSearchParams],
  );

  const updateParams = useCallback(
    (entries) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        entries.forEach(([key, value]) => {
          if (value == null || value === "") next.delete(key);
          else next.set(key, value);
        });
        next.delete("page");
        return next;
      });
      scrollToResultsTop();
    },
    [scrollToResultsTop, setSearchParams],
  );

  const handlePriceChange = useCallback(
    ({ minPrice, maxPrice }) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (minPrice) next.set("minPrice", minPrice);
        else next.delete("minPrice");
        if (maxPrice) next.set("maxPrice", maxPrice);
        else next.delete("maxPrice");
        next.delete("page");
        return next;
      });
      scrollToResultsTop();
    },
    [scrollToResultsTop, setSearchParams],
  );

  const removeFilter = useCallback(
    (key, filter) => {
      if (key === "category" && filter?.href) {
        navigate(filter.href);
        return;
      }

      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (key === "price") {
          next.delete("minPrice");
          next.delete("maxPrice");
        } else if (filter?.groupKey) {
          if (filter.value === undefined) {
            next.delete(filter.groupKey);
          } else {
            const nextValues = parseMultiValue(next.get(filter.groupKey)).filter((value) => value !== filter.value);
            const serialized = serializeMultiValue(nextValues);
            if (serialized) next.set(filter.groupKey, serialized);
            else next.delete(filter.groupKey);
          }
        } else next.delete(key);
        next.delete("page");
        return next;
      });
      scrollToResultsTop();
    },
    [navigate, scrollToResultsTop, setSearchParams],
  );

  const handleClearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
    scrollToResultsTop();
  }, [scrollToResultsTop, setSearchParams]);

  const categoryTitle = categoryData?.title || categoryData?.name || (categoryKey || "").replace(/-/g, " ");
  const sidebarCategoryTitle = sidebarCategory?.title || sidebarCategory?.name || categoryTitle;
  const categoryDesc = categoryData?.description;
  const isRootCategory =
    sidebarCategory?.parentKey === null ||
    sidebarCategory?.parentKey === undefined ||
    Number(sidebarCategory?.level || 0) === 0;
  const visibleCategoryKeys = new Set(
    (productFacets.categories || [])
      .filter((category) => Number(category.count || 0) > 0)
      .map((category) => String(category.value || category.key || "")),
  );
  const visibleSubCategories = subCategories.filter((category) =>
    visibleCategoryKeys.has(String(getCategoryKey(category))),
  );
  const isInitialLoading = (productState.loading && !products.length) || (!firstLoadDone && !products.length);

  const showSubCategoryStrip = isRootCategory && (visibleSubCategories.length > 0 || isInitialLoading);
  const showCategorySidebar = !isRootCategory && visibleSubCategories.length > 0;
  const categoryFilter = useMemo(() => {
    if (!categoryData || isRootCategory) return null;
    const parentKey =
      sidebarCategory && getCategoryKey(sidebarCategory) !== categoryKey
        ? getCategoryKey(sidebarCategory)
        : categoryData.parentKey;

    return {
      key: "category",
      label: getCategoryLabel(categoryData) || categoryTitle,
      href: parentKey ? CUSTOMER_ROUTES.category(parentKey) : "/products",
    };
  }, [categoryData, categoryKey, categoryTitle, isRootCategory, sidebarCategory]);

  const filterSections = useMemo(() => {
    const availabilityOptions = [
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
    ].filter((option) => option.count >= 1);

    const brandOptions = allBrands
      .map((brand) => ({
        value: String(brand.value),
        label: String(brand.value),
        count: Number(brand.count || 0),
      }))
      .filter((brand) => brand.count > 0);

    const globalFilters = [
      absolutePriceLimits.min != null &&
        absolutePriceLimits.max != null &&
        absolutePriceLimits.max > 0 &&
        absolutePriceLimits.min < absolutePriceLimits.max && {
          key: "price",
          title: "Price Range",
          content: (
            <PriceRangeFilter
              min={searchParams.get("minPrice")}
              max={searchParams.get("maxPrice")}
              minLimit={priceLimits.min}
              maxLimit={priceLimits.max}
              onChange={handlePriceChange}
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
            onChange={(values) => updateParam("brand", serializeMultiValue(values))}
          />
        ),
      },
      {
        key: "inStock",
        title: "Availability",
        content: (
          <CheckboxListFilter
            name="availability"
            options={availabilityOptions}
            selected={["inStock", "outOfStock"].filter((value) => searchParams.get(value) === "true")}
            onChange={(values) => {
              const selectedValues = new Set(values);
              updateParams([
                ["inStock", selectedValues.has("inStock") ? "true" : undefined],
                ["outOfStock", selectedValues.has("outOfStock") ? "true" : undefined],
              ]);
            }}
          />
        ),
      },
    ].filter((filter) => filter.key !== "inStock" || availabilityOptions.length);

    const categoryFilters = filterableAttributes
      .map((attribute) => {
        const options = attribute.options
          .map((option) => ({
            value: option,
            label: option,
            count: getFacetOptionCount(attributeCountMaps[attribute.key], option),
          }))
          .filter((option) => option.count >= 1);

        if (!options.length) return null;

        return {
          key: `attr_${attribute.key}`,
          title: attribute.label || attribute.key,
          searchable: attribute.searchable && options.length > 6,
          content: (
            <OptionFilter
              name={`attr_${attribute.key}`}
              options={options}
              selected={parseMultiValue(searchParams.get(`attr_${attribute.key}`))}
              multiple
              onChange={(values) => updateParam(`attr_${attribute.key}`, serializeMultiValue(values))}
            />
          ),
        };
      })
      .filter(Boolean);

    const finalFilters = [...globalFilters, ...categoryFilters];

    return finalFilters.flat().filter(Boolean);
  }, [
    filterableAttributes,
    searchParams,
    availabilityCounts,
    attributeCountMaps,
    handlePriceChange,
    updateParam,
    updateParams,
    priceLimits.min,
    priceLimits.max,
    absolutePriceLimits,
    allBrands,
  ]);

  const activeFilters = useMemo(() => {
    const attributeLabelByKey = new Map(
      filterableAttributes.map((attribute) => [attribute.key, attribute.label || attribute.key]),
    );

    return [
      categoryFilter,
      searchParams.get("inStock") === "true" && {
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

      ...Array.from(searchParams.entries())
        .filter(([key, value]) => {
          if (!key.startsWith("attr_") || !value) return false;
          const attributeKey = key.replace(/^attr_/, "");
          return supportedAttributeKeys.has(attributeKey);
        })
        .map(([key, value]) => {
          const attributeKey = key.replace(/^attr_/, "");
          const label = attributeLabelByKey.get(attributeKey) || capitalizeFirst(attributeKey);
          return {
            key,
            groupKey: key,
            label: `${label}: ${value.split(",").join(", ")}`,
          };
        }),
      (searchParams.get("minPrice") || searchParams.get("maxPrice")) && {
        key: "price",
        label: `Price: ₹${Number(searchParams.get("minPrice") || priceLimits.min || 0).toLocaleString("en-IN")} – ₹${Number(searchParams.get("maxPrice") || priceLimits.max || 150000).toLocaleString("en-IN")}`,
      },
    ]
      .flat()
      .filter(Boolean);
  }, [categoryFilter, filterableAttributes, searchParams, supportedAttributeKeys, priceLimits.min, priceLimits.max]);

  const clearFiltersAction = activeFilters.length > 1 ? handleClearFilters : undefined;

  return {
    categoryKey,
    searchParams,
    viewMode,
    sidebarOpen,
    setSidebarOpen,
    productState,
    products,
    pageInfo,
    isLoadingMore,
    firstLoadDone,
    categoryError,
    addToCart,
    isWishlisted,
    toggleWishlist,
    sentinelRef,
    categoryTitle,
    sidebarCategoryTitle,
    categoryDesc,
    visibleSubCategories,
    isInitialLoading,
    showSubCategoryStrip,
    showCategorySidebar,
    filterSections,
    activeFilters,
    removeFilter,
    clearFiltersAction,
    currentPage,
    totalPages,
    updateParam,
  };
}
