import { Banknote, Building2, CreditCard, Smartphone } from "lucide-react";

import OrderPaymentSummary, {
  SummaryRow,
} from "../../orders/components/OrderPaymentSummary";

const PAYMENT_ICONS = {
  razorpay: CreditCard,
  cod: Banknote,
  manual_upi: Smartphone,
  manual_bank_transfer: Building2,
};

export default function CheckoutSummary({
  items,
  subtotal,
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
  deliveryPincode = "",
}) {
  const quoteErrorMessage =
    typeof quoteError === "string"
      ? quoteError
      : quoteError?.message || "";
  const isDeliveryBlocked = Boolean(
    quoteErrorMessage &&
      /(not deliverable|delivery is not available|delivery area|pincode|serviceable)/i.test(
        quoteErrorMessage,
      ),
  );
  const blockedItemName =
    quoteErrorMessage.match(/^(.+?)\s+is not deliverable/i)?.[1] || "";
  const isBlockedItem = (item = {}) => {
    if (!isDeliveryBlocked || !blockedItemName) return false;
    const title = String(item._safeTitle || item.title || item.productTitle || "");
    return title && title.toLowerCase().includes(blockedItemName.toLowerCase());
  };
  const sellerDeliveryBreakup = (() => {
    const settlements = quote?.sellerSettlements || [];
    const sellers = settlements.filter(
      (s) =>
        Number(s.sellerDeliveryChargeAmount || s.deliveryChargeAmount || 0) > 0,
    );
    if (sellers.length <= 1) return null;
    return sellers.map((s) => ({
      name:
        s.sellerName ||
        s.seller_name ||
        `Seller ${String(s.sellerId || "").slice(0, 6)}`,
      amount: Number(
        s.sellerDeliveryChargeAmount || s.deliveryChargeAmount || 0,
      ),
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
  const deliverySellers =
    quote?.deliveryChargeBreakup?.sellers ||
    quote?.deliveryChargeBreakup?.breakup?.sellers ||
    [];
  const deliveryEta = deliverySellers
    .map((seller) => seller.estimatedDeliveryDays)
    .filter(Boolean)[0];
  const deliveryMethod = deliverySellers
    .map((seller) =>
      [seller.shippingPartner, seller.shippingMethod]
        .filter(Boolean)
        .join(" · "),
    )
    .filter(Boolean)[0];

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
      {quoteError && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="font-bold">
            {isDeliveryBlocked ? "Some item(s) cannot be delivered" : "Checkout cannot continue"}
          </div>
          <div className="mt-1 font-medium">
            {quoteErrorMessage || "Delivery is not available for the selected address."}
          </div>
          {deliveryPincode ? (
            <div className="mt-1 text-xs text-red-600">
              Selected pincode: <span className="font-semibold">{deliveryPincode}</span>
            </div>
          ) : null}
          {isDeliveryBlocked && (
            <div className="mt-2 rounded-md bg-white/70 px-3 py-2 text-xs text-red-700">
              Please change the delivery address or remove the undeliverable item before placing the order.
            </div>
          )}
        </div>
      )}
      {isDeliveryBlocked && blockedItemName ? (
        <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <div className="font-bold">Blocked item</div>
          <div className="mt-1">
            {items.filter(isBlockedItem).map((item) => item._safeTitle || item.title).join(", ") || blockedItemName}
          </div>
        </div>
      ) : null}
    </div>
  );
}
