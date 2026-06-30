export default function ProductStockStatus({
  inStock,
  selectedVariant,
  product,
  availableStock,
}) {
  if (!inStock) {
    return (
      <p className="text-[12px] font-semibold text-red-500 ">Out of stock</p>
    );
  }

  return (
    <div className="flex items-center gap-2 my-1">
      <div className="relative z-0 w-3 h-3 rounded-full bg-success " />
      <p className="text-sm lg:text-lg font-bold text-success">
        {availableStock ?? selectedVariant?.availableStock ?? product?.availableStock ?? 0} in stock
      </p>
    </div>
  );
}
