import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Seo from "../../../components/ui/Seo";
import ApiState from "../../../components/ui/ApiState";
import Breadcrumbs from "../../common/components/Breadcrumbs";
import {
  GoldOutlineButton,
  PillButton,
} from "../../../components/ui/button/buttonSpecialized";
import { fetchOrderById } from "../../orders/slices/orderSlice";
import { fetchMe } from "../../../features/user/userSlice";

import {
  findFetchedOrder,
  getDeliveryDateRange,
  formatOrderDate,
  getOrderNumber,
} from "../../../utils/orderHelpers";

import {
  decodeRouteToken,
  getOpaqueOrderPath,
  getOpaquePaymentResultPath,
} from "../../../utils/routeTokens";

import PageContainer from "../../../components/ui/layout/PageContainer";
import PaymentStatusCard from "../components/PaymentStatusCard";

export function PaymentResultPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const orderState = useSelector((state) => state.order);
  const userState = useSelector((state) => state.user);

  const [searchParams] = useSearchParams();

  const orderTokenPayload = decodeRouteToken(searchParams.get("o"), "order");
  const orderId = orderTokenPayload?.id || searchParams.get("orderId");
  const reason = searchParams.get("reason") || "";

  useEffect(() => {
    if (!searchParams.get("orderId") || !orderId) return;

    const status = location.pathname.includes("/payment/failed")
      ? "failed"
      : "success";

    navigate(getOpaquePaymentResultPath(status, orderId, reason), {
      replace: true,
    });
  }, [location.pathname, navigate, orderId, reason, searchParams]);

  const order = findFetchedOrder(orderState, orderId);
  const displayOrderRef = getOrderNumber(order) || orderId;
  const currentUser = userState.current || userState.data || {};

  const orderStatus = String(
    order?.status || order?.orderStatus || "",
  ).toLowerCase();

  const paymentStatus = String(
    order?.paymentStatus || order?.payment_status || "",
  ).toLowerCase();

  const isCod =
    String(
      order?.paymentProvider ||
        order?.payment_provider ||
        order?.paymentMethod ||
        "",
    ).toLowerCase() === "cod";

  const isConfirmed =
    Boolean(order) &&
    (isCod ? paymentStatus === "authorized" : paymentStatus === "captured") &&
    !["pending_payment", "payment_failed"].includes(orderStatus);

  const isActuallyFailed =
    paymentStatus === "failed" || orderStatus === "payment_failed";

  const isPending = Boolean(orderId) && !isConfirmed && !isActuallyFailed;

  const deliveryDateRange = getDeliveryDateRange(order || {});

  const deliveryLabel = deliveryDateRange
    ? deliveryDateRange.minDate
      ? `${formatOrderDate(deliveryDateRange.minDate)} – ${formatOrderDate(
          deliveryDateRange.maxDate,
        )}`
      : formatOrderDate(deliveryDateRange.maxDate)
    : "To be confirmed";

  useEffect(() => {
    if (!orderId) return;
    dispatch(fetchOrderById({ orderId }));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId || !isPending) return undefined;

    const interval = window.setInterval(() => {
      dispatch(fetchOrderById({ orderId }));
    }, 3000);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
    }, 30000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [dispatch, isPending, orderId]);

  useEffect(() => {
    if (!currentUser?.id && !currentUser?._id && !userState.loading) {
      dispatch(fetchMe());
    }
  }, [currentUser?._id, currentUser?.id, dispatch, userState.loading]);

  const status = isConfirmed
    ? "success"
    : isActuallyFailed
      ? "failed"
      : "pending";

  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Cart",
      href: "/cart",
    },
    {
      label: "Checkout",
    },
    {
      label:
        status === "success"
          ? "Order Placed"
          : status === "failed"
            ? "Payment Failed"
            : "Payment Pending",
    },
  ];

  if (!orderId) {
    return (
      <>
        <Seo title="Payment Status | Sam Global" />

        <PageContainer>
          <div className="flex min-h-[60vh] w-full items-center justify-center">
            <div className="w-full max-w-md rounded-[var(--customer-radius)] border border-border bg-white p-8 text-center">
              <h1 className="text-2xl font-bold text-ink">
                Order reference missing
              </h1>

              <p className="mt-2 text-sm text-muted">
                Open My Orders to check whether an order was created.
              </p>

              <PillButton onClick={() => navigate("/orders")} className="mt-5">
                View Orders
              </PillButton>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  const title =
    status === "success"
      ? "Order Placed Successfully!"
      : status === "failed"
        ? "Payment Failed"
        : reason === "dismissed"
          ? "Payment Not Completed"
          : "Payment Confirmation Pending";

  const description =
    status === "success" ? (
      <>
        Thank You for Shopping with Sam Global.
        <br className="hidden sm:block" />
        Your order has been received and is being prepared for shipment.
      </>
    ) : status === "failed" ? (
      "Razorpay could not complete this payment. Your order is saved; retry safely from its order page."
    ) : reason === "dismissed" ? (
      "You closed Razorpay before payment completed. Your order is saved and will not be shipped until payment is confirmed."
    ) : (
      "We have not received final payment confirmation yet. This page checks automatically; please do not pay twice."
    );

  const actionButton = (
    <GoldOutlineButton
      shape="circle"
      size="sm"
      rightIcon={<ArrowRight />}
      onClick={() => {
        if (orderId) {
          if (status === "failed" || reason === "dismissed") {
            navigate("/orders");
          } else {
            dispatch(fetchOrderById({ orderId }))
              .unwrap()
              .finally(() => navigate(getOpaqueOrderPath(orderId)));
          }
        } else {
          navigate("/orders");
        }
      }}
      className=" !text-[#17145f] hover:!text-[#17145f]"
    >
      {status === "success"
        ? "View order details"
        : status === "failed" || reason === "dismissed"
          ? "All pending orders"
          : "View order status"}
    </GoldOutlineButton>
  );

  return (
    <>
      <Seo
        title={
          status === "success"
            ? "Payment Successful | Sam Global"
            : status === "failed"
              ? "Payment Failed | Sam Global"
              : "Payment Status | Sam Global"
        }
      />

      <PageContainer>
        <ApiState
          loading={orderState.loading && !order}
          error={orderState.error && !order}
          empty={!order}
        >
          <div className="grid gap-6 xl:gap-12">
            <section>
              <Breadcrumbs
                items={breadcrumbItems}
                className="mb-6 flex flex-wrap items-center gap-[10px] sm:mb-8 sm:gap-[12px] lg:gap-[15px]"
              />
            </section>

            <div className="mx-auto flex w-full justify-center">
              <div className="w-full max-w-3xl">
                <PaymentStatusCard
                  status={status}
                  title={title}
                  description={description}
                  action={actionButton}
                  orderRef={displayOrderRef}
                  deliveryLabel={
                    status === "success" ||
                    (deliveryLabel && deliveryLabel !== "To be confirmed")
                      ? deliveryLabel
                      : null
                  }
                />
              </div>
            </div>
          </div>
        </ApiState>
      </PageContainer>
    </>
  );
}
