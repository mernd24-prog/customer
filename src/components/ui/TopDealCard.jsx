export default function TopDealCard({
    title,
    image,
    price,
    oldPrice,
}) {
    const formatPrice = (value) => Number(value).toLocaleString("en-IN");

    return (
        <article className="min-w-0 px-4 pb-6 pt-5">

            <img
                src={image}
                alt={title}
                className="aspect-[292/310] w-full rounded-[10px] object-cover"
            />

            <div className="mt-4 flex min-h-[38px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <h3
                    className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-montserrat text-[15px] font-medium leading-6 text-[#2E2E2E] sm:text-[16px]"
                    title={title}
                >
                    {title}
                </h3>



                <div className="mt-4 flex h-[43px] w-[176px] top-[2536px] left-[353px] opacity-100 items-center justify-center gap-2 rounded-[50px] border border-[#CE9F2D] px-3 font-montserrat">
                    <span className="text-[14px] font-semibold text-[#2E2E2E]">
                        ₹{formatPrice(price)}
                    </span>
                    <span className="text-[12px] text-[#A26D27] line-through">
                        ₹{formatPrice(oldPrice)}
                    </span>
                </div>
            </div>
        </article>
    );
}
// width: 176;
// height: 43;
// top: 2536px;
// left: 353px;
// angle: 0 deg;
// opacity: 1;
