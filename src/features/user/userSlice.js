import { createApiSlice } from "../createApiSlice";
import { userThunks } from "../domainThunks";
export const { fetchMe, updateMe, addAddress, updateAddress, deleteAddress, submitUserKyc, uploadKycDocuments } = userThunks;
export default createApiSlice({ name: "user", thunks: userThunks }).reducer;
