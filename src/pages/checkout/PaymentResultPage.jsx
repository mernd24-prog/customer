import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import BrandButton from "../../components/ui/BrandButton";
import { fetchOrderById } from "../../features/order/orderSlice";
import { fetchMe } from "../../features/user/userSlice";
import {
  findFetchedOrder,
  getDeliveryDateRange,
  formatOrderDate,
} from "../../utils/orderHelpers";
import { FailedIcon } from "../../components/icons";

export function PaymentResultPage({ failed = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orderState = useSelector((state) => state.order);
  const userState = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");

  const order = findFetchedOrder(orderState, orderId);
  const currentUser = userState.current || userState.data || {};

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

  const failureCard = (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={breadcrumbItems}
        className="mb-6"
      />
      <section className="overflow-hidden rounded-[20px] border border-red-200 bg-white shadow-[0_24px_60px_rgba(27,29,96,0.06)]">
        <div className="bg-[linear-gradient(135deg,#FFF6F6_0%,#FFFFFF_100%)] px-6 py-8 text-center sm:px-10">
          <div className="flex flex-col items-center justify-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
              <FailedIcon className="h-10 w-10" />
            </div>
            <div className="flex flex-col items-center">
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
        <div className="flex justify-center border-t border-red-100 px-6 py-5 sm:px-10">
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
                className="sm:mt-6 xl:mt-2"
              />
            </section>

            <div className="mx-auto flex w-full justify-center">
              <div className="w-full max-w-5xl">
                <section className="flex w-full flex-col overflow-hidden rounded-[16px] border border-[#CE9F2D]/40 bg-[#fffcf6] sm:rounded-[18px] xl:rounded-[20px]">
                  <div className="flex flex-col gap-4 px-4 py-8 text-center min-[375px]:gap-5 min-[375px]:px-5 min-[425px]:gap-6 sm:px-7 sm:py-10 md:px-8 xl:px-[57px]">
                    <div className="flex flex-col items-center justify-center gap-5 min-[375px]:gap-6 sm:gap-7 xl:gap-8">
                      <div className="shrink-0">
                        <img
                          src="/image/png/Group.png"
                          alt="Order Placed Successfully"
                          className="size-24 object-contain"
                        />
                      </div>

                      <div className="flex flex-col items-center">
                        <h1 className="break-words text-h2 font-bold text-[#3E4093]">
                          Order Placed Successfully!
                        </h1>

                        <p className="my-4 max-w-2xl text-small font-medium text-[#2E2E2E]">
                          Thank You for Shopping with Sam Global.
                          <br className="hidden sm:block" />
                          Your order has been received and is being prepared for shipment.
                        </p>

                        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
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

                  <div className="mt-auto flex flex-col gap-2 border-t border-[#CE9F2D]/30 bg-[#FFF4D7] px-4 py-4 text-small font-semibold text-[#1B1D60] min-[375px]:px-5 min-[425px]:gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5 md:px-8">
                    <span className="break-words">
                      Order ID : #{orderId}
                    </span>

                    <span className="break-words">
                      Estimated Delivery : {deliveryLabel}
                    </span>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </ApiState>
      </div>
    </>
  );
}
