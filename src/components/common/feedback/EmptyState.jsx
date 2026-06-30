import { ContinueShoppingButton } from "../../dynamicComponent/button/static";

export default function EmptyState({
  icon: Icon,
  title = "Nothing here yet",
  description = "Once data is available, it will appear here.",
  actionLabel,
  onAction,
  buttonLabel,
  onButtonClick,
  className = "",
  children,
}) {
  const resolvedActionLabel = actionLabel || buttonLabel;
  const resolvedAction = onAction || onButtonClick;

  return (
    <div
      className={`flex min-h-[280px] w-full flex-col items-center justify-center rounded-[16px] px-4 py-8 text-center sm:min-h-[320px] sm:px-6 sm:py-10 lg:min-h-[380px] ${className}`}
    >
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--customer-gold-soft)] text-[var(--customer-gold-dark)] ring-1 ring-[var(--customer-gold)]/15 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
          <Icon
            className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
            aria-hidden="true"
          />
        </div>
      ) : (
        <img
          src="/image/png/NoProductFound.png"
          alt="No products found"
          className="h-28 w-28 object-contain xs:h-32 xs:w-32 sm:h-40 sm:w-40 md:h-44 md:w-44 lg:h-52 lg:w-52 xl:h-60 xl:w-60"
        />
      )}

      <h2 className="mt-5 max-w-lg text-lg font-bold text-[var(--customer-ink)] sm:text-xl md:text-2xl">
        {title}
      </h2>

      <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--customer-muted)] sm:max-w-md sm:text-base lg:max-w-xl">
        {description}
      </p>

      {resolvedActionLabel && resolvedAction && (
        <div className="mt-6 w-full max-w-xs sm:w-auto">
          <ContinueShoppingButton
            onClick={resolvedAction}
            className="w-full sm:w-auto"
          >
            {resolvedActionLabel}
          </ContinueShoppingButton>
        </div>
      )}

      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  );
}   