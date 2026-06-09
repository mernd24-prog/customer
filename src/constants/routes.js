export const routeParam = (value = "") => {
  const text = String(value || "").trim();
  if (!text || text.startsWith(":")) return text;

  try {
    return encodeURIComponent(decodeURIComponent(text));
  } catch {
    return encodeURIComponent(text);
  }
};

export const CUSTOMER_ROUTES = {
  home: "/",
  products: "/products",
  product: (productId = ":productId") => `/products/${routeParam(productId)}`,
  category: (categoryKey = ":categoryKey") => `/categories/${routeParam(categoryKey)}`,
  brand: (brandSlug = ":brandSlug") => `/brands/${routeParam(brandSlug)}`,
  wishlist: "/watchlist",
  cart: "/cart",
  checkout: "/checkout",
  search: "/search",
};

export default CUSTOMER_ROUTES;
