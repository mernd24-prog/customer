import { createApiSlice } from "../createApiSlice";
import { returnsThunks } from "../domainThunks";
export const { requestReturn, fetchMyReturns, fetchReturnByOrder } = returnsThunks;
export default createApiSlice({ name: "returns", thunks: returnsThunks }).reducer;
