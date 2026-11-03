
import { cn } from "../../utils/common";

export default function PageIntroBanner({
  title,
  description,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
}) {
  return (
    <section className="relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden bg-[#17145f]">
      {/* Full-width background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#111050]/95 via-[#17145f]/80 to-[#17145f]" />

      {/* Aligned inner content */}
      <div
        className={cn(
          "customer-container relative z-10 w-full py-6 sm:py-8 md:py-10 lg:py-12",
          className,
        )}
      >
        <div className="max-w-3xl text-left">
          {title && (
            <h1
              className={cn(
                "text-[20px] font-bold leading-tight text-white sm:text-[24px] md:text-[28px] lg:text-[30px]",
                titleClassName,
              )}
            >
              {title}
            </h1>
          )}

          {description && (
            <p
              className={cn(
                "mt-2 max-w-3xl text-[13px] leading-5 text-white/80 sm:text-sm sm:leading-6 md:text-base",
                descriptionClassName,
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
