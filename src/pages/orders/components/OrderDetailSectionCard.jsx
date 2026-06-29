function OrderDetailSectionCard({
  title,
  children,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  titleClassName = "",
  headerContent,
  borderClassName = "border-[#CE9F2D80]",
  titleAs: TitleTag = "h2",
}) {
  return (
    <section
      className={`overflow-hidden rounded-[15px] h-fit border ${borderClassName} bg-white ${className}`}
    >
      {title || headerContent ? (
        <div
          className={`flex  min-h-[81px] items-center justify-between rounded-t-[15px] bg-[#CE9F2D33] px-[20px] md:py-[25px] ${headerClassName}`}
        >
          {title ? (
            <TitleTag
              className={`font-sans  text-lg lg:text-[24px] font-bold leading-none text-[#2E2E2E] ${titleClassName}`}
            >
              {title}
            </TitleTag>
          ) : null}
          {headerContent}
        </div>
      ) : null}
      <div className={`${bodyClassName}`}>{children} </div>
    </section>
  );
}

export default OrderDetailSectionCard;
