import OrderDetailSectionCard from "./OrderDetailSectionCard";
import { formatMoney } from "../../../utils/ecommerce/money";
import ShowMoreText from "../../../utils/showMore";

function SummaryRow({
  label,
  value,
  savings = false,
  className = "",
  labelClassName = "",
  valueClassName = "",
}) {
  return (
    <div
      className={`flex  w-full items-center justify-between gap-3 py-3 ${className}`}
    >
      <span
        className={`flex-1 small font-semibold text-[#2E2E2E] ${labelClassName}`}
      >
        {typeof label === "string" ? (
          <ShowMoreText
            text={label}
            mode="lines"
            limit={2}
            moreLabel="more"
            lessLabel="less"
            textClassName="inline"
            buttonClassName="ml-1 text-xs font-semibold text-[#1B1D60] hover:underline"
          />
        ) : (
          label
        )}
      </span>

      <span
        className={`shrink-0 text-right small font-bold ${
          savings ? "text-[#008425]" : "text-[#1B1D60]"
        } ${valueClassName}`}
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
      <div className="mt-2  w-full break-words text-[14px] font-medium leading-[20px] text-[#1B1D60] sm:text-[16px] sm:leading-[26px] md:text-[18px] md:leading-[30px]">
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
        Gst Invoice Breakup
      </span>
      <div className="mt-2 grid gap-1 text-[14px] font-medium leading-[20px] text-[#1B1D60] sm:text-[16px] sm:leading-[26px] md:text-[18px] md:leading-[30px]">
        {taxBreakup && (
          <p>
            Tax Mode:{" "}
            {(taxBreakup.taxMode || taxBreakup.tax_mode || "N/A")
              .toString()
              .toUpperCase()}
          </p>
        )}
        {taxPayable > 0 && (
          <p>Gst Added to Payable: {formatMoney(taxPayable, currency)}</p>
        )}
        {taxIncluded > 0 && (
          <p>
            Gst Included in Item Price: {formatMoney(taxIncluded, currency)}
          </p>
        )}
        {tax !== undefined && taxPayable === 0 && taxIncluded === 0 && (
          <p>Gst Breakup: {formatMoney(tax, currency)}</p>
        )}
      </div>
    </div>
  );
}

