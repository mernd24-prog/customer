import { SocialIcons } from "../../components/common";
import FooterLink from "./FooterLink";

export default function FooterLinkGroups({ groups = [], socialLinks = [] }) {
  if (!groups.length) return null;

  return (
    <div className="max-w-[1760px] mx-auto px-4 md:px-8">
       <div className="grid grid-cols-2    gap-6 border-t border-white/25 pt-8 md:grid-cols-3   lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {groups.map((group, groupIndex) => (
        <div key={group?.title || `group-${groupIndex}`}>
          <h2 className="mb-4 border-l-2 font-semibold  text-lg md:text-2xl pl-2 border-[var(--customer-gold)] pl-2text-white">
            {group?.title}
          </h2>
          <ul className="grid gap-1 md:gap-3 ">
            {(Array.isArray(group?.links) ? group.links : []).map(
              (link, linkIndex) => (
                <li key={link?.label || `link-${linkIndex}`}>
                  <FooterLink
                    href={link?.href}
                    className="text-sm md:text-base text-white/70  text-white transition-all duration-300 ease-in-out font-medium hover:text-white"
                  >
                    {link?.label}
                  </FooterLink>
                </li>
              ),
            )}
          </ul>
        </div>
      ))}
     
    </div>
       <div className="flex flex-wrap  gap-4 py-10">
        {socialLinks.map((social, index) => (
          <SocialIcons key={social?.label || `social-${index}`} data={social} />
        ))}
      </div>
    </div>
   
  );
}
