import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import BrandButton from "../../components/ui/BrandButton";
import StatusTimeline from "../../components/common/display/StatusTimeline";
import { Download, MapPin, Phone } from "lucide-react";

import OrderDetailLayout from "../orders/components/OrderDetailLayout";
import { OrderDetailAside } from "../orders/components/OrderDetailLayout";
import OrderDetailSectionCard from "../orders/components/OrderDetailSectionCard";
import OrderItemsSection from "../orders/components/OrderItemsSection";
import OrderProgress from "../orders/components/OrderProgress";
import { SummaryRow } from "../orders/components/OrderPaymentSummary";

import { fetchOrderById } from "../../features/order/orderSlice";
import { fetchMarketplaceInvoices } from "../../features/tax/taxSlice";
import { fetchMe } from "../../features/user/userSlice";

import { endpoints } from "../../api/endpoints";
import { downloadAuthDocument } from "../../utils/downloadAuthDocument";
import { formatMoney } from "../../utils/ecommerce";
import { notify } from "../../utils/notify";
import {
  firstDefined,
  findFetchedOrder,
  getOrderItems,
  getOrderCurrency,
  getOrderAmount,
  getCustomerOrderAmount,
  getOrderPhone,
  getOrderAddressValue,
  getOrderAddressName,
  hasOrderShippingAddress,
  getDeliveryDateRange,
  getOrderNumber,
  getItemImage,
  getOrderProductTitle,
  getOrderItemColor,
  getItemLineTotal,
  getOrderItemLineTotal,
  formatOrderDate,
  asNumber,
} from "../../utils/orderHelpers";

