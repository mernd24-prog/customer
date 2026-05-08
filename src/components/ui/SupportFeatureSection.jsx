export default function SupportFeatureSection({
    title,
    subtitle,
    items = [],
    showDividers = true,
}) {
    // Grid layout based on item count
    const getGridClasses = () => {
        const itemCount = items.length;

        if (itemCount === 3) {
            return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
        }

        if (itemCount === 4) {
            return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
        }

        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    };

    // Show divider except last item
    const shouldShowDivider = (index) => {
        if (!showDividers) return false;

        return index !== items.length - 1;
    };

    return (
        <section className="w-full bg-white px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1200px]">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h2 className="font-montserrat text-[24px] font-bold text-[#2E2E2E] sm:text-[28px] lg:text-[32px]">
                        {title}
                    </h2>

                    {subtitle && (
                        <p className="mx-auto mt-3 max-w-[700px] font-montserrat text-[13px] leading-6 text-[#787878] sm:text-[14px]">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Items */}
                <div
                    className={`grid ${getGridClasses()} gap-8 lg:gap-10`}
                >
                    {items.map((item, index) => (
                        <div
                            key={item.id || index}
                            className="relative flex flex-col items-center text-center"
                        >
                            {/* Vertical Divider */}
                            {shouldShowDivider(index) && (
                                <div className="absolute right-0 top-1/2 hidden h-[120px] w-[1px] -translate-y-1/2 bg-[#D9D9D9] xl:block" />
                            )}

                            {/* Icon */}
                            <div className="mb-4 flex h-[84px] w-[84px] items-center justify-center rounded-full border border-dashed border-[#D4A437]">
                                <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#F9F4E8]">
                                    <img
                                        src={item.icon}
                                        alt={item.title}
                                        className="h-8 w-8 object-contain"
                                    />
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="mb-2 font-montserrat text-[18px] font-semibold text-[#2D2A7A]">
                                {item.title}
                            </h3>

                            {/* Description */}
                            {item.description && (
                                <p className="max-w-[260px] font-montserrat text-[14px] leading-6 text-[#787878]">
                                    {item.description}
                                </p>
                            )}

                            {/* Link */}
                            {/* {item.link && ( */}
                                {/* <Link
                                    to={item.link}
                                    className="mt-3 font-montserrat text-[14px] font-medium text-[#D4A437] transition hover:text-[#2D2A7A]"
                                >
                                    Learn More →
                                </Link> */}
                            {/* )} */}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
