import {
  getProductImage as getVariantProductImage,
  getProductMrp,
  getProductPublicPath,
  getProductPrice,
} from "./ecommerce";

export const formatPrice = (product) => {
  const price = Number(getProductPrice(product) || 0);
  return `₹${price.toLocaleString("en-IN")}`;
};

export const getProductLink = (product) => {
  return getProductPublicPath(product);
};

export const getProductImage = (product) => {
  return getVariantProductImage(product) || product?.image || product?.thumbnail || "";
};

export const toStandardProductCard = (product) => ({
  id: String(product?._id || product?.id || ""),
  title: product?.title || "",
  image: getProductImage(product),
  price: formatPrice(product),
  oldPrice:
    getProductMrp(product) || getProductPrice(product)
      ? `₹${Number(getProductMrp(product) || getProductPrice(product) || 0).toLocaleString("en-IN")}`
      : undefined,
  rating: Number(product?.rating || 0).toFixed(1),
  reviewsCount: product?.reviewCount || 0,
  link: getProductLink(product),
});
