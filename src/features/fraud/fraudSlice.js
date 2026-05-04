import { createApiSlice } from "../createApiSlice";
import { fraudThunks } from "../domainThunks";
export const { reviewFraud } = fraudThunks;
export default createApiSlice({ name: "fraud", thunks: fraudThunks }).reducer;
