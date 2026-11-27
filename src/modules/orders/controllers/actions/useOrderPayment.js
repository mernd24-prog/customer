import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToastThunk } from "../../../../hooks/useToastThunk";
import { fetchOrderById, retryOrderPayment } from "../../slices/orderSlice";
import { initiatePayment, verifyPayment } from "../../../../features/payment/paymentSlice";
import { openRazorpayCheckout, paymentPayload } from "../../../../utils/razorpay";
import { notify } from "../../../../utils/notify";
import { getOrderStatus } from "../../../../utils/pages/orderUtils";

export function useOrderPayment({ orderId, order, userState }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const run = useToastThunk();
  const [retrying, setRetrying] = useState(false);

  const handleRetryPayment = async () => {
    if (retrying) return;
    setRetrying(true);
    let checkoutStarted = false;
    try {
      await run(dispatch, retryOrderPayment({ orderId }), null);
      const paymentResult = await run(
        dispatch,
        initiatePayment({
          orderId,
          provider: "razorpay",
          currency: "INR",
          notes: { source: "web_retry" },
        }),
        null,
      );
      const payment = paymentPayload(paymentResult);
      if (['authorized', 'captured'].includes(String(payment?.status || '').toLowerCase())) {
        navigate(`/payment/${payment.status === 'captured' ? 'success' : 'failed'}?orderId=${orderId}${payment.status === 'captured' ? '' : '&reason=pending_confirmation'}`);
        return;
      }
      await openRazorpayCheckout({
        dispatch,
        run,
        order,
        orderId,
        payment,
        user: userState,
        verifyPayment,
        onPaymentSuccess: () => { checkoutStarted = true; },
      });
      const refreshed = await dispatch(fetchOrderById({ orderId })).unwrap();
      const refreshedOrder = refreshed?.data?.order || refreshed?.data?.data?.order ||
        refreshed?.data?.data || refreshed?.order || refreshed?.data || refreshed;
      const paymentStatus = String(
        refreshedOrder?.paymentStatus || refreshedOrder?.payment_status || "",
      ).toLowerCase();
      const orderStatus = getOrderStatus(refreshedOrder);
      navigate(
        paymentStatus === "captured" && !["pending_payment", "payment_failed"].includes(orderStatus)
          ? `/payment/success?orderId=${orderId}`
          : `/payment/failed?orderId=${orderId}&reason=pending_confirmation`,
      );
    } catch (error) {
      if (!checkoutStarted && !['PAYMENT_GATEWAY_FAILED', 'PAYMENT_DISMISSED', 'PAYMENT_CONFIRMATION_PENDING'].includes(error?.code)) {
        notify.error(error?.message || error || 'Unable to open payment. Please try again.');
        return;
      }
      const reason = error?.code === "PAYMENT_GATEWAY_FAILED"
        ? "failed"
        : error?.code === "PAYMENT_DISMISSED"
          ? "dismissed"
          : "pending_confirmation";
      navigate(`/payment/failed?orderId=${orderId}&reason=${reason}`);
    } finally {
      setRetrying(false);
      dispatch(fetchOrderById({ orderId }));
    }
  };

  return { retrying, handleRetryPayment };
}
