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
  if (!catalogCategoryList?.length || !options?.length) return options;

  const getKey = (c) => String(c.categoryKey || c.key || c.slug || "").toLowerCase().trim();
  const getLabel = (c) => c.title || c.name || c.label || "";

  const catMap = new Map();
  flattenCategoryList(catalogCategoryList).forEach(c => {
    const k = getKey(c);
    if (k) catMap.set(k, c);
  });

  // Find catalog parent via parentKey field OR hyphen-prefix scan in catMap
  function catalogParent(key) {
    const cat = catMap.get(key);
    if (cat?.parentKey) return String(cat.parentKey).toLowerCase().trim();
    const parts = key.split("-");
    // Try longest matching prefix in catMap
    for (let i = parts.length - 1; i > 0; i--) {
      const prefix = parts.slice(0, i).join("-");
      if (catMap.has(prefix)) return prefix;
    }
    // Always fall back to first segment as synthetic parent group
    if (parts.length > 1) return parts[0];
    return null;
  }

  // fallback: use provided string, then humanize last segment of key
  function labelFor(key, fallback) {
    const cat = catMap.get(key);
    if (cat && getLabel(cat)) return getLabel(cat);
    if (fallback) return fallback;
    // Humanize only the last segment so "electronics-mobiles" → "Mobiles"
    const parts = key.split("-");
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  }

  // Pre-compute ancestor chain for each option key (bounded, no recursion)
  // ancestors[0] = root, ancestors[last] = direct parent
  const ancestorMap = new Map();
  options.forEach(opt => {
    const key = String(opt.value).toLowerCase().trim();
    const chain = [];
    let cur = key;
    const visited = new Set([cur]);
    for (let d = 0; d < 8; d++) {
      const p = catalogParent(cur);
      if (!p || visited.has(p)) break;  // removed catMap.has(p) — allows synthetic roots
      chain.unshift(p);
      visited.add(p);
      cur = p;
    }
    ancestorMap.set(key, chain);
  });

  // Single-level grouping:
  // - Top-level accordion for each root ancestor
  // - Inside each accordion: ALL descendants as flat checkboxes
  //   with intermediate parent name prefixed ("Mobiles iPhones", "Camera DSLR Cameras")
  function buildTree(opts) {
    // 1. Which keys will become root accordion headers?
    //    Only keys that are anc[0] (root ancestor) of SOME OTHER option
    const rootGroupKeys = new Set();
    opts.forEach(opt => {
      const anc = ancestorMap.get(String(opt.value).toLowerCase().trim()) || [];
      if (anc.length > 0) rootGroupKeys.add(anc[0]);
    });

    const rootLeaves = [];  // items with no parent AND not a group container → flat checkbox
    const rootGroups = new Map(); // rootKey → all opts belonging to this root

    opts.forEach(opt => {
      const key = String(opt.value).toLowerCase().trim();
      const anc = ancestorMap.get(key) || [];
      if (anc.length > 0) {
        // Has a root ancestor → belongs in that group
        const rk = anc[0];
        if (!rootGroups.has(rk)) rootGroups.set(rk, []);
        rootGroups.get(rk).push(opt);
      } else if (rootGroupKeys.has(key)) {
        // This item IS itself a group header (other items reference it as root)
        // It will be created as the accordion — skip adding it as a leaf
        if (!rootGroups.has(key)) rootGroups.set(key, []);
        // Push itself into its own group so it appears as a child checkbox
        rootGroups.get(key).push(opt);
      } else {
        // No parent, not a container → flat leaf checkbox
        rootLeaves.push({ ...opt, label: labelFor(key, opt.label) });
      }
    });

    const result = [...rootLeaves];

    rootGroups.forEach((groupOpts, rk) => {
      // Inside this root group, find which keys are intermediate containers
      // (they appear as ancestors[1+] of other options in this group)
      const containerKeys = new Set();
      groupOpts.forEach(opt => {
        const anc = ancestorMap.get(String(opt.value).toLowerCase().trim()) || [];
        anc.slice(1).forEach(ak => containerKeys.add(ak)); // skip [0] which is rk
      });

      // Flatten: skip container keys, prefix leaf labels with intermediate parent names
      const sortedChildren = groupOpts
        .filter(opt => !containerKeys.has(String(opt.value).toLowerCase().trim()))
        .map(opt => {
          const key = String(opt.value).toLowerCase().trim();
          const anc = ancestorMap.get(key) || [];
          const intermediates = anc.slice(1); // skip root (anc[0] = rk)
          const prefix = intermediates.map(ak => labelFor(ak)).filter(Boolean).join(" ");
          const myLabel = labelFor(key, opt.label);
          return { ...opt, label: prefix ? `${prefix} ${myLabel}` : myLabel };
        })
        .sort((a, b) => a.label.localeCompare(b.label));

      const srcOpt = opts.find(o => String(o.value).toLowerCase().trim() === rk);
      result.push({
        isGroup: true,
        label: labelFor(rk, srcOpt?.label),
        value: `__group_${rk}`,
        options: sortedChildren,
      });
    });

    return result.sort((a, b) => a.label.localeCompare(b.label));
  }

  const tree = buildTree(options);
  const hasGroups = tree.some(n => n.isGroup);
  return hasGroups ? tree : options;
}

