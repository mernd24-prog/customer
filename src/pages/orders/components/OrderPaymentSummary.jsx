import OrderDetailSectionCard from "./OrderDetailSectionCard";
import { formatMoney } from "../../../utils/ecommerce/money";

function SummaryRow({ label, value, savings = false }) {
  return (
    <div className="flex h-[58px] w-full max-w-[515px] items-center justify-between">
      <span className="text-[14px] font-semibold leading-[20px] text-[#2E2E2E] sm:text-[16px] sm:leading-[24px] md:text-[18px] md:leading-[28px]">
        {label}
      </span>

      <span
        className={`text-[14px] font-bold leading-[20px] sm:text-[16px] sm:leading-[24px] md:text-[18px] md:leading-[28px]
        ${savings ? "text-[#008425]" : "text-[#1B1D60]"}`}
      >
        {value}
      </span>
    </div>
  );
}

function AddressBlock({ shippingAddress, getAddressValue }) {
  const fullName = getAddressValue(shippingAddress, "fullName", "full_name");
  const postalCode = getAddressValue(
    shippingAddress,
    "postalCode",
    "postal_code",
  );
  const street = [shippingAddress.line1, shippingAddress.line2]
    .filter(Boolean)
    .join(", ");
  const cityLine = [
    shippingAddress.city,
    shippingAddress.state,
    postalCode,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex w-full max-w-[515px] flex-col items-start py-3">
      <span className="text-[14px] font-semibold leading-[20px] text-[#2E2E2E] sm:text-[16px] sm:leading-[24px] md:text-[18px] md:leading-[28px]">
        Shipping Address
      </span>
      <div className="mt-2 w-full break-words text-[14px] font-medium leading-[20px] text-[#1B1D60] sm:text-[16px] sm:leading-[26px] md:text-[18px] md:leading-[30px]">
        {fullName && <p className="font-semibold">{fullName}</p>}
        {street && <p>{street}</p>}
        {cityLine && <p>{cityLine}</p>}
      </div>
    </div>
  );
}

function TaxBreakupBlock({
  tax,
  taxBreakup,
  taxIncluded,
  taxPayable,
  currency,
  formatMoney,
}) {
  return (
    <div className="flex w-full max-w-[515px] flex-col items-start py-3">
      <span className="text-[14px] font-semibold leading-[20px] text-[#2E2E2E] sm:text-[16px] sm:leading-[24px] md:text-[18px] md:leading-[28px]">
        GST invoice breakup
      </span>
      <div className="mt-2 grid gap-1 text-[14px] font-medium leading-[20px] text-[#1B1D60] sm:text-[16px] sm:leading-[26px] md:text-[18px] md:leading-[30px]">
        {taxBreakup && (
          <p>
            Tax mode:{" "}
            {(taxBreakup.taxMode || taxBreakup.tax_mode || "N/A")
              .toString()
              .toUpperCase()}
          </p>
        )}
        {taxPayable > 0 && (
          <p>GST added to payable: {formatMoney(taxPayable, currency)}</p>
        )}
        {taxIncluded > 0 && (
          <p>
            GST included in item price: {formatMoney(taxIncluded, currency)}
          </p>
        )}
        {tax !== undefined && taxPayable === 0 && taxIncluded === 0 && (
          <p>GST breakup: {formatMoney(tax, currency)}</p>
        )}
      </div>
    </div>
  );
}

