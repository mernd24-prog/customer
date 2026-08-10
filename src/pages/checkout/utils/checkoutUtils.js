import { z } from "zod";
import {
  getImageFallbackSrc,
  getProductId,
  getProductImage,
  getProductTitle,
  getProductPrice,
  getVariantPrice,
} from "../../../utils/ecommerce";
import { normalizeId } from "../../../utils/ecommerce/cart";
import { normalizeDialCode } from "../../../lib/utils";
import {
  checkoutAddressSchema,
  couponCodeField,
  optionalMoneyField,
  validatePostalCodeForCountry,
} from "../../../validations";
import { verifyPayment } from "../../../features/payment/paymentSlice";

export const getAddressId = (addr) => addr?._id || addr?.id || "";

export const RAZORPAY_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
export let razorpayScriptPromise;

export const loadRazorpayCheckout = () => {
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_CHECKOUT_SCRIPT}"]`,
    );

    const handleLoad = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error("Razorpay checkout could not be loaded."));
      }
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Razorpay checkout could not be loaded.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = handleLoad;
    script.onerror = () =>
      reject(new Error("Razorpay checkout could not be loaded."));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

export async function fetchFullList(dispatch, thunkAction, params = {}) {
  const res = await dispatch(thunkAction({ params })).unwrap();
  const total = res.meta?.total || 20;
  const limit = res.meta?.limit || 20;
  if (total > limit) {
    const allRes = await dispatch(
      thunkAction({ params: { ...params, limit: total } }),
    ).unwrap();
    return extractList(allRes);
  }
  return extractList(res);
}

export function extractList(response = {}) {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  return (
    data?.items ||
    data?.states ||
    data?.countries ||
    data?.cities ||
    data?.pincodes ||
    data?.results ||
    data?.list ||
    []
  );
}

export const checkoutFormSchema = z
  .object({
    useNewAddress: z.preprocess(
      (value) => value === true || value === "true",
      z.boolean(),
    ),
    selectedAddressId: z.string().optional(),
    label: z.enum(["home", "work", "other"]).optional(),
    fullName: z.string().optional(),
    dialCode: z.string().optional(),
    phone: z.string().optional(),
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    isDefault: z.coerce.boolean().optional(),
    couponCode: couponCodeField,
    walletAmount: optionalMoneyField("Wallet amount"),
  })
  .superRefine((data, ctx) => {
    if (data.useNewAddress) {
      const addressResult = checkoutAddressSchema.safeParse(data);
      if (!addressResult.success) {
        addressResult.error.issues.forEach((issue) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: issue.path,
            message: issue.message,
          });
        });
      }
    } else {
      if (!data.selectedAddressId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["selectedAddressId"],
          message: "Select a delivery address",
        });
      }
    }
  });

export const hasAmountValue = (value) =>
  value !== undefined && value !== null && value !== "";

