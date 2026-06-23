import { Package } from "lucide-react";

import OrderDetailSectionCard from "./OrderDetailSectionCard";

function OrderItemCard({
  item,
  currency,
  getItemImage,
  getProductTitle,
  getItemLineTotal,
  getOrderItemColor,
  formatMoney,
  className = "",
}) {
  return (
    <div
      className={`flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-5 lg:gap-[36px] ${className}`}
    >
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

        <div className="my-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink sm:my-6">
          <span className="text-[18px] font-medium leading-[100%] text-[#2E2E2E]">
            Color: <span className="font-semibold text-[#1B1D60]">
              <strong className="font-bold text-[#25247B]">
                {getOrderItemColor(item)}
              </strong>
            </span>
          </span>
          <span className="text-[18px] font-medium leading-[100%] text-[#2E2E2E]">
            Quantity:{" "}
          <strong className="font-bold text-[#25247B]">
              {String(item.quantity || 1).padStart(2, "0")}
            </strong>
          </span>
        </div>

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

function OrderItemsSection({
  items,
  title = "Item",
  borderClassName = "border-[#CE9F2D66]",
  bodyClassName = "grid gap-4 p-4 sm:p-5 lg:p-6",
  itemClassName = "",
  ...itemProps
}) {
  return (
    <OrderDetailSectionCard
      title={title}
      borderClassName={borderClassName}
      bodyClassName={bodyClassName}
    >
      {items.map((item, index) => (
        <OrderItemCard
          key={item.id || item._id || index}
          item={item}
          className={itemClassName}
          {...itemProps}
        />
      ))}
    </OrderDetailSectionCard>
  );
}

export { OrderItemCard };
export default OrderItemsSection;
