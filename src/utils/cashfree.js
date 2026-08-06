import { load } from "@cashfreepayments/cashfree-js";

let cashfree = null;

export const getCashfreeCheckout = (payment = {}) => {
  const checkout = payment?.checkout || {};
  const metadata = payment?.metadata || {};
  const response = metadata.response || {};
  const paymentSessionId =
    checkout.paymentSessionId ||
    checkout.payment_session_id ||
    response.payment_session_id ||
    response.paymentSessionId ||
    metadata.payment_session_id ||
    metadata.paymentSessionId ||
    null;

  if (!paymentSessionId && !checkout.orderToken && !checkout.order_token) {
    return null;
  }

  return {
    ...checkout,
    provider: checkout.provider || "cashfree",
    paymentSessionId,
    orderToken:
      checkout.orderToken ||
      checkout.order_token ||
      response.order_token ||
      response.cftoken ||
      null,
    orderId:
      checkout.orderId ||
      checkout.order_id ||
      payment.providerOrderId ||
      payment.provider_order_id ||
      response.order_id ||
      response.orderId ||
      null,
    amount: checkout.amount ?? payment.amount ?? response.order_amount,
    currency:
      checkout.currency ||
      payment.currency ||
      response.order_currency ||
      "INR",
    mode: checkout.mode || metadata.mode || "sandbox",
  };
};

/**
 * Initialize Cashfree SDK
 */
const getCashfree = async (mode = "sandbox") => {
  if (cashfree) {
    return cashfree;
  }

  console.log("Loading Cashfree SDK...");

  cashfree = await load({
    mode:
      String(mode || "sandbox").toLowerCase() === "production"
        ? "production"
        : "sandbox",
  });

  console.log("Cashfree SDK Loaded Successfully");

  return cashfree;
};

/**
 * Open Cashfree Checkout
 */
export const openCashfreeCheckout = async ({
  checkout,
  returnUrl,
} = {}) => {
  console.log("========================================");
  console.log(" CASHFREE CHECKOUT ");
  console.log("========================================");

  console.log("Checkout Object:");
  console.log(checkout);

  if (!checkout) {
    throw new Error("Checkout object missing.");
  }

  const normalizedCheckout = getCashfreeCheckout({ checkout });

  if (!normalizedCheckout?.paymentSessionId) {
    throw new Error("Payment Session ID missing.");
  }

  try {
    const cf = await getCashfree(normalizedCheckout.mode);

    console.log("Opening Checkout...");

    const result = await cf.checkout({
      paymentSessionId: normalizedCheckout.paymentSessionId,

      redirectTarget: "_self",

      redirect: "if_required",

      ...(returnUrl ? { returnUrl } : {}),
    });

    console.log("========== CASHFREE RESULT ==========");
    console.log(result);

    if (result?.error) {
      console.error("Cashfree Error");
      console.error(result.error);
      return result;
    }

    if (result?.paymentDetails) {
      console.log("Payment Success");
      console.log(result.paymentDetails);
      return result;
    }

    console.log("Redirect Result");
    console.log(result);

    return result;
  } catch (error) {
    console.error("========== CASHFREE EXCEPTION ==========");
    console.error(error);

    throw error;
  }
};
