export default function CartActionButtons({BuyNow, SaveForLater, Remove}) {
    return (
        <div className="mt-4 flex flex-wrap gap-3 text-sm sm:flex-row sm:items-center">
            <button className="rounded-md px-4 py-2 underline font-semibold text-[#292929] transition hover:bg-gray-100">
                {BuyNow}
            </button>

            <button className="rounded-md px-4 py-2 underline font-semibold text-[#292929] transition hover:bg-gray-100">
                {SaveForLater}
            </button>

            <button className="rounded-md px-4 py-2 underline font-semibold text-[#292929] transition hover:bg-red-50">
                {Remove}
            </button>
        </div>
    );
}