function OrderDetailLayout({ children }) {
  return (
    <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,390px)] xl:gap-8">
      {children}
    </section>
  );
}

function OrderDetailAside({ children, className = "" }) {
  return <aside className={`grid gap-4 self-start ${className}`}>{children}</aside>;
}

export { OrderDetailAside };
export default OrderDetailLayout;
