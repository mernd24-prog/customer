import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function PageHero({
  eyebrow,
  title,
  description,
  ctaText,
  ctaTo,
  image,
  children,
}) {
  return (
    <section
      className="relative overflow-hidden rounded-[8px] bg-slate-950 px-6 py-14 text-white shadow-xl shadow-slate-900/10"
      style={
        image
          ? {
              backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.58)), url(${image})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      <div className="relative mx-auto w-full max-w-6xl">
        <span className="mb-4 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
          {eyebrow}
        </span>
        <div className="mt-4 max-w-3xl space-y-5">
          <h1 className="custom-h2 text-white">{title}</h1>
          <p className="custom-para max-w-2xl text-slate-300">{description}</p>
          {ctaText ? (
            <Link
              to={ctaTo}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-accent/90"
            >
              {ctaText}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
