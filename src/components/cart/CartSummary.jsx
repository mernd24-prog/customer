import { ShieldCheck } from "lucide-react";
import Button from "../ui/BrandButton";
import {
  formatMoney,
  calcMRPSubtotal,
  calcSellingSubtotal,
  calcShippingTotal,
  calcTotalSavings,
  toNum,
} from "../../utils/ecommerce/money";

function SummaryRow({ label, value, highlight, muted, savings, large }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${large ? "pt-1" : ""}`}>
      <span className={`text-xs sm:text-sm ${muted ? "text-[var(--customer-muted)]" : large ? "font-bold text-[var(--customer-ink)]" : "text-[var(--customer-ink)]"}`}>
        {label}
      </span>
      <span className={`font-semibold ${large ? "text-sm font-bold text-[var(--customer-navy)] sm:text-base md:text-lg" : savings ? "text-emerald-600" : highlight ? "text-emerald-600" : "text-[var(--customer-ink)]"} text-xs sm:text-sm`}>
        {value}
      </span>
    </div>
  );
}

export default function CartSummary({
  items = [],
  shippingLabel = "Shipping",
  shippingLocation = "",
  protectionText = "Purchase protected by",
  protectionLinkText = "Money Back Guarantee",
  protectionLink = "/",
  buttonText = "Go to checkout",
  showInfoIcon = true,
  onCheckout,
  // Optional overrides from checkout quote
  couponDiscount = 0,
  walletDiscount = 0,
  taxIncluded = 0,
  taxPayable = 0,
  currency = "INR",
}) {
  const mrpSubtotal = calcMRPSubtotal(items);
  const sellingSubtotal = calcSellingSubtotal(items);
  const shippingTotal = calcShippingTotal(items);
  const productSavings = calcTotalSavings(items);
  const extraCoupon = toNum(couponDiscount);
  const extraWallet = toNum(walletDiscount);
  const extraTaxPayable = toNum(taxPayable);
  const totalBeforeTax = sellingSubtotal + shippingTotal - extraCoupon - extraWallet;
  const totalPayable = Math.max(0, totalBeforeTax + extraTaxPayable);
  const totalSavings = productSavings + extraCoupon + extraWallet;
  const fmt = (n) => formatMoney(n, currency);
  const hasMRP = mrpSubtotal > sellingSubtotal;
  const hasDiscount = totalSavings > 0;
  const shippingFree = shippingTotal === 0;

  return (
    <div
      className="customer-card sticky top-5 h-fit w-full p-4 sm:p-5 md:p-6"
      style={{ "--customer-card-bg": "var(--customer-cream)" }}
    >
      <h2 className="text-lg font-bold leading-tight text-[var(--customer-navy)] sm:text-xl">
        Order summary
      </h2>

      <div className="mt-5 space-y-3 sm:mt-6">
        {/* MRP Subtotal */}
        {hasMRP && (
          <SummaryRow
            label={`MRP (${items.length} ${items.length === 1 ? "item" : "items"})`}
            value={fmt(mrpSubtotal)}
            muted
          />
        )}

        {/* Selling price subtotal — only show separately if MRP shown */}
        {hasMRP ? (
          <SummaryRow
            label="Price"
            value={fmt(sellingSubtotal)}
            muted
          />
        ) : (
          <SummaryRow
            label={`Items (${items.length})`}
            value={fmt(sellingSubtotal)}
            muted
          />
        )}

        {/* Product discount */}
        {productSavings > 0 && (
          <SummaryRow
            label="Product discount"
            value={`-${fmt(productSavings)}`}
            savings
          />
        )}

        {/* Coupon discount */}
        {extraCoupon > 0 && (
          <SummaryRow
            label="Coupon discount"
            value={`-${fmt(extraCoupon)}`}
            savings
          />
        )}

        {/* Wallet discount */}
        {extraWallet > 0 && (
          <SummaryRow
            label="Wallet applied"
            value={`-${fmt(extraWallet)}`}
            savings
          />
        )}

        {/* Shipping */}
        <SummaryRow
          label={`${shippingLabel}${shippingLocation ? ` (${shippingLocation})` : ""}`}
          value={shippingFree ? <span className="font-semibold text-emerald-600">FREE</span> : fmt(shippingTotal)}
          muted
        />

        {/* Tax added (if any) */}
        {extraTaxPayable > 0 && (
          <SummaryRow
            label="GST (additional)"
            value={`+${fmt(extraTaxPayable)}`}
            muted
          />
        )}

        {/* Tax included notice */}
        {taxIncluded > 0 && (
          <p className="text-xs text-[var(--customer-muted)]">
            Inclusive of ₹{formatMoney(taxIncluded, currency)} GST
          </p>
        )}
      </div>

      <div className="my-5 border-t border-[var(--customer-border)] sm:my-6" />

      {/* Total */}
      <SummaryRow
        label="Total"
        value={fmt(totalPayable)}
        large
      />

      {/* Savings banner */}
      {hasDiscount && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
          <span className="text-xs font-semibold text-emerald-700">
            You save
          </span>
          <span className="text-xs font-bold text-emerald-700">
            {fmt(totalSavings)}
          </span>
        </div>
      )}

      <Button
        variant="primary"
        rounded
        onClick={onCheckout}
        label={buttonText}
        className="mt-5 sm:mt-6 w-full h-12 text-sm font-semibold"
      />

      <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--customer-muted)] sm:text-sm">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[var(--customer-gold-dark)]" />
        <span>
          {protectionText}{" "}
          <a
            href={protectionLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--customer-gold-dark)] underline underline-offset-2 transition-all duration-300 ease-in-out hover:text-[var(--customer-navy)]"
          >
            {protectionLinkText}
          </a>
        </span>
      </div>
    </div>
  );
}
