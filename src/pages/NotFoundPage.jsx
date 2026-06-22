import { Link } from "react-router-dom";
import { Grid2X2, Home, SearchX } from "lucide-react";
import Seo from "../components/common/Seo";

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page not found | Sam Global"
        description="The page you're looking for doesn't exist."
        robots="noindex,follow"
      />

      <section className="flex min-h-[60vh] items-center justify-center px-4 py-12 text-center">
        <div className="mx-auto max-w-2xl rounded-[18px] border border-[var(--customer-border)] bg-white px-6 py-10 shadow-sm sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--customer-gold-soft)] text-[var(--customer-gold-dark)]">
            <SearchX size={26} strokeWidth={1.8} />
          </div>

          <p className="mt-5 text-display-lg font-black text-[var(--customer-navy)]">404</p>
          <h1 className="mt-2 text-heading-lg font-bold text-[var(--customer-navy)] sm:text-heading-xl">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-body-sm leading-relaxed text-[var(--customer-muted)] sm:text-body-md">
            We couldn&apos;t find the page you&apos;re looking for. It may have
            been moved or the link might be incorrect.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[var(--customer-gold)] bg-[var(--customer-gold)] px-5 py-2.5 text-label-md font-semibold text-[var(--customer-navy)] shadow-sm transition-all duration-300 hover:border-[var(--customer-gold-dark)] hover:bg-[var(--customer-gold-dark)]"
            >
              <Home size={17} />
              Go to home
            </Link>
            <Link
              to="/categories"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[var(--customer-border)] bg-white px-5 py-2.5 text-label-md font-semibold text-[var(--customer-navy)] shadow-sm transition-all duration-300 hover:border-[var(--customer-gold)] hover:text-[var(--customer-gold-dark)]"
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
