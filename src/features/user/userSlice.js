import { createApiSlice, defaultInitialState } from "../createApiSlice";
import { userThunks } from "../domainThunks";
export const { fetchMe, updateMe, uploadProfileImage, addAddress, updateAddress, deleteAddress, submitUserKyc, uploadKycDocuments } = userThunks;
const addressMutationReducers = {
  skipDefault: true,
  pending: (state) => {
    state.loading = true;
    state.error = null;
  },
  fulfilled: (state, action) => {
    state.loading = false;
    if (state.current && Array.isArray(action.payload?.data)) {
      state.current.addresses = action.payload.data;
    }
  },
  rejected: (state, action) => {
    state.loading = false;
    state.error = action.payload || action.error?.message;
  },
};
export default createApiSlice({
  name: "user",
  thunks: userThunks,
  thunkReducers: {
    addAddress: addressMutationReducers,
    updateAddress: addressMutationReducers,
    deleteAddress: addressMutationReducers,
  },
  extraReducers: (builder) => {
    builder.addCase("auth/logout", () => defaultInitialState);
  },
}).reducer;
