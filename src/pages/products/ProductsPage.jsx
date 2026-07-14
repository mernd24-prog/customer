import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { buildCategoryTree } from "../../layouts/header/categoryHelpers";
import { useDispatch, useSelector } from "react-redux";
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
  buildRatingCountMap,
  isProductInStock,
  getProductPrice,
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

const ATTRIBUTE_PARAM_PREFIX = "attr_";
const STATIC_ATTRIBUTE_KEYS = [
  "color",
  "colour",
  "size",
  "material",
  "finish",
  "fit",
  "storage",
  "skinType",
  "shade",
  "ram",
];
const DIRECT_ATTRIBUTE_KEYS = [
  ...STATIC_ATTRIBUTE_KEYS,
  "capacity",
  "memory",
  "screenSize",
  "displaySize",
  "processor",
];
const ATTRIBUTE_SOURCE_KEYS = [
  "attributes",
  "specifications",
  "attributeValues",
  "attribute_values",
];
const RESERVED_ATTRIBUTE_KEYS = new Set([
  "id",
  "_id",
  "sku",
  "slug",
  "name",
  "title",
  "price",
  "mrp",
  "stock",
  "quantity",
  "inventory",
  "images",
  "image",
  "status",
  "isDefault",
]);

function toTitleCase(value = "") {
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeAttributeKey(value = "") {
  return String(value)
    .trim()
    .replace(/^attr_/, "")
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

function getAttributeParamKey(attributeKey = "") {
  return `${ATTRIBUTE_PARAM_PREFIX}${normalizeAttributeKey(attributeKey)}`;
}

function getAttributeParamValue(searchParams, attributeKey) {
  const key = normalizeAttributeKey(attributeKey);
  return searchParams.get(getAttributeParamKey(key)) || searchParams.get(key);
}

function getObjectValueByAttributeKey(source, attributeKey) {
  if (!source || typeof source !== "object") return undefined;
  const normalizedKey = normalizeAttributeKey(attributeKey);
  const matchingKey = Object.keys(source).find(
    (key) => normalizeAttributeKey(key) === normalizedKey,
  );
  return matchingKey ? source[matchingKey] : undefined;
}

function readAttributeRow(row, callback) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return false;

  const rawKey =
    row.key ?? row.name ?? row.attributeKey ?? row.attribute_key ?? row.code;
  const rawValue =
    row.value ?? row.values ?? row.label ?? row.optionValue ?? row.option_value;

  if (!rawKey || rawValue === undefined || rawValue === null || rawValue === "") {
    return false;
  }

  forEachAttributeValue({ [rawKey]: rawValue }, callback);
  return true;
}

function forEachAttributeValue(source, callback) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return;

  Object.entries(source).forEach(([rawKey, rawValue]) => {
    const key = normalizeAttributeKey(rawKey);
    if (!key || RESERVED_ATTRIBUTE_KEYS.has(key)) return;

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    values
      .map((value) =>
        value && typeof value === "object"
          ? value.value ?? value.name ?? value.label ?? value.title
          : value,
      )
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
      .forEach((value) => callback(key, value));
  });
}

function readAttributeSource(source, callback) {
  if (!source) return;

  if (Array.isArray(source)) {
    source.forEach((row) => readAttributeRow(row, callback));
    return;
  }

  forEachAttributeValue(source, callback);
}

function readDirectAttributeFields(source, callback) {
  if (!source || typeof source !== "object") return;

  DIRECT_ATTRIBUTE_KEYS.forEach((key) => {
    const value = source[key];
    if (value === undefined || value === null || value === "") return;
    callback(normalizeAttributeKey(key), value);
  });
}

function getProductVariantList(product = {}) {
  return [
    product?.variants,
    product?.productVariants,
    product?.product_variants,
    product?.variantDetails,
    product?.variant_details,
    product?.variantOptions,
    product?.variant_options,
  ].find(Array.isArray) || [];
}

