import { createApiSlice } from "../createApiSlice";
import { taxThunks } from "../domainThunks";
export const { createInvoice, fetchTaxReports } = taxThunks;
export default createApiSlice({ name: "tax", thunks: taxThunks }).reducer;
