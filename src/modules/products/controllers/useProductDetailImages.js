import { getProductImage, getImageFallbackSrc, getProductTitle, getImageUrlFromValue } from "../../../utils/ecommerce";

export function useProductDetailImages({ product, selectedVariant }) {
  const fallbackProductImage =
    getProductImage(product) ||
    getImageFallbackSrc(getProductTitle(product), product?.category);

  const variantImages = Array.isArray(selectedVariant?.images)
    ? selectedVariant.images
    : [];
  const commonImages = Array.isArray(product?.commonImages)
    ? product.commonImages
    : Array.isArray(product?.catalogImages)
      ? product.catalogImages
      : [];
  const productImages = Array.isArray(product?.images)
    ? product.images
    : product?.imageUrl
      ? [product.imageUrl]
      : [];

  const rawMergedImages = (
    variantImages.length > 0
      ? [...variantImages, ...commonImages]
      : [...productImages, ...commonImages]
  ).filter(Boolean);

  const images = Array.from(
    new Set(
      rawMergedImages.map((img) => getImageUrlFromValue(img)).filter(Boolean),
    ),
  );
  if (!images.length && fallbackProductImage) {
    images.push(getImageUrlFromValue(fallbackProductImage));
  }
  const productVideo = Array.isArray(product?.videos)
    ? product.videos.find(Boolean)
    : product?.video || "";

  return {
    fallbackProductImage,
    variantImages,
    commonImages,
    productImages,
    rawMergedImages,
    images,
    productVideo
  };
}
