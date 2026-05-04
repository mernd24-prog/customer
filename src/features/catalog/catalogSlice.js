import { createApiSlice } from "../createApiSlice";
import { catalogThunks } from "../domainThunks";
export const { fetchCategories, fetchCategoryByKey, fetchFamilies, fetchFamilyByCode, fetchVariants, fetchVariantById, fetchHsnCodes, fetchGeographies } = catalogThunks;
export default createApiSlice({ name: "catalog", thunks: catalogThunks }).reducer;
