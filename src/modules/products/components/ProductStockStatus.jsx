
export default function ProductStockStatus({
  inStock,
  selectedVariant,
  product,
  availableStock,
  hideOnMobile = false,
}) {
  if (!inStock) {
    return null;
  }

  const stockCount =
    availableStock ??
    selectedVariant?.availableStock ??
    product?.availableStock ??
    0;

  const displayStock =
    stockCount >= 1000
      ? new Intl.NumberFormat("en-US", {
          notation: "compact",
          compactDisplay: "short",
        }).format(stockCount) + "+"
      : stockCount;

  return (
    <div
      className={`flex items-center gap-2 ${
        hideOnMobile ? "hidden sm:flex" : "flex"
      }`}
    >
      <div className="relative z-0 h-2.5 w-2.5 rounded-full bg-[#008425]" />

      <p className="text-xs font-bold text-[#008425] lg:text-sm">
        In Stock
      </p>
    </div>
  );
}
