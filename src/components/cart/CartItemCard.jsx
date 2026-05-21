import QuantitySelector from "./QuantitySelector";
import SellerInfo from "./SellerInfo";
import CartActionButtons from "./CartActionButtons";
import Badge from "./Badge";

export default function CartItemCard({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  onSaveForLater,
}) {
  return (
    <div className="rounded-2xl border border-[#e9e8e8] bg-white p-4 sm:p-6 font-['Montserrat']">
      {/* Seller Info */}
      <SellerInfo seller={item.seller} feedback={item.feedback} />

      {/* Main Layout */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Image */}
        {item.image && (
          <div className="mx-auto h-[220px] w-full max-w-[220px] overflow-hidden rounded-xl sm:h-[250px] sm:max-w-[250px] md:mx-0 md:h-[180px] md:w-[180px]">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          {/* Sold Count */}
          {item.sold && <Badge>{item.sold} Sold</Badge>}
          {/* Title */}
          <h3 className=" text-base font-medium leading-7 text-[#050404] sm:text-lg underline">
            {item.title}
          </h3>

          {/* Details */}
          <div className=" flex flex-col">
            {/* Condition */}
            {item.condition && (
              <span className="text-[13px] font-medium text-[#555454]">
                {item.condition}
              </span>
            )}

            {/* Color */}
            {item.color && (
              <span className="text-[13px] font-medium text-[#555454]">
                Color: {item.color}
              </span>
            )}

            {/* Size */}
            {item.size && (
              <span className="text-[13px] font-medium text-[#555454]">
                Size: {item.size}
              </span>
            )}

            {Object.entries(item.attributes || {})
              .filter(([key]) => !["color", "size"].includes(key))
              .map(([key, value]) => (
                <span key={key} className="text-[13px] font-medium capitalize text-[#555454]">
                  {key.replace(/_/g, " ")}: {String(value)}
                </span>
              ))}
          </div>

          {/* Pricing */}
          <div className="">
            {/* Pricing */}
            <div className="mt-2 flex flex-col">
              {/* Current Price */}
              <span className="text-base font-semibold text-[#111] sm:text-lg md:text-xl">
                ${item.price}
              </span>

              {/* Old Price */}
              {item.oldPrice && (
                <span className="text-[11px] font-medium line-through text-[#A6A6A6] sm:text-xs">
                  ${item.oldPrice}
                </span>
              )}
            </div>

            {/* Shipping */}
            {/* Shipping */}
            {item.shipping && (
              <div className="mt-1 flex flex-col gap-1">
                <span className="text-sm font-medium text-[#111] sm:text-base">
                  + ${item.shipping}
                </span>

                <span className="text-[14px] font-medium text-[#555454] sm:text-sm">
                  Shipping
                </span>
              </div>
            )}

            {/* Returns */}
            <span className="mt-1 block text-[14px] font-medium text-[#555454] sm:text-sm">
              Returns accepted
            </span>
          </div>

          {/* Quantity */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            {/* Quantity */}
            <QuantitySelector
              quantity={item.quantity}
              onIncrease={() => onIncrease(item.id)}
              onDecrease={() => onDecrease(item.id)}
            />

            {/* Actions */}
            <CartActionButtons
              BuyNow="Buy it now"
              SaveForLater="Save for later"
              Remove="Remove"
              onRemove={() => onRemove(item.id)}
              onSaveForLater={() => onSaveForLater(item.id)}
              onBuyNow={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
