import FooterLink from "./FooterLink";
import FooterSectionContainer from "./FooterSectionContainer";
import FooterSectionTitle from "./FooterSectionTitle";

export default function FooterAppDownload({ data }) {
  return (
    <FooterSectionContainer className="grid gap-8 py-4 md:py-8 lg:grid-cols-[minmax(260px,380px)_1fr] lg:items-end">
      <div>
        <FooterSectionTitle className="max-w-sm font-medium">
          {data.title}
        </FooterSectionTitle>
        <div className="my-4 flex flex-wrap gap-4 md:my-6">
          {data.links.map((app) => (
            <FooterLink key={app.label} href={app.href} ariaLabel={app.label}>
              <img className="h-11 w-auto" src={app.image} alt={app.alt} />
            </FooterLink>
          ))}
        </div>
      </div>
    </FooterSectionContainer>
  );
}
