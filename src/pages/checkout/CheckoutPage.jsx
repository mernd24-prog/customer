import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import { SKELETON_PRESETS } from "../../components/common/skeleton/skeletonPresets";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import { useToastThunk } from "../../hooks/useToastThunk";
import { notify } from "../../utils/notify";
import { fetchCart } from "../../features/cart/cartSlice";
import { fetchProductById } from "../../features/product/productSlice";
import { fetchWallet } from "../../features/wallet/walletSlice";
import { fetchMe, addAddress } from "../../features/user/userSlice";
import {
  createOrder,
  fetchOrderById,
  quoteOrder,
} from "../../features/order/orderSlice";
import {
  fetchPaymentOptions,
  initiatePayment,
  verifyPayment,
} from "../../features/payment/paymentSlice";
import {
  fetchCountries,
  fetchStates,
  fetchCities,
  fetchZipCodes,
} from "../../features/global/globalSlice";
import {
  getImageFallbackSrc,
  getProductId,
  getProductImage,
  getProductTitle,
  getProductPrice,
  getVariantPrice,
} from "../../utils/ecommerce";
import { normalizeId } from "../../utils/ecommerce/cart";
import { normalizeDialCode } from "../../lib/utils";
import {
  scrollToFirstFormError,
  scrollToFormField,
} from "../../utils/formErrors";
import {
  checkoutAddressSchema,
  couponCodeField,
  optionalMoneyField,
  validatePostalCodeForCountry,
} from "../../validations";
import { ADDRESS_LABEL_OPTIONS } from "../../components/address/AddressFormFields";
import OrderDetailLayout, {
  OrderDetailAside,
} from "../orders/components/OrderDetailLayout";
import ShippingAddressForm from "./components/ShippingAddressForm";
import AddressSelection from "./components/AddressSelection";
import DiscountsSection from "./components/DiscountsSection";
import CheckoutSummary from "./components/CheckoutSummary";
import BaseModal from "../../components/common/overlay/BaseModal";
import GuestOtpAuthModal from "../../components/common/overlay/GuestOtpAuthModal";
import Button from "../../components/ui/Button";
import AddressFormFields from "../../components/address/AddressFormFields";
import { CHECKOUT_PAGE_SKELETON } from "../../components/common/skeleton/layouts";

const getAddressId = (addr) => addr?._id || addr?.id || "";

const RAZORPAY_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise;