export const asOptionalNumber = (value) => {
  if (!hasAmountValue(value)) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export const asNumber = (value) => asOptionalNumber(value) ?? 0;

export const ORDER_AMOUNT_KEYS = {
  subtotal: ["subtotalAmount", "subtotal_amount", "subtotal", "subTotal"],
  shipping: [
    "shippingFeeAmount",
    "shipping_fee_amount",
    "deliveryChargeAmount",
    "delivery_charge_amount",
    "shippingAmount",
    "shipping_amount",
    "shipping",
  ],
  total: [
    "totalAmount",
    "total_amount",
    "customerTotalAmount",
    "customer_total_amount",
    "orderTotal",
    "grandTotal",
    "total",
  ],
  payable: [
    "payableAmount",
    "payable_amount",
    "customerPayableAmount",
    "customer_payable_amount",
    "amountPayable",
    "amount_payable",
    "payable",
  ],
  discount: ["discountAmount", "discount_amount", "discount"],
  walletAmount: [
    "walletAmount",
    "wallet_amount",
    "walletAppliedAmount",
    "wallet_applied_amount",
    "walletDiscountAmount",
    "wallet_discount_amount",
  ],
  platformFee: ["platformFeeAmount", "platform_fee_amount"],
};

export const getAmountFromSource = (source, keys) => {
  if (!source || typeof source !== "object") return undefined;
  for (const key of keys) {
    if (hasAmountValue(source[key])) return source[key];
  }
  return undefined;
};

export const getOrderAmount = (order = {}, key) => {
  const keys = ORDER_AMOUNT_KEYS[key] || [key];
  const sources = [
    order?.amounts,
    order?.summary,
    order?.totals,
    order?.pricing,
    order,
  ];

  for (const source of sources) {
    const amount = getAmountFromSource(source, keys);
    if (amount !== undefined) return amount;
  }

  return undefined;
};
export const getCartItemPrice = (item = {}, fullProduct = null) => {
  const fallbackProduct =
    item.productId && typeof item.productId === "object"
      ? item.productId
      : item.product || {};

  let livePrice = getProductPrice(fullProduct);

  const variantId = item.variantId || item.variantSku;
  if (variantId && fullProduct?.variants?.length) {
    const variant = fullProduct.variants.find(
      (v) => v._id === variantId || v.id === variantId || v.sku === variantId,
    );
    if (variant) {
      livePrice = getVariantPrice(variant) ?? livePrice;
    }
  }

  return asNumber(
    livePrice ??
      item.price ??
      item.unitPrice ??
      item.unit_price ??
      item.salePrice ??
      getProductPrice(fallbackProduct) ??
      fallbackProduct.price ??
      fallbackProduct.sellingPrice ??
      fallbackProduct.salePrice ??
      0,
  );
};
export const getCartItemShipping = (item = {}) => {
  const product =
    item.productId && typeof item.productId === "object" ? item.productId : {};
  const productShipping =
    product.shipping && typeof product.shipping === "object"
      ? product.shipping
      : {};
  const perUnit =
    typeof item.shipping === "number"
      ? item.shipping
      : typeof item.shippingFee === "number"
        ? item.shippingFee
        : productShipping.freeShipping
          ? 0
          : asNumber(
              productShipping.shippingCharge ??
                productShipping.additionalCost ??
                0,
            ) + asNumber(productShipping.handlingCharge ?? 0);
  return perUnit * asNumber(item.quantity || 1);
};
export const getCartItemProduct = (item = {}) =>
  item?.productId && typeof item.productId === "object"
    ? item.productId
    : item?.product || {};
export const getCartItemTitle = (item = {}) => {
  const product = getCartItemProduct(item);
  return item.title || getProductTitle(product, "Product");
};
export const getCartItemVariantTitle = (item = {}) =>
  item.variantTitle || item.variant_title || item.variant?.title || "";
export const getCartItemAttributes = (item = {}) =>
  Object.entries(
    item.attributes && typeof item.attributes === "object"
      ? item.attributes
      : {},
  ).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );
export const adaptCheckoutItem = (item = {}, index = 0, fullProduct = null) => {
  const product = fullProduct || getCartItemProduct(item);
  const productId = getProductId(product || item.productId || item.id);
  const variantKey = item.variantId || item.variantSku || "";
  const title = getCartItemTitle(item);
  const image =
    getProductImage(product) ||
    item.image ||
    getImageFallbackSrc(title, "checkout");
  const price = getCartItemPrice(item, fullProduct);
  const quantity = asNumber(item.quantity || 1) || 1;

  return {
    ...item,
    price,
    quantity,
    _safeId: productId || `item-${index}`,
    _lineKey: [productId || `item-${index}`, variantKey]
      .filter(Boolean)
      .join(":"),
    _safeTitle: title,
    _variantTitle: getCartItemVariantTitle(item),
    _image: image,
    _attributes: getCartItemAttributes(item),
    _lineTotal: price * quantity,
    _shippingTotal: getCartItemShipping({ ...item, quantity }),
  };
};
export const getOrderPayableAmount = (order = {}) => {
  const orderCandidates = [order, order?.order, order?.data].filter(Boolean);
  for (const candidate of orderCandidates) {
    const payable = asOptionalNumber(getOrderAmount(candidate, "payable"));
    if (payable !== null) return payable;
  }
  for (const candidate of orderCandidates) {
    const total = asOptionalNumber(getOrderAmount(candidate, "total"));
    if (total !== null) return total;
  }
  return null;
};
export const getQuotePayableAmount = (quote = {}) => {
  const quoteCandidates = [
    quote,
    quote?.quote,
    quote?.summary,
    quote?.data,
    quote?.data?.quote,
    quote?.data?.summary,
  ].filter(Boolean);

  for (const candidate of quoteCandidates) {
    const payable = asOptionalNumber(getOrderAmount(candidate, "payable"));
    if (payable !== null) return payable;
  }

  return 0;
};
export const getCreatedOrder = (result = {}) =>
  result?.data?.order ||
  result?.data?.data?.order ||
  result?.data?.data ||
  result?.order ||
  result?.data ||
  result;
export const getPaymentPayload = (result = {}) =>
  result?.data?.payment ||
  result?.data?.data?.payment ||
  result?.data?.data ||
  result?.payment ||
  result?.data ||
  result;
export const getPaymentStatus = (payment = {}) =>
  payment?.status || payment?.payment_status || "";
export const getPaymentAmount = (payment = {}) =>
  asOptionalNumber(
    payment?.amount ?? payment?.payableAmount ?? payment?.payable_amount,
  );
