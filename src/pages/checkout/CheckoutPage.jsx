import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import { useToastThunk } from "../../hooks/useToastThunk";
import { notify } from "../../utils/notify";
import { fetchCart } from "../../features/cart/cartSlice";
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
} from "../../utils/ecommerce";
import { normalizeDialCode } from "../../lib/utils";
import {
  checkoutAddressSchema,
  optionalMoneyField,
  validatePostalCodeForCountry,
} from "../../validations";
import { ADDRESS_LABEL_OPTIONS } from "../../components/address/AddressFormFields";

// Import reusable checkout subcomponents
import AddressSelection from "./AddressSelection";
import ShippingAddressForm from "./ShippingAddressForm";
import DiscountsSection from "./DiscountsSection";
import CheckoutSummary from "./CheckoutSummary";

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
    // couponCode: couponCodeField,
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

const asNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const getOrderAmount = (order = {}, key) => {
  const snakeKey = {
    subtotal: "subtotal_amount",
    shipping: "shipping_amount",
    total: "total_amount",
    payable: "payable_amount",
    discount: "discount_amount",
    walletAmount: "wallet_amount",
    platformFee: "platform_fee_amount",
  }[key];

  return (
    order.amounts?.[key] ??
    order.amounts?.[snakeKey] ??
    order[snakeKey] ??
    order[key]
  );
};
const getCartItemPrice = (item = {}) => {
  const product =
    item.productId && typeof item.productId === "object"
      ? item.productId
      : item.product || {};
  return asNumber(
    item.price ??
      item.unitPrice ??
      item.unit_price ??
      item.salePrice ??
      product.price ??
      product.sellingPrice ??
      product.salePrice ??
      0,
  );
};
const getCartItemShipping = (item = {}) =>
  asNumber(item.shipping ?? item.shippingFee ?? 0) *
  asNumber(item.quantity || 1);
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
const adaptCheckoutItem = (item = {}, index = 0) => {
  const product = getCartItemProduct(item);
  const productId = getProductId(product || item.productId || item.id);
  const variantKey = item.variantId || item.variantSku || "";
  const title = getCartItemTitle(item);
  const image =
    getProductImage(product) ||
    item.image ||
    getImageFallbackSrc(title, "checkout");
  const price = getCartItemPrice(item);
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
const getOrderPayableAmount = (order = {}) =>
  asNumber(
    getOrderAmount(order, "payable") ??
      getOrderAmount(order, "total") ??
      getOrderAmount(order?.order, "payable") ??
      getOrderAmount(order?.order, "total"),
  );
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
const BUY_NOW_STORAGE_KEY = "sam_global_buy_now_items";
const SELECTED_CHECKOUT_STORAGE_KEY = "sam_global_selected_checkout_item_ids";
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
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
const getCartLineKey = (item = {}) =>
  [
    getProductId(item.productId || item.product),
    item.variantId || item.variantSku || "",
  ]
    .filter(Boolean)
    .join(":");
const getPaymentProviderLabel = (provider = "") =>
  String(provider || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
const createCheckoutIdempotencyKey = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
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
      }) => ({
        productId:
          typeof productId === "object" ? _safeId : productId || _safeId,
        variantId: variantId || undefined,
        variantSku: variantSku || undefined,
        variantTitle: variantTitle || undefined,
        attributes: attributes || {},
        quantity: Number(quantity || 1),
      }),
    )
    .filter((item) => Boolean(item.productId));

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
    throw new Error(
      "Razorpay checkout details are missing. Please try again.",
    );
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

  const cartState = useSelector((s) => s.cart);
  const walletState = useSelector((s) => s.wallet);
  const userState = useSelector((s) => s.user);
  const orderState = useSelector((s) => s.order);
  const paymentState = useSelector((s) => s.payment);
  const [quoteData, setQuoteData] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const buyNowItems = useMemo(getBuyNowItems, []);
  const selectedCheckoutItemIds = useMemo(getSelectedCheckoutItemIds, []);
  const checkoutIdempotencyKey = useMemo(createCheckoutIdempotencyKey, []);
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
  const items = useMemo(
    () => checkoutSourceItems.map(adaptCheckoutItem),
    [checkoutSourceItems],
  );
  const subtotal = items.reduce((sum, item) => sum + item._lineTotal, 0);
  const shipping = items.reduce((sum, item) => sum + item._shippingTotal, 0);
  const total = subtotal + shipping;
  const [paymentProvider, setPaymentProvider] = useState("razorpay");
  const paymentOptions = useMemo(
    () =>
      Array.isArray(paymentState.current?.providers)
        ? paymentState.current.providers
        : [],
    [paymentState],
  );
  const quoteSummary = quoteData?.summary || {};
  const quotePayableAmount = asNumber(
    quoteSummary.customerPayableAmount ?? quoteData?.quote?.payableAmount,
  );

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

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchWallet());
    dispatch(fetchMe());
    fetchFullList(dispatch, fetchCountries)
      .then((list) => {
        setCountries(list);
      })
      .catch((err) => console.error("Error fetching countries:", err));
  }, [dispatch]);

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
    defaultValues: {
      useNewAddress: false,
      selectedAddressId: "",
      label: "home",
      country: "",
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

  const countryObj = countries.find((c) => (c.name || c) === selectedCountry);
  const countryId = countryObj?._id || countryObj?.id;
  const checkoutDialCodes = countryObj?.dialCode
    ? [normalizeDialCode(countryObj.dialCode)]
    : Array.from(
        new Set(countries.map((c) => normalizeDialCode(c.dialCode)).filter(Boolean)),
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
      const isValid = states.some(
        (s) => (s.name || s) === selectedState,
      );
      if (!isValid) {
        setValue("state", "");
        setValue("city", "");
      }
    }
  }, [selectedCountry, states, selectedState, setValue]);

  useEffect(() => {
    if (selectedCountry && countryObj?.dialCode) {
      setValue(
        "dialCode",
        normalizeDialCode(countryObj.dialCode),
        { shouldValidate: true },
      );
    }
  }, [selectedCountry, countryObj, setValue]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedState) {
      const stateObj = states.find((s) => (s.name || s) === selectedState);
      const stateId = stateObj?._id || stateObj?.id;
      if (stateId) {
        fetchFullList(dispatch, fetchCities, { stateId })
          .then((list) => {
            setCities(list);
          })
          .catch((err) => console.error("Error fetching cities:", err));
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
        fetchFullList(dispatch, fetchZipCodes, { cityId })
          .then((list) => {
            setPostalCodes(list);
          })
          .catch((err) => console.error("Error fetching zip codes:", err));
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
          .catch((err) => console.error("Error fetching zip code:", err));
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
  const paymentSellerContext = useMemo(() => {
    const sellerOrderAmounts = {};
    items.forEach((item) => {
      const product = getCartItemProduct(item);
      const sellerId = String(item.sellerId || item.seller_id || product.sellerId || product.seller_id || "").trim();
      if (!sellerId) return;
      sellerOrderAmounts[sellerId] = asNumber(sellerOrderAmounts[sellerId]) + asNumber(item._lineTotal);
    });
    return {
      sellerIds: Object.keys(sellerOrderAmounts),
      sellerOrderAmounts,
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

  useEffect(() => {
    const sellerIds = paymentSellerContext.sellerIds.join(",");
    dispatch(
      fetchPaymentOptions({
        orderAmount: quotePayableAmount || total || subtotal || 0,
        postalCode: quoteShippingAddress?.postalCode || "",
        country: quoteShippingAddress?.country || "",
        sellerIds,
        sellerOrderAmounts: sellerIds ? JSON.stringify(paymentSellerContext.sellerOrderAmounts) : undefined,
      }),
    ).catch(() => {});
  }, [
    dispatch,
    paymentSellerContext,
    quotePayableAmount,
    quoteShippingAddress?.country,
    quoteShippingAddress?.postalCode,
    subtotal,
    total,
  ]);

  useEffect(() => {
    if (!quotePayload) {
      setQuoteData(null);
      setQuoteError("");
      setQuoteLoading(false);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setQuoteLoading(true);
      setQuoteError("");
      dispatch(quoteOrder(quotePayload))
        .unwrap()
        .then((result) => {
          if (active) setQuoteData(result.data || null);
        })
        .catch((error) => {
          if (!active) return;
          setQuoteData(null);
          setQuoteError(error || "Unable to calculate order quote");
        })
        .finally(() => {
          if (active) setQuoteLoading(false);
        });
    }, 450);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [dispatch, quotePayload]);

  const loading =
    cartState.loading ||
    walletState.loading ||
    orderState.loading ||
    paymentState.loading;

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
    const freshMe = await dispatch(fetchMe()).unwrap().catch(() => null);
    const freshAddresses =
      freshMe?.data?.addresses || freshMe?.addresses || userState.current?.addresses || [];
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

  const submit = async (values) => {
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

    const order = await run(
      dispatch,
      createOrder({
        currency: "INR",
        couponCode: values.couponCode || undefined,
        walletAmount,
        paymentProvider,
        idempotencyKey: checkoutIdempotencyKey,
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
    if (payableAmount <= 0) {
      const orderDetail = await dispatch(fetchOrderById({ orderId })).unwrap();
      paymentOrder = getCreatedOrder(orderDetail);
      payableAmount = getOrderPayableAmount(paymentOrder);
    }

    if (payableAmount <= 0) {
      setError("root", {
        type: "manual",
        message:
          "Payment amount is missing from order details. Please try again.",
      });
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

    if (isBuyNowCheckout) {
      window.sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
    }
    window.sessionStorage.removeItem(SELECTED_CHECKOUT_STORAGE_KEY);

    navigate(`/payment/success?orderId=${orderId}`);
  };

  return (
    <>
      <Seo title="Checkout | Sam Global" />

      <div className="w-container py-12 sm:py-10">
        <h1 className="mb-6  text-2xl font-bold text-ink sm:text-3xl">
          Checkout
        </h1>

        <ApiState
          loading={cartState.loading}
          error={cartState.error}
          empty={items.length === 0}
          emptyTitle="Your cart is empty"
          emptyText="Add products to your cart before checking out."
        >
          <form onSubmit={handleSubmit(submit)} noValidate>
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
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
              {/* Left column: shipping + payment */}
              <div className="grid gap-6">
                {/* Saved addresses */}
                {addresses.length > 0 && (
                  <AddressSelection
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    useNewAddress={useNewAddress}
                    setValue={setValue}
                    errors={errors}
                    countries={countries}
                  />
                )}

                {/* New address form */}
                {(useNewAddress || addresses.length === 0) && (
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
                  />
                )}

                {/* Coupons & wallet */}
                <DiscountsSection
                  register={register}
                  errors={errors}
                  walletBalance={walletBalance}
                />
              </div>

              {/* Right column: order summary */}
              <CheckoutSummary
                items={items}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                quote={quoteData}
                quoteLoading={quoteLoading}
                quoteError={quoteError}
                loading={loading}
                paymentOptions={paymentOptions}
                paymentOptionsLoading={
                  paymentState.loading && !paymentOptions.length
                }
                selectedPaymentProvider={paymentProvider}
                onPaymentProviderChange={setPaymentProvider}
                getPaymentProviderLabel={getPaymentProviderLabel}
              />
            </div>
          </form>
        </ApiState>
      </div>
    </>
  );
}
