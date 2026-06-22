import { Heart } from "lucide-react";
import { cn } from "../../lib/utils";

export default function WishlistButton({
  active = false,
  label = "product",
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      title={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-label={active ? `Remove ${label} from wishlist` : `Add ${label} to wishlist`}
      onClick={onClick}
      className={cn("icon-button border-[var(--customer-border)] bg-white/95 text-[var(--customer-navy)] shadow-sm hover:border-[var(--customer-gold)]", className)}
    >
      <Heart
        size={18}
        fill={active ? "var(--customer-danger)" : "none"}
        className={active ? "text-[var(--customer-danger)]" : "text-[var(--customer-navy)]"}
      />
    </button>
  );
}
