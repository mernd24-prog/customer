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
    <section className={`my-8 lg:my-16 bg-white ${className}`}>
      {hasHeader && (
        <header
          className={`text-[var(--customer-ink)] ${headerbgColor || "bg-white"}`}
        >
          <div
            className={`mb-2 flex flex-col gap-2  sm:gap-4 sm:flex-row sm:items-start sm:justify-between ${headerClassName}`}
          >
            <div className="min-w-0 ">
              {title && (
                <h2
                  className="font-bold text-h2 text-[#3E4093]"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className=" md:py-4 text-small  align-middle text-[#2E2E2E]">
                  {subtitle}
                </p>
              )}
            </div>

            {hasAction && actionHref ? (
              <OutlineSmallButton
                to={actionHref}
                rightIcon={<FaAngleRight className="text-[10px]" />}
                className="self-start   my-2  sm:self-center md:block hidden"
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

      <div className="mt-8">
        {hasAction && actionHref ? (
          <OutlineSmallButton
            to={actionHref}
            rightIcon={<FaAngleRight className="text-[10px]" />}
            className="self-start text-center md:hidden block    sm:self-center"
          >
            {actionLabel}
          </OutlineSmallButton>
        ) : null}
      </div>
    </section>
  );
}
