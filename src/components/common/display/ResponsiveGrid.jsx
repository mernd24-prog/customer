import { cn } from "../../../lib/utils";

const GRID_VARIANTS = {
  products: "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3",
  cards: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
  compact: "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4",
  list: "grid gap-4",
};

export default function ResponsiveGrid({
  as: Component = "div",
  variant = "products",
  className = "",
  children,
  ...props
}) {
  return (
    <Component className={cn(GRID_VARIANTS[variant] || GRID_VARIANTS.products, className)} {...props}>
      {children}
    </Component>
  );
}
