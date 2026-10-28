
function DetailSectionCard({
  title,
  children,
  className = "h-fit",
  headerClassName = "",
  bodyClassName = "",
  titleClassName = "",
  headerContent,
  borderClassName = "border-[#CE9F2D80]",
  titleAs: TitleTag = "h2",
}) {
  return (
    <section
      className={`customer-card flex flex-col overflow-hidden ${borderClassName} ${className}`}
    >
      {title || headerContent ? (
        <div
  className={`flex min-h-[56px] items-center justify-between border-b border-[var(--customer-border)] bg-[var(--customer-cream)] px-4 sm:px-5 ${headerClassName}`}
>
          {title ? (
            <TitleTag
              className={`font-sans text-base font-bold leading-snug text-[var(--customer-navy)] sm:text-lg ${titleClassName}`}
            >
              {title}
            </TitleTag>
          ) : null}
          {headerContent}
        </div>
      ) : null}

      <div className={`flex-1 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}

export default DetailSectionCard;
