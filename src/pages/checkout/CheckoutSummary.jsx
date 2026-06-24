import { Banknote, Building2, CreditCard, Smartphone } from "lucide-react";
import Button from "../../components/ui/Button";
import { formatMoney } from "../../utils/ecommerce";

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

  const SummaryRow = ({
    label,
    value,
    valueClassName = "font-bold text-navy",
    className = "flex justify-between py-2 text-sm text-ink",
  }) => (
    <div className={className}>
      <span>{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );

  return (
    <aside className="min-w-0 d">
      <div className="sticky top-4 w-full overflow-hidden rounded-[8px] border border-border bg-white">
        <div className="bg-cream-strong px-4 py-3 sm:px-5">
          <h2 className="text-base font-bold text-ink">Order Summary</h2>
        </div>

        <div className="px-4 py-4 sm:px-5">
          <p className="mb-2 text-sm font-bold text-ink">
            {String(items.length).padStart(2, "0")} Item(s)
          </p>
          <div className="grid divide-y divide-border">
            {items.map((item) => (
              <div
                key={item._lineKey}
                className="flex min-w-0 items-center justify-between gap-3 py-3 text-xs first:pt-0 last:pb-0"
              >
                <span className="min-w-0 truncate font-semibold text-ink">
                  {item.quantity} x {item._safeTitle}
                </span>
                <span className="shrink-0 font-bold text-navy">
                  {formatMoney(item._lineTotal, "INR")}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3">
            <SummaryRow
              label="Item Total"
              value={formatMoney(quoteSubtotal, "INR")}
            />

            {quoteDiscount > 0 ? (
              <SummaryRow
                label="Discount"
                value={`-${formatMoney(quoteDiscount, "INR")}`}
              />
            ) : null}
            <SummaryRow
              label="Delivery"
              value={
                quoteShipping > 0
                  ? formatMoney(quoteShipping, "INR")
                  : "FREE"
              }
            />
            {sellerDeliveryBreakup && (
              <div className="ml-3 grid gap-0.5 pb-1">
                {sellerDeliveryBreakup.map((s) => (
                  <div key={s.name} className="flex justify-between text-xs text-muted">
                    <span className="truncate">{s.name}</span>
                    <span>{formatMoney(s.amount, "INR")}</span>
                  </div>
                ))}
              </div>
            )}
            {taxPayable > 0 ? (
              <SummaryRow
                label="GST added"
                value={formatMoney(taxPayable, "INR")}
              />
            ) : null}
            {taxIncluded > 0 ? (
              <SummaryRow
                label="GST included"
                value={formatMoney(taxIncluded, "INR")}
              />
            ) : null}
            {codCharge > 0 ? (
              <SummaryRow
                label="COD charge"
                value={formatMoney(codCharge, "INR")}
              />
            ) : null}
            {quoteWallet > 0 ? (
               <SummaryRow
               className="flex justify-between py-2 text-sm text-emerald-700"
               valueClassName="font-bold"
                label="Wallet Discount"
                value={formatMoney(quoteWallet, "INR")}
              />
            ) : null}
           
             <SummaryRow
               className="mt-2 flex justify-between border-t border-dashed border-border pt-4 font-bold text-ink"
               valueClassName="text-lg text-navy"
                label="Total Payable"
                value={formatMoney(quotedPayable, "INR")}
              />
            {quoteLoading ? (
              <p className="mt-2 text-xs text-gray">
                Calculating final order amount...
              </p>
            ) : null}
            {quoteError ? (
              <p className="mt-2 text-xs text-red-600">{quoteError}</p>
            ) : null}
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-base font-bold text-ink">
              Payment method
            </h3>

            {paymentOptions.length > 0 ? (
              <div className="grid gap-2">
                {paymentOptions.map((option) => {
                  const Icon = PAYMENT_ICONS[option.provider] || CreditCard;
                  const isSelected = selectedPaymentProvider === option.provider;
                  return (
                    <div key={option.provider}>
                      <label
                        className={`flex cursor-pointer items-center gap-2 text-sm text-ink transition ${option.enabled ? "" : "cursor-not-allowed opacity-50"}`}
                      >
                        <input
                          type="radio"
                          name="paymentProvider"
                          value={option.provider}
                          checked={isSelected}
                          disabled={!option.enabled}
                          onChange={(event) =>
                            onPaymentProviderChange?.(event.target.value)
                          }
                          className="h-4 w-4 accent-navy"
                        />
                        <Icon size={14} className="shrink-0 text-muted" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">
                            {option.label ||
                              getPaymentProviderLabel?.(option.provider)}
                          </span>
                          {Number(option.chargeAmount || 0) > 0 ? (
                            <span className="block text-xs text-muted">
                              Charge: {formatMoney(option.chargeAmount, "INR")}
                            </span>
                          ) : null}
                        </span>
                      </label>
                      {!option.enabled && option.disabledReason && (
                        <p className="mt-1 ml-6 text-xs text-red-500">
                          {option.disabledReason}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[8px] border border-border bg-cream px-3 py-3 text-sm text-muted">
                {paymentOptionsLoading
                  ? "Loading payment methods..."
                  : "Payment methods are not available right now."}
              </div>
            )}
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={!selectedPaymentProvider || paymentOptionsLoading}
            className="mt-5 w-full rounded-[6px]"
          >
            {buttonLabel}
          </Button>

          <p className="mt-3 text-center text-xs text-gray">
            Selected method: {selectedLabel}
          </p>
        </div>
      </div>
    </aside>
  );
}
