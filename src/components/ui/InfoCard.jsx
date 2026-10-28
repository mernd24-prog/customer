import { Link } from "react-router-dom";

export default function InfoCard({
  icon,
  title,
  description,
  href,
  to,
  actionLabel,
}) {
  const Component = to ? Link : href ? "a" : "div";
  const linkProps = to
    ? { to }
    : href
      ? { href, target: "_blank", rel: "noreferrer" }
      : {};

  return (
    <article className="customer-card customer-card--interactive group p-5 sm:p-6 focus-within:border-[var(--customer-gold)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[var(--customer-radius)] bg-[var(--customer-gold-soft)] text-[var(--customer-gold-dark)]">
          {icon}
        </div>
        {actionLabel ? (
          <Component
            className="customer-section-action"
            aria-label={actionLabel}
            {...linkProps}
          >
            {actionLabel}
          </Component>
        ) : null}
      </div>

      <h3 className="mb-2 text-lg font-bold leading-snug text-[var(--customer-navy)]">{title}</h3>
      <p className="text-sm leading-6 text-[var(--customer-muted)]">
        {description}
      </p>
    </article>
  );
}
