import { createApiSlice } from "../createApiSlice";
import { taxThunks } from "../domainThunks";
export const { createInvoice, fetchOrderInvoice, fetchTaxReports, fetchMarketplaceInvoices } = taxThunks;
export default createApiSlice({ name: "tax", thunks: taxThunks }).reducer;
