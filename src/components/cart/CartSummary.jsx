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
        <div className="customer-card sticky top-5 h-fit w-full p-4 sm:p-5 md:p-6" style={{ "--customer-card-bg": "var(--customer-cream)" }}>
            <h2 className="font-montserrat text-lg font-bold leading-tight text-[var(--customer-navy)] sm:text-xl">
                Order summary
            </h2>

            <div className="mt-5 space-y-4 sm:mt-6">
                <div className="flex items-center justify-between gap-3 font-montserrat text-xs sm:text-sm">
                    <span className="text-[var(--customer-muted)]">Items ({items.length})</span>
                    <span className="font-semibold text-[var(--customer-ink)]">{fmt(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-3 font-montserrat text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                        <span className="text-[var(--customer-muted)]">{shippingLabel} {shippingLocation}</span>
                        {showInfoIcon && (
                            <button type="button" className="text-[var(--customer-subtle)] transition-all duration-300 ease-in-out hover:text-[var(--customer-navy)]" aria-label="Shipping information">
                                <Info size={14} strokeWidth={2} />
                            </button>
                        )}
                    </div>
                    <span className="font-semibold text-[var(--customer-ink)]">{fmt(shipping)}</span>
                </div>
            </div>

            <div className="my-5 border-t border-[var(--customer-border)] sm:my-6" />

            <div className="flex items-center justify-between gap-3 pt-1">
                <span className="font-montserrat text-sm font-bold text-[var(--customer-ink)] sm:text-base md:text-lg">
                    Total
                </span>
                <span className="font-montserrat text-sm font-bold text-[var(--customer-navy)] sm:text-base md:text-lg">
                    {fmt(total)}
                </span>
            </div>

            <Button
                variant="primary"
                rounded
                onClick={onCheckout}
                label={buttonText}
                className="mt-5 sm:mt-6 w-full h-12 text-sm font-semibold"
            />

            <div className="mt-4 text-center font-montserrat text-xs leading-5 text-[var(--customer-muted)] sm:text-sm">
                <span>{protectionText} </span>
                <a
                    href={protectionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[var(--customer-gold-dark)] underline underline-offset-2 transition-all duration-300 ease-in-out hover:text-[var(--customer-navy)]"
                >
                    {protectionLinkText}
                </a>
            </div>
        </div>
    );
}
