import { createApiSlice } from "../createApiSlice";
import { catalogThunks, productThunks } from "../domainThunks";
import {
  getBrandProductCount,
  isReferenceId,
  listFromPayload,
} from "../../utils/pages/brandUtils";
import {
  filterCategoryTreeWithProducts,
  getCategoryListFromResponse,
} from "../../utils/pages/categoryUtils";

const productFacetCategories = (action = {}) => {
  const facets =
    action.payload?.meta?.facets ||
    action.payload?.data?.facets ||
    action.payload?.meta?.filters ||
    {};
  return (facets.categories || facets.category || [])
    .filter((category) => Number(category.count || 0) > 0)
    .map((category) => ({
      ...category,
      categoryKey: category.categoryKey || category.key || category.value,
      title: category.title || category.label,
      active: true,
    }));
};

const productFacetBrands = (action = {}) => {
  const facets =
    action.payload?.meta?.facets ||
    action.payload?.data?.facets ||
    action.payload?.meta?.filters ||
    {};
  return (facets.brands || facets.brand || [])
    .filter(
      (brand) =>
        Number(brand.count || 0) > 0 &&
        !isReferenceId(brand.name || brand.label || brand.value),
    )
    .map((brand) => ({
      ...brand,
      name: brand.name || brand.label || brand.value,
    }));
};

const isGlobalDiscoveryRequest = (action = {}) => {
  const request =
    action.payload?.arg?.params ||
    action.payload?.arg ||
    action.meta?.arg?.params ||
    action.meta?.arg ||
    {};
  const contextKeys = Object.keys(request).filter(
    (key) => !["page", "limit", "sort", "sortBy", "sortDir", "view"].includes(key),
  );
  return contextKeys.length === 0;
};

const syncDiscoveryCategories = (state, action) => {
  if (!isGlobalDiscoveryRequest(action)) return;

  const categories = productFacetCategories(action);
  const brands = productFacetBrands(action);

  if (categories.length) {
    if (state.globalCategories?.length) {
      const countsByKey = new Map(
        categories.map((category) => [
          String(category.categoryKey),
          Number(category.count || 0),
        ]),
      );
      const mergeCounts = (items = []) =>
        items.map((category) => {
          const categoryKey =
            category.categoryKey || category.key || category.value;
          const count = countsByKey.get(String(categoryKey));
          return {
            ...category,
            ...(count === undefined ? {} : { productCount: count, count }),
            ...(Array.isArray(category.children)
              ? { children: mergeCounts(category.children) }
              : {}),
          };
        });
      state.globalCategories = mergeCounts(state.globalCategories);
    } else {
      state.globalCategories = categories;
    }
  }

  // A product response does not always include every facet. Keep the last
  // known navigation brands when the facet is omitted instead of briefly
  // clearing the footer while changing routes.
  if (brands.length) {
    state.globalBrands = brands;
  }
  state.discoveryNavigationLoading = false;
  state.discoveryNavigationLoaded = true;
};
export const {
  fetchCategories,
  fetchCategoryByKey,
  fetchCategoryAttributes,
  fetchFamilies,
  fetchFamilyByCode,
  fetchVariants,
  fetchVariantById,
  fetchHsnCodes,
  fetchGeographies,
  fetchBrands,
  fetchBrandById,
} = catalogThunks;
const catalogSlice = createApiSlice({
  name: "catalog",
  thunks: catalogThunks,
  initialState: {
    globalCategories: [],
    globalBrands: [],
    categoryList: [],
    brandList: [],
    categoriesLoading: false,
    categoriesError: null,
    brandsLoading: false,
    brandsError: null,
  },
  thunkReducers: {
    fetchCategories: {
      skipDefault: true,
      pending: (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      },
      fulfilled: (state, action) => {
        state.categoriesLoading = false;
        state.categoryList = filterCategoryTreeWithProducts(
          getCategoryListFromResponse(action.payload?.data),
        );
      },
      rejected: (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError =
          action.payload || action.error?.message || "Failed to load categories";
      },
    },
    fetchBrands: {
      skipDefault: true,
      pending: (state) => {
        state.brandsLoading = true;
        state.brandsError = null;
      },
      fulfilled: (state, action) => {
        state.brandsLoading = false;
        state.brandList = listFromPayload(action.payload?.data).filter(
          (brand) => Number(getBrandProductCount(brand)) > 0,
        );
      },
      rejected: (state, action) => {
        state.brandsLoading = false;
        state.brandsError =
          action.payload || action.error?.message || "Failed to load brands";
      },
    },
  },
  reducers: {
    setGlobalCategories: (state, action) => {
      state.globalCategories = filterCategoryTreeWithProducts(action.payload);
    },
    setGlobalBrands: (state, action) => {
      state.globalBrands = (Array.isArray(action.payload) ? action.payload : []).filter(
        (brand) => Number(getBrandProductCount(brand)) > 0,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(productThunks.fetchProducts.pending, (state, action) => {
        if (!isGlobalDiscoveryRequest(action)) return;
        state.discoveryNavigationLoading = true;
      })
      .addCase(productThunks.fetchProducts.fulfilled, syncDiscoveryCategories)
      .addCase(productThunks.fetchProducts.rejected, (state, action) => {
        if (!isGlobalDiscoveryRequest(action)) return;
        state.discoveryNavigationLoading = false;
        state.discoveryNavigationLoaded = true;
      });
  },
});

export const { setGlobalCategories, setGlobalBrands } = catalogSlice.actions;
export default catalogSlice.reducer;
