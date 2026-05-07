// CommitmentCard.jsx

export default function CommitmentCard({
  title,
  points = [],
  bgColor = "bg-[#F5ECDD]",
  iconColor = "text-[#B57A2B]",
  watermark = "",
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-[20px] p-6 ${bgColor}`}
    >
      {/* Watermark */}
      <span className="absolute bottom-2 right-5 text-[90px] font-bold text-black/10">
        {watermark}
      </span>

      {/* Title */}
      <h3 className="font-montserrat text-[32px] font-semibold leading-[42px] text-[#2E2E2E]">
        {title}
      </h3>

      {/* Points */}
      <div className="mt-6 flex flex-col gap-5">
        {points.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            
            {/* Arrow */}
            <span className={`text-xl ${iconColor}`}>➤</span>

            {/* Text */}
            <p className="font-montserrat text-[18px] font-medium text-[#2E2E2E]">
              {item}
            </p>

          </div>
        ))}
      </div>
    </div>
  );
}