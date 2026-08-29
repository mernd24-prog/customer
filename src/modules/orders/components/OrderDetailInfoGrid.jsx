import { INFO_TILE_TONES } from "../../../data/orderPage";

function OrderDetailInfoTile({ icon, label, value, tone = "yellow" }) {
  return (
    <div className="flex items-center gap-3.5 sm:gap-4 rounded-xl border border-[#CE9F2D66] bg-[#FFFDF8] p-3.5 sm:p-4 transition hover:border-[#CE9F2D]">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
          INFO_TILE_TONES[tone] || INFO_TILE_TONES.yellow
        }`}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-xs font-medium text-[#2E2E2E] sm:text-sm">
          {label}
        </p>
        <p className="break-words text-sm font-bold text-[#1B1D60] sm:text-base">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}
function OrderDetailInfoGrid({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4 2xl:gap-[36px] ">
      {items.map((item) => (
        <OrderDetailInfoTile key={item.label} {...item} />
      ))}
    </div>
  );
}
export { OrderDetailInfoTile };
export default OrderDetailInfoGrid;
