import { Link } from "react-router-dom";

export default function InfoCard({ icon, title, description, href, to, actionLabel }) {
  const Component = to ? Link : href ? "a" : "div";
  const linkProps = to
    ? { to }
    : href
      ? { href, target: "_blank", rel: "noreferrer" }
      : {};

  return (
    <article className="group card-elevated rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-within:border-accent focus-within:outline-none">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent shadow-sm">
          {icon}
        </div>
        {actionLabel ? (
          <Component
            className="inline-flex items-center rounded-full border border-accent bg-accent/10 px-4 py-2 text-[13px] font-semibold text-accent transition duration-300 hover:bg-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={actionLabel}
            {...linkProps}
          >
            {actionLabel}
          </Component>
        ) : null}
      </div>

      <h3 className="custom-h5 mb-3 text-slate-950">{title}</h3>
      <p className="custom-para leading-relaxed text-slate-600">{description}</p>
    </article>
  );
}
