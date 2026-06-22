import { Package } from "lucide-react";

import OrderItemMetaList from "./OrderItemMeta";
import OrderDetailSectionCard from "./OrderDetailSectionCard";

function OrderItemCard({
  item,
  currency,
  getItemImage,
  getProductTitle,
  getItemLineTotal,
  getOrderItemColor,
  formatMoney,
}) {
  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:gap-5 lg:gap-[36px]">
      <div className="flex aspect-[252/210] w-full shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#CE9F2D33] bg-white sm:w-[180px] lg:w-[220px] 2xl:w-[252px]">
        {getItemImage(item) ? (
          <img
            src={getItemImage(item)}
            alt={getProductTitle(item)}
            className="h-full w-full object-contain"
          />
        ) : (
          <Package size={28} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="line-clamp-2 break-words text-[18px] font-semibold leading-[26px] text-[#2E2E2E] sm:text-[22px] sm:leading-[32px] md:text-[26px] md:leading-[38px]">
          {getProductTitle(item)}
        </p>

        <OrderItemMetaList
          className="my-4 sm:my-6"
          items={[
            { label: "Color", value: getOrderItemColor(item) },
            {
              label: "Quantity",
              value: String(item.quantity || 1).padStart(2, "0"),
            },
          ]}
        />

        <div className="mt-2 gap-[5px] sm:mt-4">
          <p className="text-[20px] font-extrabold leading-[28px] text-[#1B1D60] sm:text-[26px] sm:leading-[38px] md:text-[34px] md:leading-[46px]">
            {formatMoney(getItemLineTotal(item), currency)}
          </p>
          <p className="text-[14px] font-medium leading-[100%] text-[#2E2E2E] sm:text-[16px] md:text-[18px]">
            Inclusive of all taxes
          </p>
        </div>
      </div>
    </div>
  );
}

function OrderItemsSection({ items, ...itemProps }) {
  return (
    <OrderDetailSectionCard
      title="Item"
      borderClassName="border-[#CE9F2D66]"
      bodyClassName="grid gap-4 p-4 sm:p-5 lg:p-6"
    >
      {items.map((item, index) => (
        <OrderItemCard
          key={item.id || item._id || index}
          item={item}
          {...itemProps}
        />
      ))}
    </OrderDetailSectionCard>
  );
}

export { OrderItemCard };
export default OrderItemsSection;
