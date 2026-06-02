import FooterLink from "./FooterLink";
import FooterSectionContainer from "./FooterSectionContainer";
import FooterSectionTitle from "./FooterSectionTitle";

export default function FooterLinkGroups({ groups = [] }) {
  if (!groups.length) return null;

  return (
    <FooterSectionContainer className="grid grid-cols-2 gap-8 border-t border-white/10 py-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {groups.map((group, groupIndex) => (
        <div key={group?.title || `group-${groupIndex}`}>
          <FooterSectionTitle className="mb-4 border-l border-[var(--customer-gold)] pl-2 text-xs uppercase tracking-normal text-white">
            {group?.title}
          </FooterSectionTitle>
          <ul className="grid gap-2">
            {(Array.isArray(group?.links) ? group.links : []).map((link, linkIndex) => (
              <li key={link?.label || `link-${linkIndex}`}>
                <FooterLink
                  href={link?.href}
                  className="text-xs leading-6 text-white/65 transition-all duration-300 ease-in-out hover:text-white"
                >
                  {link?.label}
                </FooterLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </FooterSectionContainer>
  );
}
