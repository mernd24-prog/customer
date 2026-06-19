export default function ProductStockStatus({
  inStock,
  selectedVariant,
  product,
}) {
  if (!inStock) {
    return (
      <p className="text-[12px] font-semibold text-red-500">Out of stock</p>
    );
  }

  return (
    <div className="flex items-center gap-2 my-1">
      <div className="relative z-0 w-3 h-3 rounded-full bg-success animate-pulse" />
      <p className="text-sm lg:text-[20px] font-bold text-success">
        {selectedVariant?.stock ?? product?.stock ?? 52} in stock
      </p>
    </div>
  );
}
