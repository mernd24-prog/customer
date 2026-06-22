import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { IoIosArrowForward } from "react-icons/io";

export default function Breadcrumbs({
  items = [],
  className = "",
  linkClassName = "text-white",
  currentClassName = "text-[#CE9F2D]",
  separatorClassName = "text-white",
  heading,
}) {
  return (
    <>
      <nav
        className={cn(
          "flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-[15px]  text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[20px] lg:leading-[23px]",
          className,
        )}
        aria-label="Breadcrumb"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span
              key={`${item.label}-${index}`}
              className="inline-flex items-center gap-1"
            >
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className={cn(
                    "font-medium text-[14px] leading-[100%] sm:text-[16px] lg:text-[18px]",
                    linkClassName,
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "font-medium text-[14px]  leading-[100%] sm:text-[16px] lg:text-[18px]",
                    currentClassName,
                  )}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span>
                  <IoIosArrowForward className={separatorClassName} />
                </span>
              )}
            </span>
          );
        })}
      </nav>
      <h1 className="text-2xl pt-2 pb-10 font-black leading-tight text-[#3F4095] min-[375px]:text-3xl sm:text-4xl">
        {heading}
      </h1>
    </>
  );
}
