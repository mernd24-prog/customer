function OrderItemMeta({ label, value }) {
  return (
    <span className="text-[18px]  font-medium leading-[100%] text-[#2E2E2E]">
      {label}:{" "}
      <strong className="font-bold text-[#25247B]">{value || "N/A"}</strong>
    </span>
  );
}

function OrderItemMetaList({ items, className = "" }) {
  return (
    <div
      className={`flex  flex-wrap gap-x-6 gap-y-2 text-xs text-ink ${className}`}
    >
      {items.map(({ label, value }) => (
        <OrderItemMeta key={label} label={label} value={value} />
      ))}
    </div>
  );
}

export { OrderItemMeta };
export default OrderItemMetaList;
