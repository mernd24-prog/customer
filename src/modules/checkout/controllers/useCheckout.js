import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToastThunk } from "../../../hooks/useToastThunk";
import { notify } from "../../../utils/notify";
import { fetchCart } from "../../../modules/cart/slices/cartSlice";
import { checkServiceability } from "../../../features/delivery/deliverySlice";
import { fetchProductById } from "../../../modules/products/slices/productSlice";
import { fetchWallet } from "../../../features/wallet/walletSlice";
import { fetchMe, addAddress } from "../../../features/user/userSlice";
import {
  createOrder,
  fetchOrderById,
  quoteOrder,
} from "../../../modules/orders/slices/orderSlice";
import {
  fetchPaymentOptions,
  initiatePayment,
  verifyPayment,
} from "../../../features/payment/paymentSlice";
import {
  fetchCountries,
  fetchStates,
  fetchCities,
  fetchZipCodes,
} from "../../../features/global/globalSlice";
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
  scrollToFirstFormError,
  scrollToFormField,
} from "../../../utils/formErrors";
import {
  checkoutAddressSchema,
  couponCodeField,
  optionalMoneyField,
  validatePostalCodeForCountry,
} from "../../../validations";
import { ADDRESS_LABEL_OPTIONS } from "../../../components/address/AddressFormFields";
import {
  getAddressId,
  fetchFullList,
  checkoutFormSchema,
  hasAmountValue,
  asOptionalNumber,
  asNumber,
  ORDER_AMOUNT_KEYS,
  getAmountFromSource,
  getOrderAmount,
  getCartItemPrice,
  getCartItemShipping,
  getCartItemProduct,
  getCartItemTitle,
  getCartItemVariantTitle,
  getCartItemAttributes,
  adaptCheckoutItem,
  getOrderPayableAmount,
  getQuotePayableAmount,
  getCreatedOrder,
  getPaymentPayload,
  getPaymentStatus,
  getPaymentAmount,
  getCheckoutAmount,
  amountsMatch,
  BUY_NOW_STORAGE_KEY,
  SELECTED_CHECKOUT_STORAGE_KEY,
  CHECKOUT_CART_ITEM_IDS_STORAGE_KEY,
  COMPLETED_CHECKOUT_STORAGE_KEY,
  CHECKOUT_IDEMPOTENCY_STORAGE_KEY,
  normalizeCartItemId,
  normalizeCartItemIds,
  getBuyNowItems,
  getSelectedCheckoutItemIds,
  getCompletedCheckout,
  setCompletedCheckout,
  clearCompletedCheckout,
  clearCheckoutIdempotency,
  hasActiveCheckoutStorage,
  getCheckoutFingerprint,
  getCheckoutIdempotencyBaseKey,
  getCartLineKey,
  getPaymentProviderLabel,
  createCheckoutIdempotencyKey,
  createCheckoutPricingKey,
  buildOrderItems,
  normalizePincode,
  normalizeServiceabilityMode,
  normalizeList,
  listIncludes,
  getClientDeliverabilityBlockers,
  openRazorpayCheckout,
} from "../utils/checkoutUtils";