function readKnownAttributeContainers(source, callback) {
  if (!source || typeof source !== "object") return;
  ATTRIBUTE_SOURCE_KEYS.forEach((key) => readAttributeSource(source[key], callback));
  readAttributeSource(source?.metadata?.attributes, callback);
}

function readOptionRows(source, callback) {
  if (!Array.isArray(source)) return;
  source.forEach((row) => readAttributeRow(row, callback));
}

function collectProductAttributeEntries(product, callback) {
  if (!product || typeof product !== "object") return;

  const nestedProduct = product.product || product.productId;
  if (nestedProduct && typeof nestedProduct === "object" && nestedProduct !== product) {
    collectProductAttributeEntries(nestedProduct, callback);
  }

  const variantAxes = Array.isArray(product?.variantAxes)
    ? product.variantAxes.map(normalizeAttributeKey).filter(Boolean)
    : [];
  const variants = getProductVariantList(product);

  if (variantAxes.length) {
    variantAxes.forEach((axis) => {
      const directValue = getObjectValueByAttributeKey(product, axis);
      if (directValue !== undefined && directValue !== null && directValue !== "") {
        callback(axis, directValue);
      }
    });

    variants.forEach((variant) => {
      const titleParts = String(variant?.title || "")
        .split("/")
        .map((part) => part.trim())
        .filter(Boolean);

      variantAxes.forEach((axis, index) => {
        const value =
          getObjectValueByAttributeKey(variant?.attributes, axis) ??
          getObjectValueByAttributeKey(variant, axis) ??
          titleParts[index];

        if (value !== undefined && value !== null && value !== "") {
          callback(axis, value);
        }
      });
    });

    return;
  }

  readDirectAttributeFields(product, callback);
  readKnownAttributeContainers(product, callback);
  readOptionRows(product?.options, callback);

  variants.forEach((variant) => {
    readDirectAttributeFields(variant, callback);
    readKnownAttributeContainers(variant, callback);
    readOptionRows(variant?.options, callback);
  });
}

function getProductBrandLabel(product = {}) {
  const nestedProduct = product.product || product.productId;
  return (
    product?.brand ||
    product?.brandName ||
    product?.brand_name ||
    product?.manufacturer ||
    product?.vendor ||
    product?.metadata?.brand ||
    (nestedProduct && typeof nestedProduct === "object"
      ? getProductBrandLabel(nestedProduct)
      : "")
  );
}

const getFacetList = (facets = {}, keys = []) => {
  for (const key of keys) {
    const value = facets?.[key];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.options)) return value.options;
    if (value && typeof value === "object") {
      return Object.entries(value).map(([entryKey, entryValue]) => ({
        value: entryKey,
        label: entryKey,
        count:
          typeof entryValue === "number"
            ? entryValue
            : entryValue?.count || entryValue?.doc_count,
      }));
    }
  }
  return [];
};

const normalizeFacetOption = (option = {}) => {
  const value =
    option.value ??
    option.id ??
    option._id ??
    option.key ??
    option.slug ??
    option.categoryKey ??
    option.category_id ??
    option.brand_id ??
    option.name ??
    option.title;
  const label =
    option.label ??
    option.name ??
    option.title ??
    option.brandName ??
    option.categoryName ??
    option.category_name ??
    option.brand_name ??
    value;

  return value
    ? {
        value: String(value),
        label: String(label),
        count:
          option.count ??
          option.doc_count ??
          option.total ??
          option.productCount ??
          option.productsCount ??
          option.totalProducts,
      }
    : null;
};


