function OrderDetailLayout({ children }) {
  return (
    <section className="grid xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-7">
      {children}
    </section>
  );
}

function OrderDetailAside({ children, className = "" }) {
  return <aside className={`grid gap-4 self-start ${className}`}>{children}</aside>;
}

export { OrderDetailAside };
export default OrderDetailLayout;
