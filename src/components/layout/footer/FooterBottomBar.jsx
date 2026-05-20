import SocialIcons from "../../common/SocialIcons";
import FooterSectionContainer from "./FooterSectionContainer";

export default function FooterBottomBar({ copyright = "", socialLinks = [] }) {
  return (
    <section className="bg-gradient-to-r from-blue to-[#353498] py-6 md:py-4">
      <FooterSectionContainer className="flex flex-col gap-4 text-white md:flex-row md:items-center md:justify-between">
        <p className="custom-para text-center md:text-left">{copyright}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {socialLinks.map((social, index) => (
            <SocialIcons key={social?.label || `social-${index}`} data={social} />
          ))}
        </div>
      </FooterSectionContainer>
    </section>
  );
}
