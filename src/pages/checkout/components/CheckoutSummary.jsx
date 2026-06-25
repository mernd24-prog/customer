import { Banknote, Building2, CreditCard, Smartphone } from "lucide-react";
import Button from "../../../components/ui/Button";
import { formatMoney } from "../../../utils/ecommerce";
import OrderDetailSectionCard from "../../orders/components/OrderDetailSectionCard";
import OrderPaymentSummary, { SummaryRow } from "../../orders/components/OrderPaymentSummary";

const PAYMENT_ICONS = {
  razorpay: CreditCard,
  cod: Banknote,
  manual_upi: Smartphone,
  manual_bank_transfer: Building2,
};

export default function CheckoutSummary({
  items,
  subtotal,
  shipping,
  total,
  quote,
  quoteLoading = false,
  quoteError = "",
  loading,
  paymentOptions = [],
  paymentOptionsLoading = false,
  selectedPaymentProvider,
  onPaymentProviderChange,
  getPaymentProviderLabel,
}) {
  const sellerDeliveryBreakup = (() => {
    const settlements = quote?.sellerSettlements || [];
    const sellers = settlements.filter(
      (s) => Number(s.sellerDeliveryChargeAmount || s.deliveryChargeAmount || 0) > 0,
    );
    if (sellers.length <= 1) return null;
    return sellers.map((s) => ({
      name: s.sellerName || s.seller_name || `Seller ${String(s.sellerId || "").slice(0, 6)}`,
      amount: Number(s.sellerDeliveryChargeAmount || s.deliveryChargeAmount || 0),
    }));
  })();
  const selectedOption = paymentOptions.find(
    (option) => option.provider === selectedPaymentProvider,
  );
  const selectedLabel =
    selectedOption?.label ||
    getPaymentProviderLabel?.(selectedPaymentProvider) ||
    "Payment";
  const buttonLabel =
    selectedPaymentProvider === "cod"
      ? "Place COD order"
      : selectedPaymentProvider?.startsWith("manual_")
        ? "Place order"
        : "Place order & pay";
  const quoteSummary = quote?.summary || {};
  const quoteAmounts = quote?.quote || {};
  const quotedSubtotal = Number(
    quoteSummary.itemAmount ?? quoteAmounts.subtotalAmount ?? subtotal,
  );
  const quoteSubtotal =
    quotedSubtotal > 0 || subtotal <= 0 ? quotedSubtotal : subtotal;
  const quoteDiscount = Number(
    quoteSummary.discountAmount ?? quoteAmounts.discountAmount ?? 0,
  );
  const quoteWallet = Number(
    quoteSummary.walletDiscountAmount ?? quoteAmounts.walletAppliedAmount ?? 0,
  );
  const quoteCouponDiscount = Number(
    quoteSummary.couponDiscountAmount ??
      quoteSummary.coupon_discount_amount ??
      quoteAmounts.couponDiscountAmount ??
      quoteAmounts.coupon_discount_amount ??
      0,
  );
  const taxIncluded = Number(
    quoteSummary.taxIncludedAmount ?? quoteAmounts.taxIncludedAmount ?? 0,
  );
  const taxPayable = Number(
    quoteSummary.taxPayableAmount ?? quoteAmounts.taxPayableAmount ?? 0,
  );
  const codCharge = Number(
    quoteSummary.codChargeAmount ?? quoteAmounts.codChargeAmount ?? 0,
  );
  const customerPlatformFee = Number(
    quoteSummary.customerPlatformFeeAmount ??
      quoteAmounts.customerPlatformFeeAmount ??
      0,
  );
  const customerPlatformFeeTax = Number(
    quoteSummary.customerPlatformFeeTaxAmount ??
      quoteAmounts.customerPlatformFeeTaxAmount ??
      0,
  );
  const quoteShipping = Number(
    quoteSummary.deliveryChargeAmount ??
    quoteSummary.shippingFeeAmount ??
    quoteAmounts.deliveryChargeAmount ??
    quoteAmounts.shippingFeeAmount ??
    shipping,
  );
  const quotedPayable = Number(
    quoteSummary.customerPayableAmount ?? quoteAmounts.payableAmount ?? total,
  );
  const deliverySellers =
    quote?.deliveryChargeBreakup?.sellers ||
    quote?.deliveryChargeBreakup?.breakup?.sellers ||
    [];
  const deliveryEta = deliverySellers
    .map((seller) => seller.estimatedDeliveryDays)
    .filter(Boolean)[0];
  const deliveryMethod = deliverySellers
    .map((seller) => [seller.shippingPartner, seller.shippingMethod].filter(Boolean).join(" · "))
    .filter(Boolean)[0];

  return (
    <OrderPaymentSummary
      title="Order Summary"
      variant="checkout"
      items={items}
      subtotal={quoteSubtotal}
      discount={quoteDiscount}
      walletDiscount={quoteWallet}
      shipping={quoteShipping}
      customerPlatformFee={customerPlatformFee}
      customerPlatformFeeTax={customerPlatformFeeTax}
      couponDiscount={quoteCouponDiscount}
      customerAmount={quotedPayable}
      currency="INR"
      asNumber={Number}
      paymentMethods={paymentOptions}
      selectedPaymentProvider={selectedPaymentProvider}
      onPaymentProviderChange={onPaymentProviderChange}
      buttonText={buttonLabel}
      loading={loading}
      selectedLabel={selectedLabel}
      onCheckout={() => {}}
    />
  );
}
