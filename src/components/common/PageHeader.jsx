export default function PageHeader({
  title,
  description,
  eyebrow,
  action,
  className = "",
}) {
  return (
    <header className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="font-montserrat text-[12px] font-bold uppercase text-[var(--customer-gold-dark)]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-montserrat text-2xl font-bold text-[var(--customer-navy)]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl font-montserrat text-[14px] leading-6 text-[var(--customer-muted)]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
