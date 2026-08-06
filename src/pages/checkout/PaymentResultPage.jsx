import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Phone, MapPin } from "lucide-react";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import BrandButton from "../../components/ui/BrandButton";
import OrderDetailLayout from "../orders/components/OrderDetailLayout";
import OrderDetailSectionCard from "../orders/components/OrderDetailSectionCard";
import { fetchOrderById } from "../../features/order/orderSlice";
import { fetchMe } from "../../features/user/userSlice";
import {
  findFetchedOrder,
  getDeliveryDateRange,
  formatOrderDate,
  getOrderAddressName,
  getOrderAddressValue,
  getOrderPhone,
  hasOrderShippingAddress,
} from "../../utils/orderHelpers";

export function PaymentResultPage({ failed = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orderState = useSelector((state) => state.order);
  const userState = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");

  const order = findFetchedOrder(orderState, orderId);
  const currentUser = userState.current || userState.data || {};
  const orderStatus = String(order?.status || order?.order_status || "").toLowerCase();
  const paymentStatus = String(order?.payment_status || order?.paymentStatus || "").toLowerCase();
  const isPaymentPending =
    orderStatus === "pending_payment" ||
    ["initiated", "authorized"].includes(paymentStatus);
  const isPaymentFailed =
    orderStatus === "payment_failed" || paymentStatus === "failed";

  const shippingAddress =
    order?.shipping_address || order?.shippingAddress || order?.address || {};
  const displayName = getOrderAddressName(shippingAddress);
  const deliveryPhone = getOrderPhone(shippingAddress);

  const deliveryDateRange = getDeliveryDateRange(order || {});
  const deliveryLabel = deliveryDateRange
    ? deliveryDateRange.minDate
      ? `${formatOrderDate(deliveryDateRange.minDate)} – ${formatOrderDate(deliveryDateRange.maxDate)}`
      : formatOrderDate(deliveryDateRange.maxDate)
    : "To be confirmed";

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById({ orderId }));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!currentUser?.id && !currentUser?._id && !userState.loading) {
      dispatch(fetchMe());
    }
  }, [currentUser?._id, currentUser?.id, dispatch, userState.loading]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart" },
    { label: "Checkout" },
    { label: failed ? "Payment Failed" : "Order Placed" },
  ];

  const pendingCard = (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={breadcrumbItems}
        className="mb-6 text-[#2E2E2E]"
        linkClassName="text-[#2E2E2E]"
        currentClassName="text-[#CE9F2D]"
        separatorClassName="text-[#2E2E2E]"
      />
      <section className="overflow-hidden rounded-[20px] border border-amber-200 bg-white shadow-[0_24px_60px_rgba(27,29,96,0.06)]">
        <div className="bg-[linear-gradient(135deg,#FFFAEB_0%,#FFFFFF_100%)] px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[32px] font-bold leading-tight text-[#3E4093]">
                Payment Pending
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#2E2E2E]">
                Your order has been created, but the payment has not been confirmed yet.
                Please complete the payment in the Cashfree checkout window or retry from the orders page.
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-amber-100 px-6 py-5 sm:px-10">
          <BrandButton
            variant="secondary"
            rounded
            onClick={() => navigate("/orders")}
            label="View Orders"
            className="h-12 w-full min-w-[180px] text-sm sm:w-auto"
          />
        </div>
      </section>
    </div>
  );

  const failureCard = (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={breadcrumbItems}
        className="mb-6 text-[#2E2E2E]"
        linkClassName="text-[#2E2E2E]"
        currentClassName="text-[#CE9F2D]"
        separatorClassName="text-[#2E2E2E]"
      />
      <section className="overflow-hidden rounded-[20px] border border-red-200 bg-white shadow-[0_24px_60px_rgba(27,29,96,0.06)]">
        <div className="bg-[linear-gradient(135deg,#FFF6F6_0%,#FFFFFF_100%)] px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500">
              <svg
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[32px] font-bold leading-tight text-[#3E4093]">
                Payment Failed
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#2E2E2E]">
                Your payment could not be processed. Try the payment again from
                your orders page or contact support if the issue persists.
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-red-100 px-6 py-5 sm:px-10">
          <BrandButton
            variant="secondary"
            rounded
            onClick={() => navigate("/orders")}
            label="View Orders"
            className="h-12 w-full min-w-[180px] text-sm sm:w-auto"
          />
        </div>
      </section>
    </div>
  );

  if (failed || !orderId) {
    return (
      <>
        <Seo
          title={
            failed
              ? "Payment Failed | Sam Global"
              : "Payment Successful | Sam Global"
          }
        />
        {failed ? (
          failureCard
        ) : (
          <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center px-4 py-12">
            <div className="w-full rounded-[var(--customer-radius)] border border-border bg-white p-8 text-center">
              <h1 className="text-2xl font-bold text-ink">Order Placed!</h1>
              <p className="mt-2 text-sm text-muted">
                Your Order Has Been Placed Successfully.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  if (order && isPaymentFailed) {
    return (
      <>
        <Seo title="Payment Failed | Sam Global" />
        {failureCard}
      </>
    );
  }

  if (order && isPaymentPending) {
    return (
      <>
        <Seo title="Payment Pending | Sam Global" />
        {pendingCard}
      </>
    );
  }

  return (
    <>
      <Seo
        title={
          failed
            ? "Payment Failed | Sam Global"
            : "Payment Successful | Sam Global"
        }
      />
      <div className="!main-container py-4 min-[375px]:py-10 sm:py-2 lg:py-[3rem]">
        <ApiState
          loading={orderState.loading && !order}
          error={orderState.error}
          empty={!order}
        >
          <div className="grid gap-6 xl:gap-12">
            <section className="grid !sm:mt-10">
              <Breadcrumbs
                items={breadcrumbItems}
                className="flex flex-wrap items-center gap-[10px] sm:mt-6 sm:gap-[12px] lg:gap-[15px] xl:mt-2"
                linkClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#2E2E2E]"
                currentClassName="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[100%] text-[#CE9F2D]"
                separatorClassName="text-[#2E2E2E]"
              />
            </section>

            <OrderDetailLayout>
              <div className="grid gap-3 min-[375px]:gap-4 min-[425px]:gap-5 md:gap-6 xl:gap-12">
                <section className="flex w-full flex-col overflow-hidden rounded-[16px] border border-[#CE9F2D]/40 bg-[#fffcf6] sm:rounded-[18px] xl:rounded-[20px]">
                  <div className="flex flex-col gap-4 px-4 py-5 min-[375px]:gap-5 min-[375px]:px-5 min-[425px]:gap-6 sm:px-7 sm:py-6 md:px-8 xl:mt-5 xl:px-[57px]">
                    <div className="flex flex-col items-center gap-5 text-center min-[375px]:gap-6 sm:gap-7 md:flex-row md:items-center md:text-left xl:gap-10">
                      <div className="shrink-0">
                        <img
                          src="/image/png/Group.png"
                          alt="Order Placed Successfully"
                          className="size-24 object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h1 className="break-words text-h2 font-bold text-[#3E4093]">
                          Order Placed Successfully !
                        </h1>
                        <p className="my-4 max-w-3xl text-small font-medium text-[#2E2E2E]">
                          Thank You for Shopping with Sam Global.
                          <br className="hidden sm:block" />
                          Your order has been received and is being prepared for
                          shipment.
                        </p>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                          <BrandButton
                            variant="secondary"
                            rounded
                            onClick={() =>
                              navigate(`/orders/${encodeURIComponent(orderId)}`)
                            }
                            label="View order details"
                            className="h-12 w-full min-w-[180px] text-sm sm:w-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-2 border-t border-[#CE9F2D]/30 bg-[#FFF4D7] px-4 py-3 text-small font-semibold text-[#1B1D60] min-[375px]:px-5 min-[425px]:gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-4 md:px-8">
                    <span className="break-words">Order ID : # {orderId}</span>
                    <span className="break-words">
                      Estimated Delivery : {deliveryLabel}
                    </span>
                  </div>
                </section>
              </div>
            </OrderDetailLayout>

            {hasOrderShippingAddress(shippingAddress) && (
              <OrderDetailSectionCard
                title="Delivery Address"
                className="w-full rounded-[20px]"
                headerClassName="min-h-[64px] px-4 py-4 min-[375px]:px-5 sm:min-h-[72px] sm:px-6 xl:px-[20px] xl:py-[25px]"
                titleClassName=""
                borderClassName="border-[#CE9F2D66]"
                bodyClassName="grid gap-4 px-4 py-4 sm:px-6"
              >
                <div className="grid gap-3 text-[#2E2E2E]">
                  <div className="flex flex-wrap items-center gap-3">
                    {displayName && (
                      <p className="break-words text-h6 font-bold text-[#2E2E2E]">
                        {displayName}
                      </p>
                    )}
                    <div className="inline-flex h-[28px] items-center justify-center rounded-full bg-[#CE9F2D] px-3 py-1 text-xs font-semibold text-white capitalize">
                      {shippingAddress?.addressType || shippingAddress?.type || "Home"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex items-center gap-2 small font-medium">
                      <Phone className="h-[18px] w-[18px] shrink-0 text-[#CE9F2D]" />
                      <span className="break-words">
                        {deliveryPhone || "Phone unavailable"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 small font-medium">
                    <MapPin className="mt-1 h-[18px] w-[18px] shrink-0 text-[#CE9F2D]" />
                    <span className="break-words leading-relaxed">
                      {[
                        shippingAddress.line1 ||
                          shippingAddress.addressLine1 ||
                          shippingAddress.address_line1,
                        shippingAddress.line2 ||
                          shippingAddress.addressLine2 ||
                          shippingAddress.address_line2,
                        shippingAddress.city,
                        shippingAddress.state,
                        getOrderAddressValue(
                          shippingAddress,
                          "postalCode",
                          "postal_code",
                        ),
                        shippingAddress.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              </OrderDetailSectionCard>
            )}
          </div>
        </ApiState>
      </div>
    </>
  );
}
