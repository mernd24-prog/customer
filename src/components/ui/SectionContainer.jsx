import { FaAngleRight } from "react-icons/fa6";
import { OutlineSmallButton } from "../dynamicComponent/button/static";

export default function SectionContainer({
  title,
  subtitle = "",
  headerbgColor,
  children,
  bodybgColor,
  actionLabel = "",
  actionHref = "",
  onAction,
  className = "",
  headerClassName = "",
  contentClassName = "",
}) {
  const hasHeader = Boolean(title || subtitle || actionLabel);
  const hasAction = Boolean(actionLabel && (actionHref || onAction));

  return (
    <section className={`my-8 bg-white ${className}`}>
      {hasHeader && (
        <header
          className={`text-[var(--customer-ink)] ${headerbgColor || "bg-white"}`}
        >
          <div
            className={`mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${headerClassName}`}
          >
            <div className="min-w-0">
              {title && (
                <h2 className="text-[24px] font-bold leading-tight text-[#3E4093] sm:text-[28px] md:text-[32px] lg:text-[38px]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-2 text-[14px] font-medium leading-normal text-[#2E2E2E] sm:text-[16px] md:text-[17px] lg:text-[18px]">
                  {subtitle}
                </p>
              )}
            </div>

            {hasAction && actionHref ? (
              <OutlineSmallButton
                to={actionHref}
                rightIcon={<FaAngleRight className="text-[10px]" />}
                className="self-start text-[12px] sm:self-center"
              >
                {actionLabel}
              </OutlineSmallButton>
            ) : null}

            {hasAction && !actionHref ? (
              <OutlineSmallButton
                onClick={onAction}
                rightIcon={<FaAngleRight className="text-[10px]" />}
                className="self-start text-[12px] sm:self-center"
              >
                {actionLabel}
              </OutlineSmallButton>
            ) : null}
          </div>
        </header>
      )}

      <div className={`${bodybgColor || "bg-white"} ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}
