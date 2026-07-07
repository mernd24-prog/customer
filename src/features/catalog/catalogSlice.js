import { createApiSlice } from "../createApiSlice";
import { catalogThunks } from "../domainThunks";
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
  },
});

export const { setGlobalCategories } = catalogSlice.actions;
export default catalogSlice.reducer;
