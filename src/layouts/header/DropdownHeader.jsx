import { Link } from "react-router-dom";

export default function DropdownHeader({ title, actionText, actionPath }) {
  return (
    <div className="flex  items-center justify-between border-b border-[var(--customer-border)] bg-[var(--customer-cream)] px-4 py-3">
      <h3 className="text-[12px] font-bold uppercase tracking-normal text-[var(--customer-navy)]">
        {title}
      </h3>

      {actionText ? (
        <Link
          to={actionPath}
          className="text-[12px] font-semibold text-[var(--customer-gold-dark)] underline-offset-2 hover:underline"
        >
          {actionText}
        </Link>
      ) : null}
    </div>
  );
}