export const getCheckoutAmount = (payment = {}) => {
  const amountInPaise = asOptionalNumber(payment?.checkout?.amount);
  return amountInPaise === null
    ? null
    : Number((amountInPaise / 100).toFixed(2));
};
export const amountsMatch = (left, right) =>
  Math.round(Number(left || 0) * 100) === Math.round(Number(right || 0) * 100);
export const BUY_NOW_STORAGE_KEY = "sam_global_buy_now_items";
export const SELECTED_CHECKOUT_STORAGE_KEY = "sam_global_selected_checkout_item_ids";
export const CHECKOUT_CART_ITEM_IDS_STORAGE_KEY = "sam_global_checkout_cart_item_ids";
export const COMPLETED_CHECKOUT_STORAGE_KEY = "sam_global_completed_checkout";
export const CHECKOUT_IDEMPOTENCY_STORAGE_KEY = "sam_global_checkout_idempotency";
export const normalizeCartItemId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const [rawProductId, ...variantParts] = value.split(":");
    const productId = normalizeId(rawProductId);
    const variantId = normalizeId(variantParts.join(":"));
    return [productId, variantId].filter(Boolean).join(":");
  }

  const productId = normalizeId(value.productId || value.product);
  const variantId = normalizeId(value.variantId || value.variantSku || "");
  return [productId, variantId].filter(Boolean).join(":");
};
export const normalizeCartItemIds = (values = []) =>
  Array.from(
    new Set(values.map((value) => normalizeCartItemId(value)).filter(Boolean)),
  );
export const getBuyNowItems = () => {
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(BUY_NOW_STORAGE_KEY) || "[]",
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
export const getSelectedCheckoutItemIds = () => {
  try {
    const storedValue = window.sessionStorage.getItem(
      SELECTED_CHECKOUT_STORAGE_KEY,
    );
    if (storedValue === null) return null;
    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? normalizeCartItemIds(parsed) : null;
  } catch {
    return null;
  }
};
export const getCompletedCheckout = () => {
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(COMPLETED_CHECKOUT_STORAGE_KEY) || "null",
    );
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};
export const setCompletedCheckout = (orderId) => {
  if (!orderId) return;
  window.sessionStorage.setItem(
    COMPLETED_CHECKOUT_STORAGE_KEY,
    JSON.stringify({ orderId, completedAt: Date.now() }),
  );
};
export const clearCompletedCheckout = () => {
  window.sessionStorage.removeItem(COMPLETED_CHECKOUT_STORAGE_KEY);
};
export const clearCheckoutIdempotency = () => {
  window.sessionStorage.removeItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
};
export const hasActiveCheckoutStorage = () =>
  Boolean(window.sessionStorage.getItem(BUY_NOW_STORAGE_KEY)) ||
  Boolean(window.sessionStorage.getItem(SELECTED_CHECKOUT_STORAGE_KEY)) ||
  Boolean(window.sessionStorage.getItem(CHECKOUT_CART_ITEM_IDS_STORAGE_KEY));
export const getCheckoutFingerprint = ({
  isBuyNowCheckout,
  selectedCheckoutItemIds,
  orderItems,
}) => {
  const itemKeys = orderItems
    .map((item) =>
      [
        normalizeId(item.productId),
        normalizeId(item.variantId || item.variantSku || ""),
        Number(item.quantity || 1),
      ].join(":"),
    )
    .sort();

  return JSON.stringify({
    source: isBuyNowCheckout ? "buy_now" : "cart",
    selected: selectedCheckoutItemIds || [],
    items: itemKeys,
  });
};
export const getCheckoutIdempotencyBaseKey = (fingerprint) => {
  try {
    const stored = JSON.parse(
      window.sessionStorage.getItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY) || "null",
    );
    if (stored?.fingerprint === fingerprint && stored?.key) {
      return stored.key;
    }
  } catch {
    // Ignore malformed session data and replace it below.
  }

  const key = createCheckoutIdempotencyKey();
  window.sessionStorage.setItem(
    CHECKOUT_IDEMPOTENCY_STORAGE_KEY,
    JSON.stringify({ fingerprint, key, createdAt: Date.now() }),
  );
  return key;
};
export const getCartLineKey = (item = {}) =>
  normalizeCartItemId({
    productId: getProductId(item.productId || item.product),
    variantId: item.variantId,
    variantSku: item.variantSku,
  });
