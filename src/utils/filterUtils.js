export function parseMultiValue(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializeMultiValue(values) {
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

export const unwrapProducts = (response = {}) => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  return data?.items || data?.products || data?.list || [];
};

export const getPagination = (response = {}, fallback = {}) =>
  response?.meta?.pagination ||
  response?.pagination ||
  response?.meta ||
  fallback;

export const getResponseFacets = (response = {}) => {
  const data = response?.data ?? response;
  return (
    data?.filters ||
    data?.facets ||
    data?.aggregations ||
    response?.filters ||
    response?.facets ||
    response?.meta?.filters ||
    response?.meta?.facets ||
    {}
  );
};

export const getFacetList = (facets = {}, keys = []) => {
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

export const normalizeFacetOption = (option = {}) => {
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
      ...option,
      value: String(value),
      label: String(label),
      count: option.count ?? option.doc_count ?? option.total,
    }
    : null;
};

export function flattenCategoryList(data) {
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

export function computeActiveFiltersCount(activeFilters, searchParams, ignoreKeys = ["category", "categoryId", "q"]) {
  if (!activeFilters || !Array.isArray(activeFilters)) return 0;

  return activeFilters.reduce((sum, filter) => {
    if (!filter) return sum;
    if (ignoreKeys.includes(filter.key) || (filter.type && ignoreKeys.includes(filter.type))) return sum;

    if (filter.groupKey && searchParams) {
      const val = searchParams.get(filter.groupKey);
      if (val) return sum + val.split(",").length;
    }
    return sum + 1;
  }, 0);
}

export function getClearFiltersAction(activeFilters, searchParams, handleClearFilters, ignoreKeys = ["category", "categoryId", "q"]) {
  const count = computeActiveFiltersCount(activeFilters, searchParams, ignoreKeys);
  return count > 0 ? handleClearFilters : undefined;
}

export function getNormalizedAttributeFacets(attributes = [], filterColorOnly = false) {
  return (attributes || [])
    .filter((attribute) => {
      if (filterColorOnly) {
        return attribute.key?.toLowerCase() === "color";
      }
      return true;
    })
    .map((attribute) => ({
      key: String(attribute.key || ""),
      label: attribute.label || attribute.key,
      searchable: attribute.searchable === true,
      values: (attribute.values || []).filter(
        (option) => option.value && Number(option.count || 0) > 0
      ),
    }))
    .filter((attribute) => attribute.key && attribute.values.length > 0);
}

export function formatCategoryOptionsForTree(options = [], catalogCategoryList = []) {
  if (!options?.length) return [];

  const keyOf = (category = {}) =>
    String(
      category.categoryKey ||
        category.key ||
        category.slug ||
        category.value ||
        "",
    )
      .toLowerCase()
      .trim();
  const labelOf = (category = {}, fallback = "") =>
    String(category.title || category.name || category.label || fallback || "").trim();

  // Facets themselves contain parentKey/level. Merge them with the catalog so
  // hierarchy is available even when the catalog request finishes later.
  const nodeMap = new Map();
  [...flattenCategoryList(catalogCategoryList), ...options].forEach((category) => {
    const key = keyOf(category);
    if (!key) return;
    nodeMap.set(key, { ...(nodeMap.get(key) || {}), ...category });
  });

  const ancestryOf = (key) => {
    const ancestors = [];
    const visited = new Set([key]);
    let node = nodeMap.get(key);
    let parent = node?.parentKey || node?.parent_key;
    while (parent && ancestors.length < 12) {
      const parentKey = String(parent).toLowerCase().trim();
      if (!parentKey || visited.has(parentKey)) break;
      ancestors.unshift(parentKey);
      visited.add(parentKey);
      node = nodeMap.get(parentKey);
      parent = node?.parentKey || node?.parent_key;
    }
    return ancestors;
  };

  const normalized = options
    .map((option) => {
      const key = keyOf(option);
      if (!key) return null;
      return {
        ...option,
        value: String(option.value || key),
        label: labelOf(nodeMap.get(key), option.label || key),
        _key: key,
        _ancestors: ancestryOf(key),
      };
    })
    .filter(Boolean);

  const groups = new Map();
  const roots = [];
  normalized.forEach((option) => {
    const rootKey = option._ancestors[0];
    if (!rootKey) roots.push(option);
    else {
      if (!groups.has(rootKey)) groups.set(rootKey, []);
      groups.get(rootKey).push(option);
    }
  });

  const groupedRootKeys = new Set(groups.keys());
  const result = roots
    .filter((option) => !groupedRootKeys.has(option._key))
    .map(({ _key, _ancestors, ...option }) => option);

  groups.forEach((descendants, rootKey) => {
    const rootOption = normalized.find((option) => option._key === rootKey);
    const children = descendants.map((option) => {
      const intermediateLabels = option._ancestors
        .slice(1)
        .map((key) => labelOf(nodeMap.get(key)))
        .filter(Boolean);
      const { _key, _ancestors, ...cleanOption } = option;
      return {
        ...cleanOption,
        label: [...intermediateLabels, cleanOption.label].join(" › "),
      };
    });

    if (rootOption) {
      const { _key, _ancestors, ...cleanRoot } = rootOption;
      children.unshift({ ...cleanRoot, label: `All ${cleanRoot.label}` });
    }

    result.push({
      isGroup: true,
      value: `__group_${rootKey}`,
      label: labelOf(nodeMap.get(rootKey), rootOption?.label || rootKey),
      options: children.sort((left, right) => left.label.localeCompare(right.label)),
    });
  });

  return result.sort((left, right) => left.label.localeCompare(right.label));
}
