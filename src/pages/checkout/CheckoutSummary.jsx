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
  const quoteSubtotal = Number(quoteSummary.itemAmount ?? quoteAmounts.subtotalAmount ?? subtotal);
  const quoteDiscount = Number(quoteSummary.discountAmount ?? quoteAmounts.discountAmount ?? 0);
  const quoteWallet = Number(quoteSummary.walletDiscountAmount ?? quoteAmounts.walletAppliedAmount ?? 0);
  const taxIncluded = Number(quoteSummary.taxIncludedAmount ?? quoteAmounts.taxIncludedAmount ?? 0);
  const taxPayable = Number(quoteSummary.taxPayableAmount ?? quoteAmounts.taxPayableAmount ?? 0);
  const codCharge = Number(quoteSummary.codChargeAmount ?? quoteAmounts.codChargeAmount ?? 0);
  const quotePayable = Number(quoteSummary.customerPayableAmount ?? quoteAmounts.payableAmount ?? total);

  return (
    <aside className="min-w-0">
      <div className="sticky top-4 w-full overflow-hidden rounded-lg border border-[#e7dfd1] bg-white p-5">
        <h2 className="mb-4 font-montserrat text-base font-semibold text-[#2E2E2E]">
          Order summary
        </h2>
        <div className="grid divide-y divide-[#e7dfd1]">
          {items.map((item) => (
            <div
              key={item._lineKey}
              className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] gap-3 py-3 text-sm first:pt-0 last:pb-0"
            >
              <img
                src={item._image}
                alt={item._safeTitle}
                className="h-14 w-14 shrink-0 rounded-[8px] bg-[#FAF6EE] object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#2E2E2E]">
                      {item._safeTitle}
                    </p>
                    {item._variantTitle ? (
                      <p className="mt-0.5 truncate text-xs text-[#787878]">
                        {item._variantTitle}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-[#787878]">
                      Qty: {item.quantity} ·{" "}
                      {formatMoney(item.price, "INR")}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-right font-medium text-[#2E2E2E]">
                    {formatMoney(item._lineTotal, "INR")}
                  </span>
                </div>
                {item._attributes.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item._attributes.map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded-full bg-[#FAF6EE] px-2 py-0.5 text-[11px] capitalize text-[#787878]"
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

        <div className="mt-4 border-t border-[#e7dfd1] pt-4">
          <div className="flex justify-between text-sm text-[#787878]">
            <span>Items ({items.length})</span>
            <span>{formatMoney(quoteSubtotal, "INR")}</span>
          </div>
          {quoteDiscount > 0 ? (
            <div className="mt-1 flex justify-between text-sm text-emerald-700">
              <span>Discount</span>
              <span>-{formatMoney(quoteDiscount, "INR")}</span>
            </div>
          ) : null}
          <div className="mt-1 flex justify-between text-sm text-[#787878]">
            <span>Shipping</span>
            <span>{formatMoney(shipping, "INR")}</span>
          </div>
          {taxPayable > 0 ? (
            <div className="mt-1 flex justify-between text-sm text-[#787878]">
              <span>GST added</span>
              <span>{formatMoney(taxPayable, "INR")}</span>
            </div>
          ) : null}
          {taxIncluded > 0 ? (
            <div className="mt-1 flex justify-between text-sm text-[#787878]">
              <span>GST included</span>
              <span>{formatMoney(taxIncluded, "INR")}</span>
            </div>
          ) : null}
          {codCharge > 0 ? (
            <div className="mt-1 flex justify-between text-sm text-[#787878]">
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
          <div className="mt-4 flex justify-between border-t border-[#e7dfd1] pt-4 font-semibold text-[#2E2E2E]">
            <span>Payable</span>
            <span>{formatMoney(quotePayable, "INR")}</span>
          </div>
          {quoteLoading ? <p className="mt-2 text-xs text-[#A6A6A6]">Calculating final order amount...</p> : null}
          {quoteError ? <p className="mt-2 text-xs text-red-600">{quoteError}</p> : null}
        </div>

        <div className="mt-5 border-t border-[#e7dfd1] pt-4">
          <h3 className="mb-3 font-montserrat text-sm font-semibold text-[#2E2E2E]">
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
                        ? "border-[#CE9F2D] bg-[#FAF6EE]"
                        : "border-[#e7dfd1] bg-white"
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
                      className="h-4 w-4 accent-[#CE9F2D]"
                    />
                    <Icon size={18} className="shrink-0 text-[#CE9F2D]" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-[#2E2E2E]">
                        {option.label ||
                          getPaymentProviderLabel?.(option.provider)}
                      </span>
                      {Number(option.chargeAmount || 0) > 0 ? (
                        <span className="block text-xs text-[#787878]">
                          Charge: {formatMoney(option.chargeAmount, "INR")}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[8px] border border-[#e7dfd1] bg-[#FAF6EE] px-3 py-3 text-sm text-[#787878]">
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

        <p className="mt-3 text-center text-xs text-[#A6A6A6]">
          Selected method: {selectedLabel}
        </p>
      </div>
    </aside>
  );
}
