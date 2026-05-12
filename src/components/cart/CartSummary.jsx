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
}) {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const shipping = items.reduce((acc, item) => acc + item.shipping * item.quantity, 0);

    const total = subtotal + shipping;

    return (
        <div className="sticky top-5 h-fit w-full rounded-2xl bg-[#f7f7f7] p-4 sm:p-5 md:p-6">
            {/* Heading */}
            <h2 className="text-lg font-bold leading-tight text-black sm:text-xl md:text-2xl">
                Order summary
            </h2>

            {/* Summary */}
            <div className="mt-5 space-y-4 font-medium text-[#0f0f0f] sm:mt-6">
                {/* Items */}
                <div className="flex items-center justify-between gap-3 text-xs sm:text-sm md:text-base">
                    <span className="text-gray-700">
                        Items ({items.length})
                    </span>

                    <span className="font-medium text-[#111]">
                        ${subtotal.toFixed(2)}
                    </span>
                </div>

                {/* Shipping */}
                <div className="flex items-center justify-between gap-3 text-xs sm:text-sm md:text-base">
                    <div className="flex items-center gap-1">
                        <span className="text-gray-700">
                            {shippingLabel} {shippingLocation}
                        </span>

                        {showInfoIcon && (
                            <button className="font-bold text-[#0a0a0a] transition hover:text-[#0a0a0a]">
                                <Info size={16} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>

                    <span className="font-medium text-[#111]">
                        ${shipping.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div className="my-5 border-t border-[#b4b3b3] sm:my-6" />

            {/* Total */}
            <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-sm font-bold leading-tight text-[#111] sm:text-base md:text-lg lg:text-xl">
                    Subtotal
                </span>

                <span className="text-sm font-bold leading-tight text-[#111] sm:text-base md:text-lg lg:text-xl">
                    ${total.toFixed(2)}
                </span>
            </div>

            {/* Button */}
           
            <Button
                variant="primary"
                rounded
                className="mt-5 sm:mt-6 px-6 py-3 w-full h-12 rounded-full text-sm font-semibold text-white flex items-center justify-center transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-base md:text-lg"
            >
                {buttonText}
            </Button>

            {/* Protection Text */}
            <div className="mt-4 text-center text-xs leading-5 text-gray-600 sm:text-sm">
                <span>
                    {protectionText}{" "}
                </span>

                <a
                    href={protectionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#d48f03] underline transition hover:text-blue-700"
                >
                    {protectionLinkText}
                </a>
            </div>
        </div>
    );
}