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
      className={`flex min-h-[240px] flex-col items-center justify-center rounded-[16px]  px-5 py-10 text-center`}
    >
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--customer-gold-soft)] text-[var(--customer-gold-dark)] ring-1 ring-[var(--customer-gold)]/15">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      ) : (
        <img
          src="/image/png/NoProductFound.png"
          alt="No products found"
          className="h-50 w-50 object-contain sm:h-40 sm:w-40"
        />
      )}
      <h2 className="mt-5 text-xl font-bold text-[var(--customer-ink)]">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--customer-muted)]">
        {description}
      </p>
      {resolvedActionLabel && resolvedAction && (
        <ContinueShoppingButton onClick={resolvedAction}>
          {resolvedActionLabel}
        </ContinueShoppingButton>
      )}
      {children}
    </div>
  );
}
