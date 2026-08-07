import { Banknote, Building2, CreditCard, Smartphone } from "lucide-react";

import OrderPaymentSummary from "../../orders/components/OrderPaymentSummary";

export default function CheckoutSummary({
  items,
  subtotal,
  total,
  quote,
  quoteLoading = false,
  quoteError = "",
  loading,
  paymentOptions = [],
  selectedPaymentProvider,
  onPaymentProviderChange,
  getPaymentProviderLabel,
}) {
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

  const customerSpecificPlatformFee = Number(
    quoteSummary.customerPlatformFeeAmount ??
      quoteAmounts.customerPlatformFeeAmount ??
      0,
  );
  const quotedPlatformFee = Number(
    quoteSummary.platformFeeAmount ??
      quoteSummary.platform_fee_amount ??
      quoteAmounts.platformFeeAmount ??
      quoteAmounts.platform_fee_amount ??
      0,
  );
  const customerPlatformFee =
    customerSpecificPlatformFee > 0
      ? customerSpecificPlatformFee
      : quotedPlatformFee;
  const customerPlatformFeeTax = Number(
    quoteSummary.customerPlatformFeeTaxAmount ??
      quoteAmounts.customerPlatformFeeTaxAmount ??
      0,
  );
  const hasQuoteShipping =
    quoteSummary.deliveryChargeAmount !== undefined ||
    quoteSummary.shippingFeeAmount !== undefined ||
    quoteAmounts.deliveryChargeAmount !== undefined ||
    quoteAmounts.shippingFeeAmount !== undefined;
  // Only the server quote reflects the seller's actual delivery-charge
  // settings; the client-side `shipping` estimate is derived from the
  // product's own (often stale/unrelated) shipping metadata and must never
  // be shown as if it were the real charge.
  const quoteShipping = hasQuoteShipping
    ? Number(
        quoteSummary.deliveryChargeAmount ??
          quoteSummary.shippingFeeAmount ??
          quoteAmounts.deliveryChargeAmount ??
          quoteAmounts.shippingFeeAmount,
      )
    : 0;
  const quotedPayable = Number(
    quoteSummary.customerPayableAmount ?? quoteAmounts.payableAmount ?? total,
  );


  return (
    <div className="grid gap-3">
      <OrderPaymentSummary
        title="Order Summary"
        variant="checkout"
        items={items}
        subtotal={quoteSubtotal}
        discount={quoteDiscount}
        walletDiscount={quoteWallet}
        shipping={quoteShipping}
        shippingLoading={!hasQuoteShipping}
        customerPlatformFee={customerPlatformFee}
        customerPlatformFeeTax={customerPlatformFeeTax}
        couponDiscount={quoteCouponDiscount}
        customerAmount={quotedPayable}
        currency="INR"
        asNumber={Number}
        paymentMethods={paymentOptions}
        selectedPaymentProvider={selectedPaymentProvider}
        onPaymentProviderChange={onPaymentProviderChange}
        buttonText={quoteLoading ? "Checking delivery..." : buttonLabel}
        loading={loading || quoteLoading}
        disabled={Boolean(quoteError)}
        selectedLabel={selectedLabel}
        onCheckout={() => {}}
      />
    </div>
  );
}
