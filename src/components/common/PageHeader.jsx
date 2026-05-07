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
          <p className="font-montserrat text-[12px] font-semibold uppercase text-[#A26D27]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-montserrat text-2xl font-bold text-[#2E2E2E]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl font-montserrat text-[14px] leading-6 text-[#787878]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
