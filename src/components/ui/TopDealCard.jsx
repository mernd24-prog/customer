import PricePill from "./PricePill";

export default function TopDealCard({
    title,
    image,
    price,
    oldPrice,
}) {
    return (
        <article
            className="min-w-0 rounded-[12px] bg-white px-3 pb-4 pt-4 shadow-sm transition hover:shadow-lg sm:px-4 sm:pb-5 sm:pt-5"
        >

            <img
                src={image}
                alt={title}
                className="aspect-[292/310] w-full rounded-[10px] object-cover"
            />

            <div className="mt-3 flex min-h-[38px] flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <h3
                    className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-montserrat text-[14px] font-medium leading-6 text-[#2E2E2E] sm:text-[15px] lg:text-[16px]"
                    title={title}
                >
                    {title}
                </h3>

                <PricePill
                    price={price}
                    oldPrice={oldPrice}
                    className="h-[36px] max-w-[160px] gap-1.5 rounded-full px-2.5 sm:h-[40px] sm:max-w-[168px] sm:gap-2 sm:px-3"
                    priceClassName="text-[12px] sm:text-[13px] lg:text-[14px] xl:text-[14px]"
                    oldPriceClassName="text-[10px] sm:text-[11px] lg:text-[12px] xl:text-[12px]"
                />
            </div>
        </article>
    );
}
