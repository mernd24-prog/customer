import { createApiSlice } from "../createApiSlice";
import { globalThunks } from "../domainThunks";

export const {
  fetchCountries,
  fetchStates,
  fetchCities,
  fetchZipCodes,
} = globalThunks;

export default createApiSlice({
  name: "global",
  thunks: globalThunks,
}).reducer;