export function PaymentResultPage({ failed = false }) {
  const dispatch = useDispatch();
  const orderState = useSelector((state) => state.order);
  const userState = useSelector((state) => state.user);
  const [invoices, setInvoices] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");

  const order = findFetchedOrder(orderState, orderId);
  const currentUser = userState.current || userState.data || {};

  const items = getOrderItems(order || {});
  const currency = getOrderCurrency(order || {});
  const shippingAddress =
    order?.shipping_address || order?.shippingAddress || {};

  const discount = getOrderAmount(order || {}, "discount");
  const shipping = getOrderAmount(order || {}, "shipping");
  const customerAmount = getCustomerOrderAmount(order || {});
  const status = firstDefined(order?.status, order?.orderStatus, "confirmed");
  const deliveryDateRange = getDeliveryDateRange(order || {});
  const deliveryLabel = deliveryDateRange
    ? deliveryDateRange.minDate
      ? `${formatOrderDate(deliveryDateRange.minDate)} – ${formatOrderDate(deliveryDateRange.maxDate)}`
      : formatOrderDate(deliveryDateRange.maxDate)
    : "To be confirmed";
  const orderCustomer =
    order?.customer ||
    order?.user ||
    order?.buyer ||
    order?.relations?.customer ||
    order?.relations?.user ||
    order?.relations?.buyer ||
    {};

  const displayName =
    orderCustomer.profile?.firstName + " " + orderCustomer.profile?.lastName;

  const deliveryPhone =
    getOrderPhone(shippingAddress) ||
    getOrderPhone(orderCustomer) ||
    getOrderPhone(currentUser);

  const getInvoiceUrl = (ord) =>
    ord?.invoice_url ||
    ord?.invoiceUrl ||
    ord?.relations?.invoice?.url ||
    null;

  const orderInvoiceId =
    invoices?.orderInvoice?.id || invoices?.orderInvoice?._id;
  const invoiceDownloadPath = orderInvoiceId
    ? endpoints.tax.invoiceDownload(orderInvoiceId)
    : "";
  const fallbackInvoiceUrl = getInvoiceUrl(order);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById({ orderId }));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId) {
      setInvoices(null);
      return;
    }
    dispatch(fetchMarketplaceInvoices({ orderId }))
      .unwrap()
      .then((result) => setInvoices(result?.data || result))
      .catch(() => setInvoices(null));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!currentUser?.id && !currentUser?._id && !userState.loading) {
      dispatch(fetchMe());
    }
  }, [currentUser?._id, currentUser?.id, dispatch, userState.loading]);

  const handleDownload = async (apiPath, filename) => {
    setDownloadingId(apiPath);
    try {
      await downloadAuthDocument(apiPath, filename);
    } catch {
      notify.error("Invoice download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleInvoiceDownload = () => {
    if (!orderId) {
      notify.error("Order ID is missing, so invoice cannot be downloaded.");
      return;
    }
    if (invoiceDownloadPath) {
      handleDownload(
        invoiceDownloadPath,
        `invoice-${getOrderNumber(order)}.pdf`,
      );
      return;
    }
    if (fallbackInvoiceUrl) {
      window.open(fallbackInvoiceUrl, "_blank", "noopener,noreferrer");
      return;
    }
    notify.error("Invoice is not available yet.");
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart" },
    { label: "Checkout", href: "/checkout" },
    { label: failed ? "Payment Failed" : "Order Placed" },
  ];

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
          <div className="flex flex-col gap-3 sm:flex-row">
            <BrandButton
              variant="secondary"
              rounded
              loading={downloadingId === invoiceDownloadPath}
              onClick={handleInvoiceDownload}
              icon={<Download size={18} />}
              label="Download Invoice"
              className="h-12 w-full min-w-[220px] text-sm sm:w-auto"
            />
          </div>
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
                Your order has been placed successfully.
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
          <div className="grid xl:gap-12 gap-6">
            <section className="grid !sm:mt-10">
              <Breadcrumbs
                items={breadcrumbItems}
                className="sm:mt-6 xl:mt-2 flex flex-wrap items-center gap-[10px] sm:gap-[12px] lg:gap-[15px]"
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
                          alt="Order placed successfully"
                          className="h-20 w-20 object-contain min-[375px]:h-24 min-[375px]:w-24 min-[425px]:h-24 min-[425px]:w-24 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 xl:h-[160px] xl:w-[157px]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h1 className="break-words text-[18px] font-bold leading-[1.25] text-[#3E4093] min-[375px]:text-[20px] min-[425px]:text-[22px] sm:text-[24px] sm:leading-[1.25] md:text-[36px] xl:text-[36px] xl:leading-[2.1]">
                          Order Placed Successfully !
                        </h1>
                        <p className="mt-2 max-w-3xl text-[13px] font-medium leading-[21px] text-[#2E2E2E] min-[375px]:text-sm min-[375px]:leading-6 min-[425px]:text-[15px] sm:text-[15px] sm:leading-7 xl:text-[18px] xl:leading-[30px]">
                          Thank you for shopping with Sam Global.
                          <br className="hidden sm:block" />
                          Your order has been received and is being prepared for
                          shipment.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-2 bg-[#BBBBCB] px-4 py-3 text-[13px] font-semibold text-[#1B1D60] min-[375px]:px-5 min-[375px]:text-sm min-[425px]:gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-4 sm:text-[12px] md:px-8 xl:text-[20px]">
                    <span className="break-words">Order ID : # {orderId}</span>
                    <span className="break-words">
                      Estimated Delivery : {deliveryLabel}
                    </span>
                  </div>
                </section>

                <OrderDetailSectionCard
                  bodyClassName="overflow-x-auto !px-4 py-3 sm:px-8"
                  titleClassName="font-bold leading-[100%]"
                >
                  <div className="w-full">
                    <OrderProgress
                      noteClassName="text-center font-medium text-[18px] leading-none tracking-normal text-[#6F7480]"
                      status={status}
                    />
                  </div>
                </OrderDetailSectionCard>

                <div className="w-full">
                  <OrderItemsSection
                    items={items}
                    orderId={orderId}
                    orderStatus={status}
                    title={null}
                    borderClassName="border-[#CE9F2D]"
                    bodyClassName="grid divide-y divide-[#E9E9EF] p-4 min-[375px]:p-5 min-[425px]:p-6 lg:p-[25px]"
                    itemClassName="py-3 first:pt-0 last:pb-0 min-[375px]:py-4 lg:py-5 lg:gap-6"
                    currency={currency}
                    getItemImage={getItemImage}
                    getProductTitle={getOrderProductTitle}
                    getOrderItemColor={getOrderItemColor}
                    getItemLineTotal={getItemLineTotal}
                    formatMoney={formatMoney}
                    className="md:text-[18px] font-bold"
                  />
                </div>
              </div>

              <OrderDetailAside className="w-full gap-4 min-[425px]:gap-5 xl:sticky xl:top-28 xl:self-start xl:gap-6">
                <OrderDetailSectionCard
                  title="Order Summary"
                  className="w-full rounded-[20px]"
                  headerClassName="min-h-[64px] px-4 py-4 min-[375px]:px-5 sm:min-h-[72px] sm:px-6 xl:px-[20px] xl:py-[25px]"
                  titleClassName="text-[10px] leading-tight min-[375px]:text-[18px] sm:text-[22px] xl:text-[24px]"
                  borderClassName="border-[#CE9F2D66]"
                  bodyClassName="grid gap-2 px-4 py-4 sm:px-6"
                >
                  <SummaryRow
                    label={`${items.length.toString().padStart(2, "0")} Item(s)`}
                    value=""
                  />
                  {items.map((item, index) => (
                    <SummaryRow
                      key={`${getOrderProductTitle(item)}-${index}`}
                      label={`${String(item.quantity || 1)} x ${getOrderProductTitle(item)}`}
                      value={formatMoney(getOrderItemLineTotal(item), currency)}
                    />
                  ))}
                  {asNumber(discount) > 0 && (
                    <SummaryRow
                      label="Discount"
                      value={`-${formatMoney(discount, currency)}`}
                      savings
                    />
                  )}
                  <SummaryRow
                    label="Delivery"
                    value={
                      asNumber(shipping) === 0
                        ? "FREE"
                        : formatMoney(shipping, currency)
                    }
                  />
                  <div className="border-t border-dashed border-[#04258626] pt-3">
                    <SummaryRow
                      label="Total Payable"
                      value={formatMoney(customerAmount, currency)}
                    />
                  </div>

                  <div className="mt-3 rounded-[14px]">
                    <div className="flex items-start gap-3">
                      <img
                        src="/image/png/Frame1.png"
                        alt=""
                        className="h-[50px] w-[50px] object-contain min-[375px]:h-[50px] min-[375px]:w-[50px] min-[425px]:h-[48px] min-[425px]:w-[48px] sm:h-[56px] sm:w-[56px] md:h-[64px] md:w-[64px] lg:h-[70px] lg:w-[70px]"
                      />
                      <div className="min-w-0 flex flex-col gap-2 sm:gap-3">
                        <p className="font-semibold text-[#2E2E2E] text-[14px] min-[375px]:text-[15px] min-[425px]:text-[16px] sm:text-[19px] md:text-[19px] lg:text-[20px]">
                          Expected Delivery
                        </p>
                        <p className="break-words font-bold leading-tight text-[#CE9F2D] text-[16px] min-[375px]:text-[18px] min-[425px]:text-[20px] sm:text-[22px] md:text-[24px] lg:text-[26px] xl:text-[30px]">
                          {deliveryLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-[10px]">
                    <BrandButton
                      variant="secondary"
                      rounded
                      loading={downloadingId === invoiceDownloadPath}
                      onClick={handleInvoiceDownload}
                      icon={<Download size={18} />}
                      label="Download invoice"
                      className="h-[54px] w-full !rounded-[10px] px-[15px] text-sm font-semibold"
                    />
                  </div>
                </OrderDetailSectionCard>

                {hasOrderShippingAddress(shippingAddress) && (
                  <OrderDetailSectionCard
                    title="Delivery Address"
                    className="w-full rounded-[20px]"
                    headerClassName="min-h-[64px] px-4 py-4 min-[375px]:px-5 sm:min-h-[72px] sm:px-6 xl:px-[20px] xl:py-[25px]"
                    titleClassName="text-[18px] leading-tight min-[375px]:text-[20px] sm:text-[22px] xl:text-[24px]"
                    borderClassName="border-[#CE9F2D66]"
                    bodyClassName="grid gap-4 px-4 py-4 sm:px-6"
                  >
                    <div className="inline-flex h-[30px] w-[65px] items-center justify-center rounded-full bg-[#CE9F2D] px-2 py-1 text-[14px] font-semibold text-white sm:h-[37px] sm:w-[81px] sm:px-3 sm:text-[18px]">
                      Home
                    </div>
                    <div className="grid gap-3 text-[#2E2E2E]">
                      {displayName && (
                        <p className="break-words text-[18px] font-bold leading-tight text-[#2E2E2E] sm:text-[26px]">
                          {displayName}
                        </p>
                      )}
                      <div className="flex items-start gap-2 text-[13px] font-medium leading-6 min-[375px]:text-[16px] sm:text-[20px]">
                        <Phone className="mt-1 h-[18px] w-[18px] shrink-0 text-[#CE9F2D]" />
                        <span className="break-words">
                          {deliveryPhone || "Phone unavailable"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-[13px] font-medium leading-6 min-[375px]:text-[16px] sm:text-[20px]">
                        <MapPin className="mt-1 h-[18px] w-[18px] shrink-0 text-[#CE9F2D]" />
                        <span className="break-words">
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
              </OrderDetailAside>
            </OrderDetailLayout>
          </div>
        </ApiState>
      </div>
    </>
  );
}
