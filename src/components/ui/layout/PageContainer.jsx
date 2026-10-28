
export default function PageContainer({
  children,
  className = "",
  contentClassName = "",
}) {
  return (
    <section className={`customer-page mt-6 sm:mt-8 ${className}`}>
      <div
        className={`mx-auto w-full max-w-[1533px] ${contentClassName}`}
      >
        {children}
      </div>
    </section>
  );
}
