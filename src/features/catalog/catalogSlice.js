import { createApiSlice } from "../createApiSlice";
import { catalogThunks, productThunks } from "../domainThunks";

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
    .filter((brand) => Number(brand.count || 0) > 0)
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
    (key) => !["page", "limit", "sort", "sortBy", "sortDir"].includes(key),
  );
  return contextKeys.length === 0;
};

const syncDiscoveryCategories = (state, action) => {
  if (!isGlobalDiscoveryRequest(action)) return;
  const categories = productFacetCategories(action);
  const brands = productFacetBrands(action);
  state.globalCategories = categories;
  state.globalBrands = brands;
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
  reducers: {
    setGlobalCategories: (state, action) => {
      state.globalCategories = action.payload;
    },
    setGlobalBrands: (state, action) => {
      state.globalBrands = action.payload;
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
