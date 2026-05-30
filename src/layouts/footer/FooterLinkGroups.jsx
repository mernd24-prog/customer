import FooterLink from "./FooterLink";
import FooterSectionContainer from "./FooterSectionContainer";
import FooterSectionTitle from "./FooterSectionTitle";

export default function FooterLinkGroups({ groups = [] }) {
  if (!groups.length) return null;

  return (
    <FooterSectionContainer className="my-8 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {groups.map((group, groupIndex) => (
        <div key={group?.title || `group-${groupIndex}`}>
          <FooterSectionTitle className="mb-4 text-accent">
            {group?.title}
          </FooterSectionTitle>
          <ul className="grid gap-2">
            {(Array.isArray(group?.links) ? group.links : []).map((link, linkIndex) => (
              <li key={link?.label || `link-${linkIndex}`}>
                <FooterLink
                  href={link?.href}
                  className="custom-para transition-all duration-300 ease-in-out hover:font-medium hover:text-black"
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
