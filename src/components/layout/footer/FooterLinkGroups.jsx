import FooterLink from "./FooterLink";
import FooterSectionContainer from "./FooterSectionContainer";
import FooterSectionTitle from "./FooterSectionTitle";

export default function FooterLinkGroups({ groups }) {
  return (
    <FooterSectionContainer className="my-8 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {groups.map((group) => (
        <div key={group.title}>
          <FooterSectionTitle className="mb-4 text-accent">
            {group.title}
          </FooterSectionTitle>
          <ul className="grid gap-2">
            {group.links.map((link) => (
              <li key={link.label}>
                <FooterLink
                  href={link.href}
                  className="custom-para transition hover:font-medium hover:text-black"
                >
                  {link.label}
                </FooterLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </FooterSectionContainer>
  );
}
