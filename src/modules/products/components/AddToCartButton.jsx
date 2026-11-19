import { ShoppingCart } from "lucide-react";
import { cn } from "../../../utils/common";

import { DynamicButton } from "../../../components/ui/button";
export default function AddToCartButton({
  label = "Add to cart",
  disabled = false,
  compact = false,
  onClick,
  className = "",
}) {
  return (
    <DynamicButton
      disabled={disabled}
      title={label}
      aria-label={label}
      onClick={onClick}
      variant={compact ? "iconGhost" : "primary"}
      size={compact ? "iconSm" : "md"}
      shape={compact ? "circle" : "rounded"}
      className={cn(
        compact ? "" : "inline-flex items-center justify-center gap-2",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <ShoppingCart size={18} />
      {!compact && <span>{label}</span>}
    </DynamicButton>
  );
}
