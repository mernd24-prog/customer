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
export default createApiSlice({ name: "catalog", thunks: catalogThunks }).reducer;
