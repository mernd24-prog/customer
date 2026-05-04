export default function AuthCard({ children, eyebrow, subtitle, title }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <div className="grid overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="bg-slate-950 p-8 text-white sm:p-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-300">{eyebrow}</p>
          <h1 className="max-w-sm text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">{subtitle}</p>
          <div className="mt-8 grid gap-3 text-sm text-slate-200">
            <span>Buyer role applied automatically</span>
            <span>Secure account creation</span>
            <span>Ready for cart, orders, wallet, and loyalty</span>
          </div>
        </aside>
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </section>
  );
}
