
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
  className={`flex min-h-[60px] items-center justify-between rounded-t-lg bg-[#EAD9B6] px-[20px] ${headerClassName}`}
>
          {title ? (
            <TitleTag
              className={`font-sans text-h6 font-bold text-[#2E2E2E] ${titleClassName}`}
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