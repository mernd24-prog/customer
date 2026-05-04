import { createApiSlice } from "../createApiSlice";
import { simpleThunks } from "../domainThunks";
export const { fetchHealth, fetchMetaRoutes } = simpleThunks.meta;
export default createApiSlice({ name: "meta", thunks: simpleThunks.meta }).reducer;
