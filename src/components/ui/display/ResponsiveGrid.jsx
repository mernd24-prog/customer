import { cn } from "../../../utils/common";

const GRID_VARIANTS = {
  products:
    "customer-grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  cards: "customer-grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  compact: "customer-grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
  list: "customer-grid grid-cols-1",
};

export default function ResponsiveGrid({
  as: Component = "div",
  variant = "products",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        GRID_VARIANTS[variant] || GRID_VARIANTS.products,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
