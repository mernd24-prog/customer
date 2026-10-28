import DetailSectionCard from "../../../components/ui/layout/DetailSectionCard";
import { formatMoney } from "../../../utils/ecommerce/money";
import ShowMoreText from "../../../utils/showMore";
import { Loader2 } from "lucide-react";

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

  variant = "", 
  buttonText,
  onCheckout,
  disabled = false,
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
    <DetailSectionCard
      title={title}
      className="h-full w-full"
      borderClassName="border-[#CE9F2D66]"
      bodyClassName="flex flex-col px-3 py-4 text-sm sm:px-5 sm:py-5"
    >
      {variant === "checkout" && (
        <>
          <p className="mb-2 text-sm font-bold text-ink sm:text-base md:text-[18px] md:leading-[28px]">
            {String(items.length).padStart(2, "0")} Item(s)
          </p>
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
        </>
      )}

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

      {variant === "cart" && subtotal !== undefined && (
        <div className="border-t border-[#04258626] pt-2">
          <SummaryRow label="Price" value={formatMoney(subtotal, currency)} />
        </div>
      )}

      {variant === "order" && subtotal !== undefined && (
        <div>
          <SummaryRow label="Price" value={formatMoney(subtotal, currency)} />
        </div>
      )}
      {/* Product Discount */}
      {variant === "cart" && asNumber?.(productDiscount) > 0 && (
        <div className="border-t  border-[#04258626] pt-2">
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
            label="Promotion Discount"
            value={`-${formatMoney(discount, currency)}`}
            savings
          />
          {variant === "order" && (
            <p className="mt-1 text-xs leading-5 text-[#65718b]">
              {asNumber?.(sellerFundedDiscount) > 0
                ? `${formatMoney(sellerFundedDiscount, currency)} Funded by Seller`
                : ""}
              {asNumber?.(sellerFundedDiscount) > 0 &&
              (asNumber?.(marketplaceFundedDiscount) > 0 ||
                asNumber?.(paymentPartnerFundedDiscount) > 0)
                ? " · "
                : ""}
              {asNumber?.(marketplaceFundedDiscount) > 0
                ? `${formatMoney(marketplaceFundedDiscount, currency)} Funded by Marketplace`
                : ""}
              {asNumber?.(marketplaceFundedDiscount) > 0 &&
              asNumber?.(paymentPartnerFundedDiscount) > 0
                ? " · "
                : ""}
              {asNumber?.(paymentPartnerFundedDiscount) > 0
                ? `${formatMoney(paymentPartnerFundedDiscount, currency)} Funded by Payment Partner`
                : ""}
              {!asNumber?.(sellerFundedDiscount) &&
              !asNumber?.(marketplaceFundedDiscount) &&
              !asNumber?.(paymentPartnerFundedDiscount)
                ? `Funding: ${String(discountFundingType || "Promotion").replace(/_/g, " ")}`
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
            label="Shipping (Collected for Seller)"
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
                ? "Platform Fee Base"
                : "Platform Fee"
            }
            value={formatMoney(customerPlatformFee, currency)}
          />
          {variant === "order" && (
            <p className="mt-1 text-xs leading-5 text-[#65718b]">
              Marketplace Service Fee Charged by Platform.
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
              No GST Charged or GST Detail Not available for this Order.
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
          <h3 className="text-sm font-semibold leading-5 text-[#2E2E2E] sm:text-[15px] sm:leading-6 md:text-[16px] md:leading-[24px]">
            Payment Method
          </h3>

          <div className="flex flex-col mt-2">
            {visiblePaymentMethods.map((option) => (
              <label
                key={option.provider}
                className={`flex items-start gap-3 rounded-[10px] px-3 py-3 text-sm transition ${
                  option.enabled === false
                    ? "cursor-not-allowed bg-slate-50 opacity-70"
                    : "cursor-pointer hover:border-[#CE9F2D]"
                }`}
              >
                <input
                  type="radio"
                  value={option.provider}
                  checked={selectedPaymentProvider === option.provider}
                  disabled={option.enabled === false}
                  onChange={(e) => onPaymentProviderChange?.(e.target.value)}
                  className="mt-1 h-[18px] w-[18px] accent-[#3E4093]"
                />

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-6 text-[#2E2E2E] sm:text-[15px] md:text-[16px]">
                    {option.label}
                  </span>
                  {option.enabled === false && option.disabledReason ? (
                    <span className="block text-xs leading-5 text-red-600">
                      {option.disabledReason}
                    </span>
                  ) : null}
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
        <div className="mt-4 rounded-lg bg-[#228B221A] p-4 text-[#117A65]">
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
          disabled={disabled || loading}
          className="mt-6 flex h-[54px] w-full items-center justify-center gap-2.5 rounded-lg bg-[#1F2430] bg-[linear-gradient(#CE9F2D,#CE9F2D)] px-4 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
        >
          {loading && (
            <Loader2 className="h-5 w-5 animate-spin text-white shrink-0" />
          )}
          <span>{buttonText}</span>
        </button>
      )}
      {variant === "checkout" && buttonText && (
        <>
          <button
            type="submit"
            disabled={loading || disabled}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#1F2430] bg-[linear-gradient(#CE9F2D,#CE9F2D)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50 sm:h-[54px] sm:text-[16px]"
          >
            {loading && (
              <Loader2 className="h-5 w-5 animate-spin text-white shrink-0" />
            )}
            <span>{buttonText}</span>
          </button>

          {selectedLabel && (
            <p className="mt-2 text-center text-sm font-medium text-[#2E2E2E] sm:mt-3 sm:text-[15px] md:text-[16px]">
              Selected Method: {selectedLabel}
            </p>
          )}
        </>
      )}
    </DetailSectionCard>
  );
}

export { SummaryRow };
export default OrderPaymentSummary;