export const getPaymentProviderLabel = (provider = "") =>
  String(provider || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
export const createCheckoutIdempotencyKey = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
export const createCheckoutPricingKey = ({
  baseKey,
  couponCode,
  walletAmount,
  paymentProvider,
  payableAmount,
}) =>
  [
    baseKey,
    String(couponCode || "NOCOUPON")
      .trim()
      .toUpperCase(),
    Number(walletAmount || 0).toFixed(2),
    paymentProvider || "razorpay",
    Number(payableAmount || 0).toFixed(2),
  ].join(":");
export const buildOrderItems = (items = []) =>
  items
    .map(
      ({
        productId,
        _safeId,
        quantity,
        variantId,
        variantSku,
        variantTitle,
        attributes,
        price,
      }) => ({
        productId:
          typeof productId === "object" ? _safeId : productId || _safeId,
        variantId: variantId || undefined,
        variantSku: variantSku || undefined,
        variantTitle: variantTitle || undefined,
        attributes: attributes || {},
        quantity: Number(quantity || 1),
        price: price ? Number(price) : undefined,
      }),
    )
    .filter((item) => Boolean(item.productId));

export const normalizePincode = (value) => String(value || "").trim();
export const normalizeServiceabilityMode = (value) => {
  const mode = String(value || "inherit")
    .trim()
    .toLowerCase();
  if (["all_pincodes", "all_india", "all_locations"].includes(mode))
    return "all_pincodes";
  if (
    [
      "allowlist",
      "selected_pincodes",
      "serviceable_pincodes",
      "allow_pincodes",
    ].includes(mode)
  )
    return "allowlist";
  if (["regions", "selected_states", "selected_cities"].includes(mode))
    return "regions";
  if (mode === "disabled") return "disabled";
  return "inherit";
};
export const normalizeList = (value) =>
  (Array.isArray(value) ? value : String(value || "").split(/[\n,]+/))
    .map((item) =>
      String(item || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
export const listIncludes = (list, value) =>
  normalizeList(list).includes(
    String(value || "")
      .trim()
      .toLowerCase(),
  );
export const getClientDeliverabilityBlockers = (items = [], address = {}) => {
  const pincode = normalizePincode(
    address?.postalCode ||
      address?.postal_code ||
      address?.pincode ||
      address?.zip,
  );
  if (!pincode) return [];
  return items
    .map((item) => {
      const product = getCartItemProduct(item);
      const shipping =
        product?.shipping && typeof product.shipping === "object"
          ? product.shipping
          : {};
      const mode = normalizeServiceabilityMode(shipping.serviceabilityMode);
      const allowed =
        shipping.allowPincodes || shipping.serviceablePincodes || [];
      const title = getCartItemTitle(item);

      if (mode === "disabled") {
        return {
          title,
          pincode,
          reason: "Delivery is disabled for this product.",
        };
      }
      if (mode === "allowlist" && !listIncludes(allowed, pincode)) {
        return {
          title,
          pincode,
          reason: `Not in this product's allowed pincode list.`,
        };
      }
      if (mode === "regions") {
        const regionAllowed =
          !normalizeList(shipping.regions).length ||
          listIncludes(shipping.regions, pincode) ||
          listIncludes(shipping.regions, address?.state) ||
          listIncludes(shipping.regions, address?.city);
        const stateAllowed =
          !normalizeList(shipping.states).length ||
          listIncludes(shipping.states, address?.state);
        const cityAllowed =
          !normalizeList(shipping.cities).length ||
          listIncludes(shipping.cities, address?.city);
        if (!regionAllowed || !stateAllowed || !cityAllowed) {
          return {
            title,
            pincode,
            reason: "Not in this product's delivery region.",
          };
        }
      }
      return null;
    })
    .filter(Boolean);
};

export const openRazorpayCheckout = async ({
  dispatch,
  run,
  order,
  orderId,
  payment,
  user,
}) => {
  const checkout = payment?.checkout || {};
  if (!checkout.keyId || !checkout.orderId || !checkout.amount) {
    throw new Error("Razorpay checkout details are missing. Please try again.");
  }

  const Razorpay = await loadRazorpayCheckout();

  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      callback(value);
    };

    const razorpay = new Razorpay({
      key: checkout.keyId,
      amount: checkout.amount,
      currency: checkout.currency || payment.currency || "INR",
      name: "Sam Global",
      description: `Order ${order?.orderNumber || order?.order_number || orderId}`,
      order_id: checkout.orderId,
      prefill: {
        name: user?.name || user?.fullName || "",
        email: user?.email || "",
        contact: user?.phone || user?.mobile || "",
      },
      notes: { orderId },
      theme: { color: "#B48A3C" },
      handler: async (response) => {
        try {
          const verifiedPayment = await run(
            dispatch,
            verifyPayment({
              provider: "razorpay",
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
            "Payment verified",
          );
          settle(resolve, verifiedPayment);
        } catch (error) {
          settle(reject, error);
        }
      },
      modal: {
        ondismiss: () =>
          settle(
            reject,
            new Error(
              "Payment was not completed. Your order is still pending payment.",
            ),
          ),
      },
    });

    razorpay.on("payment.failed", (response) => {
      settle(
        reject,
        new Error(
          response?.error?.description ||
            response?.error?.reason ||
            "Payment failed. Please try again.",
        ),
      );
    });

    razorpay.open();
  });
};