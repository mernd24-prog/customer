export const CUSTOMER_ROUTES = {
  home: "/",
  products: "/products",
  product: (productId = ":productId") => `/products/${productId}`,
  category: (categoryKey = ":categoryKey") => `/categories/${categoryKey}`,
  brand: (brandSlug = ":brandSlug") => `/brands/${brandSlug}`,
  wishlist: "/watchlist",
  cart: "/cart",
  checkout: "/checkout",
  search: "/search",
};

export default CUSTOMER_ROUTES;
