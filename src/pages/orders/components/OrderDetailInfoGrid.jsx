import { INFO_TILE_TONES } from "../../../data/orderPage";

function OrderDetailInfoTile({ icon, label, value, tone = "yellow" }) {
  return (
    <div className="relative min-h-[127px] rounded-[15px] border border-[#CE9F2D66] bg-[#FFFDF8] px-[20px] py-[25px]">
      <div
        className={`absolute right-0 top-0 flex h-[60px] w-[60px] items-center justify-center rounded-bl-[15px] rounded-tr-[15px] p-[12px] ${
          INFO_TILE_TONES[tone] || INFO_TILE_TONES.yellow
        }`}
      >
        {icon}
      </div>
      <p className="text-[14px] font-medium leading-[100%] text-[#2E2E2E] sm:text-[16px] lg:text-[18px]">
        {label}
      </p>
      <p className="mt-3 break-words text-[18px] font-bold capitalize leading-[100%] text-[#1B1D60] sm:text-[22px] lg:text-[26px]">
        {value || "N/A"}
      </p>
    </div>
  );
}

function OrderDetailInfoGrid({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4 2xl:gap-[36px]">
      {items.map((item) => (
        <OrderDetailInfoTile key={item.label} {...item} />
      ))}
    </div>
  );
}

export { OrderDetailInfoTile };
export default OrderDetailInfoGrid;
