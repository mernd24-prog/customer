import { BadgeCheck } from "lucide-react";
import {
  formatMoney,
  calcMRPSubtotal,
  calcSellingSubtotal,
  calcShippingTotal,
  calcTotalSavings,
  toNum,
} from "../../utils/ecommerce/money";


function SummaryRow({ label, value, muted, savings, large }) {
  return (
    <div className="flex items-center justify-between gap-3 sm:gap-6">
      <span
        className={`font-dm-sans text-[14px] leading-6 tracking-normal min-[375px]:text-[15px] sm:text-[18px] sm:leading-[28px] ${
          muted
            ? "font-medium text-[#2E2E2E]"
            : large
              ? "font-bold text-[#2E2E2E]"
              : "font-medium text-[#2E2E2E]"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-right font-dm-sans text-[15px] font-bold leading-6 tracking-normal min-[375px]:text-[16px] sm:text-[18px] sm:leading-[28px] ${
          large
            ? "text-[22px] leading-7 text-[#1B1D60] sm:text-[26px] sm:leading-[32px]"
            : savings
              ? "text-[#008425]"
              : "text-[#1B1D60]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function CartSummary({
  items = [],
  shippingLabel = "Shipping",
  shippingLocation = "",
  buttonText = "Proceed To Checkout",
  onCheckout,
  couponDiscount = 0,
  walletDiscount = 0,
  taxIncluded = 0,
  taxPayable = 0,
  currency = "INR",
}) {
  // Treat the incoming cart lines as the single source of truth for selection.
  // CartPage already passes only selected lines, so all pricing must derive from this array.
  const selectedItems = Array.isArray(items) ? items : [];
  const selectedItemCount = selectedItems.length;
  const hasSelectedItems = selectedItemCount > 0;

  // Clamp every computed amount so deselection never leaves stale or negative totals behind.
  const mrpSubtotal = Math.max(0, calcMRPSubtotal(selectedItems));
  const sellingSubtotal = Math.max(0, calcSellingSubtotal(selectedItems));
  const shippingTotal = Math.max(0, calcShippingTotal(selectedItems));
  const productSavings = Math.max(0, calcTotalSavings(selectedItems));

  // Coupon, wallet and tax values should only apply when at least one line is selected.
  const extraCoupon = hasSelectedItems ? Math.max(0, toNum(couponDiscount)) : 0;
  const extraWallet = hasSelectedItems ? Math.max(0, toNum(walletDiscount)) : 0;
  const extraTaxPayable = hasSelectedItems ? Math.max(0, toNum(taxPayable)) : 0;
  const extraTaxIncluded = hasSelectedItems ? Math.max(0, toNum(taxIncluded)) : 0;

  const totalBeforeTax =
    Math.max(0, sellingSubtotal + shippingTotal - extraCoupon - extraWallet);
  const totalPayable = Math.max(0, totalBeforeTax + extraTaxPayable);
  const totalSavings = Math.max(0, productSavings + extraCoupon + extraWallet);
  const fmt = (n) => formatMoney(n, currency);
  const hasMRP = mrpSubtotal > sellingSubtotal;
  const hasDiscount = totalSavings > 0;
  const shippingFree = shippingTotal === 0;
  const resolvedButtonText = hasSelectedItems
    ? buttonText
    : "Select item to checkout";
  const summaryRows = [];

  if (hasMRP || selectedItemCount === 0) {
    summaryRows.push({
      key: "mrp",
      label: `MRP (${selectedItemCount} ${selectedItemCount === 1 ? "item" : "items"})`,
      value: fmt(mrpSubtotal),
      muted: true,
    });
  }

  summaryRows.push({
    key: "price",
    label:
      hasMRP || selectedItemCount === 0
        ? "Price"
        : `Items (${selectedItemCount})`,
    value: fmt(sellingSubtotal),
    muted: true,
  });

  if (productSavings > 0) {
    summaryRows.push({
      key: "product-discount",
      label: "Product discount",
      value: `-${fmt(productSavings)}`,
      savings: true,
    });
  }

  if (extraCoupon > 0) {
    summaryRows.push({
      key: "coupon-discount",
      label: "Coupon discount",
      value: `-${fmt(extraCoupon)}`,
      savings: true,
    });
  }

  if (extraWallet > 0) {
    summaryRows.push({
      key: "wallet-applied",
      label: "Wallet applied",
      value: `-${fmt(extraWallet)}`,
      savings: true,
    });
  }

  summaryRows.push({
    key: "shipping",
    label: `${shippingLabel}${shippingLocation ? ` (${shippingLocation})` : ""}`,
    value: hasSelectedItems && shippingFree ? "FREE" : fmt(shippingTotal),
    muted: true,
  });

  if (extraTaxPayable > 0) {
    summaryRows.push({
      key: "gst-additional",
      label: "GST (additional)",
      value: `+${fmt(extraTaxPayable)}`,
      muted: true,
    });
  }

  return (
    <aside className="w-full max-w-full lg:sticky lg:top-[calc(var(--customer-header-height,0px)+24px)] lg:h-fit lg:self-start overflow-hidden rounded-[20px] border border-[#F0E6D2] bg-[#FFFDF8]">
      <div className="bg-[#F8EFD8] px-4 py-5 min-[375px]:px-5 sm:px-6 sm:py-6 md:px-8">
        <h2 className="text-dm-sans text-[21px] font-bold leading-none tracking-normal text-[#2E2E2E] sm:text-[24px]">
          Order Summary
        </h2>
      </div>

      <div className="px-4 py-5 min-[375px]:px-5 sm:px-6 sm:py-7 md:px-8">
        <div className="space-y-4 sm:space-y-6">
          {summaryRows.map((row, index) => (
            <div
              key={row.key}
              className={index > 0 ? "border-t border-[#A9B4D8] pt-4 sm:pt-6" : ""}
            >
              <SummaryRow
                label={row.label}
                value={row.value}
                muted={row.muted}
                savings={row.savings}
              />
            </div>
          ))}

          {extraTaxIncluded > 0 && (
            <p className="text-xs text-[var(--customer-muted)]">
              Inclusive of {fmt(extraTaxIncluded)} GST
            </p>
          )}

          <div className="border-t border-dashed border-[#A9B4D8] pt-5 sm:pt-6">
            <SummaryRow label="Total Amount" value={fmt(totalPayable)} large />
          </div>
        </div>

        {hasDiscount && (
          <div className="mt-8 flex items-center gap-3 rounded-xl bg-[#228B221A] px-4 py-4 font-sans text-base font-bold text-[#228B22] sm:mt-12 sm:gap-4 sm:px-5 sm:py-5 sm:text-[20px] lg:mt-16">
            <BadgeCheck size={28} className="shrink-0 sm:size-8" />
            <p className="text-base font-medium min-[375px]:text-lg sm:text-xl">
              You Saved <span className="font-bold">{fmt(totalSavings)}</span>{" "}
              on this order
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onCheckout}
          disabled={!hasSelectedItems}
          className={`mt-7 h-12 w-full rounded-[10px] px-4 text-sm font-bold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 min-[375px]:text-base sm:mt-10 sm:h-[54px] sm:px-5 ${
            hasSelectedItems
              ? "bg-[#CE9F2D] hover:bg-[#C9961F] focus:ring-[#CE9F2D66]"
              : "cursor-not-allowed bg-[#CE9F2D]/60 focus:ring-[#CE9F2D33]"
          }`}
        >
          {resolvedButtonText}
        </button>

        {/* <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8">
          <div className="flex items-center gap-2 text-[#3F4095]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-sm font-semibold sm:text-[15px]">
              Safe & Secure Payments
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="flex h-8 items-center justify-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-bold text-[#1a1f71]">VISA</span>
            <span className="flex h-8 items-center justify-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-bold text-[#f7941e] italic">UPI</span>
            <div className="flex h-8 items-center justify-center rounded border border-gray-200 bg-white px-2 py-1">
              <div className="flex -space-x-1">
                <div className="h-4 w-4 rounded-full bg-[#eb001b] opacity-80 mix-blend-multiply"></div>
                <div className="h-4 w-4 rounded-full bg-[#f79e1b] opacity-80 mix-blend-multiply"></div>
              </div>
            </div>
            <span className="flex h-8 items-center justify-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-bold text-[#003478]">RuPay</span>
            <span className="flex h-8 items-center justify-center rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-bold text-[#002e6e]">Paytm</span>
            <span className="ml-1 text-xs font-medium text-gray-500">+ More</span>
          </div>
        </div> */}

      </div>
    </aside>
  );
}
