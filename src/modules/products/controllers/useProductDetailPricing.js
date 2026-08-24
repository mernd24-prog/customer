import { getVariantPrice, getProductPrice, getProductMrp, firstMoneyValue, isProductCodAvailable } from "../../../utils/ecommerce";
import { getActiveDealPrice, getActiveDealOriginalPrice } from "../../../utils/pages/productUtils";

export function useProductDetailPricing({ product, selectedVariant, dynamicState, productId }) {
  const selectedVariantPrice = getVariantPrice(selectedVariant);
  const productPrice = getProductPrice(product);
  const activeDealPrice = getActiveDealPrice(product);
  const activeDealOriginalPrice = getActiveDealOriginalPrice(product);
  const activeDealBadge =
    product?.deal?.badge ||
    product?.metadata?.dealBadge ||
    (activeDealPrice ? "Deal" : "");

  const dynamicPrice =
    String(dynamicState.current?.productId || "") === String(productId || "")
      ? firstMoneyValue(dynamicState.current?.price)
      : undefined;

  const baseDisplayPrice = firstMoneyValue(
    activeDealPrice,
    selectedVariantPrice,
    productPrice,
  );

  const safeDynamicPrice =
    dynamicPrice &&
    baseDisplayPrice &&
    dynamicPrice >= baseDisplayPrice * 0.5 &&
    dynamicPrice <= baseDisplayPrice * 2
      ? dynamicPrice
      : undefined;

  const price = firstMoneyValue(
    activeDealPrice,
    activeDealPrice ? undefined : safeDynamicPrice,
    activeDealPrice ? undefined : selectedVariantPrice,
    productPrice,
  );

  const mrp = firstMoneyValue(
    activeDealPrice ? activeDealOriginalPrice : undefined,
    activeDealPrice ? undefined : getProductMrp(selectedVariant),
    getProductMrp(product),
  );

  const discount =
    mrp && price && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const currency = selectedVariant?.currency || product?.currency || "INR";
  const shipping = product?.shipping || {};
  const shippingEtaMin = shipping.estimatedDaysMin ?? shipping.processingDays;
  const shippingEtaMax = shipping.estimatedDaysMax ?? shipping.processingDays;
  const shippingEtaText = [shippingEtaMin, shippingEtaMax]
    .filter((v) => v !== null && v !== undefined)
    .join("-");
  const staticIsFree = Boolean(shipping.freeShipping);
  const staticCharge = Number(shipping.shippingCharge ?? shipping.additionalCost ?? 0);
  const productCodAvailable = isProductCodAvailable(product);
  const productCodDisabled =
    !productCodAvailable &&
    (shipping.codAvailable === false ||
      product?.metadata?.codAvailable === false ||
      product?.codAvailable === false);

  return {
    selectedVariantPrice,
    productPrice,
    activeDealPrice,
    activeDealOriginalPrice,
    activeDealBadge,
    dynamicPrice,
    baseDisplayPrice,
    safeDynamicPrice,
    price,
    mrp,
    discount,
    currency,
    shipping,
    shippingEtaMin,
    shippingEtaMax,
    shippingEtaText,
    staticIsFree,
    staticCharge,
    productCodAvailable,
    productCodDisabled,
  };
}
