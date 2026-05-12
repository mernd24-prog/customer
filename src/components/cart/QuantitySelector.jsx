import { Trash2 } from "lucide-react";

export default function QuantitySelector({
    quantity,
    onIncrease,
    onDecrease,
}) {
    return (
        <div className="flex w-fit items-center overflow-hidden rounded-lg border border-[#7e7c7c] bg-white">
            {/* Decrease / Delete Button */}
            <button
                onClick={onDecrease}
                className="flex h-8 w-8 items-center justify-center text-base font-semibold text-[#2c2c2c] transition hover:bg-gray-100 sm:h-9 sm:w-9 sm:text-lg"
            >
                {quantity === 1 ? (
                    <Trash2 size={16} strokeWidth={2.5} />
                ) : (
                    "-"
                )}
            </button>

            {/* Quantity */}
            <span className="flex min-w-[40px] items-center justify-center px-3 py-1 text-xs font-semibold text-[#2c2c2c] sm:min-w-[50px] sm:px-4 sm:text-sm">
                {quantity}
            </span>

            {/* Increase Button */}
            <button
                onClick={onIncrease}
                className="flex h-8 w-8 items-center justify-center text-base font-semibold text-[#2c2c2c] transition hover:bg-gray-100 sm:h-9 sm:w-9 sm:text-lg"
            >
                +
            </button>
        </div>
    );
}