export default function useCheckout() {
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
  const [deliveryCheckLoading, setDeliveryCheckLoading] = useState(false);
  const [serverDeliverabilityBlockers, setServerDeliverabilityBlockers] =
    useState([]);
  const [isQuoteErrorDismissed, setIsQuoteErrorDismissed] = useState(false);
  const [isPostPaymentProcessing, setIsPostPaymentProcessing] = useState(false);

  const buyNowItems = useMemo(getBuyNowItems, []);
  const [selectedCheckoutItemIds, setSelectedCheckoutItemIds] = useState(() =>
    getSelectedCheckoutItemIds(),
  );
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
  const codBlockedProductNames = useMemo(
    () =>
      items
        .filter((item) => {
          const product = item._resolvedProduct || getCartItemProduct(item);
          const shippingInfo =
            product.shipping && typeof product.shipping === "object"
              ? product.shipping
              : item.shipping && typeof item.shipping === "object"
                ? item.shipping
                : {};
          return (
            shippingInfo.codAvailable === false ||
            shippingInfo.cod_available === false
          );
        })
        .map((item) => item._safeTitle || item.title || "Selected product"),
    [items],
  );
  const paymentOptions = useMemo(() => {
    const providers = Array.isArray(paymentState.current?.providers)
      ? paymentState.current.providers
      : [];
    return providers.map((option) => {
      if (option.provider !== "cod") return option;
      const blockedSellerIds = new Set(
        (option.config?.sellerRules || [])
          .filter((rule) => rule.allowed === false)
          .map((rule) => String(rule.sellerId || ""))
          .filter(Boolean),
      );
      const sellerBlockedProductNames = blockedSellerIds.size
        ? items
            .filter((item) => {
              const product = item._resolvedProduct || getCartItemProduct(item);
              return blockedSellerIds.has(
                String(
                  item.sellerId ||
                    item.seller_id ||
                    product.sellerId ||
                    product.seller_id ||
                    "",
                ),
              );
            })
            .map((item) => item._safeTitle || item.title || "Selected product")
        : [];
      const blockedNames = [
        ...new Set([...codBlockedProductNames, ...sellerBlockedProductNames]),
      ];
      if (!blockedNames.length) return option;
      return {
        ...option,
        enabled: false,
        disabledReason: `COD unavailable for: ${blockedNames.join(", ")}. Deselect or remove ${blockedNames.length === 1 ? "this product" : "these products"} to use COD, or choose online payment.`,
      };
    });
  }, [paymentState, codBlockedProductNames, items]);
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

  useEffect(() => {
    setIsQuoteErrorDismissed(false);
  }, [quoteError, selectedAddressId]);
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
          });
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
  const clientDeliverabilityBlockers = useMemo(
    () => getClientDeliverabilityBlockers(items, quoteShippingAddress),
    [items, quoteShippingAddress],
  );
  useEffect(() => {
    const pincode = normalizePincode(quoteShippingAddress?.postalCode);
    if (!/^\d{6}$/.test(pincode) || !items.length) {
      setServerDeliverabilityBlockers([]);
      setDeliveryCheckLoading(false);
      return undefined;
    }
    let active = true;
    setDeliveryCheckLoading(true);
    Promise.all(
      items.map(async (item) => {
        const productId =
          item._safeId || getProductId(getCartItemProduct(item));
        if (!productId) return null;
        try {
          const payload = await dispatch(
            checkServiceability({ pincode, productId }),
          ).unwrap();
          const result = payload?.data || payload;
          if (result?.serviceable !== false) return null;

          // Bypass server false negatives using client logic
          const product = item._resolvedProduct || getCartItemProduct(item);
          const shipping =
            product?.shipping && typeof product.shipping === "object"
              ? product.shipping
              : {};
          const mode = normalizeServiceabilityMode(
            shipping?.serviceabilityMode,
          );
          const hasProfile = Boolean(shipping?.shippingProfileId);

          // Seller-managed products without a profile and without manual
          // restrictions are deliverable across All India.
          if (!hasProfile && mode === "all_pincodes") return null;
          if (
            !hasProfile &&
            mode === "inherit" &&
            normalizeList(
              shipping.allowPincodes || shipping.serviceablePincodes || [],
            ).length === 0 &&
            normalizeList(shipping.regions).length === 0 &&
            normalizeList(shipping.states).length === 0 &&
            normalizeList(shipping.cities).length === 0
          )
            return null;

          if (mode === "allowlist") {
            const allowed =
              shipping.allowPincodes || shipping.serviceablePincodes || [];
            if (normalizeList(allowed).length === 0) return null;
            const pincodes = normalizeList(allowed);
            if (pincodes.includes(pincode)) return null;
          }

          if (mode === "regions") {
            const regions = normalizeList(shipping.regions);
            const states = normalizeList(shipping.states);
            const cities = normalizeList(shipping.cities);
            const checkInc = (list, val) =>
              list.includes(
                String(val || "")
                  .trim()
                  .toLowerCase(),
              );
            const regionAllowed =
              !regions.length ||
              checkInc(regions, pincode) ||
              checkInc(regions, quoteShippingAddress?.state) ||
              checkInc(regions, quoteShippingAddress?.city);
            const stateAllowed =
              !states.length || checkInc(states, quoteShippingAddress?.state);
            const cityAllowed =
              !cities.length || checkInc(cities, quoteShippingAddress?.city);
            if (regionAllowed && stateAllowed && cityAllowed) return null;
          }

          return {
            lineKey: getCartLineKey(item),
            productId,
            title: item._safeTitle || getCartItemTitle(item),
            pincode,
            reason:
              result?.exclusions?.[0]?.reason ||
              "This product is not serviceable at the selected address.",
          };
        } catch {
          return null;
        }
      }),
    )
      .then((results) => {
        if (active) setServerDeliverabilityBlockers(results.filter(Boolean));
      })
      .finally(() => {
        if (active) setDeliveryCheckLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dispatch, items, quoteShippingAddress?.postalCode]);

  const deliverabilityBlockers = useMemo(() => {
    const byLine = new Map();
    [...clientDeliverabilityBlockers, ...serverDeliverabilityBlockers].forEach(
      (blocker) => {
        byLine.set(
          blocker.lineKey || blocker.productId || blocker.title,
          blocker,
        );
      },
    );
    return [...byLine.values()];
  }, [clientDeliverabilityBlockers, serverDeliverabilityBlockers]);
  const deliverabilityError = useMemo(() => {
    if (!deliverabilityBlockers.length) return null;
    return "This product is no longer available. Please remove it from your cart and try again later.";
  }, [deliverabilityBlockers]);

  const excludeBlockedItem = useCallback(
    (blocker) => {
      if (isBuyNowCheckout) return;
      setSelectedCheckoutItemIds((current) => {
        const next = (current || []).filter(
          (itemId) => String(itemId) !== String(blocker.lineKey),
        );
        window.sessionStorage.setItem(
          SELECTED_CHECKOUT_STORAGE_KEY,
          JSON.stringify(next),
        );
        return next;
      });
      setQuoteError("");
    },
    [isBuyNowCheckout],
  );

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

    if (deliveryCheckLoading) {
      setQuoteLoading(true);
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
          const rawMsg =
            typeof error === "string"
              ? error
              : error?.message ||
                error?.error?.message ||
                "";
          const isUnavailable =
            !rawMsg ||
            /not available/i.test(rawMsg) ||
            /out of stock/i.test(rawMsg) ||
            /unserviceable/i.test(rawMsg) ||
            /disabled/i.test(rawMsg) ||
            /inactive/i.test(rawMsg);

          const errMsg = isUnavailable
            ? "This product is no longer available. Please remove it from your cart and try again later."
            : rawMsg;

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
  }, [dispatch, quotePayload, deliverabilityError, deliveryCheckLoading]);

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
    let activeOrderId = null;

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
        null,
      );

      const createdOrder = getCreatedOrder(order);
      const orderId =
        createdOrder?.id || createdOrder?.orderId || createdOrder?.order_id;
      if (!orderId) return;
      activeOrderId = orderId;

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
        navigate(`/orders/${encodeURIComponent(orderId)}`, { replace: true });
        notify.error({
          title: "Payment could not be started",
          message:
            "The order is saved, but its payment amount could not be confirmed. Review the order before retrying payment.",
        });
        return;
      }

      if (payableAmount <= 0) {
        const noPaymentResult = await dispatch(
          fetchOrderById({ orderId }),
        ).unwrap();
        const noPaymentOrder = getCreatedOrder(noPaymentResult);
        if (
          ["pending_payment", "payment_failed"].includes(
            String(
              noPaymentOrder?.status || noPaymentOrder?.orderStatus || "",
            ).toLowerCase(),
          )
        ) {
          navigate(
            `/payment/failed?orderId=${encodeURIComponent(orderId)}&reason=pending_confirmation`,
            { replace: true },
          );
          return;
        }
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
        null,
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
          message: `${message} The order is saved; review it before retrying payment.`,
        });
        navigate(`/orders/${encodeURIComponent(orderId)}`, { replace: true });
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
              onPaymentSuccess: () => setIsPostPaymentProcessing(true),
            });
          } catch (error) {
            setIsPostPaymentProcessing(false);
            const message =
              error?.message ||
              "Payment was not completed. Your order is still pending payment.";
            setError("root", { type: "manual", message });
            const reason =
              error?.code === "PAYMENT_GATEWAY_FAILED"
                ? "failed"
                : error?.code === "PAYMENT_DISMISSED"
                  ? "dismissed"
                  : "pending_confirmation";
            notify[reason === "failed" ? "error" : "info"]?.({
              title:
                reason === "failed"
                  ? "Payment failed"
                  : "Order awaiting payment",
              message,
            });
            navigate(
              `/payment/failed?orderId=${encodeURIComponent(orderId)}&reason=${reason}`,
              { replace: true },
            );
            return;
          }
        }
      }

      const confirmedResult = await dispatch(
        fetchOrderById({ orderId }),
      ).unwrap();
      const confirmedOrder = getCreatedOrder(confirmedResult);
      const confirmedStatus = String(
        confirmedOrder?.status || confirmedOrder?.orderStatus || "",
      ).toLowerCase();
      const confirmedPaymentStatus = String(
        confirmedOrder?.paymentStatus || confirmedOrder?.payment_status || "",
      ).toLowerCase();
      const paymentConfirmed =
        paymentProvider === "cod"
          ? confirmedPaymentStatus === "authorized"
          : confirmedPaymentStatus === "captured";
      if (
        !paymentConfirmed ||
        ["pending_payment", "payment_failed"].includes(confirmedStatus)
      ) {
        navigate(
          `/payment/failed?orderId=${encodeURIComponent(orderId)}&reason=pending_confirmation`,
          { replace: true },
        );
        return;
      }

      completeCheckout(orderId);
    } catch (error) {
      if (activeOrderId) {
        notify.warning({
          title: "Order saved — payment not confirmed",
          message:
            "We could not finish payment confirmation. Check this order before retrying so you are not charged twice.",
        });
        navigate(
          `/payment/failed?orderId=${encodeURIComponent(activeOrderId)}&reason=pending_confirmation`,
          { replace: true },
        );
      }
    } finally {
      if (shouldReleaseSubmitLock) {
        orderSubmitRef.current = false;
        setSubmittingOrder(false);
      }
    }
  };

  return {
    dispatch,
    navigate,
    run,
    currentUser,
    showGuestOtpModal,
    setShowGuestOtpModal,
    cartState,
    walletState,
    userState,
    orderState,
    paymentState,
    productEntities,
    fetchedIdsRef,
    quoteData,
    setQuoteData,
    quoteLoading,
    setQuoteLoading,
    quoteError,
    setQuoteError,
    isQuoteErrorDismissed,
    setIsQuoteErrorDismissed,
    isPostPaymentProcessing,
    buyNowItems,
    selectedCheckoutItemIds,
    isBuyNowCheckout,
    cart,
    checkoutSourceItems,
    items,
    subtotal,
    shipping,
    total,
    paymentProvider,
    setPaymentProvider,
    paymentOptions,
    quotePayableAmount,
    addresses,
    addressLabels,
    walletBalance,
    countries,
    setCountries,
    states,
    setStates,
    cities,
    setCities,
    postalCodes,
    setPostalCodes,
    newAddressFormRef,
    shouldScrollToNewAddressRef,
    orderSubmitRef,
    submittingOrder,
    setSubmittingOrder,
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    errors,
    useNewAddress,
    selectedAddressId,
    selectedCountry,
    selectedState,
    selectedCity,
    watchedPostalCode,
    watchedCouponCode,
    watchedWalletAmount,
    watchedFullName,
    watchedDialCode,
    watchedPhone,
    watchedLine1,
    watchedLine2,
    handleInvalidCheckout,
    countryObj,
    countryId,
    checkoutDialCodes,
    handleAddNewAddress,
    quoteShippingAddress,
    orderItems,
    checkoutFingerprint,
    checkoutIdempotencyBaseKey,
    paymentSellerContext,
    quotePayload,
    deliverabilityBlockers,
    deliverabilityError,
    deliveryCheckLoading,
    excludeBlockedItem,
    prevQuotePayloadRef,
    checkoutActionLoading,
    saveCheckoutAddress,
    handleSaveShippingAddressOnly,
    submit,
  };
}
