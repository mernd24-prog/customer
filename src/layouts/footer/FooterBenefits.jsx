import FooterSectionContainer from "./FooterSectionContainer";
import FooterSectionTitle from "./FooterSectionTitle";

export default function FooterBenefits({ items = [] }) {
  if (!items.length) return null;

  return (
    <section className="border-y border-white/10 bg-white">
      <FooterSectionContainer className="grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <div key={item?.title || `benefit-${index}`} className="flex items-center gap-4 rounded-[var(--customer-radius)] border border-[var(--customer-border)] bg-[var(--customer-surface-soft)] px-4 py-3">
            <img
              className="h-10 w-10 shrink-0 object-contain sm:h-10 sm:w-10 xl:h-12 xl:w-12"
              src={item?.icon}
              alt={item?.alt || item?.title || "Benefit"}
            />
            <div>
              <FooterSectionTitle className="mb-0 text-sm leading-snug text-[var(--customer-navy)]">
                {item?.title}
              </FooterSectionTitle>
              <p className="text-xs text-[var(--customer-muted)]">{item?.description}</p>
            </div>
          </div>
        ))}
      </FooterSectionContainer>
    </section>
  );
}
