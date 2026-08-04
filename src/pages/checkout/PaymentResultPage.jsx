import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import Seo from "../../components/common/Seo";
import ApiState from "../../components/common/ApiState";
import Breadcrumbs from "../../components/ecommerce/Breadcrumbs";
import BrandButton from "../../components/ui/BrandButton";
import StatusTimeline from "../../components/common/display/StatusTimeline";
import { Download, MapPin, Phone, Truck } from "lucide-react";

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
import { downloadAuthDocument, getDocumentId } from "../../utils/downloadAuthDocument";
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
  const navigate = useNavigate();
  const orderState = useSelector((state) => state.order);
  const userState = useSelector((state) => state.user);
  const [invoices, setInvoices] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");

  const order = findFetchedOrder(orderState, orderId);
  const currentUser = userState.current || userState.data || {};

  const items = getOrderItems(order) || {};
  const currency = getOrderCurrency(order || {});
  const shippingAddress =
    order?.shipping_address || order?.shippingAddress || {};

  const discount = getOrderAmount(order || {}, "discount");
  const shipping = getOrderAmount(order || {}, "shipping");
  const subtotal = getOrderAmount(order || {}, "subtotal");
  const taxPayable = firstDefined(
    order?.summary?.taxPayableAmount,
    order?.summary?.tax_payable_amount,
    order?.taxBreakup?.taxPayableAmount,
    order?.tax_breakup?.tax_payable_amount,
    0,
  );
  const taxIncluded = firstDefined(
    order?.summary?.taxIncludedAmount,
    order?.summary?.tax_included_amount,
    order?.taxBreakup?.taxIncludedAmount,
    order?.tax_breakup?.tax_included_amount,
    0,
  );
  const customerPlatformFee = firstDefined(
    order?.summary?.customerPlatformFeeAmount,
    order?.summary?.customer_platform_fee_amount,
    order?.customerPlatformFeeAmount,
    order?.customer_platform_fee_amount,
    order?.metadata?.pricingSummary?.customerPlatformFeeAmount,
    0,
  );
  const customerPlatformFeeTax = firstDefined(
    order?.summary?.customerPlatformFeeTaxAmount,
    order?.summary?.customer_platform_fee_tax_amount,
    order?.customerPlatformFeeTaxAmount,
    order?.customer_platform_fee_tax_amount,
    order?.metadata?.pricingSummary?.customerPlatformFeeTaxAmount,
    0,
  );
  const walletDiscount = getOrderAmount(order || {}, "walletDiscount") || 0;
  const customerAmount = getCustomerOrderAmount(order || {});
  const status = firstDefined(order?.status, order?.orderStatus, "confirmed");
  const invoiceDownloadAvailable = status === "fulfilled";
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
    ord?.invoice_url || ord?.invoiceUrl || ord?.relations?.invoice?.url || null;

  const customerInvoices = Array.isArray(invoices?.sellerInvoices)
    ? invoices.sellerInvoices
    : [];
  const orderReceipt = invoices?.orderInvoice || null;
  const customerFeeInvoice = invoices?.customerFeeInvoice || null;
  const orderReceiptId = getDocumentId(orderReceipt);
  const customerFeeInvoiceId = getDocumentId(customerFeeInvoice);
  const invoiceSellerName = (invoice, index) => {
    const metadata = invoice?.metadata || {};
    const seller = metadata.seller || {};
    const organization =
      metadata.organization || invoice?.organizationSnapshot || {};
    return (
      organization.legalBusinessName ||
      organization.storeDisplayName ||
      seller.legalBusinessName ||
      seller.businessName ||
      seller.displayName ||
      `Seller ${index + 1}`
    );
  };
  const invoiceItemCount = (invoice) =>
    (invoice?.metadata?.items || invoice?.metadata?.lineItems || []).length;
  const fallbackInvoiceUrl = getInvoiceUrl(order);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById({ orderId }));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!orderId || !invoiceDownloadAvailable) {
      setInvoices(null);
      return;
    }
    dispatch(fetchMarketplaceInvoices({ orderId }))
      .unwrap()
      .then((result) => setInvoices(result?.data || result))
      .catch(() => setInvoices(null));
  }, [dispatch, invoiceDownloadAvailable, orderId]);

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

  const handleInvoiceDownload = (invoice = customerInvoices[0]) => {
    if (!invoiceDownloadAvailable) {
      notify.error("Invoice will be available after the order is fulfilled.");
      return;
    }
    if (!orderId) {
      notify.error("Order ID is missing, so invoice cannot be downloaded.");
      return;
    }
    const invoiceId = getDocumentId(invoice);
    const invoiceDownloadPath = invoiceId ? endpoints.tax.invoiceDownload(invoiceId) : "";
    if (invoiceDownloadPath) {
      handleDownload(
        invoiceDownloadPath,
        `${invoice.invoice_number || invoice.invoiceNumber || `invoice-${getOrderNumber(order)}`}.pdf`,
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
    { label: "Checkout" },
    { label: failed ? "Payment Failed" : "Order Placed" },
  ];

  const handleTrackOrder = () => {
    navigate(`/orders/${encodeURIComponent(orderId)}/track`);
  };

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
            {invoiceDownloadAvailable && customerInvoices.map((invoice, index) => {
              const invoiceId = getDocumentId(invoice);
              if (!invoiceId) return null;
              const downloadPath = endpoints.tax.invoiceDownload(invoiceId);
              return <BrandButton
                key={invoiceId}
                variant="secondary"
                rounded
                loading={
                  downloadingId ===
                  endpoints.tax.invoiceDownload(
                    orderReceipt.id || orderReceipt._id,
                  )
                }
                onClick={() => handleInvoiceDownload(orderReceipt)}
                icon={<Download size={18} />}
                label="Order Receipt"
                className="h-12 w-full min-w-[220px] text-sm sm:w-auto"
              />;
            })}
            {invoiceDownloadAvailable && orderReceiptId && <BrandButton
              variant="secondary"
              rounded
              loading={downloadingId === endpoints.tax.invoiceDownload(orderReceiptId)}
              onClick={() => handleInvoiceDownload(orderReceipt)}
              icon={<Download size={18} />}
              label="Order receipt"
              className="h-12 w-full min-w-[220px] text-sm sm:w-auto"
            />}
            {invoiceDownloadAvailable && customerFeeInvoiceId && <BrandButton
              variant="secondary"
              rounded
              loading={downloadingId === endpoints.tax.invoiceDownload(customerFeeInvoiceId)}
              onClick={() => handleInvoiceDownload(customerFeeInvoice)}
              icon={<Download size={18} />}
              label="Platform fee invoice"
              className="h-12 w-full min-w-[220px] text-sm sm:w-auto"
            />}
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
                          alt="Order Placed Successfully"
                          className="size-24 object-contain "
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h1 className="break-words text-h2 font-bold  text-[#3E4093]">
                          Order Placed Successfully !
                        </h1>
                        <p className="my-4 max-w-3xl text-small font-medium  text-[#2E2E2E] ">
                          Thank You for Shopping with Sam Global.
                          <br className="hidden sm:block" />
                          Your order has been received and is being prepared for
                          shipment.
                        </p>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                          <BrandButton
                            rounded
                            onClick={handleTrackOrder}
                            icon={<Truck size={18} />}
                            label="Track order"
                            className="h-12 w-full min-w-[180px] text-sm sm:w-auto"
                          />
                          <BrandButton
                            variant="secondary"
                            rounded
                            onClick={() => navigate(`/orders/${encodeURIComponent(orderId)}`)}
                            label="View order details"
                            className="h-12 w-full min-w-[180px] text-sm sm:w-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-2 bg-[#BBBBCB] px-4 py-3  font-semibold text-[#1B1D60] min-[375px]:px-5 text-small min-[425px]:gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-4  md:px-8 ">
                    <span className="break-words">Order ID : # {orderId}</span>
                    <span className="break-words">
                      Estimated Delivery : {deliveryLabel}
                    </span>
                  </div>
                </section>

                {/* <OrderDetailSectionCard
                  bodyClassName="overflow-x-auto d !px-4 py-3 sm:px-8"
                  titleClassName="font-bold leading-[100%]"
                >
                  <div className="w-full ">
                    <OrderProgress
                      noteClassName="text-center font-medium text-[18px] leading-none tracking-normal text-[#6F7480]"
                      status={status}
                    />
                  </div>
                </OrderDetailSectionCard> */}

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

                  <div className="mt-2 rounded-[14px] border border-[#CE9F2D33] bg-[#FFFCF6] p-3">
                    <p className="mb-2 text-sm font-bold text-[#1B1D60]">
                      How your total is calculated
                    </p>
                    <SummaryRow
                      label="Product total"
                      value={formatMoney(firstDefined(subtotal, items.reduce((sum, item) => sum + asNumber(getOrderItemLineTotal(item)), 0)), currency)}
                    />
                    {asNumber(discount) > 0 && (
                      <SummaryRow
                        label="Discount"
                        value={`-${formatMoney(discount, currency)}`}
                        savings
                      />
                    )}
                    <SummaryRow
                      label="Shipping collected for seller"
                      value={
                        asNumber(shipping) === 0
                          ? "FREE"
                          : formatMoney(shipping, currency)
                      }
                    />
                    {asNumber(customerPlatformFee) > 0 && (
                      <SummaryRow
                        label="Platform fee"
                        value={formatMoney(customerPlatformFee, currency)}
                      />
                    )}
                    {asNumber(customerPlatformFeeTax) > 0 && (
                      <SummaryRow
                        label="GST on platform fee"
                        value={formatMoney(customerPlatformFeeTax, currency)}
                      />
                    )}
                    {asNumber(taxPayable) > 0 && (
                      <SummaryRow
                        label="Additional tax"
                        value={formatMoney(taxPayable, currency)}
                      />
                    )}
                    {asNumber(walletDiscount) > 0 && (
                      <SummaryRow
                        label="Wallet used"
                        value={`-${formatMoney(walletDiscount, currency)}`}
                        savings
                      />
                    )}
                    {asNumber(taxIncluded) > 0 && (
                      <p className="mt-1 text-xs font-medium text-[#6F7480]">
                        Product GST included in price: {formatMoney(taxIncluded, currency)}
                      </p>
                    )}
                    <div className="mt-3 border-t border-dashed border-[#04258626] pt-3">
                      <SummaryRow
                        label="Total paid"
                        value={formatMoney(customerAmount, currency)}
                      />
                    </div>
                    <p className="mt-2 text-xs font-medium leading-5 text-[#6F7480]">
                      Shipping is collected by Sam Global on behalf of the seller and settled to the seller.
                    </p>
                  </div>

                  <div className="mt-3 rounded-[14px]">
                    <div className="flex items-start gap-3">
                      <img
                        src="/image/png/Frame1.png"
                        alt=""
                        className="size-14 object-contain "
                      />
                      <div className="min-w-0 flex flex-col gap-2 sm:gap-3">
                        <p className="font-semibold text-[#2E2E2E] text-[14px] min-[375px]:text-[15px] min-[425px]:text-[16px] sm:text-[19px] md:text-[19px] lg:text-[20px]">
                          Expected Delivery
                        </p>
                        <p className="break-words font-bold leading-tight text-[#CE9F2D] small">
                          {deliveryLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <BrandButton
                    rounded
                    onClick={handleTrackOrder}
                    icon={<Truck size={18} />}
                    label="Track order"
                    className="mt-2 h-[54px] w-full !rounded-[10px] px-[15px] text-sm font-semibold"
                  />

                  {invoiceDownloadAvailable && (customerInvoices.length > 0 || orderReceipt || customerFeeInvoice) && (
                    <div className="mt-4 grid gap-[10px]">
                      {customerInvoices.map((invoice, index) => {
                        const invoiceId = getDocumentId(invoice);
                        if (!invoiceId) return null;
                        const downloadPath = endpoints.tax.invoiceDownload(invoiceId);
                        return <BrandButton
                          key={invoiceId}
                          variant="secondary"
                          rounded
                          loading={downloadingId === downloadPath}
                          onClick={() => handleInvoiceDownload(invoice)}
                          icon={<Download size={18} />}
                          label={`Seller invoice · ${invoiceSellerName(invoice, index)} · ${invoiceItemCount(invoice)} item${invoiceItemCount(invoice) === 1 ? "" : "s"}`}
                          className="h-[54px] w-full !rounded-[10px] px-[15px] text-sm font-semibold"
                        />;
                      })}
                      {orderReceiptId && <BrandButton
                        variant="secondary"
                        rounded
                        loading={downloadingId === endpoints.tax.invoiceDownload(orderReceiptId)}
                        onClick={() => handleInvoiceDownload(orderReceipt)}
                        icon={<Download size={18} />}
                        label="Order receipt"
                        className="h-[54px] w-full !rounded-[10px] px-[15px] text-sm font-semibold"
                      />}
                      {customerFeeInvoiceId && <BrandButton
                        variant="secondary"
                        rounded
                        loading={downloadingId === endpoints.tax.invoiceDownload(customerFeeInvoiceId)}
                        onClick={() => handleInvoiceDownload(customerFeeInvoice)}
                        icon={<Download size={18} />}
                        label="Platform fee invoice"
                        className="h-[54px] w-full !rounded-[10px] px-[15px] text-sm font-semibold"
                      />}
                    </div>
                  )}
                </OrderDetailSectionCard>

              </OrderDetailAside>
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
