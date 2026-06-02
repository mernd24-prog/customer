import { SocialIcons } from "../../components/common";
import FooterSectionContainer from "./FooterSectionContainer";

export default function FooterBottomBar({ copyright = "", socialLinks = [] }) {
  return (
    <section className="border-t border-white/10 bg-black py-4">
      <FooterSectionContainer className="flex flex-col gap-4 text-white/70 md:flex-row md:items-center md:justify-between">
        <p className="text-center text-xs md:text-left">{copyright}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {socialLinks.map((social, index) => (
            <SocialIcons
              key={social?.label || `social-${index}`}
              data={social}
            />
          ))}
        </div>
      </FooterSectionContainer>
    </section>
  );
}
