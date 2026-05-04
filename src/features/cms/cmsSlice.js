import { createApiSlice } from "../createApiSlice";
import { cmsThunks } from "../domainThunks";
export const { fetchCmsPages, fetchCmsPageBySlug } = cmsThunks;
export default createApiSlice({ name: "cms", thunks: cmsThunks }).reducer;
