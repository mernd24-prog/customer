import { Link,  } from "react-router-dom";
import {  Home  } from "lucide-react";
import Seo from "../components/common/Seo";

export default function NotFoundPage() {


  return (
    <>
      <Seo
        title="404 - Page Not Found | Sam Global"
        description="The page you are looking for could not be found."
        robots="noindex,follow"
      />

      <section className="flex min-h-[60vh] items-center justify-center py-12 text-center">
        <div className="mx-auto max-w-2xl">
      
          <h1 className="mt-4 text-4xl font-black leading-tight text-[var(--customer-navy)] sm:text-5xl">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--customer-muted)] sm:text-base">
            The page may have moved, been deleted, or the URL may be incorrect.
            Use the options below to continue shopping.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[var(--customer-gold)] bg-[var(--customer-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--customer-navy)] shadow-sm transition-all duration-300 hover:border-[var(--customer-gold-dark)] hover:bg-[var(--customer-gold-dark)]"
            >
              <Home size={17} />
              Go to home
            </Link>
            
          </div>

        </div>
      </section>
    </>
  );
}
