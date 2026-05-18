import { Heart } from "lucide-react";
import { cn } from "../../utils/classNames";

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
      className={cn("icon-button bg-white/95 shadow-sm", className)}
    >
      <Heart
        size={18}
        fill={active ? "#E23B3B" : "none"}
        className={active ? "text-[#E23B3B]" : "text-[#2E2E2E]"}
      />
    </button>
  );
}
