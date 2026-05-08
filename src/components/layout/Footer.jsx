import { Link } from "react-router-dom";
import { SocialIcons } from "../common/SocialIcons";
import { footerData } from "../../data/footer";
import { SkeletonLoader, SKELETON_PRESETS } from "../common/skeleton";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";

/* ------------------ Reusable Components ------------------ */

const FooterLink = ({ href, children, className = "", ariaLabel }) => (
  <Link to={href} className={className} aria-label={ariaLabel}>
    {children}
  </Link>
);

const SectionContainer = ({ children, className = "" }) => (
  <div className={`w-container ${className}`}>{children}</div>
);

const SectionTitle = ({ children, className = "" }) => (
  <h2 className={`custom-h6 font-semibold ${className}`}>{children}</h2>
);

/* ------------------ Sections ------------------ */

const Benefits = ({ items }) => (
  <section className="bg-band ">
    <div className="w-full h-2 bg-gradient-to-l from-50% to-50% from-accent to-primary " />
    <SectionContainer className="grid py-8 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="flex items-center gap-6 md:gap-4">
          <img
            className="h-10 w-10 sm:h-10 sm:w-10 xl:h-12 xl:w-12 shrink-0 object-contain"
            src={item.icon}
            alt={item.alt}
          />
          <div>
            <SectionTitle className="mb-1 leading-snug">
              {item.title}
            </SectionTitle>
            <p className="custom-para text-muted">{item.description}</p>
          </div>
        </div>
      ))}
    </SectionContainer>
  </section>
);

const LinkGroups = ({ groups }) => (
  <SectionContainer className="grid gap-8 my-8   grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
    {groups.map((group) => (
      <div key={group.title} className="">
        <SectionTitle className="mb-4 text-accent">{group.title}</SectionTitle>
        <ul className="grid gap-2">
          {group.links.map((link) => (
            <li key={link.label}>
              <FooterLink
                href={link.href}
                className="custom-para transition hover:font-medium hover:text-black "
              >
                {link.label}
              </FooterLink>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </SectionContainer>
);

const ActionLinks = ({ items }) => (
  <SectionContainer className="grid  gap-4 border-y bg-band border-accent grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {items.map((item) => (
      <FooterLink
        key={item.label}
        href={item.href}
        className="flex min-h-12 p-2 lg:p-8  items-center gap-4 custom-h6 font-semibold hover:text-accent"
      >
        <img
          className="h-9 w-9 object-contain"
          src={item.icon}
          alt={item.alt}
        />
        {item.label}
      </FooterLink>
    ))}
  </SectionContainer>
);

const AppDownload = ({ data }) => (
  <SectionContainer className="grid gap-8 py-4 md:py-8 lg:grid-cols-[minmax(260px,380px)_1fr] lg:items-end">
    <div>
      <SectionTitle className="max-w-sm font-medium">{data.title}</SectionTitle>
      <div className="flex flex-wrap gap-4 my-4 md:my-6">
        {data.links.map((app) => (
          <FooterLink key={app.label} href={app.href} ariaLabel={app.label}>
            <img className="h-11 w-auto" src={app.image} alt={app.alt} />
          </FooterLink>
        ))}
      </div>
    </div>
  </SectionContainer>
);

const BottomBar = ({ copyright, socialLinks }) => {
  return (
    <section className="bg-gradient-to-r from-blue to-[#353498] py-6 md:py-4">
      <SectionContainer className="flex flex-col gap-4 text-white md:flex-row md:items-center md:justify-between">
        <p className="custom-para text-center md:text-left">{copyright}</p>

        <div className="flex flex-wrap justify-center items-center gap-4">
          {socialLinks.map((social) => (
            <SocialIcons key={social.label} data={social} />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
};

/* ------------------ Main Footer ------------------ */

export function Footer({ data = footerData }) {
  const loading = useDelayedLoading();

  return (
    <footer className="w-full bg-surface font-montserrat text-ink">
      <Benefits items={data.benefits} />
      {loading ? (
        <SkeletonLoader
          layout={SKELETON_PRESETS.FOOTER_LINKS}
          count={6}
          containerClass="w-container grid gap-8 my-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        />
      ) : (
        <LinkGroups groups={data.linkGroups} />
      )}
      {loading ? (
        <SkeletonLoader
          layout={SKELETON_PRESETS.FOOTER_ACTIONS}
          count={4}
          containerClass="w-container grid gap-4 border-y bg-band border-accent grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          wrapperClass="flex min-h-12 p-2 lg:p-8 items-center"
        />
      ) : (
        <ActionLinks items={data.actionLinks} />
      )}
      <AppDownload data={data.appDownload} />
      <BottomBar copyright={data.copyright} socialLinks={data.socialLinks} />
    </footer>
  );
}
