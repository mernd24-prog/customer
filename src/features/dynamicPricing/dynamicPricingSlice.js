import { createApiSlice } from "../createApiSlice";
import { simpleThunks } from "../domainThunks";
export const { fetchDynamicPrice, adjustDynamicPrice } = simpleThunks.dynamicPricing;
export default createApiSlice({ name: "dynamicPricing", thunks: simpleThunks.dynamicPricing }).reducer;
