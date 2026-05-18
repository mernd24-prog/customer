import { ShoppingCart } from "lucide-react";
import { cn } from "../../utils/classNames";

export default function AddToCartButton({
  label = "Add to cart",
  disabled = false,
  compact = false,
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        compact ? "icon-button primary" : "button primary inline-flex items-center justify-center gap-2",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <ShoppingCart size={18} />
      {!compact && <span>{label}</span>}
    </button>
  );
}
