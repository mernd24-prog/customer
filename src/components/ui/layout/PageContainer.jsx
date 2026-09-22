
export default function PageContainer({
  children,
  className = "",
  contentClassName = "",
}) {
  return (
    <section className={`bg-white mt-6 sm:mt-8 mb-12 ${className}`}>
      <div
        className={`mx-auto w-full max-w-[1900px] ${contentClassName}`}
      >
        {children}
      </div>
    </section>
  );
}