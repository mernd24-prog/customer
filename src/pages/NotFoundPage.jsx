import { Link } from "react-router-dom";
import { Grid2X2, Home, Sparkles } from "lucide-react";
import Seo from "../components/common/Seo";

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Coming Soon | Sam Global"
        description="This Sam Global page is coming soon."
        robots="noindex,follow"
      />

      <section className="flex min-h-[60vh] items-center justify-center px-4 py-12 text-center">
        <div className="mx-auto max-w-2xl rounded-[18px] border border-[var(--customer-border)] bg-white px-6 py-10 shadow-sm sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--customer-gold-soft)] text-[var(--customer-gold-dark)]">
            <Sparkles size={26} strokeWidth={1.8} />
          </div>

          <h1 className="mt-5 text-4xl font-black leading-tight text-[var(--customer-navy)] sm:text-5xl">
            Coming soon
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--customer-muted)] sm:text-base">
            This section is being prepared. You can continue shopping from the
            home page or browse live categories while we finish it.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[var(--customer-gold)] bg-[var(--customer-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--customer-navy)] shadow-sm transition-all duration-300 hover:border-[var(--customer-gold-dark)] hover:bg-[var(--customer-gold-dark)]"
            >
              <Home size={17} />
              Go to home
            </Link>
            <Link
              to="/categories"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[var(--customer-border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--customer-navy)] shadow-sm transition-all duration-300 hover:border-[var(--customer-gold)] hover:text-[var(--customer-gold-dark)]"
            >
              <Grid2X2 size={17} />
              Browse categories
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