const loadRazorpayCheckout = () => {
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

async function fetchFullList(dispatch, thunkAction, params = {}) {
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

function extractList(response = {}) {
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

const checkoutFormSchema = z
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

const hasAmountValue = (value) =>
  value !== undefined && value !== null && value !== "";

const asOptionalNumber = (value) => {
  if (!hasAmountValue(value)) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const asNumber = (value) => asOptionalNumber(value) ?? 0;

const ORDER_AMOUNT_KEYS = {
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

const getAmountFromSource = (source, keys) => {
  if (!source || typeof source !== "object") return undefined;
  for (const key of keys) {
    if (hasAmountValue(source[key])) return source[key];
  }
  return undefined;
};

const getOrderAmount = (order = {}, key) => {
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
const getCartItemPrice = (item = {}, fullProduct = null) => {
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
const getCartItemShipping = (item = {}) => {
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
const getCartItemProduct = (item = {}) =>
  item?.productId && typeof item.productId === "object"
    ? item.productId
    : item?.product || {};
const getCartItemTitle = (item = {}) => {
  const product = getCartItemProduct(item);
  return item.title || getProductTitle(product, "Product");
};
const getCartItemVariantTitle = (item = {}) =>
  item.variantTitle || item.variant_title || item.variant?.title || "";
const getCartItemAttributes = (item = {}) =>
  Object.entries(
    item.attributes && typeof item.attributes === "object"
      ? item.attributes
      : {},
  ).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );
const adaptCheckoutItem = (item = {}, index = 0, fullProduct = null) => {
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
const getOrderPayableAmount = (order = {}) => {
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
const getQuotePayableAmount = (quote = {}) => {
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
const getCreatedOrder = (result = {}) =>
  result?.data?.order ||
  result?.data?.data?.order ||
  result?.data?.data ||
  result?.order ||
  result?.data ||
  result;
const getPaymentPayload = (result = {}) =>
  result?.data?.payment ||
  result?.data?.data?.payment ||
  result?.data?.data ||
  result?.payment ||
  result?.data ||
  result;
const getPaymentStatus = (payment = {}) =>
  payment?.status || payment?.payment_status || "";
const getPaymentAmount = (payment = {}) =>
  asOptionalNumber(
    payment?.amount ?? payment?.payableAmount ?? payment?.payable_amount,
  );
const getCheckoutAmount = (payment = {}) => {
  const amountInPaise = asOptionalNumber(payment?.checkout?.amount);
  return amountInPaise === null
    ? null
    : Number((amountInPaise / 100).toFixed(2));
};
const amountsMatch = (left, right) =>
  Math.round(Number(left || 0) * 100) === Math.round(Number(right || 0) * 100);
const BUY_NOW_STORAGE_KEY = "sam_global_buy_now_items";
const SELECTED_CHECKOUT_STORAGE_KEY = "sam_global_selected_checkout_item_ids";
const CHECKOUT_CART_ITEM_IDS_STORAGE_KEY = "sam_global_checkout_cart_item_ids";
const COMPLETED_CHECKOUT_STORAGE_KEY = "sam_global_completed_checkout";
const CHECKOUT_IDEMPOTENCY_STORAGE_KEY = "sam_global_checkout_idempotency";
const normalizeCartItemId = (value) => {
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
const normalizeCartItemIds = (values = []) =>
  Array.from(
    new Set(values.map((value) => normalizeCartItemId(value)).filter(Boolean)),
  );
const getBuyNowItems = () => {
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(BUY_NOW_STORAGE_KEY) || "[]",
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const getSelectedCheckoutItemIds = () => {
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
const getCompletedCheckout = () => {
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(COMPLETED_CHECKOUT_STORAGE_KEY) || "null",
    );
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};
const setCompletedCheckout = (orderId) => {
  if (!orderId) return;
  window.sessionStorage.setItem(
    COMPLETED_CHECKOUT_STORAGE_KEY,
    JSON.stringify({ orderId, completedAt: Date.now() }),
  );
};
const clearCompletedCheckout = () => {
  window.sessionStorage.removeItem(COMPLETED_CHECKOUT_STORAGE_KEY);
};
const clearCheckoutIdempotency = () => {
  window.sessionStorage.removeItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
};
const hasActiveCheckoutStorage = () =>
  Boolean(window.sessionStorage.getItem(BUY_NOW_STORAGE_KEY)) ||
  Boolean(window.sessionStorage.getItem(SELECTED_CHECKOUT_STORAGE_KEY)) ||
  Boolean(window.sessionStorage.getItem(CHECKOUT_CART_ITEM_IDS_STORAGE_KEY));
const getCheckoutFingerprint = ({
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
const getCheckoutIdempotencyBaseKey = (fingerprint) => {
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
const getCartLineKey = (item = {}) =>
  normalizeCartItemId({
    productId: getProductId(item.productId || item.product),
    variantId: item.variantId,
    variantSku: item.variantSku,
  });
const getPaymentProviderLabel = (provider = "") =>
  String(provider || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
const createCheckoutIdempotencyKey = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
const createCheckoutPricingKey = ({
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
const buildOrderItems = (items = []) =>
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

const normalizePincode = (value) => String(value || "").trim();
const normalizeServiceabilityMode = (value) => {
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
const normalizeList = (value) =>
  (Array.isArray(value) ? value : String(value || "").split(/[\n,]+/))
    .map((item) =>
      String(item || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
const listIncludes = (list, value) =>
  normalizeList(list).includes(
    String(value || "")
      .trim()
      .toLowerCase(),
  );
const getClientDeliverabilityBlockers = (items = [], address = {}) => {
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

const openRazorpayCheckout = async ({
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

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const run = useToastThunk();

  const currentUser = useSelector((s) => s.auth?.current);
  const [showGuestOtpModal, setShowGuestOtpModal] = useState(!currentUser);

  useEffect(() => {
    if (!currentUser) {
      setShowGuestOtpModal(true);
    }
  }, [currentUser]);

  const cartState = useSelector((s) => s.cart);
  const walletState = useSelector((s) => s.wallet);
  const userState = useSelector((s) => s.user);
  const orderState = useSelector((s) => s.order);
  const paymentState = useSelector((s) => s.payment);
  const productEntities = useSelector((s) => s.product?.entities) || {};
  const fetchedIdsRef = useRef(new Set());

  const [quoteData, setQuoteData] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const buyNowItems = useMemo(getBuyNowItems, []);
  const selectedCheckoutItemIds = useMemo(getSelectedCheckoutItemIds, []);
  const isBuyNowCheckout = buyNowItems.length > 0;
  const cart = cartState.current || {};
  const checkoutSourceItems = useMemo(
    () =>
      isBuyNowCheckout
        ? buyNowItems
        : selectedCheckoutItemIds !== null
          ? (cart.items || []).filter((item) =>
              selectedCheckoutItemIds.includes(getCartLineKey(item)),
            )
          : cart.items || [],
    [buyNowItems, cart.items, isBuyNowCheckout, selectedCheckoutItemIds],
  );
  useEffect(() => {
    const itemProductIds = checkoutSourceItems
      .map((item) => getProductId(item.productId || item.product || {}))
      .filter(Boolean);
    const missingIds = itemProductIds.filter(
      (id) => !productEntities[id] && !fetchedIdsRef.current.has(id),
    );

    if (!missingIds.length) return;

    missingIds.forEach((id) => fetchedIdsRef.current.add(id));
    missingIds.forEach((productId) => {
      dispatch(fetchProductById({ productId })).catch(() => {});
    });
  }, [dispatch, checkoutSourceItems, productEntities]);

  const items = useMemo(
    () =>
      checkoutSourceItems.map((item, i) => {
        const productId = getProductId(item.productId || item.product || {});
        const fullProduct = productEntities[productId] || null;
        return adaptCheckoutItem(item, i, fullProduct);
      }),
    [checkoutSourceItems, productEntities],
  );
  const subtotal = items.reduce((sum, item) => sum + item._lineTotal, 0);
  const shipping = items.reduce((sum, item) => sum + item._shippingTotal, 0);
  const total = subtotal + shipping;
  const [paymentProvider, setPaymentProvider] = useState("razorpay");
  const paymentOptions = useMemo(() => {
    const providers = Array.isArray(paymentState.current?.providers)
      ? paymentState.current.providers
      : [];
    return providers.filter((option) => option.enabled !== false);
  }, [paymentState]);
  const quotePayableAmount = getQuotePayableAmount(quoteData);

  const addresses = useMemo(
    () => userState.current?.addresses || [],
    [userState],
  );
  const addressLabels = ADDRESS_LABEL_OPTIONS;
  const walletBalance = walletState.current?.balance || 0;

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [postalCodes, setPostalCodes] = useState([]);
  const newAddressFormRef = useRef(null);
  const shouldScrollToNewAddressRef = useRef(false);
  const orderSubmitRef = useRef(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchWallet());
    dispatch(fetchMe());
    fetchFullList(dispatch, fetchCountries).then((list) => {
      setCountries(list);
    });
    // .catch((err) => console.error("Error fetching countries:", err));
  }, [dispatch]);

  useEffect(() => {
    if (cartState.loading) return;

    const completedCheckout = getCompletedCheckout();
    if (!completedCheckout?.orderId) return;

    if (hasActiveCheckoutStorage() || (cart.items || []).length > 0) {
      clearCompletedCheckout();
      return;
    }

    clearCompletedCheckout();
    navigate(`/payment/success?orderId=${completedCheckout.orderId}`, {
      replace: true,
    });
  }, [cart.items, cartState.loading, navigate]);

  useEffect(() => {
    if (!paymentOptions.length) return;
    const selected = paymentOptions.find(
      (option) => option.provider === paymentProvider,
    );
    if (selected?.enabled) return;
    const firstEnabled = paymentOptions.find((option) => option.enabled);
    if (firstEnabled?.provider) {
      setPaymentProvider(firstEnabled.provider);
    }
  }, [paymentOptions, paymentProvider]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      useNewAddress: false,
      selectedAddressId: "",
      label: "home",
      country: "India",
      dialCode: "+91",
      isDefault: false,
      walletAmount: 0,
      couponCode: "",
    },
  });

  const useNewAddress = watch("useNewAddress");
  const selectedAddressId = watch("selectedAddressId");
  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const selectedCity = watch("city");
  const watchedPostalCode = watch("postalCode");
  const watchedCouponCode = watch("couponCode");
  const watchedWalletAmount = watch("walletAmount");
  const watchedFullName = watch("fullName");
  const watchedDialCode = watch("dialCode");
  const watchedPhone = watch("phone");
  const watchedLine1 = watch("line1");
  const watchedLine2 = watch("line2");

  const handleInvalidCheckout = (validationErrors) => {
    scrollToFirstFormError(validationErrors, {
      idPrefix: "shipping",
      fieldSelectors: {
        selectedAddressId: 'input[name="addressSelect"]',
      },
      fallbackRef: newAddressFormRef,
    });
  };

  const countryObj = countries.find((c) => (c.name || c) === selectedCountry);
  const countryId = countryObj?._id || countryObj?.id;
  const checkoutDialCodes = countryObj?.dialCode
    ? [normalizeDialCode(countryObj.dialCode)]
    : Array.from(
        new Set(
          countries.map((c) => normalizeDialCode(c.dialCode)).filter(Boolean),
        ),
      ).sort((a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")));

  useEffect(() => {
    if (!countryId) {
      setStates([]);
      return;
    }

    fetchFullList(dispatch, fetchStates, { countryId })
      .then((list) => setStates(list))
      .catch(() => setStates([]));
  }, [countryId, dispatch]);

  // Clear state and city if they don't match the selected country
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const isValid = states.some((s) => (s.name || s) === selectedState);
      if (!isValid) {
        setValue("state", "");
        setValue("city", "");
      }
    }
  }, [selectedCountry, states, selectedState, setValue]);

  useEffect(() => {
    if (selectedCountry && countryObj?.dialCode) {
      setValue("dialCode", normalizeDialCode(countryObj.dialCode), {
        shouldValidate: true,
      });
    }
  }, [selectedCountry, countryObj, setValue]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedState) {
      const stateObj = states.find((s) => (s.name || s) === selectedState);
      const stateId = stateObj?._id || stateObj?.id;
      if (stateId) {
        fetchFullList(dispatch, fetchCities, { stateId }).then((list) => {
          setCities(list);
        });
        // .catch((err) => console.error("Error fetching cities:", err));
      } else {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  }, [selectedState, states, dispatch]);

  // Fetch postal codes when city changes
  useEffect(() => {
    if (selectedCity) {
      const cityObj = cities.find((c) => (c.name || c) === selectedCity);
      const cityId = cityObj?._id || cityObj?.id;
      if (cityId) {
        fetchFullList(dispatch, fetchZipCodes, { cityId }).then((list) => {
          setPostalCodes(list);
        });
        // .catch((err) => console.error("Error fetching zip codes:", err));
      } else {
        setPostalCodes([]);
      }
    } else {
      setPostalCodes([]);
    }
  }, [selectedCity, cities, dispatch]);

  // Zipcode auto-fill logic (with 500ms debounce)
  useEffect(() => {
    const isValid =
      watchedPostalCode &&
      validatePostalCodeForCountry(watchedPostalCode, selectedCountry).valid;
    if (isValid) {
      const timer = setTimeout(() => {
        dispatch(fetchZipCodes({ params: { zip: watchedPostalCode } }))
          .unwrap()
          .then((res) => {
            const data = res.data || res || {};
            if (data.city && data.state) {
              setValue("city", data.city, { shouldValidate: true });
              setValue("state", data.state, { shouldValidate: true });
              if (data.country) {
                setValue("country", data.country, { shouldValidate: true });
              }
            }
          })
          // .catch((err) => console.error("Error fetching zip code:", err));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [watchedPostalCode, selectedCountry, dispatch, setValue]);

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setValue("selectedAddressId", getAddressId(def), {
        shouldValidate: true,
      });
      setValue("useNewAddress", false);
    }
    if (addresses.length === 0) {
      setValue("useNewAddress", true);
    }
  }, [addresses, selectedAddressId, setValue]);

  const handleAddNewAddress = () => {
    if (useNewAddress && newAddressFormRef.current) {
      newAddressFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    shouldScrollToNewAddressRef.current = true;
    setValue("useNewAddress", true, { shouldValidate: true });
  };

  useEffect(() => {
    if (!useNewAddress || !shouldScrollToNewAddressRef.current) return;

    const frameId = window.requestAnimationFrame(() => {
      newAddressFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      shouldScrollToNewAddressRef.current = false;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [useNewAddress]);

  const quoteShippingAddress = useMemo(() => {
    if (!useNewAddress && selectedAddressId) {
      const saved = addresses.find(
        (address) => getAddressId(address) === String(selectedAddressId),
      );
      if (!saved) return null;
      return {
        fullName: saved.fullName,
        dialCode: saved.dialCode,
        phone: saved.phone,
        line1: saved.line1,
        line2: saved.line2 || "",
        city: saved.city,
        state: saved.state,
        postalCode: saved.postalCode,
        country: saved.country || "",
      };
    }

    if (
      !watchedLine1 ||
      !selectedCity ||
      !selectedState ||
      !watchedPostalCode ||
      !selectedCountry
    ) {
      return null;
    }

    return {
      fullName: watchedFullName || "",
      dialCode: watchedDialCode || "",
      phone: watchedPhone || "",
      line1: watchedLine1,
      line2: watchedLine2 || "",
      city: selectedCity,
      state: selectedState,
      postalCode: watchedPostalCode,
      country: selectedCountry,
    };
  }, [
    addresses,
    selectedAddressId,
    selectedCity,
    selectedCountry,
    selectedState,
    useNewAddress,
    watchedDialCode,
    watchedFullName,
    watchedLine1,
    watchedLine2,
    watchedPhone,
    watchedPostalCode,
  ]);

  const orderItems = useMemo(() => buildOrderItems(items), [items]);
  const checkoutFingerprint = useMemo(
    () =>
      getCheckoutFingerprint({
        isBuyNowCheckout,
        selectedCheckoutItemIds,
        orderItems,
      }),
    [isBuyNowCheckout, orderItems, selectedCheckoutItemIds],
  );
  const checkoutIdempotencyBaseKey = useMemo(
    () => getCheckoutIdempotencyBaseKey(checkoutFingerprint),
    [checkoutFingerprint],
  );
  const paymentSellerContext = useMemo(() => {
    const sellerOrderAmounts = {};
    let productCodDisabled = false;
    items.forEach((item) => {
      const product = getCartItemProduct(item);
      const sellerId = String(
        item.sellerId ||
          item.seller_id ||
          product.sellerId ||
          product.seller_id ||
          "",
      ).trim();
      if (sellerId) {
        sellerOrderAmounts[sellerId] =
          asNumber(sellerOrderAmounts[sellerId]) + asNumber(item._lineTotal);
      }
      const productShipping =
        product.shipping && typeof product.shipping === "object"
          ? product.shipping
          : {};
      if (productShipping.codAvailable === false) {
        productCodDisabled = true;
      }
    });
    return {
      sellerIds: Object.keys(sellerOrderAmounts),
      sellerOrderAmounts,
      productCodDisabled,
    };
  }, [items]);
  const quotePayload = useMemo(() => {
    if (!quoteShippingAddress || !orderItems.length) return null;
    return {
      currency: "INR",
      couponCode: watchedCouponCode || undefined,
      walletAmount: Number(watchedWalletAmount || 0),
      paymentProvider,
      shippingAddress: quoteShippingAddress,
      items: orderItems,
    };
  }, [
    orderItems,
    paymentProvider,
    quoteShippingAddress,
    watchedCouponCode,
    watchedWalletAmount,
  ]);
  const deliverabilityBlockers = useMemo(
    () => getClientDeliverabilityBlockers(items, quoteShippingAddress),
    [items, quoteShippingAddress],
  );
  const deliverabilityError = useMemo(() => {
    if (!deliverabilityBlockers.length) return "";
    const first = deliverabilityBlockers[0];
    const extra =
      deliverabilityBlockers.length > 1
        ? ` and ${deliverabilityBlockers.length - 1} more item(s)`
        : "";
    return `${first.title}${extra} cannot be delivered to ${first.pincode}. ${first.reason}`;
  }, [deliverabilityBlockers]);

  useEffect(() => {
    const sellerIds = paymentSellerContext.sellerIds.join(",");
    dispatch(
      fetchPaymentOptions({
        orderAmount: quotePayableAmount || total || subtotal || 0,
        postalCode: quoteShippingAddress?.postalCode || "",
        country: quoteShippingAddress?.country || "",
        sellerIds,
        sellerOrderAmounts: sellerIds
          ? JSON.stringify(paymentSellerContext.sellerOrderAmounts)
          : undefined,
        productCodDisabled:
          paymentSellerContext.productCodDisabled || undefined,
      }),
    );
  }, [
    dispatch,
    paymentSellerContext,
    quotePayableAmount,
    quoteShippingAddress?.country,
    quoteShippingAddress?.postalCode,
    subtotal,
    total,
  ]);

  const prevQuotePayloadRef = useRef(quotePayload);

  useEffect(() => {
    if (!quotePayload) {
      setQuoteData(null);
      setQuoteError("");
      setQuoteLoading(false);
      return undefined;
    }

    if (deliverabilityError) {
      setQuoteData(null);
      setQuoteError(deliverabilityError);
      setQuoteLoading(false);
      return undefined;
    }

    const prev = prevQuotePayloadRef.current;
    let successTitle = "Order Updated";
    let successMessage = "Delivery charges updated successfully.";

    if (prev) {
      if (
        JSON.stringify(prev.shippingAddress) !==
        JSON.stringify(quotePayload.shippingAddress)
      ) {
        successTitle = "Address Updated";
        successMessage = "Delivery address updated successfully.";
      } else if (prev.paymentProvider !== quotePayload.paymentProvider) {
        successTitle = "Payment Updated";
        successMessage = "Payment method updated successfully.";
      } else if (prev.couponCode !== quotePayload.couponCode) {
        if (!quotePayload.couponCode) {
          successTitle = "Coupon Removed";
          successMessage = "Coupon code removed successfully.";
        } else {
          successTitle = "Coupon Updated";
          successMessage = "Coupon code updated successfully.";
        }
      } else if (prev.walletAmount !== quotePayload.walletAmount) {
        if (!quotePayload.walletAmount || quotePayload.walletAmount <= 0) {
          successTitle = "Wallet Removed";
          successMessage = "Wallet balance removed successfully.";
        } else {
          successTitle = "Wallet Updated";
          successMessage = "Wallet balance applied successfully.";
        }
      }
    }
    prevQuotePayloadRef.current = quotePayload;

    let active = true;
    const timer = window.setTimeout(() => {
      setQuoteLoading(true);
      setQuoteError("");

      dispatch(quoteOrder(quotePayload))
        .unwrap()
        .then((result) => {
          if (active) {
            setQuoteData(result.data || null);
            notify.success({
              title: successTitle,
              message: successMessage,
            });
          }
        })
        .catch((error) => {
          if (!active) return;
          setQuoteData(null);
          const errMsg =
            typeof error === "string"
              ? error
              : error?.message ||
                error?.error?.message ||
                "Unable to calculate order quote";
          setQuoteError(errMsg);
          notify.error({
            title: "Update Failed",
            message: errMsg,
          });
        })
        .finally(() => {
          if (active) setQuoteLoading(false);
        });
    }, 450);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [dispatch, quotePayload, deliverabilityError]);

  const checkoutActionLoading = orderState.loading || submittingOrder;

  const saveCheckoutAddress = async (values) => {
    const addressResult = checkoutAddressSchema.safeParse({
      fullName: values.fullName,
      dialCode: values.dialCode,
      phone: values.phone,
      line1: values.line1,
      line2: values.line2,
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      country: values.country,
      couponCode: values.couponCode,
      walletAmount: values.walletAmount,
    });

    if (!addressResult.success) {
      addressResult.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) {
          setError(String(field), {
            type: "manual",
            message: issue.message,
          });
        }
      });
      return null;
    }

    const addressValues = addressResult.data;
    const savedAddress = await run(
      dispatch,
      addAddress({
        label: values.label || "home",
        fullName: addressValues.fullName,
        phone: addressValues.phone,
        line1: addressValues.line1,
        line2: addressValues.line2 || "",
        city: addressValues.city,
        state: addressValues.state,
        postalCode: addressValues.postalCode,
        country: addressValues.country || "",
        isDefault: Boolean(values.isDefault),
      }),
      "Address added",
    );

    const saved =
      savedAddress?.data?.address ||
      savedAddress?.data?.data?.address ||
      savedAddress?.address ||
      savedAddress?.data ||
      null;
    const freshMe = await dispatch(fetchMe())
      .unwrap()
      .catch(() => null);
    const freshAddresses =
      freshMe?.data?.addresses ||
      freshMe?.addresses ||
      userState.current?.addresses ||
      [];
    const savedId = getAddressId(saved);
    const selectedSaved =
      freshAddresses.find((address) => getAddressId(address) === savedId) ||
      freshAddresses.find(
        (address) =>
          address.line1 === addressValues.line1 &&
          address.postalCode === addressValues.postalCode &&
          address.phone === addressValues.phone,
      ) ||
      saved;

    if (selectedSaved) {
      const selectedSavedId = getAddressId(selectedSaved);
      if (selectedSavedId) {
        setValue("selectedAddressId", selectedSavedId, {
          shouldValidate: true,
        });
        setValue("useNewAddress", false, { shouldValidate: true });
      }
    }

    return {
      fullName: addressValues.fullName,
      dialCode: addressValues.dialCode,
      phone: addressValues.phone,
      line1: addressValues.line1,
      line2: addressValues.line2 || "",
      city: addressValues.city,
      state: addressValues.state,
      postalCode: addressValues.postalCode,
      country: addressValues.country || "",
    };
  };

  const handleSaveShippingAddressOnly = async () => {
    const addressResult = checkoutAddressSchema.safeParse({
      fullName: watchedFullName,
      dialCode: watchedDialCode,
      phone: watchedPhone,
      line1: watchedLine1,
      line2: watchedLine2,
      city: selectedCity,
      state: selectedState,
      postalCode: watchedPostalCode,
      country: selectedCountry,
      couponCode: "",
      walletAmount: 0,
    });

    if (!addressResult.success) {
      addressResult.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) {
          setError(String(field), {
            type: "manual",
            message: issue.message,
          });
        }
      });
      const firstIssue = addressResult.error.issues[0];
      const firstField = firstIssue?.path?.[0];
      if (firstField) {
        scrollToFormField(String(firstField), undefined, {
          idPrefix: "shipping",
          fallbackRef: newAddressFormRef,
        });
      }
      return;
    }

    const addressValues = addressResult.data;
    const getFormLabel = () => {
      const labelValue = document.querySelector('input[name="label"]')?.value;
      return labelValue || "home";
    };

    await run(
      dispatch,
      addAddress({
        label: getFormLabel(),
        fullName: addressValues.fullName,
        phone: addressValues.phone,
        line1: addressValues.line1,
        line2: addressValues.line2 || "",
        city: addressValues.city,
        state: addressValues.state,
        postalCode: addressValues.postalCode,
        country: addressValues.country || "",
        isDefault: false,
      }),
      "Address saved successfully",
    );

    await dispatch(fetchMe());
    setValue("useNewAddress", false, { shouldValidate: true });
  };

  const submit = async (values) => {
    if (orderSubmitRef.current) return;
    orderSubmitRef.current = true;
    setSubmittingOrder(true);
    let shouldReleaseSubmitLock = true;

    const completeCheckout = (orderId) => {
      setCompletedCheckout(orderId);
      if (isBuyNowCheckout) {
        window.sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
      }
      window.sessionStorage.removeItem(SELECTED_CHECKOUT_STORAGE_KEY);
      window.sessionStorage.removeItem(CHECKOUT_CART_ITEM_IDS_STORAGE_KEY);
      clearCheckoutIdempotency();
      dispatch(fetchCart());
      navigate(`/payment/success?orderId=${orderId}`, { replace: true });
      shouldReleaseSubmitLock = false;
    };

    try {
      let shippingAddress;
      if (!values.useNewAddress && values.selectedAddressId) {
        const saved = addresses.find(
          (a) => getAddressId(a) === String(values.selectedAddressId),
        );
        if (!saved) {
          setError("selectedAddressId", {
            type: "manual",
            message: "Select a delivery address",
          });
          return;
        }

        shippingAddress = {
          fullName: saved.fullName,
          dialCode: saved.dialCode,
          phone: saved.phone,
          line1: saved.line1,
          line2: saved.line2 || "",
          city: saved.city,
          state: saved.state,
          postalCode: saved.postalCode,
          country: saved.country || "",
        };
      } else {
        shippingAddress = await saveCheckoutAddress(values);
        if (!shippingAddress) return;
      }

      const walletAmount = Number(values.walletAmount || 0);
      if (walletAmount > walletBalance) {
        setError("walletAmount", {
          type: "manual",
          message: "Wallet amount cannot exceed your available balance",
        });
        return;
      }

      if (!orderItems.length) {
        return;
      }

      if (quoteLoading) {
        setError("root", {
          type: "manual",
          message: "Please wait while we check delivery and shipping charges.",
        });
        return;
      }

      if (quoteError) {
        setError("root", {
          type: "manual",
          message:
            typeof quoteError === "string"
              ? quoteError
              : "Delivery is not available for the selected address.",
        });
        return;
      }

      const order = await run(
        dispatch,
        createOrder({
          currency: "INR",
          couponCode: values.couponCode || undefined,
          walletAmount,
          paymentProvider,
          idempotencyKey: createCheckoutPricingKey({
            baseKey: checkoutIdempotencyBaseKey,
            couponCode: values.couponCode,
            walletAmount,
            paymentProvider,
            payableAmount: quotePayableAmount,
          }),
          shippingAddress,
          items: orderItems,
        }),
        "Order created",
      );

      const createdOrder = getCreatedOrder(order);
      const orderId =
        createdOrder?.id || createdOrder?.orderId || createdOrder?.order_id;
      if (!orderId) return;

      let paymentOrder = createdOrder;
      let payableAmount = getOrderPayableAmount(paymentOrder);
      if (payableAmount === null) {
        const orderDetail = await dispatch(
          fetchOrderById({ orderId }),
        ).unwrap();
        paymentOrder = getCreatedOrder(orderDetail);
        payableAmount = getOrderPayableAmount(paymentOrder);
      }

      if (payableAmount === null) {
        setError("root", {
          type: "manual",
          message:
            "Payment amount is missing from order details. Please try again.",
        });
        return;
      }

      if (payableAmount <= 0) {
        completeCheckout(orderId);
        return;
      }

      const initiatedPaymentResult = await run(
        dispatch,
        initiatePayment({
          orderId,
          provider: paymentProvider,
          amount: payableAmount,
          currency: paymentOrder?.currency || createdOrder?.currency || "INR",
          notes: { source: "web_checkout", paymentProvider },
        }),
        paymentProvider === "cod" ? "COD order confirmed" : null,
      );
      const initiatedPayment = getPaymentPayload(initiatedPaymentResult);
      const paymentAmount = getPaymentAmount(initiatedPayment);
      const checkoutAmount = getCheckoutAmount(initiatedPayment);
      if (
        (paymentAmount !== null &&
          !amountsMatch(paymentAmount, payableAmount)) ||
        (checkoutAmount !== null &&
          !amountsMatch(checkoutAmount, payableAmount))
      ) {
        const message = `Payment amount mismatch. Checkout payable is ₹${Number(payableAmount).toLocaleString("en-IN")} but payment gateway returned ₹${Number(paymentAmount ?? checkoutAmount ?? 0).toLocaleString("en-IN")}. Please refresh checkout and try again.`;
        setError("root", { type: "manual", message });
        notify.error({
          title: "Payment amount mismatch",
          message,
        });
        return;
      }

      if (paymentProvider === "razorpay") {
        if (getPaymentStatus(initiatedPayment) !== "captured") {
          try {
            await openRazorpayCheckout({
              dispatch,
              run,
              order: paymentOrder || createdOrder,
              orderId,
              payment: initiatedPayment,
              user: userState.current,
            });
          } catch (error) {
            const message =
              error?.message ||
              "Payment was not completed. Your order is still pending payment.";
            setError("root", { type: "manual", message });
            notify.error({
              title: "Payment failed",
              message,
            });
            return;
          }
        }
      }

      completeCheckout(orderId);
    } finally {
      if (shouldReleaseSubmitLock) {
        orderSubmitRef.current = false;
        setSubmittingOrder(false);
      }
    }
  };

  return (
    <>
      <GuestOtpAuthModal
        open={showGuestOtpModal}
        onClose={() => {
          setShowGuestOtpModal(false);
          if (!currentUser) {
            navigate("/cart");
          }
        }}
        onSuccess={() => setShowGuestOtpModal(false)}
      />
      <Seo title="Checkout | Sam Global" />

      <div className="mx-auto max-w-[850px] lg:max-w-none py-6 sm:py-8">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cart", href: "/cart" },
              { label: "Checkout" },
            ]}
            className="mb-2 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
            linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
            heading="Checkout"
            currentClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#CE9F2D]"
            separatorClassName="text-[#2E2E2E]"
          />
        </div>
        <ApiState
          loading={cartState.loading}
          error={cartState.error}
          empty={items.length === 0}
          skeletonLayout={CHECKOUT_PAGE_SKELETON}
          skeletonContainerClass="bg-transparent"
          emptyTitle="Your Cart is Empty"
          emptyText="Add products to your cart before checking out."
        >
          <form
            onSubmit={handleSubmit(submit, handleInvalidCheckout)}
            noValidate
          >
            {errors.root?.message ? (
              <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.root.message}
              </div>
            ) : null}
            <input
              type="hidden"
              value={String(useNewAddress)}
              {...register("useNewAddress")}
            />
            <input
              type="hidden"
              value={selectedAddressId || ""}
              {...register("selectedAddressId")}
            />
            <OrderDetailLayout>
              {/* Left column: shipping + payment */}
              <div className="flex flex-col gap-6">
                {/* Saved addresses */}
                {addresses.length > 0 && (
                  <AddressSelection
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    useNewAddress={useNewAddress}
                    setValue={setValue}
                    errors={errors}
                    countries={countries}
                    onAddNewAddress={handleAddNewAddress}
                  />
                )}

                {/* New address form */}
                {(useNewAddress || addresses.length === 0) &&
                  (addresses.length > 0 ? (
                    <BaseModal onClose={() => setValue("useNewAddress", false)}>
                      <div className="w-full bg-surface p-4 sm:p-5 rounded-[10px] max-h-[75vh] overflow-y-auto [scrollbar-color:#CE9F2D33_transparent] [scrollbar-width:thin]">
                        <ShippingAddressForm
                          register={register}
                          errors={errors}
                          checkoutDialCodes={checkoutDialCodes}
                          countries={countries}
                          selectedCountry={selectedCountry}
                          states={states}
                          selectedState={selectedState}
                          cities={cities}
                          selectedCity={selectedCity}
                          watchedPostalCode={watchedPostalCode}
                          setValue={setValue}
                          postalCodes={postalCodes}
                          showSavedAddressFields={true}
                          addressLabels={addressLabels}
                          loading={checkoutActionLoading}
                          onCancel={() => setValue("useNewAddress", false)}
                          onSave={handleSaveShippingAddressOnly}
                        />
                      </div>
                    </BaseModal>
                  ) : (
                    <div ref={newAddressFormRef} className="scroll-mt-24">
                      <ShippingAddressForm
                        register={register}
                        errors={errors}
                        checkoutDialCodes={checkoutDialCodes}
                        countries={countries}
                        selectedCountry={selectedCountry}
                        states={states}
                        selectedState={selectedState}
                        cities={cities}
                        selectedCity={selectedCity}
                        watchedPostalCode={watchedPostalCode}
                        setValue={setValue}
                        postalCodes={postalCodes}
                        showSavedAddressFields={true}
                        addressLabels={addressLabels}
                        loading={checkoutActionLoading}
                        onCancel={() => setValue("useNewAddress", false)}
                        onSave={handleSaveShippingAddressOnly}
                      />
                    </div>
                  ))}

                {/* Coupons & wallet */}
                <DiscountsSection
                  register={register}
                  errors={errors}
                  walletBalance={walletBalance}
                />
              </div>

              {/* Right column: order summary */}
              <OrderDetailAside>
                <CheckoutSummary
                  items={items}
                  subtotal={subtotal}
                  shipping={shipping}
                  total={total}
                  quote={quoteData}
                  quoteLoading={quoteLoading}
                  quoteError={quoteError}
                  loading={checkoutActionLoading}
                  paymentOptions={paymentOptions}
                  paymentOptionsLoading={
                    paymentState.loading && !paymentOptions.length
                  }
                  selectedPaymentProvider={paymentProvider}
                  onPaymentProviderChange={setPaymentProvider}
                  getPaymentProviderLabel={getPaymentProviderLabel}
                  deliveryPincode={
                    quoteShippingAddress?.postalCode || watchedPostalCode || ""
                  }
                />
              </OrderDetailAside>
            </OrderDetailLayout>
          </form>
        </ApiState>
      </div>
    </>
  );
}
