import { FaAngleRight } from "react-icons/fa6";
export default function SectionContainer({
    title,
    subtitle,
    headerbgColor,
    children,
    bodybgColor,
    className = "",
}) {
    return (
        <section className={`w-full overflow-hidden rounded-[20px] ${className}`}>
            <header className={`text-[#2E2E2E] ${headerbgColor}`}>
                <div className="flex min-h-[92px] flex-col gap-3 px-4 py-5 sm:min-h-[111px] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="min-w-0">
                        <h2 className="font-montserrat text-[22px] font-bold leading-tight tracking-normal sm:text-[26px]">
                            {title}
                        </h2>
                        <p className="mt-2 font-montserrat text-sm leading-5 text-[#2E2E2E]">
                            {subtitle}
                        </p>
                    </div>
                    {/* <button className="flex items-center gap-2 text-black text-[16px] font-medium font-montserrat">
                        View More
                        <FaAngleRight />

                    </button> */}
                    <button className="shrink-0 self-start sm:self-center flex items-center gap-2 text-black text-[14px] sm:text-[16px] lg:text-[18px] font-medium font-montserrat">
    View More
    <FaAngleRight />
</button>
                </div>
            </header>
            <div className={`p-3 sm:p-4 lg:p-6 ${bodybgColor}`}>
                {children}
            </div>
        </section>
    );
}
