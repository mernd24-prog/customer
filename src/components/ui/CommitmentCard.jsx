export default function CommitmentCard({
    title,
    points = [],
    bgColor = "bg-[#F5ECDD]",
    iconColor = "text-[#B57A2B]",
    watermarkImage,
}) {
    return (
        <div
            className={`relative overflow-hidden rounded-[20px]  ${bgColor} p-6`}
        >
            {watermarkImage && (
                <img
                    src={watermarkImage}
                    alt="watermark"
                    className="absolute bottom-0 right-4 h-[125px] w-[90px]  object-contain"
                />
            )}

            <div className="relative z-10">
                <h3 className="mb-5 font-montserrat text-[28px] font-bold text-[#2E2E2E]">
                    {title}
                </h3>

                <ul className="space-y-4 ">
                    {points.map((point, index) => (
                        <li
                            key={index}
                            className="flex items-center gap-3 font-montserrat text-[16px] font-medium text-[#2E2E2E]"
                        >
                            <span className={`text-xl ${iconColor}`}>➜</span>
                            {point}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

