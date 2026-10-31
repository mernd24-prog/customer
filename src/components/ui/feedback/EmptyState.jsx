
import { ContinueShoppingButton } from "../../ui/button/static";

export default function EmptyState({
  icon: Icon,
  imageSrc = "/image/png/NoProductFound.png",
  title = "Nothing here yet",
  description = "Once data is available, it will appear here.",
  actionLabel,
  onAction,
  buttonLabel,
  onButtonClick,
  className = "",
  buttonClassName = "",
  children,
  bordered = true,
}) {
  const resolvedActionLabel = actionLabel || buttonLabel;
  const resolvedAction = onAction || onButtonClick;

  const containerClasses = bordered
    ? "rounded-xl border border-dashed border-[#D8E3F0] bg-[#F5F8FC] px-5 py-10 text-center"
    : "rounded-[16px] bg-[#F7F9FC] px-4 py-8 text-center";

  return (
    <div
      className={`flex min-h-[280px] w-full flex-col items-center justify-center ${containerClasses} sm:min-h-[320px] sm:px-6 sm:py-10 lg:min-h-[380px] ${className}`}
    >
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F0FA] text-[#52749B] ring-1 ring-[#D8E3F0] sm:h-14 sm:w-14 lg:h-16 lg:w-16">
          <Icon
            className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
            aria-hidden="true"
          />
        </div>
      ) : (
        <img
          loading="lazy"
          width="400"
          height="400"
          src={imageSrc}
          alt={title}
className="h-28 w-28 object-contain mix-blend-multiply xs:h-32 xs:w-32 sm:h-40 sm:w-40 md:h-44 md:w-44 lg:h-52 lg:w-52 xl:h-60 xl:w-60"        />
      )}

      <h2 className="mt-5 max-w-lg text-lg font-bold text-[var(--customer-ink)] sm:text-xl md:text-2xl">
        {title}
      </h2>

      <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--customer-muted)] sm:max-w-md sm:text-base lg:max-w-xl">
        {description}
      </p>

      {resolvedActionLabel && resolvedAction && (
        <div className="mt-6 flex justify-center">
          <ContinueShoppingButton
            onClick={resolvedAction}
            className={`!mx-0 !mt-0 !h-[44px] sm:!h-[46px] !w-auto px-7 sm:px-8 whitespace-nowrap !rounded-full !bg-[#3E4093] !text-white !border-[#3E4093] hover:!bg-[#32347C] hover:!border-[#32347C] hover:!text-white shadow-sm hover:shadow-md ${buttonClassName}`}
          >
            {resolvedActionLabel}
          </ContinueShoppingButton>
        </div>
      )}

      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  );
}
