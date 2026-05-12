import FooterLink from "./FooterLink";
import FooterSectionContainer from "./FooterSectionContainer";

export default function FooterActionLinks({ items }) {
  return (
    <FooterSectionContainer className="grid grid-cols-1 gap-4 border-y border-accent bg-band sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <FooterLink
          key={item.label}
          href={item.href}
          className="custom-h6 flex min-h-12 items-center gap-4 p-2 font-semibold hover:text-accent lg:p-8"
        >
          <img className="h-9 w-9 object-contain" src={item.icon} alt={item.alt} />
          {item.label}
        </FooterLink>
      ))}
    </FooterSectionContainer>
  );
}