function OrderPaymentSummary({
  // Order Detail Props
  subtotal,
  discount,
  discountFundingType,
  marketplaceFundedDiscount,
  paymentPartnerFundedDiscount,
  sellerFundedDiscount,
  walletDiscount,
  shipping,
  shippingLoading = false,
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

  title = "Payment Summary",

  // Controls
  variant = "", // order | cart | checkout
  buttonText,
  onCheckout,
  disabled = false,

  // Checkout Props
  items = [],
  paymentMethods = [],
  selectedPaymentProvider,
  onPaymentProviderChange,
  loading,
  selectedLabel,
}) {
  const visiblePaymentMethods =
    variant === "checkout" ? paymentMethods : paymentMethods;

  return (
    <OrderDetailSectionCard
      title={title}
      className="h-full w-full"
      borderClassName="border-[#CE9F2D66]"
      bodyClassName="flex flex-col px-4 py-4 text-sm"
    >
      {variant === "checkout" && (
        <>
          <p className="mb-2  text-[18px] font-bold leading-[28px] text-ink">
            {String(items.length).padStart(2, "0")} Item(s)
          </p>

          {/* <div className="grid divide-y divide-border "> */}
          {items.map((item) => (
            <div
              key={item._lineKey}
              className="flex w-full min-w-0 items-start justify-between gap-3 border-t border-[#04258626] pt-3 pb-2"
            >
              <div className="min-w-0 flex-1 small font-semibold text-[#2E2E2E]">
                <ShowMoreText
                  text={`${item.quantity} x ${item._safeTitle}`}
                  mode="characters"
                  limit={65}
                  moreLabel="more"
                  lessLabel="less"
                  textClassName="inline"
                  buttonClassName="ml-1 text-xs font-semibold text-[#1B1D60] hover:underline whitespace-nowrap"
                />
              </div>

              <span className="shrink-0 text-right small font-bold text-[#1B1D60]">
                {formatMoney(item._lineTotal, currency)}
              </span>
            </div>
          ))}
          {/* </div> */}
        </>
      )}
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
          <SummaryRow label="Price" value={formatMoney(subtotal, currency)} />
        </div>
      )}
      {/* Product Discount */}
      {variant === "cart" && asNumber?.(productDiscount) > 0 && (
        <div className="border-t  border-[#04258626] pt-2">
          <SummaryRow
            label="Product discount"
            value={`-${formatMoney(productDiscount, currency)}`}
            savings
          />
        </div>
      )}

      {/* Discount */}
      {asNumber?.(discount) > 0 && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow
            label="Promotion discount"
            value={`-${formatMoney(discount, currency)}`}
            savings
          />
          {variant === "order" && (
            <p className="mt-1 text-xs leading-5 text-[#65718b]">
              {asNumber?.(sellerFundedDiscount) > 0
                ? `${formatMoney(sellerFundedDiscount, currency)} funded by seller`
                : ""}
              {asNumber?.(sellerFundedDiscount) > 0 &&
              (asNumber?.(marketplaceFundedDiscount) > 0 ||
                asNumber?.(paymentPartnerFundedDiscount) > 0)
                ? " · "
                : ""}
              {asNumber?.(marketplaceFundedDiscount) > 0
                ? `${formatMoney(marketplaceFundedDiscount, currency)} funded by marketplace`
                : ""}
              {asNumber?.(marketplaceFundedDiscount) > 0 &&
              asNumber?.(paymentPartnerFundedDiscount) > 0
                ? " · "
                : ""}
              {asNumber?.(paymentPartnerFundedDiscount) > 0
                ? `${formatMoney(paymentPartnerFundedDiscount, currency)} funded by payment partner`
                : ""}
              {!asNumber?.(sellerFundedDiscount) &&
              !asNumber?.(marketplaceFundedDiscount) &&
              !asNumber?.(paymentPartnerFundedDiscount)
                ? `Funding: ${String(discountFundingType || "promotion").replace(/_/g, " ")}`
                : ""}
            </p>
          )}
        </div>
      )}

      {variant === "checkout" && asNumber?.(subtotal) >= 0 && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow
            label="Item Total"
            value={formatMoney(subtotal, currency)}
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
      {variant !== "cart" && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow
            label="Shipping (collected for seller)"
            value={
              shippingLoading
                ? "Calculating..."
                : asNumber?.(shipping) === 0
                  ? "FREE"
                  : formatMoney(shipping || 0, currency)
            }
          />
        </div>
      )}

      {asNumber?.(customerPlatformFee) > 0 && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow
            label={
              asNumber?.(customerPlatformFeeTax) > 0
                ? "Platform fee base"
                : "Platform Fee"
            }
            value={formatMoney(customerPlatformFee, currency)}
          />
          {variant === "order" && (
            <p className="mt-1 text-xs leading-5 text-[#65718b]">
              Marketplace service fee charged by platform.
            </p>
          )}
        </div>
      )}

      {(asNumber?.(customerPlatformFeeTax) > 0 ||
        (variant === "order" && asNumber?.(customerPlatformFee) > 0)) && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow
            label="Platform Fee GST"
            value={formatMoney(customerPlatformFeeTax || 0, currency)}
          />
          {variant === "order" && asNumber?.(customerPlatformFeeTax) <= 0 && (
            <p className="mt-1 text-xs leading-5 text-[#65718b]">
              No GST charged or GST detail not available for this order.
            </p>
          )}
        </div>
      )}

      {/* Total */}
      <div className="border-t border-dashed border-[#04258626] pt-2">
        <SummaryRow
          label={
            variant === "checkout"
              ? "Total Payable"
              : variant === "cart"
                ? "Total Amount"
                : "Order Amount"
          }
          value={formatMoney(customerAmount || 0, currency)}
        />
      </div>

      {variant === "checkout" && visiblePaymentMethods.length > 0 && (
        <div className="pt-4">
          <h3 className="text-[14px] font-semibold leading-[20px] text-[#2E2E2E] sm:text-[16px] sm:leading-[24px] md:text-[18px] md:leading-[28px] ">
            Payment Method
          </h3>

          <div className="flex flex-col mt-2">
            {visiblePaymentMethods.map((option) => (
              <label
                key={option.provider}
                className="flex cursor-pointer  items-center gap-3 rounded-[10px] px-3 py-3 text-sm transition hover:border-[#CE9F2D]"
              >
                <input
                  type="radio"
                  value={option.provider}
                  checked={selectedPaymentProvider === option.provider}
                  onChange={(e) => onPaymentProviderChange?.(e.target.value)}
                  className="h-[18px] w-[18px] accent-[#3E4093]"
                />

                <span className="text-sm md:text-[18px]   font-medium leading-[28px] text-[#2E2E2E]">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

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
          <p className="text-sm font-medium">
            You Saved{" "}
            <span className="font-bold">
              {formatMoney(totalSavings, currency)}
            </span>{" "}
            On This Order
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
      {variant === "checkout" && buttonText && (
        <>
          <button
            type="submit"
            disabled={loading || disabled}
            className="mt-6 flex h-[54px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#CE9F2D] px-4 text-[16px] font-semibold leading-[24px] text-white transition hover:bg-[#C9961F] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Please Wait...
              </>
            ) : (
              buttonText
            )}
          </button>

          {selectedLabel && (
            <p className="mt-3 text-center text-[16px] font-medium leading-[24px] text-[#2E2E2E] sm:text-[18px] sm:leading-[28px]">
              Selected Method: {selectedLabel}
            </p>
          )}
        </>
      )}
    </OrderDetailSectionCard>
  );
}

export { SummaryRow };
export default OrderPaymentSummary;
