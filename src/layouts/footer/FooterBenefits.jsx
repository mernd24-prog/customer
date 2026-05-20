import FooterSectionContainer from "./FooterSectionContainer";
import FooterSectionTitle from "./FooterSectionTitle";

export default function FooterBenefits({ items = [] }) {
  if (!items.length) return null;

  return (
    <section className="bg-band">
      <div className="h-2 w-full bg-gradient-to-l from-50% to-50% from-accent to-primary" />
      <FooterSectionContainer className="grid gap-8 py-8 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div key={item?.title || `benefit-${index}`} className="flex items-center gap-6 md:gap-4">
            <img
              className="h-10 w-10 shrink-0 object-contain sm:h-10 sm:w-10 xl:h-12 xl:w-12"
              src={item?.icon}
              alt={item?.alt || item?.title || "Benefit"}
            />
            <div>
              <FooterSectionTitle className="mb-1 leading-snug">
                {item?.title}
              </FooterSectionTitle>
              <p className="custom-para text-muted">{item?.description}</p>
            </div>
          </div>
        ))}
      </FooterSectionContainer>
    </section>
  );
}
