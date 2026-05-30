import Button from "../ui/BrandButton";
import { Info } from "lucide-react";

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
}) {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = items.reduce((acc, item) => acc + item.shipping * item.quantity, 0);
    const total = subtotal + shipping;
    const fmt = (n) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="sticky top-5 h-fit w-full rounded-[16px] border border-[#e7dfd1] bg-[#FAF6EE] p-4 sm:p-5 md:p-6">
            {/* Heading */}
            <h2 className="font-montserrat text-lg font-bold leading-tight text-[#2E2E2E] sm:text-xl">
                Order summary
            </h2>

            {/* Summary */}
            <div className="mt-5 space-y-4 sm:mt-6">
                {/* Items */}
                <div className="flex items-center justify-between gap-3 font-montserrat text-xs sm:text-sm">
                    <span className="text-[#787878]">Items ({items.length})</span>
                    <span className="font-semibold text-[#2E2E2E]">{fmt(subtotal)}</span>
                </div>

                {/* Shipping */}
                <div className="flex items-center justify-between gap-3 font-montserrat text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                        <span className="text-[#787878]">{shippingLabel} {shippingLocation}</span>
                        {showInfoIcon && (
                            <button type="button" className="text-[#A6A6A6] transition-all duration-300 ease-in-out hover:text-[#2E2E2E]">
                                <Info size={14} strokeWidth={2} />
                            </button>
                        )}
                    </div>
                    <span className="font-semibold text-[#2E2E2E]">{fmt(shipping)}</span>
                </div>
            </div>

            {/* Divider */}
            <div className="my-5 border-t border-[#e7dfd1] sm:my-6" />

            {/* Total */}
            <div className="flex items-center justify-between gap-3 pt-1">
                <span className="font-montserrat text-sm font-bold text-[#2E2E2E] sm:text-base md:text-lg">
                    Total
                </span>
                <span className="font-montserrat text-sm font-bold text-[#CE9F2D] sm:text-base md:text-lg">
                    {fmt(total)}
                </span>
            </div>

            {/* Button */}
            <Button
                variant="primary"
                rounded
                onClick={onCheckout}
                label={buttonText}
                className="mt-5 sm:mt-6 w-full h-12 text-sm font-semibold"
            />

            {/* Protection Text */}
            <div className="mt-4 text-center font-montserrat text-xs leading-5 text-[#787878] sm:text-sm">
                <span>{protectionText} </span>
                <a
                    href={protectionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#CE9F2D] underline underline-offset-2 transition-all duration-300 ease-in-out hover:text-[#A26D27]"
                >
                    {protectionLinkText}
                </a>
            </div>
        </div>
    );
}