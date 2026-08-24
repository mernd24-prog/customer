import { createApiSlice } from "../../../features/createApiSlice";
import { productThunks } from "../../../features/domainThunks";
export const {
  fetchProducts,
  fetchSellerProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = productThunks;
export default createApiSlice({
  name: "product",
  thunks: productThunks,
  setCurrentFromList: false,
}).reducer;
  