function OrderPaymentSummary({
  // Order Detail Props
  subtotal,
  discount,
  walletDiscount,
  shipping,
  customerPlatformFee,
  customerPlatformFeeTax,
  customerAmount,
  tax,
  taxBreakup,
  taxIncluded,
  taxPayable,
  shippingAddress,

  // Cart Props
  mrpSubtotal,
  productDiscount,
  couponDiscount,
  totalSavings,
  itemCount,

  // Common
  currency,
  asNumber,
  hasShippingAddress,
  getAddressValue,

  // Controls
  variant = "order", // order | cart
  buttonText,
  onCheckout,
}) {
  return (
    <OrderDetailSectionCard
      title="Payment Summary"
      className="h-auto w-full"
      borderClassName="border-[#CE9F2D66]"
      bodyClassName="grid gap-3 px-4 py-4 text-sm "
    >
      {/* Cart MRP */}
      {variant === "cart" && asNumber?.(mrpSubtotal) > 0 && (
        <div>
          <SummaryRow
            label={`MRP (${itemCount || 0} ${
              itemCount === 1 ? "item" : "items"
            })`}
            value={formatMoney(mrpSubtotal, currency)}
          />
        </div>
      )}

      {/* Cart Price */}
      {variant === "cart" && subtotal !== undefined && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow label="Price" value={formatMoney(subtotal, currency)} />
        </div>
      )}

      {/* Order Subtotal */}
      {variant === "order" && subtotal !== undefined && (
        <div>
          <SummaryRow
            label="Subtotal"
            value={formatMoney(subtotal, currency)}
          />
        </div>
      )}
      {/* Product Discount */}
      {variant === "cart" && asNumber?.(productDiscount) > 0 && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow
            label="Product Discount"
            value={`-${formatMoney(productDiscount, currency)}`}
            savings
          />
        </div>
      )}

      {/* Discount */}
      {asNumber?.(discount) > 0 && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow
            label="Discount"
            value={`-${formatMoney(discount, currency)}`}
            savings
          />
        </div>
      )}

      {/* Coupon Discount */}
      {asNumber?.(couponDiscount) > 0 && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow
            label="Coupon Discount"
            value={`-${formatMoney(couponDiscount, currency)}`}
            savings
          />
        </div>
      )}

      {/* Wallet Discount */}
      {asNumber?.(walletDiscount) > 0 && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow
            label="Wallet Discount"
            value={`-${formatMoney(walletDiscount, currency)}`}
            savings
          />
        </div>
      )}

      {/* Shipping */}
      <div className="border-t border-[#04258626] pt-2">
        <SummaryRow
          label="Shipping"
          value={
            asNumber?.(shipping) === 0
              ? "FREE"
              : formatMoney(shipping || 0, currency)
          }
        />
      </div>

      {asNumber?.(customerPlatformFee) > 0 && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow
            label="Platform Fee"
            value={formatMoney(customerPlatformFee, currency)}
          />
        </div>
      )}

      {asNumber?.(customerPlatformFeeTax) > 0 && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow
            label="Platform Fee GST"
            value={formatMoney(customerPlatformFeeTax, currency)}
          />
        </div>
      )}

      {/* Total */}
      <div className="border-t border-dashed border-[#04258626] pt-4">
        <SummaryRow
          label={variant === "cart" ? "Total Amount" : "Order Amount"}
          value={formatMoney(customerAmount || 0, currency)}
        />
      </div>

      {/* Tax Section */}
      {variant === "order" && (taxBreakup || tax !== undefined) && (
        <div className="border-t border-[#04258626] pt-3">
          <TaxBreakupBlock
            tax={tax}
            taxBreakup={taxBreakup}
            taxIncluded={taxIncluded}
            taxPayable={taxPayable}
            currency={currency}
            formatMoney={formatMoney}
          />
        </div>
      )}

      {/* Address Section */}
      {variant === "order" && hasShippingAddress?.(shippingAddress) && (
        <div className="border-t border-[#04258626] pt-3">
          <AddressBlock
            shippingAddress={shippingAddress}
            getAddressValue={getAddressValue}
          />
        </div>
      )}

      {/* Cart Savings Box */}
      {variant === "cart" && asNumber?.(totalSavings) > 0 && (
        <div className="mt-4 rounded-xl bg-[#228B221A] p-4 text-[#228B22]">
          <p className="text-base font-medium">
            You Saved{" "}
            <span className="font-bold">
              {formatMoney(totalSavings, currency)}
            </span>{" "}
            on this order
          </p>
        </div>
      )}

      {/* Cart Checkout Button */}
      {variant === "cart" && buttonText && (
        <button
          type="button"
          onClick={onCheckout}
          className="mt-6 h-[54px] w-full rounded-[10px] bg-[#CE9F2D] px-4 text-sm font-bold text-white transition hover:bg-[#C9961F] sm:text-base"
        >
          {buttonText}
        </button>
      )}
    </OrderDetailSectionCard>
  );
}

export { SummaryRow };
export default OrderPaymentSummary;
