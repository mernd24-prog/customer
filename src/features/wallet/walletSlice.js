import { createApiSlice } from "../createApiSlice";
import { simpleThunks } from "../domainThunks";
export const { fetchWallet } = simpleThunks.wallet;
export default createApiSlice({ name: "wallet", thunks: simpleThunks.wallet }).reducer;