function getMatchingCategoryKeys(targetCats, categoryTree) {
  const keys = new Set();
  
  const addNodeAndChildren = (node) => {
    if (!node) return;
    keys.add(String(node.categoryKey || node.key).toLowerCase().replace(/[^a-z0-9]/g, ""));
    const children = [...(node.children || []), ...(node.subs || [])];
    children.forEach(addNodeAndChildren);
  };

  const findAndAdd = (nodes) => {
    if (!nodes) return;
    for (const node of nodes) {
      const nodeKey = String(node.categoryKey || node.key).toLowerCase().replace(/[^a-z0-9]/g, "");
      if (targetCats.some(tc => tc === nodeKey || nodeKey.includes(tc) || tc.includes(nodeKey))) {
        addNodeAndChildren(node);
      } else {
        const children = [...(node.children || []), ...(node.subs || [])];
        if (children.length > 0) {
          findAndAdd(children);
        }
      }
    }
  };

  findAndAdd(categoryTree);
  return keys;
}


export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brandList, setBrandList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [items, setItems] = useState([]);
  const [productFacets, setProductFacets] = useState({});
  const [seenCategories, setSeenCategories] = useState(new Map());
  const [seenCategoryCounts, setSeenCategoryCounts] = useState(new Map());
  const [seenBrands, setSeenBrands] = useState(new Map());
  const [seenBrandCounts, setSeenBrandCounts] = useState(new Map());
  const [seenRatingCounts, setSeenRatingCounts] = useState({});
  const [seenAttributeOptions, setSeenAttributeOptions] = useState({});
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const sentinelRef = useRef(null);
  const catalogCategoryList = useSelector((state) => state.catalog?.globalCategories || state.catalog?.list || []);
  const categoryTree = useMemo(() => buildCategoryTree(catalogCategoryList), [catalogCategoryList]);


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


  const products = useMemo(() => {
    const selectedCategory = searchParams.get("category");
    if (!selectedCategory) return items;
    
    const targetCats = parseMultiValue(selectedCategory).map((c) =>
      String(c).toLowerCase().replace(/[^a-z0-9]/g, "")
    );
    const validKeys = getMatchingCategoryKeys(targetCats, categoryTree);
    
    return items.filter((p) => {
      const cat = p.categoryId || p.category;
      if (!cat) return false;
      const catStr = String(
        typeof cat === "object"
          ? cat.slug || cat.key || cat.id || cat.name
          : cat,
      )
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
        
      if (validKeys.size > 0 && validKeys.has(catStr)) {
        return true;
      }
        
      return targetCats.some(
        (targetCat) =>
          catStr === targetCat ||
          catStr.includes(targetCat) ||
          targetCat.includes(catStr)
      );
    });
  }, [items, searchParams, categoryTree]);

  const totalPages = pageInfo.totalPages || 1;
  const currentPage = pageInfo.page || 1;
  const pageSize = Number(searchParams.get("limit") || 12);
  const availabilityCounts = useMemo(
    () =>
      productFacets?.availability &&
      typeof productFacets.availability === "object"
        ? {
            inStock: Number(
              productFacets.availability.inStock ||
                productFacets.availability.in_stock ||
                0,
            ),
            outOfStock: Number(
              productFacets.availability.outOfStock ||
                productFacets.availability.out_of_stock ||
                0,
            ),
          }
        : products.reduce(
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
    [productFacets, products],
  );
  const ratingCounts = useMemo(() => buildRatingCountMap(products), [products]);
  const facetCategoryOptions = useMemo(
    () =>
      getFacetList(productFacets, ["categories", "category"])
        .map(normalizeFacetOption)
        .filter(Boolean),
    [productFacets],
  );
  const facetBrandOptions = useMemo(
    () =>
      getFacetList(productFacets, ["brands", "brand"])
        .map(normalizeFacetOption)
        .filter(Boolean),
    [productFacets],
  );
  const facetRatingCounts = useMemo(() => {
    const ratings = getFacetList(productFacets, ["ratings", "rating"]);
    return ratings.reduce((counts, option) => {
      const value =
        option.value ?? option.rating ?? option.stars ?? option.key ?? "";
      if (value) counts[String(value)] = option.count ?? option.doc_count ?? 0;
      return counts;
    }, {});
  }, [productFacets]);
  const currentRatingCounts = Object.keys(facetRatingCounts).length
    ? facetRatingCounts
    : ratingCounts;
  const effectiveRatingCounts = useMemo(() => {
    return [1, 2, 3, 4, 5].reduce((counts, rating) => {
      const key = String(rating);
      counts[key] = Math.max(
        Number(currentRatingCounts[key] || 0),
        Number(seenRatingCounts[key] || 0),
        Number(ratingCounts[key] || 0),
      );
      return counts;
    }, {});
  }, [currentRatingCounts, ratingCounts, seenRatingCounts]);
  const categoryCounts = useMemo(() => {
    const counts = {};
    facetCategoryOptions.forEach((opt) => (counts[opt.value] = opt.count));
    return counts;
  }, [facetCategoryOptions]);

  const brandCountsObj = useMemo(() => {
    const counts = {};
    facetBrandOptions.forEach((opt) => (counts[opt.value] = opt.count));
    return counts;
  }, [facetBrandOptions]);

  const productBrandCounts = useMemo(() => {
    return products.reduce((counts, product) => {
      const brand = String(getProductBrandLabel(product) || "").trim();
      if (brand) counts[brand] = (counts[brand] || 0) + 1;
      return counts;
    }, {});
  }, [products]);

  const visibleAttributeOptionGroups = useMemo(() => {
    const groups = new Map();

    products.forEach((product) => {
      const productValues = new Map();

      collectProductAttributeEntries(product, (key, value) => {
        if (!productValues.has(key)) productValues.set(key, new Set());
        productValues.get(key).add(value);
      });

      productValues.forEach((values, key) => {
        if (!groups.has(key)) {
          groups.set(key, {
            key,
            title: toTitleCase(key),
            values: new Map(),
          });
        }

        const group = groups.get(key);
        values.forEach((value) => {
          group.values.set(value, (group.values.get(value) || 0) + 1);
        });
      });
    });

    const result = Array.from(groups.values()).map((group) => ({
      key: group.key,
      title: group.title,
      options: Array.from(group.values.entries())
        .map(([value, count]) => ({
          value,
          label: value,
          count,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    }));

    console.log("[Products filters] attribute sources", {
      products: products.map((product) => ({
        id: product?._id || product?.id,
        title: product?.title || product?.name,
        color: product?.color,
        brand: getProductBrandLabel(product),
        variantCount: getProductVariantList(product).length,
        variantColors: getProductVariantList(product)
          .map((variant) => variant?.attributes?.color || variant?.color)
          .filter(Boolean),
      })),
      filters: result,
    });

    return result;
  }, [products]);

  const currentContextKey = useMemo(() => {
    const p = new URLSearchParams(searchParams);
    p.delete("minPrice");
    p.delete("maxPrice");
    p.delete("page");
    return p.toString();
  }, [searchParams]);

  const [absolutePriceLimits, setAbsolutePriceLimits] = useState({ min: null, max: null, key: '' });

  useEffect(() => {
    let backendMin = productFacets?.price?.min;
    let backendMax = productFacets?.price?.max;
    
    let currentMin = backendMin;
    let currentMax = backendMax;

    if (currentMin == null || currentMax == null || currentMin >= currentMax) {
      if (products.length > 0) {
        const prices = products
          .map((p) => Number(getProductPrice(p) || 0))
          .filter((price) => price > 0);
          
        if (prices.length > 0) {
          currentMin = Math.min(...prices);
          currentMax = Math.max(...prices);
        }
      }
    }

    if (currentMin != null && currentMax != null) {
      setAbsolutePriceLimits(prev => {
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
  }, [productFacets?.price, products, currentContextKey]);

  const priceLimits = useMemo(() => {
    return {
      min: absolutePriceLimits.min ?? 0,
      max: absolutePriceLimits.max ?? 150000,
    };
  }, [absolutePriceLimits]);

  useEffect(() => {
    if (facetCategoryOptions.length > 0) {
      setSeenCategories((prev) => {
        const next = new Map(prev);
        facetCategoryOptions.forEach((c) => {
          if (!next.has(c.value)) next.set(c.value, c.label);
        });
        return next;
      });
      setSeenCategoryCounts((prev) => {
        const next = new Map(prev);
        facetCategoryOptions.forEach((c) => {
          const count = Number(c.count || 0);
          const previousCount = Number(next.get(c.value) || 0);
          if (count > previousCount) next.set(c.value, count);
        });
        return next;
      });
    }
  }, [facetCategoryOptions]);

  useEffect(() => {
    setSeenRatingCounts((prev) => {
      const next = { ...prev };
      let changed = false;
      [1, 2, 3, 4, 5].forEach((rating) => {
        const key = String(rating);
        const count = Number(currentRatingCounts[key] || 0);
        const previousCount = Number(next[key] || 0);
        if (count > previousCount) {
          next[key] = count;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [currentRatingCounts]);

  useEffect(() => {
    if (facetBrandOptions.length > 0) {
      setSeenBrands((prev) => {
        const next = new Map(prev);
        facetBrandOptions.forEach((c) => {
          if (!next.has(c.value)) next.set(c.value, c.label);
        });
        return next;
      });
      setSeenBrandCounts((prev) => {
        const next = new Map(prev);
        facetBrandOptions.forEach((c) => {
          const count = Number(c.count || 0);
          const previousCount = Number(next.get(c.value) || 0);
          if (count > previousCount) next.set(c.value, count);
        });
        return next;
      });
    }
  }, [facetBrandOptions]);

  useEffect(() => {
    if (!visibleAttributeOptionGroups.length) return;

    setSeenAttributeOptions((prev) => {
      const next = { ...prev };
      let changed = false;

      visibleAttributeOptionGroups.forEach((group) => {
        const existingGroup = next[group.key] || {
          title: group.title,
          options: {},
        };
        const nextOptions = { ...existingGroup.options };
        let groupChanged = false;

        group.options.forEach((option) => {
          const previousCount = Number(nextOptions[option.value]?.count || 0);
          if (!nextOptions[option.value] || option.count > previousCount) {
            nextOptions[option.value] = {
              label: option.label,
              count: option.count,
            };
            groupChanged = true;
          }
        });

        if (groupChanged || !next[group.key]) {
          next[group.key] = {
            title: existingGroup.title || group.title,
            options: nextOptions,
          };
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [visibleAttributeOptionGroups]);

  const categoryOptions = useMemo(() => {
    const selectedCategories = parseMultiValue(searchParams.get("category"));
    const optionMap = new Map(seenCategories);
    const catalogCategoryCounts = new Map();
    const catalogCategoryOptions = categoryList
      .map(normalizeFacetOption)
      .filter(Boolean);

    catalogCategoryOptions.forEach((category) => {
      if (!optionMap.has(category.value)) {
        optionMap.set(category.value, category.label);
      }
      const count = Number(category.count || 0);
      if (count > 0) catalogCategoryCounts.set(category.value, count);
    });

    selectedCategories.forEach((category) => {
      if (!optionMap.has(category)) optionMap.set(category, category);
    });

    return Array.from(optionMap.entries()).map(([value, label]) => ({
      value,
      label,
      count:
        categoryCounts[value] ||
        seenCategoryCounts.get(value) ||
        catalogCategoryCounts.get(value) ||
        0,
    }));
  }, [
    categoryCounts,
    categoryList,
    searchParams,
    seenCategories,
    seenCategoryCounts,
  ]);

  const brandOptions = useMemo(() => {
    const optionMap = new Map(seenBrands);
    const catalogBrandCounts = new Map();

    brandList.forEach((brand) => {
      if (!optionMap.has(brand.value)) optionMap.set(brand.value, brand.label);
      const count = Number(brand.count || 0);
      if (count > 0) catalogBrandCounts.set(brand.value, count);
    });
    Object.keys(productBrandCounts).forEach((brand) => {
      if (!optionMap.has(brand)) optionMap.set(brand, brand);
    });
    selectedBrands.forEach((brand) => {
      if (!optionMap.has(brand)) optionMap.set(brand, brand);
    });

    return Array.from(optionMap.entries()).map(([value, label]) => ({
      value,
      label,
      count:
        brandCountsObj[value] ||
        productBrandCounts[value] ||
        seenBrandCounts.get(value) ||
        catalogBrandCounts.get(value) ||
        0,
    }));
  }, [
    brandCountsObj,
    brandList,
    productBrandCounts,
    selectedBrands,
    seenBrands,
    seenBrandCounts,
  ]);

  const attributeFilterGroups = useMemo(() => {
    const groupMap = new Map();

    visibleAttributeOptionGroups.forEach((group) => {
      groupMap.set(group.key, {
        key: group.key,
        title: group.title,
        options: new Map(
          group.options.map((option) => [
            option.value,
            {
              value: option.value,
              label: option.label,
              count: option.count,
            },
          ]),
        ),
      });
    });

    Object.entries(seenAttributeOptions).forEach(([key, group]) => {
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          title: group.title || toTitleCase(key),
          options: new Map(),
        });
      }

      const targetGroup = groupMap.get(key);
      Object.entries(group.options || {}).forEach(([value, option]) => {
        const current = targetGroup.options.get(value);
        const count = Math.max(
          Number(current?.count || 0),
          Number(option?.count || 0),
        );
        targetGroup.options.set(value, {
          value,
          label: current?.label || option?.label || value,
          count,
        });
      });
    });

    Array.from(searchParams.entries()).forEach(([paramKey, paramValue]) => {
      if (!paramValue) return;
      const isAttributeParam =
        paramKey.startsWith(ATTRIBUTE_PARAM_PREFIX) ||
        STATIC_ATTRIBUTE_KEYS.includes(paramKey);
      if (!isAttributeParam) return;

      const key = normalizeAttributeKey(paramKey);
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          title: toTitleCase(key),
          options: new Map(),
        });
      }

      const targetGroup = groupMap.get(key);
      parseMultiValue(paramValue).forEach((value) => {
        if (!targetGroup.options.has(value)) {
          targetGroup.options.set(value, {
            value,
            label: value,
            count: 0,
          });
        }
      });
    });

    return Array.from(groupMap.values())
      .map((group) => ({
        key: group.key,
        title: group.title,
        options: Array.from(group.options.values()).sort((a, b) =>
          a.label.localeCompare(b.label),
        ),
      }))
      .filter((group) => group.options.length);
  }, [searchParams, seenAttributeOptions, visibleAttributeOptionGroups]);

  const getParams = useCallback(
    (pageOverride) => {
      const parseMultiParam = (val) => val || undefined;
      const params = {
        category: searchParams.get("category") || undefined,
        brand: parseMultiParam(searchParams.get("brand")),
        q: searchParams.get("q") || undefined,
        minPrice: searchParams.get("minPrice") || undefined,
        maxPrice: searchParams.get("maxPrice") || undefined,
        sort: searchParams.get("sort") || undefined,
        productFamilyCode:
          searchParams.get("productFamilyCode") ||
          searchParams.get("family") ||
          undefined,
        color: parseMultiParam(searchParams.get("color")),
        size: parseMultiParam(searchParams.get("size")),
        material: parseMultiParam(searchParams.get("material")),
        fit: parseMultiParam(searchParams.get("fit")),
        storage: parseMultiParam(searchParams.get("storage")),
        skinType: parseMultiParam(searchParams.get("skinType")),
        shade: parseMultiParam(searchParams.get("shade")),
        rating: parseMultiParam(searchParams.get("rating")),
        inStock: searchParams.get("inStock") === "true" ? "true" : undefined,
        outOfStock:
          searchParams.get("outOfStock") === "true" ? "true" : undefined,
        includeVariants: true,
        include_variants: true,
        includeAttributes: true,
        include_attributes: true,

        page: pageOverride || 1,
        limit: Number(searchParams.get("limit") || 12),
      };

      searchParams.forEach((value, key) => {
        if (!value) return;
        const isAttributeParam =
          key.startsWith(ATTRIBUTE_PARAM_PREFIX) ||
          STATIC_ATTRIBUTE_KEYS.includes(key);
        if (!isAttributeParam) return;

        const attributeKey = normalizeAttributeKey(key);
        params[attributeKey] = value;
        params[getAttributeParamKey(attributeKey)] = value;
      });

      return params;
    },
    [searchParams],
  );

  const loadProducts = useCallback(
    async ({ page = 1, append = false } = {}) => {
      const params = getParams(page);
      if (append) setIsLoadingMore(true);
      const result = await dispatch(fetchProducts(params)).unwrap();

      const data = result?.data || {};
      let list =
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
      setProductFacets(result?.meta?.facets || result?.meta?.filters || {});
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
      .catch(() => {});

    dispatch(fetchBrands({ limit: 100 }))
      .then((action) => {
        const data = action?.payload?.data;
        const list = Array.isArray(data)
          ? data
          : data?.items || data?.list || [];
        setBrandList(
          list
            .map((brand) => {
              const option = normalizeFacetOption(brand);
              if (option) return option;
              const label =
                brand?.name || brand?.title || brand?.brandName || brand?.code;
              return label ? { value: String(label), label: String(label) } : null;
            })
            .filter(Boolean),
        );
      })
      .catch(() => {});
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
        loadProducts({ page: currentPage + 1, append: true }).catch(() => {});
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

  const updateParams = (entries) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      entries.forEach(([key, value]) => {
        if (value == null || value === "") next.delete(key);
        else next.set(key, value);
      });
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
    /*
    searchParams.get("expressDelivery") === "true" && {
      key: "expressDelivery",
      label: "Express Delivery",
    },
    searchParams.get("freeDelivery") === "true" && {
      key: "freeDelivery",
      label: "Free Delivery",
    },
    */
    attributeFilterGroups.flatMap((group) =>
      parseMultiValue(getAttributeParamValue(searchParams, group.key)).map(
        (value) => ({
          key: `${getAttributeParamKey(group.key)}:${value}`,
          groupKey: getAttributeParamKey(group.key),
          value,
          label: `${group.title}: ${value}`,
        }),
      ),
    ),
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
    categoryOptions.length > 0 && {
      key: "category",
      title: "Category",
      content: (
        <OptionFilter
          name="category"
          options={categoryOptions}
          selected={parseMultiValue(searchParams.get("category"))}
          multiple
          onChange={(values) =>
            updateParam("category", serializeMultiValue(values))
          }
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
          minLimit={priceLimits.min}
          maxLimit={priceLimits.max}
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
          counts={effectiveRatingCounts}
          onChange={(values) =>
            updateParam("rating", serializeMultiValue(values))
          }
        />
      ),
    },
    ...attributeFilterGroups.map((group) => ({
      key: `attribute:${group.key}`,
      title: group.title,
      content: (
        <OptionFilter
          name={getAttributeParamKey(group.key)}
          options={group.options}
          selected={parseMultiValue(
            getAttributeParamValue(searchParams, group.key),
          )}
          multiple
          onChange={(values) =>
            updateParam(getAttributeParamKey(group.key), serializeMultiValue(values))
          }
        />
      ),
    })),
    /*
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

  return (
    <>
      <Seo
        title={`${pageTitle} | Sam Global`}
        description="Browse products with filters, sort, and pagination."
      />

      <div className="my-3 md:my-6 ">
        <div className="flex flex-wrap items-end justify-end gap-3">
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
          error={products.length === 0 ? productState.error : null}
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
