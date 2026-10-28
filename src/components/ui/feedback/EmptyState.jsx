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
  children,
}) {
  const resolvedActionLabel = actionLabel || buttonLabel;
  const resolvedAction = onAction || onButtonClick;

  return (
    <div
      className={`flex min-h-[300px] w-full flex-col items-center justify-center rounded-[var(--customer-radius-lg)] border border-dashed border-border bg-[var(--customer-surface-soft)] px-5 py-8 text-center sm:min-h-[340px] sm:px-8 sm:py-10 ${className}`}
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
          loading="lazy"
          width="400"
          height="400"
          src={imageSrc}
          alt={title}
          className="h-28 w-28 object-contain xs:h-32 xs:w-32 sm:h-36 sm:w-36 lg:h-40 lg:w-40"
        />
      )}

      <h2 className="mt-5 max-w-lg text-xl font-extrabold leading-tight tracking-[-0.02em] text-navy sm:text-2xl">
        {title}
      </h2>

      <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--customer-muted)] sm:max-w-md sm:text-body">
        {description}
      </p>

      {resolvedActionLabel && resolvedAction && (
        <div className="mt-6 flex justify-center">
          <ContinueShoppingButton
            onClick={resolvedAction}
            className="!mx-0 !mt-0 !h-11 !w-auto !min-w-[180px] !max-w-none !shrink-0 !whitespace-nowrap !rounded-full !px-6 sm:!h-12"
          >
            {resolvedActionLabel}
          </ContinueShoppingButton>
        </div>
      )}

      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  );
}
