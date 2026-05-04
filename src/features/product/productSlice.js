import { createApiSlice } from "../createApiSlice";
import { productThunks } from "../domainThunks";
export const { fetchProducts, searchProducts, fetchSellerProducts, fetchProductById, createProduct, updateProduct, deleteProduct } = productThunks;
export default createApiSlice({ name: "product", thunks: productThunks }).reducer;
