import FooterLink from "./FooterLink";
import FooterSectionContainer from "./FooterSectionContainer";
import FooterSectionTitle from "./FooterSectionTitle";

export default function FooterAppDownload({ data = {} }) {
  const title = data?.title || "";
  const links = Array.isArray(data?.links) ? data.links : [];

  if (!title && !links.length) return null;

  return (
    <FooterSectionContainer className="grid gap-8 py-4 md:py-8 lg:grid-cols-[minmax(260px,380px)_1fr] lg:items-end">
      <div>
        <FooterSectionTitle className="max-w-sm font-medium">
          {title}
        </FooterSectionTitle>
        <div className="my-4 flex flex-wrap gap-4 md:my-6">
          {links.map((app, index) => (
            <FooterLink
              key={app?.label || `app-link-${index}`}
              href={app?.href}
              ariaLabel={app?.label || "App link"}
            >
              <img className="h-11 w-auto" src={app?.image} alt={app?.alt || app?.label || "App"} />
            </FooterLink>
          ))}
        </div>
      </div>
    </FooterSectionContainer>
  );
}
