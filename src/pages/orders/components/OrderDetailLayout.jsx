function OrderDetailLayout({ children }) {
  return (
    <section className="grid w-full gap-4 md:gap-6 xl:grid-cols-[minmax(0,68%)_minmax(320px,30%)] xl:gap-8">
      {children}
    </section>
  );
}

function OrderDetailAside({ children, className = "" }) {
  return <aside className={`grid gap-4 self-start ${className}`}>{children}</aside>;
}

export { OrderDetailAside };
export default OrderDetailLayout;
