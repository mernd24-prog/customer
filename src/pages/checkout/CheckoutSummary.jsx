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
  const calculatedPayable = Math.max(
    quoteSubtotal +
      quoteShipping +
      taxPayable +
      codCharge -
      quoteDiscount -
      quoteWallet,
    0,
  );
  const quotePayable =
    quotedPayable > 0 || calculatedPayable <= 0
      ? quotedPayable
      : calculatedPayable;

  return (
    <aside className="min-w-0">
      <div className="sticky top-4 w-full overflow-hidden rounded-lg border border-border bg-white p-5">
        <h2 className="mb-4  text-base font-semibold text-ink">
          Order summary
        </h2>
        <div className="grid divide-y divide-border">
          {items.map((item) => (
            <div
              key={item._lineKey}
              className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] gap-3 py-3 text-sm first:pt-0 last:pb-0"
            >
              <img
                src={item._image}
                alt={item._safeTitle}
                className="h-14 w-14 shrink-0 rounded-[8px] bg-cream object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {item._safeTitle}
                    </p>
                    {item._variantTitle ? (
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {item._variantTitle}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted">
                      Qty: {item.quantity} · {formatMoney(item.price, "INR")}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-right font-medium text-ink">
                    {formatMoney(item._lineTotal, "INR")}
                  </span>
                </div>
                {item._attributes.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item._attributes.map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded-full bg-cream px-2 py-0.5 text-[11px] capitalize text-muted"
                      >
                        {key.replace(/[_-]/g, " ")}: {String(value)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex justify-between text-sm text-muted">
            <span>Items ({items.length})</span>
            <span>{formatMoney(quoteSubtotal, "INR")}</span>
          </div>
          {quoteDiscount > 0 ? (
            <div className="mt-1 flex justify-between text-sm text-emerald-700">
              <span>Discount</span>
              <span>-{formatMoney(quoteDiscount, "INR")}</span>
            </div>
          ) : null}
          <div className="mt-1 flex justify-between text-sm text-muted">
            <span>Shipping</span>
            <span>{formatMoney(quoteShipping, "INR")}</span>
          </div>
          {taxPayable > 0 ? (
            <div className="mt-1 flex justify-between text-sm text-muted">
              <span>GST added</span>
              <span>{formatMoney(taxPayable, "INR")}</span>
            </div>
          ) : null}
          {taxIncluded > 0 ? (
            <div className="mt-1 flex justify-between text-sm text-muted">
              <span>GST included</span>
              <span>{formatMoney(taxIncluded, "INR")}</span>
            </div>
          ) : null}
          {codCharge > 0 ? (
            <div className="mt-1 flex justify-between text-sm text-muted">
              <span>COD charge</span>
              <span>{formatMoney(codCharge, "INR")}</span>
            </div>
          ) : null}
          {quoteWallet > 0 ? (
            <div className="mt-1 flex justify-between text-sm text-emerald-700">
              <span>Wallet</span>
              <span>-{formatMoney(quoteWallet, "INR")}</span>
            </div>
          ) : null}
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-semibold text-ink">
            <span>Payable</span>
            <span>{formatMoney(quotePayable, "INR")}</span>
          </div>
          {quoteLoading ? (
            <p className="mt-2 text-xs text-gray">
              Calculating final order amount...
            </p>
          ) : null}
          {quoteError ? (
            <p className="mt-2 text-xs text-red-600">{quoteError}</p>
          ) : null}
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <h3 className="mb-3  text-sm font-semibold text-ink">
            Payment method
          </h3>

          {paymentOptions.length > 0 ? (
            <div className="grid gap-2">
              {paymentOptions.map((option) => {
                const Icon = PAYMENT_ICONS[option.provider] || CreditCard;
                const isSelected = selectedPaymentProvider === option.provider;
                return (
                  <label
                    key={option.provider}
                    className={`flex cursor-pointer items-center gap-3 rounded-[8px] border px-3 py-3 text-sm transition ${
                      isSelected
                        ? "border-gold bg-cream"
                        : "border-border bg-white"
                    } ${option.enabled ? "" : "cursor-not-allowed opacity-50"}`}
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
                      className="h-4 w-4 accent-gold"
                    />
                    <Icon size={18} className="shrink-0 text-gold" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">
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
          className="mt-5 w-full"
        >
          <CreditCard size={16} /> {buttonLabel}
        </Button>

        <p className="mt-3 text-center text-xs text-gray">
          Selected method: {selectedLabel}
        </p>
      </div>
    </aside>
  );
}
