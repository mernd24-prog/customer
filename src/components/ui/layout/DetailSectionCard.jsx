
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
      className={`flex flex-col overflow-hidden rounded-lg border ${borderClassName} bg-white ${className}`}
    >
      {title || headerContent ? (
        <div
          className={`flex min-h-[52px] flex-wrap items-center justify-between gap-2 rounded-t-lg bg-[#EAD9B6] px-4 py-2.5 sm:min-h-[60px] sm:px-5 sm:py-3 ${headerClassName}`}
        >
          {title ? (
            <TitleTag
              className={`font-sans text-sm font-bold text-[#2E2E2E] sm:text-base md:text-h6 ${titleClassName}`}
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