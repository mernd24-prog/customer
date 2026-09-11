export default function ProductStockStatus({
  inStock,
  selectedVariant,
  product,
  availableStock,
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
    <div className="flex items-center gap-2">
      <div className="relative z-0 w-2.5 h-2.5 rounded-full bg-[#008425]" />
      <p className="text-xs lg:text-sm font-bold text-[#008425]">
        {/* {displayStock} In Stock */}
        In Stock
      </p>
    </div>
  );
}
